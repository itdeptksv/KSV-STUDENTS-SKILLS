const AcademicYear = require('../models/AcademicYear');
const AcademicTerm = require('../models/AcademicTerm');
const { ok, created } = require('../utils/response');

// --- Academic Years ---
exports.listYears = async (req, res, next) => {
  try {
    const years = await AcademicYear.find().sort({ startDate: -1 });
    ok(res, years);
  } catch (err) { next(err); }
};

exports.createYear = async (req, res, next) => {
  try {
    const year = await AcademicYear.create({ ...req.body, createdBy: req.user._id });
    created(res, year);
  } catch (err) { next(err); }
};

exports.updateYear = async (req, res, next) => {
  try {
    const year = await AcademicYear.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!year) return res.status(404).json({ success: false, message: 'Academic year not found' });
    ok(res, year);
  } catch (err) { next(err); }
};

exports.setCurrentYear = async (req, res, next) => {
  try {
    await AcademicYear.updateMany({}, { isCurrent: false });
    const year = await AcademicYear.findByIdAndUpdate(req.params.id, { isCurrent: true }, { new: true });
    if (!year) return res.status(404).json({ success: false, message: 'Academic year not found' });
    ok(res, year, 'Current year set');
  } catch (err) { next(err); }
};

// --- Academic Terms ---
exports.listTerms = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.academicYear) filter.academicYear = req.query.academicYear;
    const terms = await AcademicTerm.find(filter).populate('academicYear', 'label').sort({ termNumber: 1 });
    ok(res, terms);
  } catch (err) { next(err); }
};

exports.createTerm = async (req, res, next) => {
  try {
    const term = await AcademicTerm.create({ ...req.body, createdBy: req.user._id });
    created(res, term);
  } catch (err) { next(err); }
};

exports.updateTerm = async (req, res, next) => {
  try {
    const term = await AcademicTerm.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!term) return res.status(404).json({ success: false, message: 'Term not found' });
    ok(res, term);
  } catch (err) { next(err); }
};

exports.lockTerm = async (req, res, next) => {
  try {
    const term = await AcademicTerm.findByIdAndUpdate(
      req.params.id,
      { isLocked: true, lockedBy: req.user._id, lockedAt: new Date() },
      { new: true }
    );
    if (!term) return res.status(404).json({ success: false, message: 'Term not found' });
    ok(res, term, 'Term locked');
  } catch (err) { next(err); }
};

exports.unlockTerm = async (req, res, next) => {
  try {
    const term = await AcademicTerm.findByIdAndUpdate(
      req.params.id,
      { isLocked: false, lockedBy: null, lockedAt: null },
      { new: true }
    );
    if (!term) return res.status(404).json({ success: false, message: 'Term not found' });
    ok(res, term, 'Term unlocked');
  } catch (err) { next(err); }
};
