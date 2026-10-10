const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/galleryController');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadImage } = require('../utils/upload');

// Public
router.get('/albums', ctrl.listAlbums);
router.get('/albums/:albumId/items', ctrl.listItems);

// Authenticated
router.post('/albums', authenticate, authorize('admin', 'class_teacher'), ctrl.createAlbum);
router.put('/albums/:id', authenticate, authorize('admin'), ctrl.updateAlbum);
router.post('/albums/:albumId/items', authenticate, authorize('admin', 'class_teacher', 'skill_teacher'),
  uploadImage('gallery').single('file'), ctrl.submitItem);
router.get('/pending', authenticate, authorize('admin'), ctrl.pendingItems);
router.post('/items/:id/approve', authenticate, authorize('admin'), ctrl.approveItem);
router.post('/items/:id/reject', authenticate, authorize('admin'), ctrl.rejectItem);

module.exports = router;
