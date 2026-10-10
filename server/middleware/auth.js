const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password -refreshTokens');
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'User not found or inactive' });
    }
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Insufficient permissions' });
  }
  next();
};

// Verify teacher is assigned to the class in the request
const requireClassAccess = async (req, res, next) => {
  const { user } = req;
  if (user.role === 'admin') return next();
  const classId = req.params.classId || req.body.class || req.query.classId;
  if (!classId) return res.status(400).json({ success: false, message: 'Class ID required' });
  const assigned = user.assignedClasses.map((c) => c.toString());
  if (!assigned.includes(classId.toString())) {
    return res.status(403).json({ success: false, message: 'Not assigned to this class' });
  }
  next();
};

module.exports = { authenticate, authorize, requireClassAccess };
