const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.use(protect);

// Customer payment routes
router.post('/create-order', authorize('customer'), (req, res) => {
  res.json({ success: true, message: 'Order created' });
});

router.post('/verify', authorize('customer'), (req, res) => {
  res.json({ success: true, message: 'Payment verified' });
});

router.get('/history', authorize('customer'), (req, res) => {
  res.json({ success: true, message: 'Get payment history' });
});

// Admin payment routes
router.get('/', authorize('admin', 'manager'), (req, res) => {
  res.json({ success: true, message: 'Get payments' });
});

router.post('/:id/refund', authorize('admin'), (req, res) => {
  res.json({ success: true, message: 'Refund processed' });
});

module.exports = router;