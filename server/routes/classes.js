const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/classController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.get('/', ctrl.list);
router.post('/', authorize('admin'), ctrl.create);
router.get('/:id', ctrl.get);
router.put('/:id', authorize('admin'), ctrl.update);
router.post('/:id/sections', authorize('admin'), ctrl.addSection);
router.put('/:id/sections/:sectionId', authorize('admin'), ctrl.updateSection);

module.exports = router;
