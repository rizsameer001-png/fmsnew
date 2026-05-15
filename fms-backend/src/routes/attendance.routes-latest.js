const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const {
  checkIn,
  checkOut,
  getMyAttendance,
  getTodayStatus,
  getAllEmployeesAttendance,
  getTeamAttendance,
  approveAttendance,
  getAttendanceStats
} = require('../controllers/attendance.controller');

// All routes require authentication
router.use(protect);

// ==================== SELF ATTENDANCE (ALL USERS) ====================
router.post('/checkin', checkIn);  // Anyone can check-in
router.post('/checkout', checkOut);  // Anyone can check-out
router.get('/my', getMyAttendance);
router.get('/today', getTodayStatus);

// ==================== ADMIN ONLY ====================
router.get('/all', authorize('super_admin'), getAllEmployeesAttendance);

// ==================== MANAGER/SUPERVISOR ====================
router.get('/team', authorize('manager', 'supervisor'), getTeamAttendance);
router.get('/stats', authorize('super_admin', 'manager', 'supervisor'), getAttendanceStats);
router.put('/:id/approve', authorize('super_admin', 'manager'), approveAttendance);

module.exports = router;