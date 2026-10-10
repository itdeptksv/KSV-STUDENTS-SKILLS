const mongoose = require('mongoose');

const CLASS_GROUPS = ['Pre-KG–2', 'Classes 3–5', 'Classes 6–8', 'Classes 9–12'];

const sectionSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true }, // A, B, C
  classTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
});

const classSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // Pre-KG, KG, Class 1 … Class 12
    shortName: { type: String, required: true, trim: true },
    classGroup: { type: String, enum: CLASS_GROUPS, required: true },
    order: { type: Number, required: true }, // for sorting
    sections: [sectionSchema],
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

classSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model('Class', classSchema);
module.exports.CLASS_GROUPS = CLASS_GROUPS;
