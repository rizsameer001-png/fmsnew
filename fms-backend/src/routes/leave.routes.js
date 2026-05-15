const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const {
  applyLeave,
  getMyLeaves,
  getTeamLeaves,
  getPendingLeaves,
  getLeaveBalance,
  approveLeave,
  rejectLeave,
  cancelLeave,
  getLeaveStats
} = require('../controllers/leave.controller');

// All routes require authentication
router.use(protect);

// Employee routes
router.post('/apply', applyLeave);
router.get('/my', getMyLeaves);
router.get('/balance', getLeaveBalance);
router.put('/:id/cancel', cancelLeave);

// Manager/Supervisor routes
router.get('/team', authorize('manager', 'supervisor'), getTeamLeaves);
router.get('/pending', authorize('manager', 'supervisor'), getPendingLeaves);
router.put('/:id/approve', authorize('manager', 'supervisor'), approveLeave);
router.put('/:id/reject', authorize('manager', 'supervisor'), rejectLeave);

// Admin routes
router.get('/stats', authorize('super_admin', 'manager'), getLeaveStats);

module.exports = router;