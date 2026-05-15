// const express = require('express');
// const router = express.Router();
// const { protect } = require('../middleware/auth.middleware');
// const { authorize } = require('../middleware/role.middleware');

// router.use(protect);

// // GPS routes
// router.post('/location', authorize('technician'), (req, res) => {
//   res.json({ success: true, message: 'Location updated' });
// });

// router.get('/live', authorize('admin', 'manager', 'supervisor'), (req, res) => {
//   res.json({ success: true, locations: [] });
// });

// router.get('/technician/:userId', authorize('admin', 'manager', 'supervisor'), (req, res) => {
//   res.json({ success: true, location: null });
// });

// router.get('/history/:userId', authorize('admin', 'manager'), (req, res) => {
//   res.json({ success: true, history: [] });
// });

// router.post('/emergency', authorize('technician'), (req, res) => {
//   res.json({ success: true, message: 'Emergency alert sent' });
// });

// router.post('/validate-geofence', authorize('technician'), (req, res) => {
//   res.json({ success: true, isValid: true });
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

// All routes require authentication
router.use(protect);

// GPS routes
router.post('/location', authorize('technician'), (req, res) => {
  res.json({ success: true, message: 'Location updated' });
});

// ⬇️⬇️⬇️ FIXED: Added 'super_admin' and 'admin' to allowed roles ⬇️⬇️⬇️
router.get('/live', authorize('super_admin', 'admin', 'manager', 'supervisor'), (req, res) => {
  res.json({ success: true, locations: [] });
});

router.get('/technician/:userId', authorize('super_admin', 'admin', 'manager', 'supervisor'), (req, res) => {
  res.json({ success: true, location: null });
});

router.get('/history/:userId', authorize('super_admin', 'admin', 'manager'), (req, res) => {
  res.json({ success: true, history: [] });
});

router.post('/emergency', authorize('technician'), (req, res) => {
  res.json({ success: true, message: 'Emergency alert sent' });
});

router.post('/validate-geofence', authorize('technician'), (req, res) => {
  res.json({ success: true, isValid: true });
});

module.exports = router;