const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/academicController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
// Academic Years
router.get('/years', ctrl.listYears);
router.post('/years', authorize('admin'), ctrl.createYear);
router.put('/years/:id', authorize('admin'), ctrl.updateYear);
router.post('/years/:id/set-current', authorize('admin'), ctrl.setCurrentYear);
// Academic Terms
router.get('/terms', ctrl.listTerms);
router.post('/terms', authorize('admin'), ctrl.createTerm);
router.put('/terms/:id', authorize('admin'), ctrl.updateTerm);
router.post('/terms/:id/lock', authorize('admin'), ctrl.lockTerm);
router.post('/terms/:id/unlock', authorize('admin'), ctrl.unlockTerm);

module.exports = router;
