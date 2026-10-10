const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const Student = require('../models/Student');
const SkillAssessment = require('../models/SkillAssessment');
const { CompetitionResult } = require('../models/CompetitionResult');
const { ok } = require('../utils/response');

const LEVEL_LABELS = { 1: 'Beginner', 2: 'Developing', 3: 'Proficient', 4: 'Advanced' };

exports.studentSkillReport = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { termId, academicYearId, format = 'json' } = req.query;

    const student = await Student.findById(studentId)
      .populate('class', 'name').populate('academicYear', 'label');
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const filter = { student: studentId, status: 'approved' };
    if (termId) filter.term = termId;
    if (academicYearId) filter.academicYear = academicYearId;

    const assessments = await SkillAssessment.find(filter)
      .populate('skillArea', 'name').populate('subSkill', 'name')
      .populate('term', 'name termNumber').populate('academicYear', 'label')
      .sort({ 'skillArea.name': 1 });

    if (format === 'pdf') {
      const doc = new PDFDocument({ margin: 50 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=skill_report_${student.admissionNumber}.pdf`);
      doc.pipe(res);

      doc.fontSize(18).fillColor('#1e3a5f').text('KSV Skill Sets', { align: 'center' });
      doc.fontSize(14).fillColor('#333').text('Student Skill Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(11).text(`Name: ${student.name}`);
      doc.text(`Admission No: ${student.admissionNumber}`);
      doc.text(`Class: ${student.class?.name} - ${student.section}`);
      doc.text(`Academic Year: ${student.academicYear?.label}`);
      doc.text(`Report Generated: ${new Date().toLocaleDateString()}`);
      doc.moveDown();

      if (!assessments.length) {
        doc.text('No approved assessments found for the selected period.');
      } else {
        let currentArea = null;
        for (const a of assessments) {
          if (a.skillArea?.name !== currentArea) {
            currentArea = a.skillArea?.name;
            doc.moveDown(0.5).fontSize(12).fillColor('#1e3a5f').text(currentArea);
          }
          doc.fontSize(10).fillColor('#333')
            .text(`  ${a.subSkill?.name}: Level ${a.level} — ${LEVEL_LABELS[a.level] || ''}${a.remarks ? ` | ${a.remarks}` : ''}`);
        }
      }
      doc.end();
      return;
    }

    if (format === 'excel') {
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('Skill Report');
      ws.columns = [
        { header: 'Skill Area', key: 'skillArea', width: 25 },
        { header: 'Sub-Skill', key: 'subSkill', width: 25 },
        { header: 'Term', key: 'term', width: 15 },
        { header: 'Level', key: 'level', width: 10 },
        { header: 'Level Label', key: 'levelLabel', width: 15 },
        { header: 'Remarks', key: 'remarks', width: 40 },
        { header: 'Date', key: 'date', width: 15 },
      ];
      ws.getRow(1).font = { bold: true };
      for (const a of assessments) {
        ws.addRow({
          skillArea: a.skillArea?.name, subSkill: a.subSkill?.name,
          term: a.term?.name, level: a.level, levelLabel: LEVEL_LABELS[a.level],
          remarks: a.remarks, date: a.assessmentDate?.toLocaleDateString(),
        });
      }
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=skill_report_${student.admissionNumber}.xlsx`);
      await wb.xlsx.write(res);
      return res.end();
    }

    ok(res, { student, assessments });
  } catch (err) { next(err); }
};

exports.classSkillSummary = async (req, res, next) => {
  try {
    const { classId, section, termId, academicYearId } = req.query;
    if (!classId) return res.status(400).json({ success: false, message: 'classId required' });
    const filter = { class: classId, status: 'approved' };
    if (section) filter.section = section;
    if (termId) filter.term = termId;
    if (academicYearId) filter.academicYear = academicYearId;
    const assessments = await SkillAssessment.find(filter)
      .populate('student', 'name admissionNumber section')
      .populate('skillArea', 'name').populate('subSkill', 'name')
      .populate('term', 'name');
    // Group by skill area
    const summary = {};
    for (const a of assessments) {
      const area = a.skillArea?.name || 'Unknown';
      if (!summary[area]) summary[area] = { total: 0, levels: { 1: 0, 2: 0, 3: 0, 4: 0 } };
      summary[area].total++;
      summary[area].levels[a.level] = (summary[area].levels[a.level] || 0) + 1;
    }
    ok(res, { summary, total: assessments.length });
  } catch (err) { next(err); }
};

exports.competitionReport = async (req, res, next) => {
  try {
    const { competitionId } = req.params;
    const results = await CompetitionResult.find({ competition: competitionId, isPublished: true })
      .populate('student', 'name admissionNumber class section').sort({ rank: 1 });
    ok(res, results);
  } catch (err) { next(err); }
};

exports.adminDashboard = async (req, res, next) => {
  try {
    const [students, teachers, assessmentsPending, galleryPending] = await Promise.all([
      require('../models/Student').countDocuments({ isActive: true }),
      require('../models/User').countDocuments({ role: { $in: ['class_teacher', 'skill_teacher'] }, isActive: true }),
      SkillAssessment.countDocuments({ status: 'submitted' }),
      require('../models/Gallery').GalleryItem
        ? require('../models/Gallery').GalleryItem.countDocuments({ status: 'pending' })
        : Promise.resolve(0),
    ]);
    const { GalleryItem } = require('../models/Gallery');
    const galleryCount = await GalleryItem.countDocuments({ status: 'pending' });
    const Competition = require('../models/Competition');
    const upcomingComps = await Competition.countDocuments({ status: { $in: ['upcoming', 'open'] } });
    ok(res, { students, teachers, assessmentsPending, galleryPending: galleryCount, upcomingComps });
  } catch (err) { next(err); }
};
