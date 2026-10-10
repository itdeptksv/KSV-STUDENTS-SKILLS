const mongoose = require('mongoose');

const academicTermSchema = new mongoose.Schema(
  {
    academicYear: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    name: { type: String, required: true, trim: true }, // Term 1, Term 2, Term 3
    termNumber: { type: Number, required: true, min: 1, max: 3 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isCurrent: { type: Boolean, default: false },
    isLocked: { type: Boolean, default: false },
    lockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lockedAt: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

academicTermSchema.index({ academicYear: 1, termNumber: 1 }, { unique: true });

module.exports = mongoose.model('AcademicTerm', academicTermSchema);
