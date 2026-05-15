const Task = require('../models/Task.model');
const User = require('../models/User.model');
const Complaint = require('../models/Complaint.model');
const Notification = require('../models/Notification.model');
const ActivityLog = require('../models/ActivityLog.model');
const { sendPushNotification } = require('../services/push.service');
const { getIO } = require('../config/socketio');
//const logger = require('../utils/logger');
// Replace with:
const { logger } = require('../utils/logger');

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const { status, assignedTo, buildingId, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (assignedTo) query.assignedTo = assignedTo;
    if (buildingId) query.buildingId = buildingId;

    // Role-based filtering
    if (req.user.role === 'technician') {
      query.assignedTo = req.user._id;
    } else if (req.user.role === 'supervisor') {
      const technicians = await User.find({ supervisorId: req.user._id, role: 'technician' });
      query.assignedTo = { $in: technicians.map(t => t._id) };
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email phone technicianType')
      .populate('assignedBy', 'name email')
      .populate('supervisorId', 'name')
      .populate('buildingId', 'name code')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Task.countDocuments(query);

    res.json({
      success: true,
      tasks,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    logger.error('Get tasks error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my tasks (for technicians)
// @route   GET /api/tasks/my
// @access  Private/Technician
const getMyTasks = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { assignedTo: req.user._id };

    if (status) query.status = status;

    const tasks = await Task.find(query)
      .populate('buildingId', 'name code address')
      .populate('assignedBy', 'name')
      .sort({ scheduledDate: 1, priority: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Task.countDocuments(query);

    // Group by status for dashboard
    const statusCounts = await Task.aggregate([
      { $match: { assignedTo: req.user._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      tasks,
      statusCounts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    logger.error('Get my tasks error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email phone technicianType profileImage')
      .populate('assignedBy', 'name email')
      .populate('supervisorId', 'name email')
      .populate('verifiedBy', 'name')
      .populate('buildingId', 'name code address');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Check authorization
    if (req.user.role === 'technician' && task.assignedTo._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    res.json({ success: true, task });
  } catch (error) {
    logger.error('Get task error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create task
// @route   POST /api/tasks
// @access  Private/Supervisor/Manager
const createTask = async (req, res) => {
  try {
    const { title, description, serviceType, buildingId, floorId, assignedTo, scheduledDate, priority } = req.body;

    const task = await Task.create({
      title,
      description,
      serviceType,
      buildingId,
      floorId,
      assignedTo,
      assignedBy: req.user._id,
      scheduledDate,
      priority: priority || 'medium',
      status: 'assigned'
    });

    // Notify technician
    await Notification.create({
      userId: assignedTo,
      title: 'New Task Assigned',
      body: `Task: ${title} scheduled for ${new Date(scheduledDate).toLocaleDateString()}`,
      type: 'task',
      referenceId: task._id,
      referenceModel: 'Task',
      channels: ['push', 'inapp']
    });

    // Send push notification
    const technician = await User.findById(assignedTo);
    if (technician?.fcmTokens?.length) {
      await sendPushNotification(technician.fcmTokens, {
        title: 'New Task',
        body: title,
        data: { taskId: task._id, type: 'task' }
      });
    }

    // Real-time update
    const io = getIO();
    io.to(`user_${assignedTo}`).emit('new_task', task);

    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'CREATE_TASK',
      entityType: 'task',
      entityId: task._id,
      newData: { title, assignedTo },
      ipAddress: req.ip
    });

    res.status(201).json({ success: true, task });
  } catch (error) {
    logger.error('Create task error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Assign task
// @route   PUT /api/tasks/:id/assign
// @access  Private/Supervisor/Manager
const assignTask = async (req, res) => {
  try {
    const { technicianId } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    task.assignedTo = technicianId;
    task.status = 'assigned';
    await task.save();

    await Notification.create({
      userId: technicianId,
      title: 'Task Reassigned',
      body: `Task ${task.taskNumber}: ${task.title}`,
      type: 'task',
      referenceId: task._id
    });

    const io = getIO();
    io.to(`user_${technicianId}`).emit('task_assigned', task);

    res.json({ success: true, task });
  } catch (error) {
    logger.error('Assign task error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update task status
// @route   PUT /api/tasks/:id/status
// @access  Private/Technician
const updateTaskStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not assigned to you' });
    }

    task.status = status;
    
    if (status === 'in_progress' && !task.actualStartTime) {
      task.actualStartTime = new Date();
    }
    
    if (status === 'completed') {
      task.actualEndTime = new Date();
    }

    await task.save();

    // Notify supervisor
    if (task.supervisorId) {
      await Notification.create({
        userId: task.supervisorId,
        title: `Task ${status}`,
        body: `Task ${task.taskNumber} is now ${status}`,
        type: 'task',
        referenceId: task._id
      });
    }

    const io = getIO();
    io.to(`user_${task.assignedBy}`).emit('task_updated', task);

    res.json({ success: true, task });
  } catch (error) {
    logger.error('Update task status error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify work (supervisor)
// @route   PUT /api/tasks/:id/verify
// @access  Private/Supervisor
const verifyWork = async (req, res) => {
  try {
    const { verificationNotes, rating } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    task.status = 'verified';
    task.verificationNotes = verificationNotes;
    task.verifiedBy = req.user._id;
    task.verifiedAt = new Date();
    task.rating = rating;

    await task.save();

    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'VERIFY_TASK',
      entityType: 'task',
      entityId: task._id,
      newData: { status: 'verified', rating },
      ipAddress: req.ip
    });

    res.json({ success: true, task });
  } catch (error) {
    logger.error('Verify work error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload completion proof
// @route   POST /api/tasks/:id/upload-proof
// @access  Private/Technician
const uploadCompletionProof = async (req, res) => {
  try {
    const { images } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    task.completionProof = [...(task.completionProof || []), ...images];
    await task.save();

    res.json({ success: true, task });
  } catch (error) {
    logger.error('Upload proof error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Request service (customer)
// @route   POST /api/tasks/service-request
// @access  Private/Customer
const requestService = async (req, res) => {
  try {
    const { serviceType, buildingId, description, scheduledDate } = req.body;

    const task = await Task.create({
      title: `Service Request: ${serviceType}`,
      description,
      serviceType,
      buildingId,
      assignedBy: req.user._id,
      scheduledDate,
      status: 'pending',
      isServiceRequest: true
    });

    res.status(201).json({ success: true, task });
  } catch (error) {
    logger.error('Service request error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTasks,
  getMyTasks,
  getTask,
  createTask,
  assignTask,
  updateTaskStatus,
  verifyWork,
  uploadCompletionProof,
  requestService
};