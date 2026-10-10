const User = require('../models/User');
const { ok, created, paginated } = require('../utils/response');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const audit = require('../utils/audit');

exports.list = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.search) filter.name = { $regex: req.query.search, $options: 'i' };
    const [users, total] = await Promise.all([
      User.find(filter).select('-password -refreshTokens').skip(skip).limit(limit).sort({ name: 1 }),
      User.countDocuments(filter),
    ]);
    paginated(res, users, buildPaginationMeta(total, page, limit));
  } catch (err) { next(err); }
};

exports.get = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password -refreshTokens');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    ok(res, user);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, assignedClasses, assignedSkillAreas } = req.body;
    // Prevent privilege escalation
    if (role === 'admin' && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Cannot assign admin role' });
    const user = await User.create({ name, email, password, role, phone, assignedClasses, assignedSkillAreas });
    await audit(req.user._id, 'CREATE_USER', 'User', user._id, { role }, req.ip);
    created(res, user.toSafeObject(), 'User created');
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { name, email, phone, isActive, assignedClasses, assignedSkillAreas } = req.body;
    // Don't allow role change via this endpoint
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, isActive, assignedClasses, assignedSkillAreas },
      { new: true, runValidators: true }
    ).select('-password -refreshTokens');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    await audit(req.user._id, 'UPDATE_USER', 'User', user._id, null, req.ip);
    ok(res, user);
  } catch (err) { next(err); }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    const valid = await user.comparePassword(currentPassword);
    if (!valid) return res.status(400).json({ success: false, message: 'Current password incorrect' });
    user.password = newPassword;
    await user.save();
    ok(res, null, 'Password changed');
  } catch (err) { next(err); }
};

exports.adminResetPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    const user = await User.findById(req.params.id).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.password = newPassword;
    await user.save();
    await audit(req.user._id, 'RESET_PASSWORD', 'User', user._id, null, req.ip);
    ok(res, null, 'Password reset');
  } catch (err) { next(err); }
};
