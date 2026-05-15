// const express = require('express');
// const router = express.Router();
// const { protect } = require('../middleware/auth.middleware');
// const { authorize } = require('../middleware/role.middleware');

// router.use(protect);

// // Technician routes
// router.post('/checkin', authorize('technician', 'supervisor', 'security'), (req, res) => {
//   res.json({ success: true, message: 'Check-in successful', time: new Date() });
// });

// router.post('/checkout', authorize('technician', 'supervisor', 'security'), (req, res) => {
//   res.json({ success: true, message: 'Check-out successful', time: new Date() });
// });

// router.get('/my', (req, res) => {
//   res.json({ success: true, message: 'Get my attendance' });
// });

// // Manager/Supervisor routes
// router.get('/team', authorize('manager', 'supervisor'), (req, res) => {
//   res.json({ success: true, message: 'Get team attendance' });
// });

// router.get('/report', authorize('manager', 'supervisor', 'admin'), (req, res) => {
//   res.json({ success: true, message: 'Get attendance report' });
// });

// router.put('/:id/approve', authorize('manager', 'supervisor'), (req, res) => {
//   res.json({ success: true, message: 'Attendance approved' });
// });

// module.exports = router;


const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const {
  checkIn,
  checkOut,
  getMyAttendance,
  getTeamAttendance,
  getAttendanceReport,
  approveAttendance,
  getAttendanceStats,
  getTodayStatus
} = require('../controllers/attendance.controller');

// All routes require authentication
router.use(protect);

// Technician routes
router.post('/checkin', authorize('technician', 'supervisor', 'security'), checkIn);
router.post('/checkout', authorize('technician', 'supervisor', 'security'), checkOut);
router.get('/my', getMyAttendance);
router.get('/today', getTodayStatus);

// Manager/Supervisor routes
router.get('/team', authorize('manager', 'supervisor'), getTeamAttendance);
router.get('/report', authorize('manager', 'supervisor', 'admin'), getAttendanceReport);
router.get('/stats', authorize('manager', 'supervisor', 'admin'), getAttendanceStats);
router.put('/:id/approve', authorize('manager', 'supervisor'), approveAttendance);

module.exports = router;