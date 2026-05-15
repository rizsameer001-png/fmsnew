const PPM_Schedule = require('../models/PPM_Schedule.model');
const Task = require('../models/Task.model');
const Notification = require('../models/Notification.model');
const ActivityLog = require('../models/ActivityLog.model');
const { getIO } = require('../config/socketio');
//const logger = require('../utils/logger');
// Replace with:
const { logger } = require('../utils/logger');

// @desc    Get all PPM schedules
// @route   GET /api/ppm
// @access  Private/Admin/Manager
const getPPMSchedules = async (req, res) => {
  try {
    const { buildingId, status, frequency, page = 1, limit = 10 } = req.query;
    const query = {};

    if (buildingId) query.buildingId = buildingId;
    if (status) query.status = status;
    if (frequency) query.frequency = frequency;

    const schedules = await PPM_Schedule.find(query)
      .populate('serviceId', 'name category')
      .populate('buildingId', 'name code')
      .populate('assignedTo', 'name email technicianType')
      .sort('nextRunDate')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await PPM_Schedule.countDocuments(query);

    res.json({
      success: true,
      schedules,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    logger.error('Get PPM schedules error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single PPM schedule
// @route   GET /api/ppm/:id
// @access  Private
const getPPMSchedule = async (req, res) => {
  try {
    const schedule = await PPM_Schedule.findById(req.params.id)
      .populate('serviceId', 'name category description checklist')
      .populate('buildingId', 'name code address')
      .populate('assignedTo', 'name email technicianType')
      .populate('assignedBy', 'name');

    if (!schedule) {
      return res.status(404).json({ success: false, message: 'PPM schedule not found' });
    }

    res.json({ success: true, schedule });
  } catch (error) {
    logger.error('Get PPM schedule error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create PPM schedule
// @route   POST /api/ppm
// @access  Private/Admin/Manager
const createPPMSchedule = async (req, res) => {
  try {
    const { name, description, serviceId, buildingId, floorId, frequency, customDays, startDate, endDate, assignedTo, checklist, reminderDays } = req.body;

    const nextRunDate = calculateNextRunDate(frequency, startDate, customDays);

    const schedule = await PPM_Schedule.create({
      name,
      description,
      serviceId,
      buildingId,
      floorId,
      frequency,
      customDays: frequency === 'custom' ? customDays : undefined,
      startDate,
      endDate,
      nextRunDate,
      assignedTo,
      assignedBy: req.user._id,
      checklist: checklist || [],
      reminderDays: reminderDays || [1, 3]
    });

    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'CREATE_PPM',
      entityType: 'ppm',
      entityId: schedule._id,
      newData: { name, frequency },
      ipAddress: req.ip
    });

    res.status(201).json({ success: true, schedule });
  } catch (error) {
    logger.error('Create PPM schedule error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update PPM schedule
// @route   PUT /api/ppm/:id
// @access  Private/Admin/Manager
const updatePPMSchedule = async (req, res) => {
  try {
    const schedule = await PPM_Schedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!schedule) {
      return res.status(404).json({ success: false, message: 'PPM schedule not found' });
    }

    res.json({ success: true, schedule });
  } catch (error) {
    logger.error('Update PPM schedule error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete PPM schedule
// @route   DELETE /api/ppm/:id
// @access  Private/Admin
const deletePPMSchedule = async (req, res) => {
  try {
    const schedule = await PPM_Schedule.findById(req.params.id);
    if (!schedule) {
      return res.status(404).json({ success: false, message: 'PPM schedule not found' });
    }

    await schedule.deleteOne();

    res.json({ success: true, message: 'PPM schedule deleted' });
  } catch (error) {
    logger.error('Delete PPM schedule error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate tasks from due PPM schedules
// @route   POST /api/ppm/generate-tasks
// @access  Private/Admin (Cron job)
const generatePPMTasks = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueSchedules = await PPM_Schedule.find({
      status: 'active',
      nextRunDate: { $lte: today },
      $or: [
        { endDate: { $exists: false } },
        { endDate: { $gte: today } }
      ]
    }).populate('serviceId');

    const createdTasks = [];

    for (const schedule of dueSchedules) {
      // Create task from schedule
      const task = await Task.create({
        title: `PPM: ${schedule.name}`,
        description: schedule.description || `Preventive maintenance task for ${schedule.serviceId?.name}`,
        serviceType: schedule.serviceId?.category || 'maintenance',
        buildingId: schedule.buildingId,
        floorId: schedule.floorId,
        assignedTo: schedule.assignedTo[0], // Assign to first technician
        assignedBy: schedule.assignedBy,
        scheduledDate: schedule.nextRunDate,
        ppmTask: {
          isPPM: true,
          ppmScheduleId: schedule._id
        },
        checklist: schedule.checklist
      });

      createdTasks.push(task);

      // Send notification to assigned technician
      for (const techId of schedule.assignedTo) {
        await Notification.create({
          userId: techId,
          title: 'PPM Task Generated',
          body: `New preventive maintenance task: ${schedule.name}`,
          type: 'task',
          referenceId: task._id,
          referenceModel: 'Task'
        });
      }

      // Update schedule's last run and next run date
      schedule.lastRunDate = schedule.nextRunDate;
      schedule.nextRunDate = schedule.calculateNextRunDate();
      await schedule.save();

      // Send reminder if within reminder days
      const daysUntilNext = Math.ceil((schedule.nextRunDate - today) / (1000 * 60 * 60 * 24));
      if (schedule.reminderDays.includes(daysUntilNext)) {
        await sendPPMReminder(schedule, daysUntilNext);
      }
    }

    const io = getIO();
    io.to('role_admin').to('role_manager').emit('ppm_tasks_generated', { count: createdTasks.length });

    res.json({ 
      success: true, 
      message: `Generated ${createdTasks.length} PPM tasks`,
      tasks: createdTasks 
    });
  } catch (error) {
    logger.error('Generate PPM tasks error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper function to calculate next run date
const calculateNextRunDate = (frequency, startDate, customDays) => {
  const nextRun = new Date(startDate);
  
  switch(frequency) {
    case 'daily':
      nextRun.setDate(nextRun.getDate() + 1);
      break;
    case 'weekly':
      nextRun.setDate(nextRun.getDate() + 7);
      break;
    case 'monthly':
      nextRun.setMonth(nextRun.getMonth() + 1);
      break;
    case 'quarterly':
      nextRun.setMonth(nextRun.getMonth() + 3);
      break;
    case 'half_yearly':
      nextRun.setMonth(nextRun.getMonth() + 6);
      break;
    case 'yearly':
      nextRun.setFullYear(nextRun.getFullYear() + 1);
      break;
    case 'custom':
      if (customDays) {
        nextRun.setDate(nextRun.getDate() + customDays);
      }
      break;
  }
  
  return nextRun;
};

const sendPPMReminder = async (schedule, daysUntil) => {
  for (const techId of schedule.assignedTo) {
    await Notification.create({
      userId: techId,
      title: 'PPM Reminder',
      body: `PPM task "${schedule.name}" is due in ${daysUntil} days`,
      type: 'reminder',
      referenceId: schedule._id,
      referenceModel: 'PPM_Schedule'
    });
  }
};

module.exports = {
  getPPMSchedules,
  getPPMSchedule,
  createPPMSchedule,
  updatePPMSchedule,
  deletePPMSchedule,
  generatePPMTasks
};