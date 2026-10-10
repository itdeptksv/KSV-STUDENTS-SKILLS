const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ok } = require('../utils/response');
const audit = require('../utils/audit');

const signAccess = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '15m' });

const signRefresh = (id) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' });

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password required' });

    const user = await User.findOne({ email }).select('+password +refreshTokens');
    if (!user || !user.isActive)
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const valid = await user.comparePassword(password);
    if (!valid)
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const accessToken = signAccess(user._id);
    const refreshToken = signRefresh(user._id);

    user.refreshTokens = [...(user.refreshTokens || []).slice(-4), refreshToken];
    user.lastLogin = new Date();
    await user.save();

    await audit(user._id, 'LOGIN', 'User', user._id, null, req.ip);

    ok(res, { accessToken, refreshToken, user: user.toSafeObject() }, 'Login successful');
  } catch (err) {
    next(err);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(401).json({ success: false, message: 'Refresh token required' });

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    const user = await User.findById(decoded.id).select('+refreshTokens');
    if (!user || !user.isActive || !user.refreshTokens?.includes(refreshToken))
      return res.status(401).json({ success: false, message: 'Refresh token revoked' });

    const newAccess = signAccess(user._id);
    const newRefresh = signRefresh(user._id);

    user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
    user.refreshTokens.push(newRefresh);
    await user.save();

    ok(res, { accessToken: newAccess, refreshToken: newRefresh });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const user = await User.findById(req.user._id).select('+refreshTokens');
    if (user && refreshToken) {
      user.refreshTokens = (user.refreshTokens || []).filter((t) => t !== refreshToken);
      await user.save();
    }
    await audit(req.user._id, 'LOGOUT', 'User', req.user._id, null, req.ip);
    ok(res, null, 'Logged out');
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res) => {
  ok(res, req.user);
};

// Bootstrap: create first admin — protected by ADMIN_SETUP_TOKEN
exports.setupAdmin = async (req, res, next) => {
  try {
    const { setupToken, name, email, password } = req.body;
    if (!setupToken || setupToken !== process.env.ADMIN_SETUP_TOKEN)
      return res.status(403).json({ success: false, message: 'Invalid setup token' });

    const existing = await User.findOne({ role: 'admin' });
    if (existing)
      return res.status(409).json({ success: false, message: 'Admin already exists' });

    const admin = await User.create({ name, email, password, role: 'admin' });
    ok(res, { id: admin._id, email: admin.email }, 'Admin created', 201);
  } catch (err) {
    next(err);
  }
};
