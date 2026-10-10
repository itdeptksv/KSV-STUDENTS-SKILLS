const SkillAssessment = require('../models/SkillAssessment');
const AcademicTerm = require('../models/AcademicTerm');
const Student = require('../models/Student');
const { ok, created, paginated } = require('../utils/response');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const audit = require('../utils/audit');
const { Notification } = require('../models/Misc');
const ExcelJS = require('exceljs');

const checkTermLocked = async (termId) => {
  const term = await AcademicTerm.findById(termId);
  if (!term) throw Object.assign(new Error('Term not found'), { status: 404 });
  if (term.isLocked) throw Object.assign(new Error('Term is locked. Contact admin to unlock.'), { status: 403 });
  return term;
};

const checkClassAccess = (user, classId) => {
  if (user.role === 'admin') return;
  const assigned = user.assignedClasses.map((c) => c.toString());
  if (!assigned.includes(classId?.toString()))
    throw Object.assign(new Error('Not assigned to this class'), { status: 403 });
};

exports.list = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = {};
    if (req.query.student) filter.student = req.query.student;
    if (req.query.class) filter.class = req.query.class;
    if (req.query.section) filter.section = req.query.section;
    if (req.query.skillArea) filter.skillArea = req.query.skillArea;
    if (req.query.term) filter.term = req.query.term;
    if (req.query.academicYear) filter.academicYear = req.query.academicYear;
    if (req.query.status) filter.status = req.query.status;

    if (req.user.role === 'class_teacher' || req.user.role === 'skill_teacher') {
      if (!filter.class) filter.class = { $in: req.user.assignedClasses };
    }
    if (req.user.role === 'student') {
      const student = await Student.findOne({ userAccount: req.user._id });
      if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });
      filter.student = student._id;
      filter.status = 'approved';
    }

    const [assessments, total] = await Promise.all([
      SkillAssessment.find(filter)
        .populate('student', 'name admissionNumber')
        .populate('skillArea', 'name')
        .populate('subSkill', 'name')
        .populate('term', 'name termNumber')
        .populate('academicYear', 'label')
        .populate('createdBy', 'name')
        .skip(skip).limit(limit).sort({ createdAt: -1 }),
      SkillAssessment.countDocuments(filter),
    ]);
    paginated(res, assessments, buildPaginationMeta(total, page, limit));
  } catch (err) { next(err); }
};

exports.get = async (req, res, next) => {
  try {
    const a = await SkillAssessment.findById(req.params.id)
      .populate('student', 'name admissionNumber class section')
      .populate('skillArea', 'name').populate('subSkill', 'name')
      .populate('term', 'name termNumber').populate('academicYear', 'label')
      .populate('evidence').populate('createdBy', 'name').populate('reviewedBy', 'name');
    if (!a) return res.status(404).json({ success: false, message: 'Assessment not found' });
    ok(res, a);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    checkClassAccess(req.user, req.body.class);
    await checkTermLocked(req.body.term);
    const assessment = await SkillAssessment.create({ ...req.body, createdBy: req.user._id, status: 'draft' });
    await audit(req.user._id, 'CREATE_ASSESSMENT', 'SkillAssessment', assessment._id, null, req.ip);
    created(res, assessment);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const existing = await SkillAssessment.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Assessment not found' });
    if (existing.status === 'approved')
      return res.status(403).json({ success: false, message: 'Cannot edit approved assessment' });
    checkClassAccess(req.user, existing.class);
    await checkTermLocked(existing.term);
    const updated = await SkillAssessment.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    );
    ok(res, updated);
  } catch (err) { next(err); }
};

exports.submit = async (req, res, next) => {
  try {
    const a = await SkillAssessment.findById(req.params.id);
    if (!a) return res.status(404).json({ success: false, message: 'Assessment not found' });
    if (a.status !== 'draft') return res.status(400).json({ success: false, message: 'Only drafts can be submitted' });
    checkClassAccess(req.user, a.class);
    a.status = 'submitted';
    a.updatedBy = req.user._id;
    await a.save();
    ok(res, a, 'Assessment submitted for review');
  } catch (err) { next(err); }
};

exports.approve = async (req, res, next) => {
  try {
    const a = await SkillAssessment.findById(req.params.id);
    if (!a) return res.status(404).json({ success: false, message: 'Assessment not found' });
    if (a.status !== 'submitted') return res.status(400).json({ success: false, message: 'Only submitted assessments can be approved' });
    a.status = 'approved';
    a.reviewedBy = req.user._id;
    a.reviewedAt = new Date();
    a.reviewNote = req.body.note;
    await a.save();
    await audit(req.user._id, 'APPROVE_ASSESSMENT', 'SkillAssessment', a._id, null, req.ip);
    ok(res, a, 'Assessment approved');
  } catch (err) { next(err); }
};

exports.reject = async (req, res, next) => {
  try {
    const a = await SkillAssessment.findById(req.params.id);
    if (!a) return res.status(404).json({ success: false, message: 'Assessment not found' });
    a.status = 'rejected';
    a.reviewedBy = req.user._id;
    a.reviewedAt = new Date();
    a.reviewNote = req.body.note;
    await a.save();
    ok(res, a, 'Assessment rejected');
  } catch (err) { next(err); }
};

exports.bulkCreate = async (req, res, next) => {
  try {
    const { assessments } = req.body;
    if (!Array.isArray(assessments) || !assessments.length)
      return res.status(400).json({ success: false, message: 'assessments array required' });
    const results = { created: 0, updated: 0, errors: [] };
    for (const a of assessments) {
      try {
        checkClassAccess(req.user, a.class);
        await checkTermLocked(a.term);
        await SkillAssessment.findOneAndUpdate(
          { student: a.student, subSkill: a.subSkill, term: a.term },
          { ...a, createdBy: req.user._id, updatedBy: req.user._id },
          { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
        );
        results.created++;
      } catch (e) {
        results.errors.push({ student: a.student, message: e.message });
      }
    }
    ok(res, results, 'Bulk assessment complete');
  } catch (err) { next(err); }
};

exports.importExcel = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(req.file.buffer);
    const ws = wb.worksheets[0];
    const rows = [];
    ws.eachRow((row, rowNum) => {
      if (rowNum === 1) return;
      rows.push({
        rowNum,
        admissionNumber: row.getCell(1).value?.toString().trim(),
        subSkillName: row.getCell(2).value?.toString().trim(),
        level: parseInt(row.getCell(3).value),
        remarks: row.getCell(4).value?.toString().trim(),
      });
    });
    ok(res, { rows, total: rows.length });
  } catch (err) { next(err); }
};

exports.notAssessed = async (req, res, next) => {
  try {
    const { classId, section, termId, subSkillId } = req.query;
    if (!classId || !termId) return res.status(400).json({ success: false, message: 'classId and termId required' });
    const filter = { class: classId, isActive: true };
    if (section) filter.section = section;
    const students = await Student.find(filter).select('name admissionNumber section rollNumber');
    const assessed = await SkillAssessment.find({ class: classId, term: termId, ...(subSkillId && { subSkill: subSkillId }) })
      .distinct('student');
    const assessedSet = new Set(assessed.map((id) => id.toString()));
    const notAssessed = students.filter((s) => !assessedSet.has(s._id.toString()));
    ok(res, notAssessed);
  } catch (err) { next(err); }
};
