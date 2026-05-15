// const express = require('express');
// const router = express.Router();
// const { protect } = require('../middleware/auth.middleware');
// const { authorize } = require('../middleware/role.middleware');
// const {
//   getUsers,
//   getUser,
//   createUser,
//   updateUser,
//   deleteUser,
//   getTechniciansByType,
//   getUserStats
// } = require('../controllers/user.controller');

// // All routes require authentication
// router.use(protect);

// // Admin only routes
// router.get('/stats', authorize('super_admin', 'manager'), getUserStats);
// router.get('/technicians/:type', authorize('super_admin', 'manager', 'supervisor'), getTechniciansByType);
// router.get('/', authorize('super_admin', 'manager'), getUsers);
// router.post('/', authorize('super_admin'), createUser);
// router.get('/:id', authorize('super_admin', 'manager'), getUser);
// router.put('/:id', authorize('super_admin'), updateUser);
// router.delete('/:id', authorize('super_admin'), deleteUser);

// module.exports = router;

// // fms-backend/src/routes/user.routes.js
// const express = require('express');
// const router = express.Router();
// const { protect } = require('../middleware/auth.middleware');
// const { authorize } = require('../middleware/role.middleware');
// const {
//   getUsers,
//   getUser,
//   createUser,
//   updateUser,
//   deleteUser,
//   getTechniciansByType,
//   getUserStats
// } = require('../controllers/user.controller');

// // All routes require authentication
// router.use(protect);

// // Admin only routes
// router.get('/stats', authorize('super_admin', 'manager'), getUserStats);
// router.get('/technicians/:type', authorize('super_admin', 'manager', 'supervisor'), getTechniciansByType);
// router.get('/', authorize('super_admin', 'manager'), getUsers);
// router.post('/', authorize('super_admin'), createUser);
// router.get('/:id', authorize('super_admin', 'manager'), getUser);
// router.put('/:id', authorize('super_admin'), updateUser);
// router.delete('/:id', authorize('super_admin'), deleteUser);

// module.exports = router;


// //fms-backend/src/routes/user.route.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getTechniciansByType,
  getUserStats
} = require('../controllers/user.controller');

// All routes require authentication
router.use(protect);

// Admin only routes
router.get('/stats', authorize('super_admin', 'manager'), getUserStats);

// ⬇️⬇️⬇️ FIXED: Added 'supervisor' to allowed roles for technicians endpoint ⬇️⬇️⬇️
router.get('/technicians/:type', authorize('super_admin', 'manager', 'supervisor'), getTechniciansByType);

router.get('/', authorize('super_admin', 'manager'), getUsers);
router.post('/', authorize('super_admin'), createUser);
router.get('/:id', authorize('super_admin', 'manager'), getUser);
// router.put('/:id', authorize('super_admin'), updateUser);
// update Allow manager to update users
router.put('/:id', authorize('super_admin', 'manager'), updateUser);
router.delete('/:id', authorize('super_admin'), deleteUser);

module.exports = router;