const mongoose = require('mongoose');

const COMP_STATUSES = ['draft', 'upcoming', 'open', 'closed', 'results_out', 'cancelled'];
const COMP_FORMATS = ['individual', 'team', 'class', 'house'];
const COMP_LEVELS = ['school', 'inter_school', 'district', 'state', 'national'];

const criterionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  maxMarks: { type: Number, required: true, min: 1 },
  description: { type: String },
}, { _id: false });

const competitionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    skillArea: { type: mongoose.Schema.Types.ObjectId, ref: 'SkillArea' },
    banner: { type: String },
    eligibleClasses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
    level: { type: String, enum: COMP_LEVELS, default: 'school' },
    format: { type: String, enum: COMP_FORMATS, default: 'individual' },
    registrationDeadline: { type: Date },
    eventDate: { type: Date, required: true },
    startTime: { type: String },
    endTime: { type: String },
    venue: { type: String },
    rules: { type: String },
    timeLimit: { type: Number }, // minutes
    judgingCriteria: [criterionSchema],
    status: { type: String, enum: COMP_STATUSES, default: 'draft' },
    academicYear: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear' },
    resultsPublishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resultsPublishedAt: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

competitionSchema.index({ status: 1 });
competitionSchema.index({ eventDate: 1 });

module.exports = mongoose.model('Competition', competitionSchema);
module.exports.COMP_STATUSES = COMP_STATUSES;
