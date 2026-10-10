const mongoose = require('mongoose');

const ASSESSMENT_STATUSES = ['draft', 'submitted', 'approved', 'rejected'];

const assessmentSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    section: { type: String, required: true },
    skillArea: { type: mongoose.Schema.Types.ObjectId, ref: 'SkillArea', required: true },
    subSkill: { type: mongoose.Schema.Types.ObjectId, ref: 'SubSkill', required: true },
    academicYear: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    term: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicTerm', required: true },
    assessmentDate: { type: Date, required: true },
    level: { type: Number, required: true, min: 1, max: 4 },
    score: { type: Number, min: 0 },
    remarks: { type: String, trim: true },
    evidence: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Evidence' }],
    status: { type: String, enum: ASSESSMENT_STATUSES, default: 'draft' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    reviewNote: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Prevent duplicate assessment for same student+subSkill+term
assessmentSchema.index(
  { student: 1, subSkill: 1, term: 1 },
  { unique: true }
);
assessmentSchema.index({ student: 1, academicYear: 1 });
assessmentSchema.index({ class: 1, section: 1, term: 1 });
assessmentSchema.index({ status: 1 });

module.exports = mongoose.model('SkillAssessment', assessmentSchema);
module.exports.ASSESSMENT_STATUSES = ASSESSMENT_STATUSES;
