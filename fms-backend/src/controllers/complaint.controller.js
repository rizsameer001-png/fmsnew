const Complaint = require('../models/Complaint.model');
const User = require('../models/User.model');
const Notification = require('../models/Notification.model');
const ActivityLog = require('../models/ActivityLog.model');
const { sendPushNotification } = require('../services/push.service');
const { SLA_PRIORITIES } = require('../utils/constants');
const { getIO } = require('../config/socketio');
//const logger = require('../utils/logger');
// Replace with:
const { logger } = require('../utils/logger');

// @desc    Get all complaints
// @route   GET /api/complaints
// @access  Private
const getComplaints = async (req, res) => {
  try {
    const { status, priority, assignedTo, buildingId, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;
    if (buildingId) query.buildingId = buildingId;

    // Role-based filtering
    if (req.user.role === 'customer') {
      query.customerId = req.user._id;
    } else if (req.user.role === 'technician') {
      query.assignedTo = req.user._id;
    } else if (req.user.role === 'supervisor') {
      // Get all technicians under this supervisor
      const technicians = await User.find({ supervisorId: req.user._id, role: 'technician' });
      const techIds = technicians.map(t => t._id);
      query.$or = [{ assignedTo: { $in: techIds } }, { assignedBy: req.user._id }];
    }

    const complaints = await Complaint.find(query)
      .populate('customerId', 'name email phone')
      .populate('assignedTo', 'name email phone technicianType')
      .populate('assignedBy', 'name')
      .populate('buildingId', 'name code')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Complaint.countDocuments(query);

    res.json({
      success: true,
      complaints,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    logger.error('Get complaints error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single complaint
// @route   GET /api/complaints/:id
// @access  Private
const getComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('customerId', 'name email phone')
      .populate('assignedTo', 'name email phone technicianType')
      .populate('assignedBy', 'name')
      .populate('buildingId', 'name code address')
      .populate('escalationHistory.escalatedBy', 'name role');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Check authorization
    if (req.user.role === 'customer' && complaint.customerId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    res.json({ success: true, complaint });
  } catch (error) {
    logger.error('Get complaint error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create complaint
// @route   POST /api/complaints
// @access  Private/Customer
const createComplaint = async (req, res) => {
  try {
    const { serviceType, title, description, priority, buildingId, floorId, images } = req.body;

    // Calculate SLA deadline
    const sla = SLA_PRIORITIES[priority] || SLA_PRIORITIES.medium;
    const slaDeadline = new Date();
    slaDeadline.setHours(slaDeadline.getHours() + sla.response);

    const complaint = await Complaint.create({
      customerId: req.user._id,
      buildingId,
      floorId,
      serviceType,
      title,
      description,
      priority,
      slaDeadline,
      images: images || []
    });

    // Auto-assign based on priority and service type
    await autoAssignTechnician(complaint);

    // Create notification
    await Notification.create({
      userId: complaint.assignedTo,
      title: 'New Complaint Assigned',
      body: `Complaint ${complaint.complaintNumber}: ${title}`,
      type: 'complaint',
      referenceId: complaint._id,
      referenceModel: 'Complaint',
      channels: ['push', 'inapp']
    });

    // Send push notification
    if (complaint.assignedTo) {
      const technician = await User.findById(complaint.assignedTo);
      if (technician?.fcmTokens?.length) {
        await sendPushNotification(technician.fcmTokens, {
          title: 'New Complaint',
          body: `${complaint.complaintNumber} - ${title}`,
          data: { complaintId: complaint._id, type: 'complaint' }
        });
      }
    }

    // Real-time update via socket
    const io = getIO();
    io.to(`role_admin`).emit('new_complaint', complaint);
    if (complaint.assignedTo) {
      io.to(`user_${complaint.assignedTo}`).emit('new_complaint', complaint);
    }

    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'CREATE_COMPLAINT',
      entityType: 'complaint',
      entityId: complaint._id,
      newData: { complaintNumber: complaint.complaintNumber, title },
      ipAddress: req.ip
    });

    res.status(201).json({ success: true, complaint });
  } catch (error) {
    logger.error('Create complaint error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Auto-assign technician based on service type and priority
const autoAssignTechnician = async (complaint) => {
  try {
    // Find available technician for the service type
    const technician = await User.findOne({
      role: 'technician',
      technicianType: complaint.serviceType,
      isActive: true,
      buildingId: complaint.buildingId
    });

    if (technician) {
      complaint.assignedTo = technician._id;
      complaint.status = 'assigned';
      await complaint.save();
    }
  } catch (error) {
    logger.error('Auto-assign error:', error);
  }
};

// @desc    Assign complaint to technician
// @route   PUT /api/complaints/:id/assign
// @access  Private/Supervisor/Manager
const assignComplaint = async (req, res) => {
  try {
    const { technicianId } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    complaint.assignedTo = technicianId;
    complaint.assignedBy = req.user._id;
    complaint.status = 'assigned';
    await complaint.save();

    // Notify technician
    await Notification.create({
      userId: technicianId,
      title: 'Complaint Assigned',
      body: `Complaint ${complaint.complaintNumber} has been assigned to you`,
      type: 'complaint',
      referenceId: complaint._id,
      referenceModel: 'Complaint'
    });

    const io = getIO();
    io.to(`user_${technicianId}`).emit('complaint_assigned', complaint);

    res.json({ success: true, complaint });
  } catch (error) {
    logger.error('Assign complaint error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update complaint status
// @route   PUT /api/complaints/:id/status
// @access  Private/Technician
const updateStatus = async (req, res) => {
  try {
    const { status, notes, images } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    complaint.status = status;
    
    if (status === 'in_progress') {
      complaint.actualStartTime = new Date();
    }
    
    if (status === 'resolved') {
      complaint.resolution = {
        description: notes,
        resolvedAt: new Date(),
        resolvedBy: req.user._id,
        images: images || []
      };
    }

    await complaint.save();

    // Notify customer
    await Notification.create({
      userId: complaint.customerId,
      title: `Complaint ${status.replace('_', ' ')}`,
      body: `Complaint ${complaint.complaintNumber} status updated to ${status}`,
      type: 'complaint',
      referenceId: complaint._id
    });

    const io = getIO();
    io.to(`user_${complaint.customerId}`).emit('complaint_updated', complaint);

    res.json({ success: true, complaint });
  } catch (error) {
    logger.error('Update status error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add rating and feedback
// @route   POST /api/complaints/:id/rate
// @access  Private/Customer
const addRating = async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (complaint.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    complaint.rating = rating;
    complaint.feedback = feedback;
    await complaint.save();

    res.json({ success: true, complaint });
  } catch (error) {
    logger.error('Add rating error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Escalate complaint
// @route   POST /api/complaints/:id/escalate
// @access  Private
const escalateComplaint = async (req, res) => {
  try {
    const { reason } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const escalationLevels = {
      0: 'supervisor',
      1: 'manager',
      2: 'admin'
    };

    const nextLevel = complaint.escalationLevel + 1;
    const escalateToRole = escalationLevels[nextLevel];

    complaint.escalationLevel = nextLevel;
    complaint.escalationHistory.push({
      escalatedBy: req.user._id,
      reason,
      fromRole: req.user.role,
      toRole: escalateToRole
    });
    
    if (nextLevel >= 2) {
      complaint.status = 'escalated';
    }

    await complaint.save();

    res.json({ success: true, complaint });
  } catch (error) {
    logger.error('Escalate complaint error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get complaint statistics
// @route   GET /api/complaints/stats/overview
// @access  Private
const getComplaintStats = async (req, res) => {
  try {
    const match = {};
    
    if (req.user.role === 'customer') {
      match.customerId = req.user._id;
    }

    const stats = await Complaint.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const priorityStats = await Complaint.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    const slaBreaches = await Complaint.countDocuments({ 
      ...match, 
      slaBreached: true 
    });

    const avgResolutionTime = await Complaint.aggregate([
      { $match: { ...match, status: 'closed', resolution: { $exists: true } } },
      {
        $project: {
          resolutionTime: { 
            $subtract: ['$resolution.resolvedAt', '$createdAt'] 
          }
        }
      },
      {
        $group: {
          _id: null,
          avgTime: { $avg: '$resolutionTime' }
        }
      }
    ]);

    res.json({
      success: true,
      statusStats: stats,
      priorityStats,
      slaBreaches,
      avgResolutionTime: avgResolutionTime[0]?.avgTime || 0
    });
  } catch (error) {
    logger.error('Get complaint stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getComplaints,
  getComplaint,
  createComplaint,
  assignComplaint,
  updateStatus,
  addRating,
  escalateComplaint,
  getComplaintStats
};