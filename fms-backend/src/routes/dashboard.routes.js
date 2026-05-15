const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

// Role-specific dashboards
router.get('/admin', (req, res) => {
  res.json({ 
    success: true, 
    role: req.user.role,
    stats: {
      totalUsers: 0,
      totalBuildings: 0,
      totalComplaints: 0,
      pendingComplaints: 0
    }
  });
});

router.get('/manager', (req, res) => {
  res.json({ 
    success: true, 
    role: req.user.role,
    stats: {
      teamMembers: 0,
      openComplaints: 0,
      activeTasks: 0
    }
  });
});

router.get('/supervisor', (req, res) => {
  res.json({ 
    success: true, 
    role: req.user.role,
    stats: {
      teamAttendance: 0,
      pendingTasks: 0
    }
  });
});

router.get('/technician', (req, res) => {
  res.json({ 
    success: true, 
    role: req.user.role,
    attendance: {
      isCheckedIn: false,
      isCheckedOut: false
    },
    stats: {
      pendingTasks: 0,
      completedToday: 0
    }
  });
});

router.get('/customer', (req, res) => {
  res.json({ 
    success: true, 
    role: req.user.role,
    activeComplaints: [],
    recentInvoices: []
  });
});

router.get('/building-metrics', (req, res) => {
  res.json({ success: true, metrics: [] });
});

module.exports = router;