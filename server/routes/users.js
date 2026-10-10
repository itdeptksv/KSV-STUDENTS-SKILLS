const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.get('/', authorize('admin'), ctrl.list);
router.post('/', authorize('admin'), ctrl.create);
router.get('/:id', authorize('admin'), ctrl.get);
router.put('/:id', authorize('admin'), ctrl.update);
router.post('/:id/reset-password', authorize('admin'), ctrl.adminResetPassword);
router.post('/me/change-password', ctrl.changePassword);

module.exports = router;
