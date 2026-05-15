const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

// Notification routes
router.get('/', (req, res) => {
  res.json({ success: true, message: 'Get notifications' });
});

router.put('/:id/read', (req, res) => {
  res.json({ success: true, message: 'Notification marked as read' });
});

router.put('/read-all', (req, res) => {
  res.json({ success: true, message: 'All notifications marked as read' });
});

router.delete('/:id', (req, res) => {
  res.json({ success: true, message: 'Notification deleted' });
});

router.get('/unread/count', (req, res) => {
  res.json({ success: true, count: 0 });
});

router.post('/push-token', (req, res) => {
  res.json({ success: true, message: 'Push token updated' });
});

module.exports = router;