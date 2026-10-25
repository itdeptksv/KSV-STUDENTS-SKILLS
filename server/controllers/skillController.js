const mongoose = require('mongoose');
const { SkillArea, SubSkill } = require('../models/Skill');
const { ok, created } = require('../utils/response');

const DEFAULT_TAXONOMY = [
  { _id: '60d0fe4f5311236168a10901', name: 'Reading', order: 1, color: '#3b82f6', isActive: true, subSkills: ['Fluency', 'Pronunciation', 'Comprehension', 'Vocabulary', 'Reading Speed'] },
  { _id: '60d0fe4f5311236168a10902', name: 'Writing', order: 2, color: '#8b5cf6', isActive: true, subSkills: ['Handwriting', 'Spelling', 'Grammar', 'Creative Writing', 'Composition'] },
  { _id: '60d0fe4f5311236168a10903', name: 'Speaking & Communication', order: 3, color: '#ec4899', isActive: true, subSkills: ['Clarity', 'Confidence', 'Elocution', 'Debate', 'Storytelling'] },
  { _id: '60d0fe4f5311236168a10904', name: 'Listening', order: 4, color: '#f59e0b', isActive: true, subSkills: ['Following Instructions', 'Note-Taking', 'Recall'] },
  { _id: '60d0fe4f5311236168a10905', name: 'Numeracy & Logical Thinking', order: 5, color: '#10b981', isActive: true, subSkills: ['Mental Mathematics', 'Problem-Solving', 'Puzzles', 'Reasoning'] },
  { _id: '60d0fe4f5311236168a10906', name: 'Digital / Computer Skills', order: 6, color: '#06b6d4', isActive: true, subSkills: ['Typing', 'Office Tools', 'Basic Coding', 'Internet Safety'] },
  { _id: '60d0fe4f5311236168a10907', name: 'Arts & Crafts', order: 7, color: '#f97316', isActive: true, subSkills: ['Drawing', 'Painting', 'Clay Work', 'Craft', 'Rangoli'] },
  { _id: '60d0fe4f5311236168a10908', name: 'Music & Dance', order: 8, color: '#a855f7', isActive: true, subSkills: ['Vocal Skills', 'Instruments', 'Classical Dance', 'Folk Dance'] },
  { _id: '60d0fe4f5311236168a10909', name: 'Sports & Physical Skills', order: 9, color: '#22c55e', isActive: true, subSkills: ['Athletics', 'Team Games', 'Yoga', 'Fitness'] },
  { _id: '60d0fe4f5311236168a1090a', name: 'Life Skills & Leadership', order: 10, color: '#ef4444', isActive: true, subSkills: ['Leadership', 'Teamwork', 'Time Management', 'Empathy', 'Discipline'] },
];

const DEFAULT_SUB_SKILLS = DEFAULT_TAXONOMY.flatMap((a) =>
  a.subSkills.map((subName, idx) => ({
    _id: `${a._id}_sub_${idx + 1}`,
    name: subName,
    order: idx + 1,
    skillArea: { _id: a._id, name: a.name },
    isActive: true,
  }))
);

// Skill Areas
exports.listAreas = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return ok(res, DEFAULT_TAXONOMY.map(({ subSkills, ...rest }) => rest));
    }
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
    if (mongoose.connection.readyState !== 1) {
      let list = DEFAULT_SUB_SKILLS;
      if (req.query.skillArea) {
        list = list.filter((s) => s.skillArea?._id === req.query.skillArea || s.skillArea === req.query.skillArea);
      }
      return ok(res, list);
    }
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
