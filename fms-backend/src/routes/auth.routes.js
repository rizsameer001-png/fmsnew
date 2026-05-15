const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  register,
  login,
  verifyOTP,
  forgotPassword,
  resetPassword,
  changePassword,
  refreshToken,
  logout,
  getMe,
  updateProfile
} = require('../controllers/auth.controller');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/refresh-token', refreshToken);

// Protected routes
router.use(protect);
router.post('/change-password', changePassword);
router.post('/logout', logout);
router.get('/me', getMe);
router.put('/profile', updateProfile);

module.exports = router;