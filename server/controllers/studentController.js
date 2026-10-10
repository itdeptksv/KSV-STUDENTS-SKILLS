const Student = require('../models/Student');
const { ok, created, paginated } = require('../utils/response');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const audit = require('../utils/audit');
const ExcelJS = require('exceljs');

exports.list = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = { isActive: true };
    if (req.query.class) filter.class = req.query.class;
    if (req.query.section) filter.section = req.query.section;
    if (req.query.academicYear) filter.academicYear = req.query.academicYear;
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { admissionNumber: { $regex: req.query.search, $options: 'i' } },
      ];
    }
    // Class teachers can only see their assigned classes
    if (req.user.role === 'class_teacher') {
      const assigned = req.user.assignedClasses.map((c) => c.toString());
      if (filter.class && !assigned.includes(filter.class.toString()))
        return res.status(403).json({ success: false, message: 'Not assigned to this class' });
      if (!filter.class) filter.class = { $in: req.user.assignedClasses };
    }
    const [students, total] = await Promise.all([
      Student.find(filter)
        .populate('class', 'name shortName')
        .populate('academicYear', 'label')
        .select('-guardian.phone -guardian.email') // hide contact from non-admin
        .skip(skip).limit(limit).sort({ name: 1 }),
      Student.countDocuments(filter),
    ]);
    // Admins see full guardian info
    const data = req.user.role === 'admin'
      ? await Student.find(filter).populate('class', 'name shortName').skip(skip).limit(limit).sort({ name: 1 })
      : students;
    paginated(res, data, buildPaginationMeta(total, page, limit));
  } catch (err) { next(err); }
};

exports.get = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('class', 'name shortName classGroup')
      .populate('academicYear', 'label');
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    // Students can only see themselves
    if (req.user.role === 'student' && student.userAccount?.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Access denied' });
    const data = student.toObject();
    if (!['admin', 'class_teacher'].includes(req.user.role)) {
      delete data.guardian?.phone;
      delete data.guardian?.email;
    }
    ok(res, data);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const student = await Student.create({ ...req.body, createdBy: req.user._id });
    await audit(req.user._id, 'CREATE_STUDENT', 'Student', student._id, null, req.ip);
    created(res, student);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    );
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    await audit(req.user._id, 'UPDATE_STUDENT', 'Student', student._id, null, req.ip);
    ok(res, student);
  } catch (err) { next(err); }
};

exports.downloadTemplate = async (req, res, next) => {
  try {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Students');
    ws.columns = [
      { header: 'Name*', key: 'name', width: 25 },
      { header: 'Admission Number*', key: 'admissionNumber', width: 20 },
      { header: 'Date of Birth (YYYY-MM-DD)', key: 'dateOfBirth', width: 25 },
      { header: 'Gender (male/female/other)', key: 'gender', width: 20 },
      { header: 'Section*', key: 'section', width: 10 },
      { header: 'Roll Number', key: 'rollNumber', width: 15 },
      { header: 'Guardian Name', key: 'guardianName', width: 25 },
      { header: 'Guardian Relation', key: 'guardianRelation', width: 20 },
    ];
    ws.getRow(1).font = { bold: true };
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=student_import_template.xlsx');
    await wb.xlsx.write(res);
    res.end();
  } catch (err) { next(err); }
};

exports.importPreview = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const { classId, academicYearId } = req.body;
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(req.file.buffer);
    const ws = wb.worksheets[0];
    const rows = [];
    ws.eachRow((row, rowNum) => {
      if (rowNum === 1) return;
      const name = row.getCell(1).value?.toString().trim();
      const admissionNumber = row.getCell(2).value?.toString().trim();
      const errors = [];
      if (!name) errors.push('Name is required');
      if (!admissionNumber) errors.push('Admission number is required');
      rows.push({ rowNum, name, admissionNumber, dateOfBirth: row.getCell(3).value,
        gender: row.getCell(4).value, section: row.getCell(5).value,
        rollNumber: row.getCell(6).value, guardianName: row.getCell(7).value,
        guardianRelation: row.getCell(8).value, errors });
    });
    ok(res, { rows, total: rows.length, valid: rows.filter((r) => !r.errors.length).length });
  } catch (err) { next(err); }
};

exports.importSave = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const { classId, academicYearId } = req.body;
    if (!classId || !academicYearId)
      return res.status(400).json({ success: false, message: 'classId and academicYearId required' });
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(req.file.buffer);
    const ws = wb.worksheets[0];
    const results = { created: 0, skipped: 0, errors: [] };
    const ops = [];
    ws.eachRow((row, rowNum) => {
      if (rowNum === 1) return;
      const name = row.getCell(1).value?.toString().trim();
      const admissionNumber = row.getCell(2).value?.toString().trim();
      if (!name || !admissionNumber) {
        results.errors.push({ rowNum, message: 'Missing required fields' });
        return;
      }
      ops.push({ name, admissionNumber, class: classId, academicYear: academicYearId,
        section: row.getCell(5).value?.toString().trim() || 'A',
        rollNumber: row.getCell(6).value?.toString().trim(),
        guardian: { name: row.getCell(7).value?.toString().trim(), relation: row.getCell(8).value?.toString().trim() },
        createdBy: req.user._id });
    });
    for (const op of ops) {
      try {
        await Student.create(op);
        results.created++;
      } catch (e) {
        if (e.code === 11000) { results.skipped++; results.errors.push({ admissionNumber: op.admissionNumber, message: 'Duplicate' }); }
        else results.errors.push({ admissionNumber: op.admissionNumber, message: e.message });
      }
    }
    ok(res, results, 'Import complete');
  } catch (err) { next(err); }
};
