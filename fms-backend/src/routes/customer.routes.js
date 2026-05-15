const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.use(protect);
router.use(authorize('customer'));

// Dashboard
router.get('/dashboard', (req, res) => {
  res.json({ success: true, message: 'Customer dashboard', user: req.user });
});

// Complaints
router.get('/complaints', (req, res) => {
  res.json({ success: true, message: 'Get my complaints' });
});

router.post('/complaints', (req, res) => {
  res.json({ success: true, message: 'Complaint created' });
});

router.get('/complaints/:id', (req, res) => {
  res.json({ success: true, message: 'Get complaint details' });
});

router.post('/complaints/:id/rate', (req, res) => {
  res.json({ success: true, message: 'Rating submitted' });
});

// Invoices & Payments
router.get('/invoices', (req, res) => {
  res.json({ success: true, message: 'Get my invoices' });
});

router.get('/invoices/:id', (req, res) => {
  res.json({ success: true, message: 'Get invoice details' });
});

router.post('/payments/create-order', (req, res) => {
  res.json({ success: true, message: 'Payment order created' });
});

router.post('/payments/verify', (req, res) => {
  res.json({ success: true, message: 'Payment verified' });
});

router.get('/payments/history', (req, res) => {
  res.json({ success: true, message: 'Get payment history' });
});

// Service requests
router.get('/services', (req, res) => {
  res.json({ success: true, message: 'Get services' });
});

router.post('/service-requests', (req, res) => {
  res.json({ success: true, message: 'Service request created' });
});

// Chat support
router.get('/chat/support', (req, res) => {
  res.json({ success: true, message: 'Get support chat' });
});

router.post('/chat/send', (req, res) => {
  res.json({ success: true, message: 'Message sent' });
});

router.get('/chat/messages', (req, res) => {
  res.json({ success: true, message: 'Get messages' });
});

// Profile
router.get('/profile', (req, res) => {
  res.json({ success: true, user: req.user });
});

router.put('/profile', (req, res) => {
  res.json({ success: true, message: 'Profile updated' });
});

router.get('/service-history', (req, res) => {
  res.json({ success: true, message: 'Get service history' });
});

module.exports = router;