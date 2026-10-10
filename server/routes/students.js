const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/studentController');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadExcel, uploadImage } = require('../utils/upload');

router.use(authenticate);
router.get('/', ctrl.list);
router.post('/', authorize('admin', 'class_teacher'), ctrl.create);
router.get('/template', authorize('admin'), ctrl.downloadTemplate);
router.post('/import/preview', authorize('admin'), uploadExcel().single('file'), ctrl.importPreview);
router.post('/import/save', authorize('admin'), uploadExcel().single('file'), ctrl.importSave);
router.get('/:id', ctrl.get);
router.put('/:id', authorize('admin', 'class_teacher'), ctrl.update);

module.exports = router;
