// const express = require('express');
// const router = express.Router();
// const { protect } = require('../middleware/auth.middleware');
// const { authorize } = require('../middleware/role.middleware');

// // All routes require super_admin role
// router.use(protect);
// router.use(authorize('super_admin'));

// // Dashboard
// router.get('/dashboard/stats', (req, res) => {
//   res.json({ success: true, message: 'Admin stats endpoint - Implement controller' });
// });

// router.get('/dashboard/recent-activities', (req, res) => {
//   res.json({ success: true, message: 'Recent activities endpoint - Implement controller' });
// });

// // System settings
// router.get('/settings', (req, res) => {
//   res.json({ success: true, message: 'Get system settings' });
// });

// router.put('/settings', (req, res) => {
//   res.json({ success: true, message: 'Update system settings' });
// });

// // Activity logs
// router.get('/activity-logs', (req, res) => {
//   res.json({ success: true, message: 'Activity logs endpoint' });
// });

// // Backup
// router.post('/backup', (req, res) => {
//   res.json({ success: true, message: 'Create database backup' });
// });

// router.get('/backup/list', (req, res) => {
//   res.json({ success: true, message: 'List backups' });
// });

// module.exports = router;


const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

// All routes require super_admin role
router.use(protect);
router.use(authorize('super_admin'));

// Dashboard
router.get('/dashboard/stats', (req, res) => {
  res.json({ success: true, message: 'Admin stats endpoint' });
});

// Roles management
router.get('/roles', (req, res) => {
  res.json({ 
    success: true, 
    roles: [
      { _id: '1', name: 'super_admin', description: 'Super Administrator', permissions: ['*'], userCount: 1 },
      { _id: '2', name: 'manager', description: 'Building Manager', permissions: ['view_dashboard', 'manage_team'], userCount: 0 },
      { _id: '3', name: 'supervisor', description: 'Team Supervisor', permissions: ['view_team', 'assign_tasks'], userCount: 0 },
      { _id: '4', name: 'technician', description: 'Field Technician', permissions: ['view_tasks', 'update_status'], userCount: 0 },
      { _id: '5', name: 'customer', description: 'Customer', permissions: ['raise_complaints', 'view_invoices'], userCount: 0 }
    ]
  });
});

router.post('/roles', (req, res) => {
  res.json({ success: true, message: 'Role created', role: req.body });
});

router.put('/roles/:id', (req, res) => {
  res.json({ success: true, message: 'Role updated' });
});

router.delete('/roles/:id', (req, res) => {
  res.json({ success: true, message: 'Role deleted' });
});

// System settings
router.get('/settings', (req, res) => {
  res.json({ success: true, settings: {} });
});

router.put('/settings', (req, res) => {
  res.json({ success: true, message: 'Settings updated' });
});

// Activity logs
router.get('/activity-logs', (req, res) => {
  res.json({ success: true, logs: [] });
});

// Backup
router.post('/backup', (req, res) => {
  res.json({ success: true, message: 'Backup created' });
});

router.get('/backup/list', (req, res) => {
  res.json({ success: true, backups: [] });
});

module.exports = router;