const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/competitionController');
const { authenticate, authorize } = require('../middleware/auth');

// Public routes
router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.get('/:id/results', ctrl.getResults);

// Authenticated
router.post('/', authenticate, authorize('admin'), ctrl.create);
router.put('/:id', authenticate, authorize('admin'), ctrl.update);
router.post('/:id/status', authenticate, authorize('admin'), ctrl.updateStatus);
router.post('/:id/register', authenticate, authorize('admin', 'class_teacher'), ctrl.register);
router.get('/:id/registrations', authenticate, authorize('admin', 'class_teacher', 'skill_teacher'), ctrl.listRegistrations);
router.post('/:id/scores', authenticate, authorize('admin', 'skill_teacher'), ctrl.enterScores);
router.post('/:id/calculate-results', authenticate, authorize('admin'), ctrl.calculateResults);

module.exports = router;
