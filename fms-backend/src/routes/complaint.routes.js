const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.use(protect);

// Complaint routes
router.get('/', (req, res) => {
  res.json({ success: true, message: 'Get complaints' });
});

router.get('/stats', (req, res) => {
  res.json({ success: true, message: 'Get complaint stats' });
});

router.get('/:id', (req, res) => {
  res.json({ success: true, message: 'Get complaint details' });
});

router.post('/', authorize('customer'), (req, res) => {
  res.json({ success: true, message: 'Complaint created' });
});

router.put('/:id/assign', authorize('supervisor', 'manager'), (req, res) => {
  res.json({ success: true, message: 'Complaint assigned' });
});

router.put('/:id/status', authorize('technician', 'supervisor'), (req, res) => {
  res.json({ success: true, message: 'Complaint status updated' });
});

router.post('/:id/rate', authorize('customer'), (req, res) => {
  res.json({ success: true, message: 'Rating submitted' });
});

router.post('/:id/escalate', authorize('technician', 'supervisor', 'customer'), (req, res) => {
  res.json({ success: true, message: 'Complaint escalated' });
});

module.exports = router;