





const User = require('../models/User.model');
const ActivityLog = require('../models/ActivityLog.model');
const { sendEmail } = require('../services/email.service');
const { logger } = require('../utils/logger');

// ==================== GET ALL USERS ====================
// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin/Manager
const getUsers = async (req, res) => {
  try {
    console.log('=== getUsers called ===');
    console.log('Query params:', req.query);
    console.log('User:', req.user?.email, 'Role:', req.user?.role);
    
    const { role, isActive, search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Role-based filtering for managers
    if (req.user.role === 'manager') {
      // Managers can only see users in their building
      if (req.user.buildingId) {
        query.buildingId = req.user.buildingId;
      }
      // Managers cannot see super_admin users
      query.role = { $ne: 'super_admin' };
    }
    
    // Supervisors can only see their technicians
    if (req.user.role === 'supervisor') {
      query.supervisorId = req.user._id;
      query.role = 'technician';
    }

    console.log('Query:', JSON.stringify(query));
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const users = await User.find(query)
      .populate('buildingId', 'name code')
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip(skip);

    const total = await User.countDocuments(query);
    
    console.log(`Found ${users.length} users, Total: ${total}`);

    // 🔥 CHANGE 1: Format technicianType for response (null if undefined)
    const formattedUsers = users.map(user => {
      const userObj = user.toObject ? user.toObject() : user;
      return {
        ...userObj,
        technicianType: userObj.technicianType || null
      };
    });

    res.json({
      success: true,
      users: formattedUsers,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('ERROR in getUsers:', error);
    console.error('Error stack:', error.stack);
    logger.error('Get users error:', error);
    res.status(500).json({ success: false, message: error.message, stack: error.stack });
  }
};

// ==================== GET SINGLE USER ====================
// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin/Manager
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('buildingId', 'name code address');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Authorization check for managers
    if (req.user.role === 'manager') {
      // Managers can only view users in their building
      if (user.buildingId?._id?.toString() !== req.user.buildingId?.toString() &&
          user.buildingId?.toString() !== req.user.buildingId?.toString()) {
        return res.status(403).json({ success: false, message: 'Unauthorized to view this user' });
      }
      // Managers cannot view super_admin users
      if (user.role === 'super_admin') {
        return res.status(403).json({ success: false, message: 'Unauthorized to view super admin' });
      }
    }

    // 🔥 CHANGE 2: Format technicianType in response
    const userObj = user.toObject();
    userObj.technicianType = userObj.technicianType || null;

    res.json({ success: true, user: userObj });
  } catch (error) {
    console.error('ERROR in getUser:', error);
    logger.error('Get user error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== CREATE USER ====================
// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin ONLY (Managers cannot create users)
const createUser = async (req, res) => {
  try {
    // Only Admin can create users
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only administrators can create users' 
      });
    }
    
    const { name, email, phone, password, role, technicianType, buildingId, department } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // 🔥 CHANGE 3: Clean up technicianType before creating
    let cleanedTechnicianType = technicianType;
    if (role !== 'technician' || !technicianType || technicianType === '' || technicianType === 'null') {
      cleanedTechnicianType = undefined; // Use undefined instead of null or empty string
    }

    const userData = {
      name,
      email,
      phone,
      password: password || 'Temp@123',
      role: role || 'customer',
      buildingId,
      department
    };

    // Only add technicianType if it's defined and role is technician
    if (cleanedTechnicianType !== undefined && role === 'technician') {
      userData.technicianType = cleanedTechnicianType;
    }

    const user = await User.create(userData);

    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'CREATE_USER',
      entityType: 'user',
      entityId: user._id,
      newData: { name, email, role, technicianType: cleanedTechnicianType },
      ipAddress: req.ip
    });

    await sendEmail(email, 'Welcome to FMS', `Your account has been created. Temporary password: Temp@123`);

    // 🔥 CHANGE 4: Remove password from response and format technicianType
    const userResponse = user.toObject();
    delete userResponse.password;
    userResponse.technicianType = userResponse.technicianType || null;

    res.status(201).json({ success: true, user: userResponse });
  } catch (error) {
    console.error('ERROR in createUser:', error);
    logger.error('Create user error:', error);
    
    // 🔥 CHANGE 5: Handle validation errors properly
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== UPDATE USER ====================
// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin/Manager (with restrictions)
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // ==================== ROLE-BASED PERMISSIONS ====================
    
    // SUPER ADMIN - Full access, no restrictions
    if (req.user.role === 'super_admin') {
      // 🔥 CHANGE 6: Clean up technicianType for super admin updates
      let cleanedTechnicianType = req.body.technicianType;
      const newRole = req.body.role || user.role;
      
      if (newRole !== 'technician' || !req.body.technicianType || req.body.technicianType === '' || req.body.technicianType === 'null') {
        cleanedTechnicianType = undefined;
      }
      
      const allowedUpdates = ['name', 'phone', 'role', 'buildingId', 'department', 'shift', 'isActive', 'email'];
      const updates = {};
      
      allowedUpdates.forEach(field => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });
      
      // Add technicianType only if valid
      if (cleanedTechnicianType !== undefined && newRole === 'technician') {
        updates.technicianType = cleanedTechnicianType;
      } else if (newRole !== 'technician') {
        // Remove technicianType for non-technicians
        updates.technicianType = undefined;
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
      );

      await ActivityLog.create({
        userId: req.user._id,
        userName: req.user.name,
        userRole: req.user.role,
        action: 'UPDATE_USER',
        entityType: 'user',
        entityId: user._id,
        oldData: { role: user.role, isActive: user.isActive, technicianType: user.technicianType },
        newData: updates,
        ipAddress: req.ip
      });

      // 🔥 CHANGE 7: Format response
      const userResponse = updatedUser.toObject();
      userResponse.technicianType = userResponse.technicianType || null;

      return res.json({ success: true, user: userResponse });
    }
    
    // MANAGER - Limited access
    if (req.user.role === 'manager') {
      // RESTRICTION 1: Cannot modify Super Admin users
      if (user.role === 'super_admin') {
        return res.status(403).json({ 
          success: false, 
          message: 'Managers cannot modify Super Admin users' 
        });
      }
      
      // RESTRICTION 2: Cannot change role to Super Admin
      if (req.body.role === 'super_admin') {
        return res.status(403).json({ 
          success: false, 
          message: 'Managers cannot assign Super Admin role' 
        });
      }
      
      // RESTRICTION 3: Cannot change user role at all
      if (req.body.role && req.body.role !== user.role) {
        return res.status(403).json({ 
          success: false, 
          message: 'Managers cannot change user roles. Only administrators can change roles.' 
        });
      }
      
      // RESTRICTION 4: Cannot change technician type
      if (req.body.technicianType && req.body.technicianType !== user.technicianType) {
        return res.status(403).json({ 
          success: false, 
          message: 'Managers cannot change technician type. Only administrators can change technician types.' 
        });
      }
      
      // RESTRICTION 5: Cannot change email
      if (req.body.email && req.body.email !== user.email) {
        return res.status(403).json({ 
          success: false, 
          message: 'Managers cannot change email addresses' 
        });
      }
      
      // Fields managers CAN update
      const managerAllowedUpdates = ['name', 'phone', 'buildingId', 'department', 'shift', 'isActive'];
      const updates = {};
      
      managerAllowedUpdates.forEach(field => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });
      
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
      );

      await ActivityLog.create({
        userId: req.user._id,
        userName: req.user.name,
        userRole: req.user.role,
        action: 'UPDATE_USER',
        entityType: 'user',
        entityId: user._id,
        oldData: { name: user.name, isActive: user.isActive },
        newData: updates,
        ipAddress: req.ip
      });

      const userResponse = updatedUser.toObject();
      userResponse.technicianType = userResponse.technicianType || null;

      return res.json({ success: true, user: userResponse });
    }
    
    // SUPERVISOR - Can only update their technicians' certain fields
    if (req.user.role === 'supervisor') {
      // Check if user is a technician under this supervisor
      if (user.supervisorId?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ 
          success: false, 
          message: 'You can only update technicians assigned to you' 
        });
      }
      
      // Fields supervisors CAN update for their technicians
      const supervisorAllowedUpdates = ['phone', 'department', 'isActive'];
      const updates = {};
      
      supervisorAllowedUpdates.forEach(field => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });
      
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
      );

      await ActivityLog.create({
        userId: req.user._id,
        userName: req.user.name,
        userRole: req.user.role,
        action: 'UPDATE_USER',
        entityType: 'user',
        entityId: user._id,
        newData: updates,
        ipAddress: req.ip
      });

      const userResponse = updatedUser.toObject();
      userResponse.technicianType = userResponse.technicianType || null;

      return res.json({ success: true, user: userResponse });
    }
    
    // TECHNICIAN - Can only update their own profile (limited fields)
    if (req.user.role === 'technician') {
      // Technicians can only update themselves
      if (req.params.id !== req.user._id.toString()) {
        return res.status(403).json({ 
          success: false, 
          message: 'You can only update your own profile' 
        });
      }
      
      // Fields technicians CAN update
      const technicianAllowedUpdates = ['phone', 'emergencyContact'];
      const updates = {};
      
      technicianAllowedUpdates.forEach(field => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });
      
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
      );

      const userResponse = updatedUser.toObject();
      userResponse.technicianType = userResponse.technicianType || null;

      return res.json({ success: true, user: userResponse });
    }
    
    // CUSTOMER - Can only update their own profile
    if (req.user.role === 'customer') {
      if (req.params.id !== req.user._id.toString()) {
        return res.status(403).json({ 
          success: false, 
          message: 'You can only update your own profile' 
        });
      }
      
      const customerAllowedUpdates = ['name', 'phone', 'address'];
      const updates = {};
      
      customerAllowedUpdates.forEach(field => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });
      
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
      );

      const userResponse = updatedUser.toObject();
      userResponse.technicianType = userResponse.technicianType || null;

      return res.json({ success: true, user: userResponse });
    }
    
    res.status(403).json({ success: false, message: 'Unauthorized to update users' });
    
  } catch (error) {
    console.error('ERROR in updateUser:', error);
    logger.error('Update user error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== DELETE USER ====================
// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin ONLY
const deleteUser = async (req, res) => {
  try {
    // Only Admin can delete users
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only administrators can delete users' 
      });
    }
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Prevent deleting own account
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete your own account' 
      });
    }

    await user.deleteOne();

    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'DELETE_USER',
      entityType: 'user',
      entityId: req.params.id,
      oldData: { name: user.name, email: user.email },
      ipAddress: req.ip
    });

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('ERROR in deleteUser:', error);
    logger.error('Delete user error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== GET TECHNICIANS BY TYPE ====================
// @desc    Get technicians by type
// @route   GET /api/users/technicians/:type
// @access  Private/Admin/Manager/Supervisor
const getTechniciansByType = async (req, res) => {
  try {
    const { type } = req.params;
    const { buildingId } = req.query;
    
    const query = { role: 'technician', isActive: true };
    if (type !== 'all') query.technicianType = type;
    if (buildingId) query.buildingId = buildingId;
    
    // Role-based filtering
    if (req.user.role === 'manager' && req.user.buildingId) {
      query.buildingId = req.user.buildingId;
    }
    
    if (req.user.role === 'supervisor') {
      query.supervisorId = req.user._id;
    }

    const technicians = await User.find(query).select('name email phone technicianType buildingId');
    
    // 🔥 CHANGE 8: Format technicianType in response
    const formattedTechnicians = technicians.map(tech => {
      const techObj = tech.toObject ? tech.toObject() : tech;
      return {
        ...techObj,
        technicianType: techObj.technicianType || null
      };
    });
    
    res.json({ success: true, technicians: formattedTechnicians });
  } catch (error) {
    console.error('ERROR in getTechniciansByType:', error);
    logger.error('Get technicians error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== GET USER STATISTICS ====================
// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private/Admin/Manager
const getUserStats = async (req, res) => {
  try {
    const match = {};
    
    // Managers only see stats for their building
    if (req.user.role === 'manager' && req.user.buildingId) {
      match.buildingId = req.user.buildingId;
    }
    
    const stats = await User.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          active: { $sum: { $cond: ['$isActive', 1, 0] } },
          inactive: { $sum: { $cond: ['$isActive', 0, 1] } }
        }
      }
    ]);

    res.json({ success: true, stats });
  } catch (error) {
    console.error('ERROR in getUserStats:', error);
    logger.error('Get user stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔥 NEW: Toggle user active status
// @desc    Toggle user active/inactive status
// @route   PATCH /api/users/:id/toggle-status
// @access  Private/Admin/Manager
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Role-based authorization
    if (req.user.role === 'manager') {
      if (user.role === 'super_admin') {
        return res.status(403).json({ success: false, message: 'Cannot modify super admin status' });
      }
      if (user.buildingId?.toString() !== req.user.buildingId?.toString()) {
        return res.status(403).json({ success: false, message: 'Cannot modify users from other buildings' });
      }
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    ).select('-password');
    
    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'TOGGLE_USER_STATUS',
      entityType: 'user',
      entityId: id,
      newData: { isActive },
      ipAddress: req.ip
    });
    
    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: updatedUser
    });
  } catch (error) {
    console.error('ERROR in toggleUserStatus:', error);
    logger.error('Toggle user status error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getTechniciansByType,
  getUserStats,
  toggleUserStatus  // 🔥 NEW: Export the new function
};