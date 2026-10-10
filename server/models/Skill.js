const mongoose = require('mongoose');

const levelDescSchema = new mongoose.Schema({
  level: { type: Number, required: true, min: 1, max: 4 },
  label: { type: String, required: true },
  description: { type: String },
}, { _id: false });

const subSkillSchema = new mongoose.Schema(
  {
    skillArea: { type: mongoose.Schema.Types.ObjectId, ref: 'SkillArea', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    applicableClassGroups: [{ type: String }],
    levelDescriptions: [levelDescSchema],
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

subSkillSchema.index({ skillArea: 1 });

const skillAreaSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String },
    icon: { type: String },
    color: { type: String },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const SkillArea = mongoose.model('SkillArea', skillAreaSchema);
const SubSkill = mongoose.model('SubSkill', subSkillSchema);

module.exports = { SkillArea, SubSkill };
