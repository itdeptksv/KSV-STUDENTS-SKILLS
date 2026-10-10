const mongoose = require('mongoose');

const academicYearSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, unique: true, trim: true }, // e.g. "2024-25"
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isCurrent: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Only one current year at a time
academicYearSchema.pre('save', async function (next) {
  if (this.isCurrent && this.isModified('isCurrent')) {
    await this.constructor.updateMany({ _id: { $ne: this._id } }, { isCurrent: false });
  }
  next();
});

module.exports = mongoose.model('AcademicYear', academicYearSchema);
