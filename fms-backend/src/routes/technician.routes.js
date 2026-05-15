const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.use(protect);
router.use(authorize('technician'));

// Dashboard
router.get('/dashboard', (req, res) => {
  res.json({ success: true, message: 'Technician dashboard', user: req.user });
});

// Tasks
router.get('/tasks', (req, res) => {
  res.json({ success: true, message: 'Get my tasks' });
});

router.put('/tasks/:id/status', (req, res) => {
  res.json({ success: true, message: 'Update task status' });
});

router.post('/tasks/:id/upload-proof', (req, res) => {
  res.json({ success: true, message: 'Upload completion proof' });
});

// Attendance
router.post('/attendance/checkin', (req, res) => {
  res.json({ success: true, message: 'Check-in successful' });
});

router.post('/attendance/checkout', (req, res) => {
  res.json({ success: true, message: 'Check-out successful' });
});

router.get('/attendance/history', (req, res) => {
  res.json({ success: true, message: 'Get attendance history' });
});

// My profile
router.get('/profile', (req, res) => {
  res.json({ success: true, user: req.user });
});

router.put('/profile', (req, res) => {
  res.json({ success: true, message: 'Profile updated' });
});

router.post('/emergency-alert', (req, res) => {
  res.json({ success: true, message: 'Emergency alert sent' });
});

module.exports = router;