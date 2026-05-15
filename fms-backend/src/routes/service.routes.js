const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

// Public routes
router.get('/', (req, res) => {
  res.json({ success: true, message: 'Get services' });
});

router.get('/categories', (req, res) => {
  res.json({ success: true, message: 'Get service categories' });
});

router.get('/:id', (req, res) => {
  res.json({ success: true, message: 'Get service details' });
});

// Admin only routes
router.use(protect);
router.use(authorize('super_admin'));

router.post('/', (req, res) => {
  res.json({ success: true, message: 'Service created' });
});

router.put('/:id', (req, res) => {
  res.json({ success: true, message: 'Service updated' });
});

router.delete('/:id', (req, res) => {
  res.json({ success: true, message: 'Service deleted' });
});

router.put('/:id/toggle', (req, res) => {
  res.json({ success: true, message: 'Service status toggled' });
});

module.exports = router;