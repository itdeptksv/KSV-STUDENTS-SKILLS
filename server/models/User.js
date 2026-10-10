const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ROLES = ['admin', 'class_teacher', 'skill_teacher', 'student', 'parent'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, required: true },
    phone: { type: String, trim: true },
    photo: { type: String },
    isActive: { type: Boolean, default: true },
    // For teachers: assigned classes
    assignedClasses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
    assignedSkillAreas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SkillArea' }],
    // For students/parents: link
    studentRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    refreshTokens: [{ type: String, select: false }],
    lastLogin: { type: Date },
    passwordChangedAt: { type: Date },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordChangedAt = new Date();
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshTokens;
  return obj;
};

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);
module.exports.ROLES = ROLES;
