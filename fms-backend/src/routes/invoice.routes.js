const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.use(protect);

// Invoice routes
router.get('/', authorize('admin', 'manager'), (req, res) => {
  res.json({ success: true, message: 'Get invoices' });
});

router.get('/my', authorize('customer'), (req, res) => {
  res.json({ success: true, message: 'Get my invoices' });
});

router.get('/:id', (req, res) => {
  res.json({ success: true, message: 'Get invoice details' });
});

router.post('/', authorize('admin', 'manager'), (req, res) => {
  res.json({ success: true, message: 'Invoice created' });
});

router.put('/:id', authorize('admin'), (req, res) => {
  res.json({ success: true, message: 'Invoice updated' });
});

router.delete('/:id', authorize('admin'), (req, res) => {
  res.json({ success: true, message: 'Invoice deleted' });
});

router.get('/:id/pdf', (req, res) => {
  res.json({ success: true, message: 'Generate PDF' });
});

module.exports = router;