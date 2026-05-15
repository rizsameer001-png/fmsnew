// const Attendance = require('../models/Attendance.model');
// const User = require('../models/User.model');
// const Geofence = require('../models/Geofence.model');
// const Notification = require('../models/Notification.model');
// const ActivityLog = require('../models/ActivityLog.model');
// const { getIO } = require('../config/socketio');
// //const logger = require('../utils/logger');
// // Replace with:
// const { logger } = require('../utils/logger');

// // @desc    Check-in
// // @route   POST /api/attendance/checkin
// // @access  Private/Technician/Supervisor
// const checkIn = async (req, res) => {
//   try {
//     const { latitude, longitude, address, photo, deviceInfo } = req.body;
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     // Check if already checked in today
//     const existingAttendance = await Attendance.findOne({
//       userId: req.user._id,
//       date: today
//     });

//     if (existingAttendance && existingAttendance.checkIn.time) {
//       return res.status(400).json({ success: false, message: 'Already checked in today' });
//     }

//     // Validate geofence if user has assigned building
//     let isWithinGeofence = true;
//     if (req.user.buildingId) {
//       const geofence = await Geofence.findOne({ buildingId: req.user.buildingId, isActive: true });
//       if (geofence) {
//         isWithinGeofence = await validateGeofenceCheck(latitude, longitude, geofence);
//         if (!isWithinGeofence) {
//           return res.status(400).json({ success: false, message: 'You are outside the allowed geofence area' });
//         }
//       }
//     }

//     const attendance = await Attendance.findOneAndUpdate(
//       { userId: req.user._id, date: today },
//       {
//         userId: req.user._id,
//         date: today,
//         checkIn: {
//           time: new Date(),
//           location: { latitude, longitude, address },
//           photo,
//           deviceInfo
//         },
//         status: 'present'
//       },
//       { upsert: true, new: true }
//     );

//     // Calculate late status
//     const shiftStart = new Date();
//     shiftStart.setHours(9, 0, 0); // Default 9 AM
//     if (attendance.checkIn.time > shiftStart) {
//       const lateMinutes = Math.round((attendance.checkIn.time - shiftStart) / (1000 * 60));
//       attendance.lateMinutes = lateMinutes;
//       attendance.status = lateMinutes > 30 ? 'late' : 'present';
//       await attendance.save();
//     }

//     // Real-time update
//     const io = getIO();
//     io.to(`role_supervisor`).emit('attendance_update', {
//       userId: req.user._id,
//       userName: req.user.name,
//       checkIn: attendance.checkIn.time,
//       status: attendance.status
//     });

//     await ActivityLog.create({
//       userId: req.user._id,
//       userName: req.user.name,
//       userRole: req.user.role,
//       action: 'CHECK_IN',
//       entityType: 'attendance',
//       entityId: attendance._id,
//       ipAddress: req.ip
//     });

//     res.json({ success: true, attendance });
//   } catch (error) {
//     logger.error('Check-in error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Check-out
// // @route   POST /api/attendance/checkout
// // @access  Private/Technician/Supervisor
// const checkOut = async (req, res) => {
//   try {
//     const { latitude, longitude, address, photo, deviceInfo } = req.body;
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     const attendance = await Attendance.findOne({
//       userId: req.user._id,
//       date: today
//     });

//     if (!attendance) {
//       return res.status(400).json({ success: false, message: 'No check-in record found' });
//     }

//     if (attendance.checkOut && attendance.checkOut.time) {
//       return res.status(400).json({ success: false, message: 'Already checked out today' });
//     }

//     attendance.checkOut = {
//       time: new Date(),
//       location: { latitude, longitude, address },
//       photo,
//       deviceInfo
//     };

//     // Calculate total hours
//     const hours = (attendance.checkOut.time - attendance.checkIn.time) / (1000 * 60 * 60);
//     attendance.totalHours = Math.round(hours * 100) / 100;

//     await attendance.save();

//     // Real-time update
//     const io = getIO();
//     io.to(`role_supervisor`).emit('attendance_update', {
//       userId: req.user._id,
//       userName: req.user.name,
//       checkOut: attendance.checkOut.time,
//       totalHours: attendance.totalHours
//     });

//     await ActivityLog.create({
//       userId: req.user._id,
//       userName: req.user.name,
//       userRole: req.user.role,
//       action: 'CHECK_OUT',
//       entityType: 'attendance',
//       entityId: attendance._id,
//       ipAddress: req.ip
//     });

//     res.json({ success: true, attendance });
//   } catch (error) {
//     logger.error('Check-out error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Get my attendance history
// // @route   GET /api/attendance/my
// // @access  Private
// const getMyAttendance = async (req, res) => {
//   try {
//     const { startDate, endDate, page = 1, limit = 30 } = req.query;
//     const query = { userId: req.user._id };

//     if (startDate && endDate) {
//       query.date = {
//         $gte: new Date(startDate),
//         $lte: new Date(endDate)
//       };
//     }

//     const attendance = await Attendance.find(query)
//       .sort('-date')
//       .limit(limit * 1)
//       .skip((page - 1) * limit);

//     const total = await Attendance.countDocuments(query);

//     // Calculate summary
//     const summary = await Attendance.aggregate([
//       { $match: { userId: req.user._id } },
//       {
//         $group: {
//           _id: null,
//           totalPresent: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
//           totalLate: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
//           totalAbsent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
//           totalHours: { $sum: '$totalHours' },
//           avgLateMinutes: { $avg: '$lateMinutes' }
//         }
//       }
//     ]);

//     res.json({
//       success: true,
//       attendance,
//       summary: summary[0] || {},
//       totalPages: Math.ceil(total / limit),
//       currentPage: page,
//       total
//     });
//   } catch (error) {
//     logger.error('Get my attendance error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Get team attendance (supervisor/manager)
// // @route   GET /api/attendance/team
// // @access  Private/Supervisor/Manager
// const getTeamAttendance = async (req, res) => {
//   try {
//     const { date, status, page = 1, limit = 20 } = req.query;
//     const queryDate = date ? new Date(date) : new Date();
//     queryDate.setHours(0, 0, 0, 0);

//     // Get team members based on role
//     let teamMembers = [];
//     if (req.user.role === 'supervisor') {
//       teamMembers = await User.find({ supervisorId: req.user._id, isActive: true }).select('_id');
//     } else if (req.user.role === 'manager') {
//       teamMembers = await User.find({ buildingId: req.user.buildingId, role: { $in: ['supervisor', 'technician'] }, isActive: true }).select('_id');
//     }

//     const memberIds = teamMembers.map(m => m._id);
//     const query = { userId: { $in: memberIds }, date: queryDate };
//     if (status) query.status = status;

//     const attendance = await Attendance.find(query)
//       .populate('userId', 'name email phone technicianType profileImage')
//       .sort('userId.name');

//     res.json({ success: true, attendance });
//   } catch (error) {
//     logger.error('Get team attendance error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Get attendance report
// // @route   GET /api/attendance/report
// // @access  Private/Admin/Manager
// const getAttendanceReport = async (req, res) => {
//   try {
//     const { startDate, endDate, buildingId, role, exportFormat } = req.query;
    
//     const match = {};
//     if (startDate && endDate) {
//       match.date = {
//         $gte: new Date(startDate),
//         $lte: new Date(endDate)
//       };
//     }
    
//     if (buildingId) {
//       const users = await User.find({ buildingId }).select('_id');
//       match.userId = { $in: users.map(u => u._id) };
//     }
    
//     if (role) {
//       const users = await User.find({ role }).select('_id');
//       match.userId = { $in: users.map(u => u._id) };
//     }

//     const report = await Attendance.aggregate([
//       { $match: match },
//       {
//         $lookup: {
//           from: 'users',
//           localField: 'userId',
//           foreignField: '_id',
//           as: 'user'
//         }
//       },
//       { $unwind: '$user' },
//       {
//         $group: {
//           _id: '$user._id',
//           name: { $first: '$user.name' },
//           email: { $first: '$user.email' },
//           role: { $first: '$user.role' },
//           totalPresent: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
//           totalLate: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
//           totalAbsent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
//           totalHours: { $sum: '$totalHours' },
//           averageLateMinutes: { $avg: '$lateMinutes' }
//         }
//       }
//     ]);

//     res.json({ success: true, report });
//   } catch (error) {
//     logger.error('Get attendance report error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Approve attendance (manager)
// // @route   PUT /api/attendance/:id/approve
// // @access  Private/Manager
// const approveAttendance = async (req, res) => {
//   try {
//     const { status, notes } = req.body;
//     const attendance = await Attendance.findById(req.params.id);

//     if (!attendance) {
//       return res.status(404).json({ success: false, message: 'Attendance record not found' });
//     }

//     attendance.status = status;
//     attendance.notes = notes;
//     attendance.approvedBy = req.user._id;
//     attendance.approvedAt = new Date();
//     await attendance.save();

//     res.json({ success: true, attendance });
//   } catch (error) {
//     logger.error('Approve attendance error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Helper function to validate geofence
// const validateGeofenceCheck = async (lat, lng, geofence) => {
//   if (geofence.shape === 'circle') {
//     const distance = calculateDistance(
//       lat, lng,
//       geofence.coordinates.center.latitude,
//       geofence.coordinates.center.longitude
//     );
//     return distance <= geofence.coordinates.radius;
//   }
//   return true; // For polygon, implement point-in-polygon check
// };

// const calculateDistance = (lat1, lon1, lat2, lon2) => {
//   const R = 6371e3; // Earth's radius in meters
//   const φ1 = lat1 * Math.PI / 180;
//   const φ2 = lat2 * Math.PI / 180;
//   const Δφ = (lat2 - lat1) * Math.PI / 180;
//   const Δλ = (lon2 - lon1) * Math.PI / 180;

//   const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
//     Math.cos(φ1) * Math.cos(φ2) *
//     Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

//   return R * c;
// };

// module.exports = {
//   checkIn,
//   checkOut,
//   getMyAttendance,
//   getTeamAttendance,
//   getAttendanceReport,
//   approveAttendance
// };


// fms-backend/src/controllers/attendance.controller.js
const Attendance = require('../models/Attendance.model');
const User = require('../models/User.model');
const Geofence = require('../models/Geofence.model');
const Notification = require('../models/Notification.model');
const ActivityLog = require('../models/ActivityLog.model');
const { getIO } = require('../config/socketio');
const { logger } = require('../utils/logger');

// Calculate distance between two points
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

// @desc    Check-in
// @route   POST /api/attendance/checkin
const checkIn = async (req, res) => {
  try {
    const { latitude, longitude, address, photo, deviceInfo } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingAttendance = await Attendance.findOne({
      userId: req.user._id,
      date: today
    });

    if (existingAttendance?.checkIn?.time) {
      return res.status(400).json({ success: false, message: 'Already checked in today' });
    }

    const attendance = await Attendance.findOneAndUpdate(
      { userId: req.user._id, date: today },
      {
        userId: req.user._id,
        date: today,
        checkIn: {
          time: new Date(),
          location: { latitude, longitude, address },
          photo,
          deviceInfo
        },
        status: 'present'
      },
      { upsert: true, new: true }
    );

    const shiftStart = new Date();
    shiftStart.setHours(9, 0, 0);
    if (attendance.checkIn.time > shiftStart) {
      attendance.lateMinutes = Math.round((attendance.checkIn.time - shiftStart) / (1000 * 60));
      attendance.status = attendance.lateMinutes > 30 ? 'late' : 'present';
      await attendance.save();
    }

    const io = getIO();
    io.to(`role_supervisor`).emit('attendance_update', {
      userId: req.user._id,
      userName: req.user.name,
      checkIn: attendance.checkIn.time,
      status: attendance.status
    });

    res.json({ success: true, attendance });
  } catch (error) {
    logger.error('Check-in error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Check-out
// @route   POST /api/attendance/checkout
const checkOut = async (req, res) => {
  try {
    const { latitude, longitude, address, photo, deviceInfo } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      userId: req.user._id,
      date: today
    });

    if (!attendance) {
      return res.status(400).json({ success: false, message: 'No check-in record found' });
    }

    if (attendance.checkOut?.time) {
      return res.status(400).json({ success: false, message: 'Already checked out today' });
    }

    attendance.checkOut = {
      time: new Date(),
      location: { latitude, longitude, address },
      photo,
      deviceInfo
    };

    const hours = (attendance.checkOut.time - attendance.checkIn.time) / (1000 * 60 * 60);
    attendance.totalHours = Math.round(hours * 100) / 100;
    await attendance.save();

    res.json({ success: true, attendance });
  } catch (error) {
    logger.error('Check-out error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my attendance history
// @route   GET /api/attendance/my
const getMyAttendance = async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 30 } = req.query;
    const query = { userId: req.user._id };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await Attendance.find(query)
      .sort('-date')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Attendance.countDocuments(query);

    res.json({ success: true, attendance, total, currentPage: page });
  } catch (error) {
    logger.error('Get my attendance error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get today's status
// @route   GET /api/attendance/today
const getTodayStatus = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const attendance = await Attendance.findOne({
      userId: req.user._id,
      date: today
    });
    
    res.json({
      success: true,
      checkIn: attendance?.checkIn?.time || null,
      checkOut: attendance?.checkOut?.time || null,
      totalHours: attendance?.totalHours || 0,
      status: attendance?.status || 'absent'
    });
  } catch (error) {
    logger.error('Get today status error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get team attendance
// @route   GET /api/attendance/team
const getTeamAttendance = async (req, res) => {
  try {
    const { date, status } = req.query;
    const queryDate = date ? new Date(date) : new Date();
    queryDate.setHours(0, 0, 0, 0);

    let teamMembers = [];
    if (req.user.role === 'supervisor') {
      teamMembers = await User.find({ supervisorId: req.user._id, isActive: true }).select('_id');
    } else if (req.user.role === 'manager') {
      teamMembers = await User.find({ buildingId: req.user.buildingId, role: { $in: ['supervisor', 'technician'] }, isActive: true }).select('_id');
    }

    const memberIds = teamMembers.map(m => m._id);
    const query = { userId: { $in: memberIds }, date: queryDate };
    if (status) query.status = status;

    const attendance = await Attendance.find(query)
      .populate('userId', 'name email phone role');

    res.json({ success: true, attendance });
  } catch (error) {
    logger.error('Get team attendance error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get attendance report
// @route   GET /api/attendance/report
const getAttendanceReport = async (req, res) => {
  try {
    const { startDate, endDate, buildingId, role } = req.query;
    
    const match = {};
    if (startDate && endDate) {
      match.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const report = await Attendance.aggregate([
      { $match: match },
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
        $group: {
          _id: '$user._id',
          name: { $first: '$user.name' },
          email: { $first: '$user.email' },
          role: { $first: '$user.role' },
          totalPresent: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          totalLate: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
          totalAbsent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
          totalHours: { $sum: '$totalHours' }
        }
      }
    ]);

    res.json({ success: true, report });
  } catch (error) {
    logger.error('Get attendance report error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get attendance stats
// @route   GET /api/attendance/stats
const getAttendanceStats = async (req, res) => {
  try {
    const { date } = req.query;
    const queryDate = date ? new Date(date) : new Date();
    queryDate.setHours(0, 0, 0, 0);
    
    const totalEmployees = await User.countDocuments({ 
      role: { $in: ['technician', 'supervisor', 'security', 'cleaning'] },
      isActive: true 
    });
    
    const attendance = await Attendance.find({ date: queryDate });
    
    const stats = {
      totalEmployees,
      present: attendance.filter(a => a.status === 'present').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      late: attendance.filter(a => a.status === 'late').length,
      leave: attendance.filter(a => a.status === 'leave').length,
      halfDay: attendance.filter(a => a.status === 'half_day').length
    };
    
    res.json({ success: true, ...stats });
  } catch (error) {
    logger.error('Get attendance stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve attendance
// @route   PUT /api/attendance/:id/approve
const approveAttendance = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }

    attendance.status = status;
    attendance.notes = notes;
    attendance.approvedBy = req.user._id;
    attendance.approvedAt = new Date();
    await attendance.save();

    res.json({ success: true, attendance });
  } catch (error) {
    logger.error('Approve attendance error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  checkIn,
  checkOut,
  getMyAttendance,
  getTeamAttendance,
  getAttendanceReport,
  approveAttendance,
  getTodayStatus,
  getAttendanceStats
};