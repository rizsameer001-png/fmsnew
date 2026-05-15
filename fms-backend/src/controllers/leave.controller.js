const Leave = require('../models/Leave.model');
const LeaveBalance = require('../models/LeaveBalance.model');
const User = require('../models/User.model');
const Notification = require('../models/Notification.model');
const ActivityLog = require('../models/ActivityLog.model');
const { getIO } = require('../config/socketio');
const { logger } = require('../utils/logger');

// Helper function to calculate days between dates
const calculateDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
};

// Helper function to get approver based on role
const getApprover = async (userRole, buildingId) => {
  if (userRole === 'technician') {
    return await User.findOne({ role: 'supervisor', buildingId, isActive: true });
  } else if (userRole === 'supervisor') {
    return await User.findOne({ role: 'manager', buildingId, isActive: true });
  } else if (userRole === 'manager') {
    return await User.findOne({ role: 'super_admin', isActive: true });
  }
  return null;
};

// ==================== APPLY FOR LEAVE ====================
// @desc    Apply for leave
// @route   POST /api/leaves
// @access  Private
const applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason, attachments } = req.body;
    
    const totalDays = calculateDays(startDate, endDate);
    
    // Check leave balance
    const currentYear = new Date().getFullYear();
    let leaveBalance = await LeaveBalance.findOne({ 
      userId: req.user._id, 
      year: currentYear 
    });
    
    if (!leaveBalance) {
      leaveBalance = await LeaveBalance.create({
        userId: req.user._id,
        year: currentYear,
      });
    }
    
    const availableBalance = leaveBalance.balances[leaveType] - leaveBalance.used[leaveType] - leaveBalance.pending[leaveType];
    
    if (availableBalance < totalDays) {
      return res.status(400).json({
        success: false,
        message: `Insufficient leave balance. Available: ${availableBalance} days, Requested: ${totalDays} days`,
        availableBalance,
        requestedDays: totalDays
      });
    }
    
    // Get approver
    const approver = await getApprover(req.user.role, req.user.buildingId);
    
    if (!approver) {
      return res.status(400).json({
        success: false,
        message: 'No approver available for this request'
      });
    }
    
    // Update pending balance
    leaveBalance.pending[leaveType] += totalDays;
    await leaveBalance.save();
    
    const leave = await Leave.create({
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      userRole: req.user.role,
      buildingId: req.user.buildingId,
      leaveType,
      startDate,
      endDate,
      totalDays,
      reason,
      attachments,
      status: 'pending'
    });
    
    // Create notification for approver
    await Notification.create({
      userId: approver._id,
      title: 'New Leave Request',
      body: `${req.user.name} requested ${totalDays} days of ${leaveType} leave from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`,
      type: 'approval',
      priority: 'medium',
      referenceId: leave._id,
      referenceModel: 'Leave',
      channels: ['push', 'email', 'inapp']
    });
    
    // Send real-time notification
    const io = getIO();
    io.to(`user_${approver._id}`).emit('new_leave_request', {
      leaveId: leave._id,
      userName: req.user.name,
      leaveType,
      totalDays
    });
    
    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'APPLY_LEAVE',
      entityType: 'leave',
      entityId: leave._id,
      newData: { leaveType, totalDays, startDate, endDate },
      ipAddress: req.ip
    });
    
    res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully',
      leave
    });
  } catch (error) {
    logger.error('Apply leave error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== GET MY LEAVES ====================
// @desc    Get my leave history
// @route   GET /api/leaves/my
// @access  Private
const getMyLeaves = async (req, res) => {
  try {
    const { status, year, page = 1, limit = 20 } = req.query;
    const query = { userId: req.user._id };
    
    if (status) query.status = status;
    if (year) {
      const startYear = new Date(year, 0, 1);
      const endYear = new Date(year, 11, 31);
      query.createdAt = { $gte: startYear, $lte: endYear };
    }
    
    const leaves = await Leave.find(query)
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Leave.countDocuments(query);
    
    // Get leave balances
    const currentYear = new Date().getFullYear();
    const leaveBalance = await LeaveBalance.findOne({ 
      userId: req.user._id, 
      year: currentYear 
    });
    
    res.json({
      success: true,
      leaves,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      leaveBalance: leaveBalance || null
    });
  } catch (error) {
    logger.error('Get my leaves error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== GET TEAM LEAVES (Manager/Supervisor) ====================
// @desc    Get team leaves
// @route   GET /api/leaves/team
// @access  Private (Manager/Supervisor)
const getTeamLeaves = async (req, res) => {
  try {
    const { status, startDate, endDate, search, page = 1, limit = 20 } = req.query;
    
    let teamQuery = {};
    
    if (req.user.role === 'manager') {
      teamQuery = { buildingId: req.user.buildingId, isActive: true };
      if (req.user.role === 'manager') {
        teamQuery.role = { $in: ['supervisor', 'technician'] };
      }
    } else if (req.user.role === 'supervisor') {
      teamQuery = { supervisorId: req.user._id, role: 'technician', isActive: true };
    }
    
    const teamMembers = await User.find(teamQuery).select('_id name email role');
    const memberIds = teamMembers.map(m => m._id);
    
    const query = { userId: { $in: memberIds } };
    if (status) query.status = status;
    if (startDate && endDate) {
      query.startDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    
    if (search) {
      const matchingUsers = teamMembers.filter(u => 
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      );
      query.userId = { $in: matchingUsers.map(u => u._id) };
    }
    
    const leaves = await Leave.find(query)
      .populate('userId', 'name email role')
      .populate('approvedBy', 'name')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Leave.countDocuments(query);
    
    // Get statistics
    const stats = {
      pending: await Leave.countDocuments({ userId: { $in: memberIds }, status: 'pending' }),
      approved: await Leave.countDocuments({ userId: { $in: memberIds }, status: 'approved' }),
      rejected: await Leave.countDocuments({ userId: { $in: memberIds }, status: 'rejected' }),
      total: total
    };
    
    res.json({
      success: true,
      leaves,
      stats,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    logger.error('Get team leaves error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== GET PENDING LEAVES ====================
// @desc    Get pending leaves for approval
// @route   GET /api/leaves/pending
// @access  Private (Manager/Supervisor)
const getPendingLeaves = async (req, res) => {
  try {
    let teamQuery = {};
    
    if (req.user.role === 'manager') {
      teamQuery = { buildingId: req.user.buildingId, isActive: true };
      teamQuery.role = { $in: ['supervisor', 'technician'] };
    } else if (req.user.role === 'supervisor') {
      teamQuery = { supervisorId: req.user._id, role: 'technician', isActive: true };
    }
    
    const teamMembers = await User.find(teamQuery).select('_id');
    const memberIds = teamMembers.map(m => m._id);
    
    const leaves = await Leave.find({
      userId: { $in: memberIds },
      status: 'pending'
    })
      .populate('userId', 'name email role')
      .sort('-createdAt');
    
    res.json({
      success: true,
      leaves,
      count: leaves.length
    });
  } catch (error) {
    logger.error('Get pending leaves error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== GET LEAVE BALANCE ====================
// @desc    Get leave balance
// @route   GET /api/leaves/balance
// @access  Private
const getLeaveBalance = async (req, res) => {
  try {
    const { year } = req.query;
    const queryYear = year ? parseInt(year) : new Date().getFullYear();
    
    let leaveBalance = await LeaveBalance.findOne({ 
      userId: req.user._id, 
      year: queryYear 
    });
    
    if (!leaveBalance) {
      leaveBalance = await LeaveBalance.create({
        userId: req.user._id,
        year: queryYear,
      });
    }
    
    // Calculate available balance
    const available = {};
    for (const type of Object.keys(leaveBalance.balances)) {
      available[type] = leaveBalance.balances[type] - leaveBalance.used[type] - leaveBalance.pending[type];
    }
    
    res.json({
      success: true,
      balances: leaveBalance.balances,
      used: leaveBalance.used,
      pending: leaveBalance.pending,
      available,
      year: queryYear
    });
  } catch (error) {
    logger.error('Get leave balance error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== APPROVE LEAVE ====================
// @desc    Approve leave request
// @route   PUT /api/leaves/:id/approve
// @access  Private (Manager/Supervisor)
const approveLeave = async (req, res) => {
  try {
    const { comments } = req.body;
    const leave = await Leave.findById(req.params.id);
    
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }
    
    // Check authorization
    if (req.user.role === 'manager') {
      const user = await User.findById(leave.userId);
      if (user?.buildingId?.toString() !== req.user.buildingId?.toString()) {
        return res.status(403).json({ success: false, message: 'Unauthorized to approve this request' });
      }
    } else if (req.user.role === 'supervisor') {
      const user = await User.findById(leave.userId);
      if (user?.supervisorId?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Unauthorized to approve this request' });
      }
    }
    
    leave.status = 'approved';
    leave.approvedBy = req.user._id;
    leave.approvedByName = req.user.name;
    leave.approvedAt = new Date();
    if (comments) leave.rejectionReason = comments;
    await leave.save();
    
    // Update leave balance - move from pending to used
    const currentYear = new Date().getFullYear();
    const leaveBalance = await LeaveBalance.findOne({ 
      userId: leave.userId, 
      year: currentYear 
    });
    
    if (leaveBalance) {
      leaveBalance.pending[leave.leaveType] -= leave.totalDays;
      leaveBalance.used[leave.leaveType] += leave.totalDays;
      await leaveBalance.save();
    }
    
    // Create notification for employee
    await Notification.create({
      userId: leave.userId,
      title: 'Leave Request Approved',
      body: `Your ${leave.leaveType} leave request for ${leave.totalDays} days has been approved.`,
      type: 'approval',
      referenceId: leave._id,
      referenceModel: 'Leave'
    });
    
    const io = getIO();
    io.to(`user_${leave.userId}`).emit('leave_approved', {
      leaveId: leave._id,
      status: 'approved'
    });
    
    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'APPROVE_LEAVE',
      entityType: 'leave',
      entityId: leave._id,
      newData: { status: 'approved' },
      ipAddress: req.ip
    });
    
    res.json({
      success: true,
      message: 'Leave request approved',
      leave
    });
  } catch (error) {
    logger.error('Approve leave error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== REJECT LEAVE ====================
// @desc    Reject leave request
// @route   PUT /api/leaves/:id/reject
// @access  Private (Manager/Supervisor)
const rejectLeave = async (req, res) => {
  try {
    const { reason } = req.body;
    const leave = await Leave.findById(req.params.id);
    
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }
    
    // Check authorization
    if (req.user.role === 'manager') {
      const user = await User.findById(leave.userId);
      if (user?.buildingId?.toString() !== req.user.buildingId?.toString()) {
        return res.status(403).json({ success: false, message: 'Unauthorized to reject this request' });
      }
    } else if (req.user.role === 'supervisor') {
      const user = await User.findById(leave.userId);
      if (user?.supervisorId?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Unauthorized to reject this request' });
      }
    }
    
    leave.status = 'rejected';
    leave.rejectionReason = reason;
    await leave.save();
    
    // Update leave balance - remove from pending
    const currentYear = new Date().getFullYear();
    const leaveBalance = await LeaveBalance.findOne({ 
      userId: leave.userId, 
      year: currentYear 
    });
    
    if (leaveBalance) {
      leaveBalance.pending[leave.leaveType] -= leave.totalDays;
      await leaveBalance.save();
    }
    
    // Create notification for employee
    await Notification.create({
      userId: leave.userId,
      title: 'Leave Request Rejected',
      body: `Your ${leave.leaveType} leave request for ${leave.totalDays} days has been rejected. Reason: ${reason || 'Not specified'}`,
      type: 'approval',
      referenceId: leave._id,
      referenceModel: 'Leave'
    });
    
    const io = getIO();
    io.to(`user_${leave.userId}`).emit('leave_rejected', {
      leaveId: leave._id,
      status: 'rejected',
      reason
    });
    
    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'REJECT_LEAVE',
      entityType: 'leave',
      entityId: leave._id,
      newData: { status: 'rejected', reason },
      ipAddress: req.ip
    });
    
    res.json({
      success: true,
      message: 'Leave request rejected',
      leave
    });
  } catch (error) {
    logger.error('Reject leave error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== CANCEL LEAVE ====================
// @desc    Cancel leave request
// @route   PUT /api/leaves/:id/cancel
// @access  Private
const cancelLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }
    
    if (leave.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to cancel this request' });
    }
    
    if (leave.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Only pending leave requests can be cancelled' });
    }
    
    leave.status = 'cancelled';
    await leave.save();
    
    // Update leave balance - remove from pending
    const currentYear = new Date().getFullYear();
    const leaveBalance = await LeaveBalance.findOne({ 
      userId: leave.userId, 
      year: currentYear 
    });
    
    if (leaveBalance) {
      leaveBalance.pending[leave.leaveType] -= leave.totalDays;
      await leaveBalance.save();
    }
    
    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'CANCEL_LEAVE',
      entityType: 'leave',
      entityId: leave._id,
      newData: { status: 'cancelled' },
      ipAddress: req.ip
    });
    
    res.json({
      success: true,
      message: 'Leave request cancelled',
      leave
    });
  } catch (error) {
    logger.error('Cancel leave error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== GET LEAVE STATISTICS ====================
// @desc    Get leave statistics
// @route   GET /api/leaves/stats
// @access  Private (Admin/Manager)
const getLeaveStats = async (req, res) => {
  try {
    const { year, buildingId } = req.query;
    const queryYear = year ? parseInt(year) : new Date().getFullYear();
    
    let userQuery = { isActive: true };
    if (req.user.role === 'manager') {
      userQuery.buildingId = req.user.buildingId;
    }
    if (buildingId && req.user.role === 'super_admin') {
      userQuery.buildingId = buildingId;
    }
    
    const startDate = new Date(queryYear, 0, 1);
    const endDate = new Date(queryYear, 11, 31);
    
    const stats = await Leave.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $match: userQuery
      },
      {
        $group: {
          _id: '$leaveType',
          totalDays: { $sum: '$totalDays' },
          count: { $sum: 1 },
          approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } }
        }
      }
    ]);
    
    res.json({
      success: true,
      stats,
      year: queryYear
    });
  } catch (error) {
    logger.error('Get leave stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  applyLeave,
  getMyLeaves,
  getTeamLeaves,
  getPendingLeaves,
  getLeaveBalance,
  approveLeave,
  rejectLeave,
  cancelLeave,
  getLeaveStats
};