const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/skillController');
const { authenticate, authorize } = require('../middleware/auth');

// Skill areas — public read
router.get('/areas', ctrl.listAreas);
router.post('/areas', authenticate, authorize('admin'), ctrl.createArea);
router.put('/areas/:id', authenticate, authorize('admin'), ctrl.updateArea);

// Sub-skills
router.get('/sub-skills', ctrl.listSubSkills);
router.post('/sub-skills', authenticate, authorize('admin'), ctrl.createSubSkill);
router.put('/sub-skills/:id', authenticate, authorize('admin'), ctrl.updateSubSkill);

module.exports = router;
