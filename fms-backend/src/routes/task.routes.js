const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.use(protect);

// Task routes
router.get('/', authorize('manager', 'supervisor', 'admin'), (req, res) => {
  res.json({ success: true, message: 'Get tasks' });
});

router.get('/my', authorize('technician'), (req, res) => {
  res.json({ success: true, message: 'Get my tasks' });
});

router.get('/:id', (req, res) => {
  res.json({ success: true, message: 'Get task details' });
});

router.post('/', authorize('supervisor', 'manager'), (req, res) => {
  res.json({ success: true, message: 'Task created' });
});

router.put('/:id/assign', authorize('supervisor', 'manager'), (req, res) => {
  res.json({ success: true, message: 'Task assigned' });
});

router.put('/:id/status', authorize('technician'), (req, res) => {
  res.json({ success: true, message: 'Task status updated' });
});

router.put('/:id/verify', authorize('supervisor'), (req, res) => {
  res.json({ success: true, message: 'Task verified' });
});

router.post('/:id/upload-proof', authorize('technician'), (req, res) => {
  res.json({ success: true, message: 'Proof uploaded' });
});

module.exports = router;