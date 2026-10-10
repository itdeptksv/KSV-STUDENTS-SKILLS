const Competition = require('../models/Competition');
const { CompetitionRegistration, JudgingEntry, CompetitionResult } = require('../models/CompetitionResult');
const Student = require('../models/Student');
const { ok, created, paginated } = require('../utils/response');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const audit = require('../utils/audit');

const VALID_TRANSITIONS = {
  draft: ['upcoming', 'cancelled'],
  upcoming: ['open', 'cancelled'],
  open: ['closed', 'cancelled'],
  closed: ['results_out'],
  results_out: [],
  cancelled: [],
};

exports.list = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.academicYear) filter.academicYear = req.query.academicYear;
    // Public: only show non-draft
    if (!req.user) filter.status = { $in: ['upcoming', 'open', 'closed', 'results_out'] };
    const [comps, total] = await Promise.all([
      Competition.find(filter).populate('skillArea', 'name').populate('academicYear', 'label')
        .skip(skip).limit(limit).sort({ eventDate: -1 }),
      Competition.countDocuments(filter),
    ]);
    paginated(res, comps, buildPaginationMeta(total, page, limit));
  } catch (err) { next(err); }
};

exports.get = async (req, res, next) => {
  try {
    const comp = await Competition.findById(req.params.id)
      .populate('skillArea', 'name').populate('eligibleClasses', 'name shortName')
      .populate('academicYear', 'label').populate('createdBy', 'name');
    if (!comp) return res.status(404).json({ success: false, message: 'Competition not found' });
    ok(res, comp);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const comp = await Competition.create({ ...req.body, createdBy: req.user._id });
    created(res, comp);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const comp = await Competition.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!comp) return res.status(404).json({ success: false, message: 'Competition not found' });
    ok(res, comp);
  } catch (err) { next(err); }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const comp = await Competition.findById(req.params.id);
    if (!comp) return res.status(404).json({ success: false, message: 'Competition not found' });
    if (!VALID_TRANSITIONS[comp.status]?.includes(status))
      return res.status(400).json({ success: false, message: `Cannot transition from ${comp.status} to ${status}` });
    comp.status = status;
    if (status === 'results_out') {
      comp.resultsPublishedBy = req.user._id;
      comp.resultsPublishedAt = new Date();
      await CompetitionResult.updateMany({ competition: comp._id }, { isPublished: true, publishedBy: req.user._id, publishedAt: new Date() });
    }
    await comp.save();
    await audit(req.user._id, 'UPDATE_COMPETITION_STATUS', 'Competition', comp._id, { status }, req.ip);
    ok(res, comp);
  } catch (err) { next(err); }
};

exports.register = async (req, res, next) => {
  try {
    const comp = await Competition.findById(req.params.id);
    if (!comp) return res.status(404).json({ success: false, message: 'Competition not found' });
    if (comp.status !== 'open') return res.status(400).json({ success: false, message: 'Registration not open' });
    if (comp.registrationDeadline && new Date() > comp.registrationDeadline)
      return res.status(400).json({ success: false, message: 'Registration deadline passed' });
    const { studentId, teamName, teamMembers } = req.body;
    // Validate student eligibility
    const student = await Student.findById(studentId).populate('class');
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    const eligibleIds = comp.eligibleClasses.map((c) => c.toString());
    if (eligibleIds.length && !eligibleIds.includes(student.class._id.toString()))
      return res.status(400).json({ success: false, message: 'Student not eligible for this competition' });
    const reg = await CompetitionRegistration.create({
      competition: comp._id, student: studentId, teamName, teamMembers,
      registeredBy: req.user._id,
    });
    created(res, reg, 'Student registered');
  } catch (err) { next(err); }
};

exports.listRegistrations = async (req, res, next) => {
  try {
    const regs = await CompetitionRegistration.find({ competition: req.params.id })
      .populate('student', 'name admissionNumber class section')
      .populate('registeredBy', 'name');
    ok(res, regs);
  } catch (err) { next(err); }
};

exports.enterScores = async (req, res, next) => {
  try {
    const { registrationId, scores, remarks } = req.body;
    const reg = await CompetitionRegistration.findById(registrationId).populate('competition');
    if (!reg) return res.status(404).json({ success: false, message: 'Registration not found' });
    const comp = reg.competition;
    // Validate scores against criteria
    let totalScore = 0;
    const validatedScores = [];
    for (const s of scores) {
      const criterion = comp.judgingCriteria.find((c) => c.name === s.criterionName);
      if (!criterion) return res.status(400).json({ success: false, message: `Unknown criterion: ${s.criterionName}` });
      if (s.score > criterion.maxMarks) return res.status(400).json({ success: false, message: `Score exceeds max for ${s.criterionName}` });
      totalScore += s.score;
      validatedScores.push(s);
    }
    const entry = await JudgingEntry.findOneAndUpdate(
      { competition: comp._id, student: reg.student },
      { competition: comp._id, registration: reg._id, student: reg.student, scores: validatedScores, totalScore, remarks, enteredBy: req.user._id },
      { upsert: true, new: true }
    );
    ok(res, entry);
  } catch (err) { next(err); }
};

exports.calculateResults = async (req, res, next) => {
  try {
    const comp = await Competition.findById(req.params.id);
    if (!comp) return res.status(404).json({ success: false, message: 'Competition not found' });
    const entries = await JudgingEntry.find({ competition: comp._id }).sort({ totalScore: -1 });
    const prizes = ['1st', '2nd', '3rd'];
    const results = [];
    for (let i = 0; i < entries.length; i++) {
      const rank = i + 1;
      const prize = prizes[i] || 'Participation';
      results.push(await CompetitionResult.findOneAndUpdate(
        { competition: comp._id, student: entries[i].student },
        { competition: comp._id, student: entries[i].student, rank, totalScore: entries[i].totalScore, prize },
        { upsert: true, new: true }
      ));
    }
    ok(res, results, 'Results calculated');
  } catch (err) { next(err); }
};

exports.getResults = async (req, res, next) => {
  try {
    const comp = await Competition.findById(req.params.id);
    if (!comp) return res.status(404).json({ success: false, message: 'Competition not found' });
    const filter = { competition: req.params.id };
    // Public only sees published
    if (!req.user || !['admin', 'class_teacher', 'skill_teacher'].includes(req.user?.role))
      filter.isPublished = true;
    const results = await CompetitionResult.find(filter)
      .populate('student', 'name class section')
      .sort({ rank: 1 });
    ok(res, results);
  } catch (err) { next(err); }
};
