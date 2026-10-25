const mongoose = require('mongoose');
const { AuditLog } = require('../models/Misc');

const audit = async (userId, action, resource, resourceId, details, ip) => {
  if (mongoose.connection.readyState !== 1) return;
  try {
    await AuditLog.create({ user: userId, action, resource, resourceId, details, ip });
  } catch (e) {
    // Non-blocking — log but don't fail the request
    console.error('Audit log error:', e.message);
  }
};

module.exports = audit;
