const Approval = require('../models/Approval.model');
const Leave = require('../models/Leave.model');
const Notification = require('../models/Notification.model');
const ActivityLog = require('../models/ActivityLog.model');
const { getIO } = require('../config/socketio');
//const logger = require('../utils/logger');
// Replace with:
const { logger } = require('../utils/logger');

// @desc    Get approvals
// @route   GET /api/approvals
// @access  Private/Manager/Supervisor
const getApprovals = async (req, res) => {
  try {
    const { type, status, page = 1, limit = 10 } = req.query;
    const query = { status: 'pending' };

    if (type) query.type = type;
    if (status) query.status = status;

    // Role-based filtering
    if (req.user.role === 'supervisor') {
      query.currentLevel = 1;
    } else if (req.user.role === 'manager') {
      query.currentLevel = 2;
    }

    const approvals = await Approval.find(query)
      .populate('requestedBy.userId', 'name email role')
      .populate('approvals.approverId', 'name')
      .sort('-requestedAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Approval.countDocuments(query);

    res.json({
      success: true,
      approvals,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    logger.error('Get approvals error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create approval request
// @route   POST /api/approvals
// @access  Private
const createApproval = async (req, res) => {
  try {
    const { type, details, referenceId, referenceModel } = req.body;

    const approval = await Approval.create({
      type,
      requestedBy: {
        userId: req.user._id,
        name: req.user.name,
        role: req.user.role
      },
      details,
      referenceId,
      referenceModel,
      currentLevel: 1,
      approvals: [
        { level: 1, status: 'pending' },
        { level: 2, status: 'pending' }
      ]
    });

    // Notify supervisor/manager based on type
    await notifyNextApprover(approval);

    res.status(201).json({ success: true, approval });
  } catch (error) {
    logger.error('Create approval error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Process approval
// @route   PUT /api/approvals/:id
// @access  Private/Manager/Supervisor
const processApproval = async (req, res) => {
  try {
    const { status, comments } = req.body;
    const approval = await Approval.findById(req.params.id);

    if (!approval) {
      return res.status(404).json({ success: false, message: 'Approval request not found' });
    }

    const currentApproval = approval.approvals.find(a => a.level === approval.currentLevel);
    currentApproval.status = status;
    currentApproval.approverId = req.user._id;
    currentApproval.approverName = req.user.name;
    currentApproval.approverRole = req.user.role;
    currentApproval.comments = comments;
    currentApproval.approvedAt = new Date();

    if (status === 'approved') {
      if (approval.currentLevel < approval.approvals.length) {
        approval.currentLevel++;
      } else {
        approval.status = 'approved';
        await handleApprovedAction(approval);
      }
    } else if (status === 'rejected') {
      approval.status = 'rejected';
      approval.finalComments = comments;
      await handleRejectedAction(approval);
    }

    await approval.save();

    // Notify requester
    await Notification.create({
      userId: approval.requestedBy.userId,
      title: `Approval ${status}`,
      body: `Your ${approval.type} request has been ${status}`,
      type: 'approval',
      referenceId: approval._id,
      referenceModel: 'Approval'
    });

    const io = getIO();
    io.to(`user_${approval.requestedBy.userId}`).emit('approval_processed', approval);

    res.json({ success: true, approval });
  } catch (error) {
    logger.error('Process approval error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const notifyNextApprover = async (approval) => {
  // Find next approver based on level and type
  let approverRole = approval.currentLevel === 1 ? 'supervisor' : 'manager';
  
  // In production, find actual user with that role
  const approver = await User.findOne({ role: approverRole, buildingId: req.user.buildingId });
  
  if (approver) {
    await Notification.create({
      userId: approver._id,
      title: 'Approval Required',
      body: `${approval.requestedBy.name} requests approval for ${approval.type}`,
      type: 'approval',
      referenceId: approval._id,
      referenceModel: 'Approval'
    });
  }
};

const handleApprovedAction = async (approval) => {
  // Update related record based on approval type
  if (approval.referenceModel === 'Leave' && approval.referenceId) {
    await Leave.findByIdAndUpdate(approval.referenceId, { status: 'approved' });
  }
  // Add other approval type handlers
};

const handleRejectedAction = async (approval) => {
  if (approval.referenceModel === 'Leave' && approval.referenceId) {
    await Leave.findByIdAndUpdate(approval.referenceId, { 
      status: 'rejected',
      rejectionReason: approval.finalComments 
    });
  }
};

module.exports = {
  getApprovals,
  createApproval,
  processApproval
};