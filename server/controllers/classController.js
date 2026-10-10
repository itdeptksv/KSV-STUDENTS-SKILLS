const Class = require('../models/Class');
const { ok, created } = require('../utils/response');

exports.list = async (req, res, next) => {
  try {
    const classes = await Class.find({ isActive: true })
      .populate('sections.classTeacher', 'name email')
      .sort({ order: 1 });
    ok(res, classes);
  } catch (err) { next(err); }
};

exports.get = async (req, res, next) => {
  try {
    const cls = await Class.findById(req.params.id).populate('sections.classTeacher', 'name email');
    if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });
    ok(res, cls);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const cls = await Class.create({ ...req.body, createdBy: req.user._id });
    created(res, cls);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const cls = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });
    ok(res, cls);
  } catch (err) { next(err); }
};

exports.addSection = async (req, res, next) => {
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });
    cls.sections.push(req.body);
    await cls.save();
    ok(res, cls);
  } catch (err) { next(err); }
};

exports.updateSection = async (req, res, next) => {
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) return res.status(404).json({ success: false, message: 'Class not found' });
    const section = cls.sections.id(req.params.sectionId);
    if (!section) return res.status(404).json({ success: false, message: 'Section not found' });
    Object.assign(section, req.body);
    await cls.save();
    ok(res, cls);
  } catch (err) { next(err); }
};
