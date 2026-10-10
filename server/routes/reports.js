const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reportController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.get('/dashboard', authorize('admin'), ctrl.adminDashboard);
router.get('/student/:studentId', ctrl.studentSkillReport);
router.get('/class-summary', authorize('admin', 'class_teacher', 'skill_teacher'), ctrl.classSkillSummary);
router.get('/competition/:competitionId', ctrl.competitionReport);

module.exports = router;
