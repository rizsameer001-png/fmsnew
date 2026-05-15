const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User.model');
const ActivityLog = require('../models/ActivityLog.model');
const { sendOTPEmail, sendWelcomeEmail } = require('../services/email.service');
const { sendOTPSMS } = require('../services/sms.service');
const { logger } = require('../utils/logger');

// Generate JWT Token
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store OTP temporarily (use Redis in production)
const otpStore = new Map();

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, phone, password, role = 'customer' } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or phone'
      });
    }

    const user = await User.create({
      name,
      email,
      phone,
      password,
      role
    });

    const otp = generateOTP();
    otpStore.set(email, { otp, expires: Date.now() + 10 * 60 * 1000 });

    await sendOTPEmail(email, otp);
    if (phone) await sendOTPSMS(phone, otp);

    const token = generateToken(user._id, user.role);

    await ActivityLog.create({
      userId: user._id,
      userName: user.name,
      userRole: user.role,
      action: 'REGISTER',
      entityType: 'user',
      entityId: user._id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json({
      success: true,
      message: 'OTP sent to your email and phone',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    logger.error('Register error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user - FIXED with better error handling
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('=== LOGIN ATTEMPT ===');
    console.log('Email:', email);
    console.log('Password provided:', !!password);

    // Find user with password field included
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    console.log('User found:', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      hasPassword: !!user.password,
      isActive: user.isActive
    });

    // Check if user is active
    if (!user.isActive) {
      console.log('User account is deactivated');
      return res.status(401).json({ success: false, message: 'Account is deactivated' });
    }

    // Compare password
    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, user.password);
      console.log('Password comparison result:', isMatch);
    } catch (compareError) {
      console.error('bcrypt.compare error:', compareError);
      return res.status(500).json({ success: false, message: 'Error verifying password' });
    }

    if (!isMatch) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id, user.role);
    console.log('Token generated successfully');

    // Log activity
    await ActivityLog.create({
      userId: user._id,
      userName: user.name,
      userRole: user.role,
      action: 'LOGIN',
      entityType: 'user',
      entityId: user._id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    console.log('=== LOGIN SUCCESS ===');
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        technicianType: user.technicianType,
        buildingId: user.buildingId,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error('Login error details:', error);
    logger.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error. Please try again.' });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const storedOTP = otpStore.get(email);

    if (!storedOTP || storedOTP.otp !== otp || storedOTP.expires < Date.now()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    await User.findOneAndUpdate(
      { email },
      { isEmailVerified: true, isPhoneVerified: true },
      { new: true }
    );

    otpStore.delete(email);
    
    await sendWelcomeEmail(email);

    res.json({ success: true, message: 'Verified successfully' });
  } catch (error) {
    logger.error('OTP verification error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const resetUrl = `${process.env.WEB_URL}/reset-password?token=${resetToken}`;
    await sendOTPEmail(email, `Reset your password using this link: ${resetUrl}`);

    res.json({ success: true, message: 'Password reset email sent' });
  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.password = newPassword;
    await user.save();

    await ActivityLog.create({
      userId: user._id,
      userName: user.name,
      userRole: user.role,
      action: 'PASSWORD_RESET',
      entityType: 'user',
      entityId: user._id,
      ipAddress: req.ip
    });

    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Change password
// @route   POST /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    logger.error('Change password error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Refresh token
// @route   POST /api/auth/refresh-token
// @access  Public
const refreshToken = async (req, res) => {
  try {
    const { token } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    const newToken = generateToken(user._id, user.role);
    res.json({ success: true, token: newToken });
  } catch (error) {
    logger.error('Refresh token error:', error);
    res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};

// @desc    Logout
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'LOGOUT',
      entityType: 'user',
      entityId: req.user._id,
      ipAddress: req.ip
    });
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Logout error:', error);
    res.json({ success: true, message: 'Logged out successfully' });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const allowedUpdates = ['name', 'phone', 'address', 'emergencyContact', 'profileImage'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    await ActivityLog.create({
      userId: user._id,
      userName: user.name,
      userRole: user.role,
      action: 'UPDATE_PROFILE',
      entityType: 'user',
      entityId: user._id,
      newData: updates,
      ipAddress: req.ip
    });

    res.json({ success: true, user });
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
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
};