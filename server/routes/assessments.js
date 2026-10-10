const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/assessmentController');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadEvidence, uploadExcel } = require('../utils/upload');

router.use(authenticate);
router.get('/', ctrl.list);
router.post('/', authorize('admin', 'class_teacher', 'skill_teacher'), ctrl.create);
router.post('/bulk', authorize('admin', 'class_teacher', 'skill_teacher'), ctrl.bulkCreate);
router.post('/import', authorize('admin', 'class_teacher', 'skill_teacher'), uploadExcel().single('file'), ctrl.importExcel);
router.get('/not-assessed', authorize('admin', 'class_teacher', 'skill_teacher'), ctrl.notAssessed);
router.get('/:id', ctrl.get);
router.put('/:id', authorize('admin', 'class_teacher', 'skill_teacher'), ctrl.update);
router.post('/:id/submit', authorize('admin', 'class_teacher', 'skill_teacher'), ctrl.submit);
router.post('/:id/approve', authorize('admin'), ctrl.approve);
router.post('/:id/reject', authorize('admin'), ctrl.reject);

module.exports = router;
