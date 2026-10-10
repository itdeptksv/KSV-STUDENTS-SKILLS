const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/miscController');
const { authenticate, authorize } = require('../middleware/auth');

// Announcements — public read
router.get('/announcements', ctrl.listAnnouncements);
router.post('/announcements', authenticate, authorize('admin'), ctrl.createAnnouncement);
router.put('/announcements/:id', authenticate, authorize('admin'), ctrl.updateAnnouncement);

// Notifications
router.get('/notifications', authenticate, ctrl.myNotifications);
router.post('/notifications/mark-read', authenticate, ctrl.markRead);

// Parent-child links
router.get('/parents/children', authenticate, authorize('parent'), ctrl.myChildren);
router.post('/parents/link', authenticate, authorize('parent'), ctrl.linkChild);
router.post('/parents/admin-link', authenticate, authorize('admin'), ctrl.adminLinkChild);

// Settings
router.get('/settings', authenticate, authorize('admin'), ctrl.getSettings);
router.post('/settings', authenticate, authorize('admin'), ctrl.setSetting);

module.exports = router;
