const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    competition: { type: mongoose.Schema.Types.ObjectId, ref: 'Competition', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    teamName: { type: String },
    teamMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    registeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['registered', 'withdrawn', 'disqualified'], default: 'registered' },
  },
  { timestamps: true }
);

registrationSchema.index({ competition: 1, student: 1 }, { unique: true });

const judgingEntrySchema = new mongoose.Schema(
  {
    competition: { type: mongoose.Schema.Types.ObjectId, ref: 'Competition', required: true },
    registration: { type: mongoose.Schema.Types.ObjectId, ref: 'CompetitionRegistration', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    scores: [{ criterionName: String, score: Number }],
    totalScore: { type: Number },
    remarks: { type: String },
    enteredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

judgingEntrySchema.index({ competition: 1, student: 1 }, { unique: true });

const resultSchema = new mongoose.Schema(
  {
    competition: { type: mongoose.Schema.Types.ObjectId, ref: 'Competition', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    rank: { type: Number },
    totalScore: { type: Number },
    prize: { type: String }, // 1st, 2nd, 3rd, Participation
    isPublished: { type: Boolean, default: false },
    publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

resultSchema.index({ competition: 1 });

module.exports = {
  CompetitionRegistration: mongoose.model('CompetitionRegistration', registrationSchema),
  JudgingEntry: mongoose.model('JudgingEntry', judgingEntrySchema),
  CompetitionResult: mongoose.model('CompetitionResult', resultSchema),
};
