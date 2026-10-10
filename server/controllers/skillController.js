const { SkillArea, SubSkill } = require('../models/Skill');
const { ok, created } = require('../utils/response');

// Skill Areas
exports.listAreas = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.active !== 'false') filter.isActive = true;
    const areas = await SkillArea.find(filter).sort({ order: 1 });
    ok(res, areas);
  } catch (err) { next(err); }
};

exports.createArea = async (req, res, next) => {
  try {
    const area = await SkillArea.create({ ...req.body, createdBy: req.user._id });
    created(res, area);
  } catch (err) { next(err); }
};

exports.updateArea = async (req, res, next) => {
  try {
    const area = await SkillArea.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!area) return res.status(404).json({ success: false, message: 'Skill area not found' });
    ok(res, area);
  } catch (err) { next(err); }
};

// Sub-skills
exports.listSubSkills = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.skillArea) filter.skillArea = req.query.skillArea;
    if (req.query.active !== 'false') filter.isActive = true;
    const subs = await SubSkill.find(filter).populate('skillArea', 'name').sort({ order: 1 });
    ok(res, subs);
  } catch (err) { next(err); }
};

exports.createSubSkill = async (req, res, next) => {
  try {
    const sub = await SubSkill.create({ ...req.body, createdBy: req.user._id });
    created(res, sub);
  } catch (err) { next(err); }
};

exports.updateSubSkill = async (req, res, next) => {
  try {
    const sub = await SubSkill.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!sub) return res.status(404).json({ success: false, message: 'Sub-skill not found' });
    ok(res, sub);
  } catch (err) { next(err); }
};
