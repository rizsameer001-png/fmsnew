const Attendance = require('../models/Attendance.model');
const User = require('../models/User.model');
const Notification = require('../models/Notification.model');
const ActivityLog = require('../models/ActivityLog.model');
const { getIO } = require('../config/socketio');
const { logger } = require('../utils/logger');

// ==================== CHECK-IN ====================
// @desc    Check-in for any authenticated user
// @route   POST /api/attendance/checkin
// @access  Private (All authenticated users)
const checkIn = async (req, res) => {
  try {
    const { latitude, longitude, address, photo, deviceInfo } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in today
    const existingAttendance = await Attendance.findOne({
      userId: req.user._id,
      date: today
    });

    if (existingAttendance?.checkIn?.time) {
      return res.status(400).json({ success: false, message: 'Already checked in today' });
    }

    // Get shift timing based on user role
    let shiftStart = new Date();
    shiftStart.setHours(9, 0, 0, 0); // Default 9 AM
    
    // Custom shift for different roles (optional)
    if (req.user.role === 'super_admin') {
      shiftStart.setHours(10, 0, 0, 0); // Admin starts at 10 AM
    } else if (req.user.role === 'manager') {
      shiftStart.setHours(9, 30, 0, 0); // Managers at 9:30 AM
    }

    // Create or update attendance record
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

    // Calculate late minutes
    if (attendance.checkIn.time > shiftStart) {
      attendance.lateMinutes = Math.round((attendance.checkIn.time - shiftStart) / (1000 * 60));
      attendance.status = attendance.lateMinutes > 30 ? 'late' : 'present';
      await attendance.save();
    }

    // Send real-time notification to supervisors/managers
    const io = getIO();
    
    // Notify all supervisors and managers about employee check-in
    io.to('role_supervisor').to('role_manager').to('role_super_admin').emit('attendance_update', {
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      checkIn: attendance.checkIn.time,
      status: attendance.status,
      type: 'checkin'
    });

    // Create notification
    await Notification.create({
      userId: req.user.supervisorId || req.user.managerId,
      title: 'Attendance Update',
      message: `${req.user.name} (${req.user.role}) checked in at ${attendance.checkIn.time.toLocaleTimeString()}`,
      type: 'attendance',
      data: { userId: req.user._id, attendanceId: attendance._id }
    });

    // Log activity
    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'CHECK_IN',
      entityType: 'attendance',
      entityId: attendance._id,
      details: { location: { latitude, longitude }, lateMinutes: attendance.lateMinutes },
      ipAddress: req.ip
    });

    res.json({ 
      success: true, 
      attendance,
      message: attendance.lateMinutes > 0 ? `Checked in late by ${attendance.lateMinutes} minutes` : 'Checked in successfully'
    });
  } catch (error) {
    logger.error('Check-in error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== CHECK-OUT ====================
// @desc    Check-out for any authenticated user
// @route   POST /api/attendance/checkout
// @access  Private (All authenticated users)
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

    // Send real-time notification
    const io = getIO();
    io.to('role_supervisor').to('role_manager').to('role_super_admin').emit('attendance_update', {
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      checkOut: attendance.checkOut.time,
      totalHours: attendance.totalHours,
      type: 'checkout'
    });

    res.json({ success: true, attendance });
  } catch (error) {
    logger.error('Check-out error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== GET MY ATTENDANCE ====================
// @desc    Get my attendance history
// @route   GET /api/attendance/my
// @access  Private
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
    
    // Calculate summary
    const summary = {
      totalDays: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      late: attendance.filter(a => a.status === 'late').length,
      absent: 0,
      totalHours: attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0)
    };

    res.json({ success: true, attendance, summary, total, currentPage: page });
  } catch (error) {
    logger.error('Get my attendance error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== GET TODAY'S STATUS ====================
// @desc    Get today's status for current user
// @route   GET /api/attendance/today
// @access  Private
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
      isCheckedIn: !!attendance?.checkIn?.time,
      isCheckedOut: !!attendance?.checkOut?.time,
      checkIn: attendance?.checkIn?.time || null,
      checkOut: attendance?.checkOut?.time || null,
      totalHours: attendance?.totalHours || 0,
      status: attendance?.status || 'absent',
      lateMinutes: attendance?.lateMinutes || 0
    });
  } catch (error) {
    logger.error('Get today status error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== GET ALL EMPLOYEES ATTENDANCE (ADMIN) ====================
// @desc    Get attendance for all employees
// @route   GET /api/attendance/all
// @access  Private (Super Admin only)
const getAllEmployeesAttendance = async (req, res) => {
  try {
    const { date, role, buildingId, status, search, page = 1, limit = 50 } = req.query;
    const queryDate = date ? new Date(date) : new Date();
    queryDate.setHours(0, 0, 0, 0);

    // Build user filter
    let userFilter = { isActive: true };
    if (role && role !== 'all') userFilter.role = role;
    if (buildingId && buildingId !== 'all') userFilter.buildingId = buildingId;
    
    // Get all employees (excluding customers)
    userFilter.role = { $in: ['super_admin', 'manager', 'supervisor', 'technician'] };
    
    const employees = await User.find(userFilter).select('_id name email role buildingId department');
    
    // Filter by search
    let filteredEmployees = employees;
    if (search) {
      filteredEmployees = employees.filter(e => 
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    const employeeIds = filteredEmployees.map(e => e._id);
    
    // Get attendance records
    const attendanceRecords = await Attendance.find({
      userId: { $in: employeeIds },
      date: queryDate
    });
    
    // Create map for quick lookup
    const attendanceMap = new Map();
    attendanceRecords.forEach(record => {
      attendanceMap.set(record.userId.toString(), record);
    });
    
    // Build response
    const allAttendance = filteredEmployees.map(employee => {
      const record = attendanceMap.get(employee._id.toString());
      return {
        userId: employee._id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        department: employee.department,
        buildingId: employee.buildingId,
        checkIn: record?.checkIn?.time || null,
        checkOut: record?.checkOut?.time || null,
        totalHours: record?.totalHours || 0,
        status: record?.status || 'absent',
        lateMinutes: record?.lateMinutes || 0
      };
    });
    
    // Filter by status
    let filteredAttendance = allAttendance;
    if (status && status !== 'all') {
      filteredAttendance = allAttendance.filter(a => a.status === status);
    }
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const paginatedAttendance = filteredAttendance.slice(startIndex, startIndex + limit);
    
    // Calculate stats
    const stats = {
      total: allAttendance.length,
      present: allAttendance.filter(a => a.status === 'present').length,
      absent: allAttendance.filter(a => a.status === 'absent').length,
      late: allAttendance.filter(a => a.status === 'late').length,
      onLeave: allAttendance.filter(a => a.status === 'leave').length,
      attendanceRate: allAttendance.length > 0 ? ((allAttendance.filter(a => a.status === 'present').length / allAttendance.length) * 100).toFixed(1) : 0
    };
    
    res.json({
      success: true,
      attendance: paginatedAttendance,
      stats,
      total: filteredAttendance.length,
      currentPage: parseInt(page),
      totalPages: Math.ceil(filteredAttendance.length / limit)
    });
  } catch (error) {
    logger.error('Get all employees attendance error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== GET TEAM ATTENDANCE (MANAGER/SUPERVISOR) ====================
// @desc    Get team attendance based on role
// @route   GET /api/attendance/team
// @access  Private (Manager, Supervisor)
const getTeamAttendance = async (req, res) => {
  try {
    const { date, status, search } = req.query;
    const queryDate = date ? new Date(date) : new Date();
    queryDate.setHours(0, 0, 0, 0);

    let teamMembers = [];
    
    if (req.user.role === 'manager') {
      // Manager sees supervisors and technicians in their building
      teamMembers = await User.find({
        buildingId: req.user.buildingId,
        role: { $in: ['supervisor', 'technician'] },
        isActive: true
      }).select('_id name email role buildingId department');
    } 
    else if (req.user.role === 'supervisor') {
      // Supervisor sees their technicians
      teamMembers = await User.find({
        supervisorId: req.user._id,
        role: 'technician',
        isActive: true
      }).select('_id name email role buildingId department');
    }
    
    // Filter by search
    let filteredMembers = teamMembers;
    if (search) {
      filteredMembers = teamMembers.filter(m => 
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    const memberIds = filteredMembers.map(m => m._id);
    
    const attendanceRecords = await Attendance.find({
      userId: { $in: memberIds },
      date: queryDate
    });
    
    const attendanceMap = new Map();
    attendanceRecords.forEach(record => {
      attendanceMap.set(record.userId.toString(), record);
    });
    
    const teamAttendance = filteredMembers.map(member => {
      const record = attendanceMap.get(member._id.toString());
      return {
        userId: member._id,
        name: member.name,
        email: member.email,
        role: member.role,
        department: member.department,
        checkIn: record?.checkIn?.time || null,
        checkOut: record?.checkOut?.time || null,
        totalHours: record?.totalHours || 0,
        status: record?.status || 'absent',
        lateMinutes: record?.lateMinutes || 0
      };
    });
    
    // Filter by status
    let filteredAttendance = teamAttendance;
    if (status && status !== 'all') {
      filteredAttendance = teamAttendance.filter(a => a.status === status);
    }
    
    const stats = {
      total: teamAttendance.length,
      present: teamAttendance.filter(a => a.status === 'present').length,
      absent: teamAttendance.filter(a => a.status === 'absent').length,
      late: teamAttendance.filter(a => a.status === 'late').length,
      attendanceRate: teamAttendance.length > 0 ? ((teamAttendance.filter(a => a.status === 'present').length / teamAttendance.length) * 100).toFixed(1) : 0
    };
    
    res.json({
      success: true,
      attendance: filteredAttendance,
      stats,
      total: filteredAttendance.length
    });
  } catch (error) {
    logger.error('Get team attendance error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== APPROVE ATTENDANCE ====================
// @desc    Approve/Edit attendance (Admin/Manager)
// @route   PUT /api/attendance/:id/approve
// @access  Private (Admin, Manager)
const approveAttendance = async (req, res) => {
  try {
    const { status, notes, checkInTime, checkOutTime } = req.body;
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }

    if (status) attendance.status = status;
    if (notes) attendance.notes = notes;
    if (checkInTime) attendance.checkIn.time = new Date(checkInTime);
    if (checkOutTime) attendance.checkOut.time = new Date(checkOutTime);
    
    attendance.approvedBy = req.user._id;
    attendance.approvedAt = new Date();
    await attendance.save();

    await Notification.create({
      userId: attendance.userId,
      title: 'Attendance Updated',
      message: `Your attendance for ${attendance.date.toLocaleDateString()} has been marked as ${status}`,
      type: 'attendance'
    });

    res.json({ success: true, attendance });
  } catch (error) {
    logger.error('Approve attendance error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================== GET ATTENDANCE STATS ========================
// @desc    Get attendance statistics
// @route   GET /api/attendance/stats
// @access  Private
const getAttendanceStats = async (req, res) => {
  try {
    const { date } = req.query;
    const queryDate = date ? new Date(date) : new Date();
    queryDate.setHours(0, 0, 0, 0);
    
    let userFilter = { isActive: true };
    
    if (req.user.role === 'super_admin') {
      userFilter.role = { $in: ['super_admin', 'manager', 'supervisor', 'technician'] };
    } 
    else if (req.user.role === 'manager') {
      userFilter.buildingId = req.user.buildingId;
      userFilter.role = { $in: ['supervisor', 'technician'] };
    }
    else if (req.user.role === 'supervisor') {
      userFilter.supervisorId = req.user._id;
      userFilter.role = 'technician';
    }
    else if (req.user.role === 'technician') {
      userFilter._id = req.user._id;
    }
    else {
      return res.json({ totalEmployees: 0, present: 0, absent: 0, late: 0 });
    }
    
    const totalEmployees = await User.countDocuments(userFilter);
    const employeeIds = (await User.find(userFilter).select('_id')).map(u => u._id);
    
    const attendanceRecords = await Attendance.find({
      userId: { $in: employeeIds },
      date: queryDate
    });
    
    const stats = {
      totalEmployees,
      present: attendanceRecords.filter(a => a.status === 'present').length,
      absent: totalEmployees - attendanceRecords.length,
      late: attendanceRecords.filter(a => a.status === 'late').length,
      leave: attendanceRecords.filter(a => a.status === 'leave').length,
      attendanceRate: totalEmployees > 0 ? ((attendanceRecords.filter(a => a.status === 'present').length / totalEmployees) * 100).toFixed(1) : 0
    };
    
    res.json({ success: true, ...stats });
  } catch (error) {
    logger.error('Get attendance stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  checkIn,
  checkOut,
  getMyAttendance,
  getTodayStatus,
  getAllEmployeesAttendance,
  getTeamAttendance,
  approveAttendance,
  getAttendanceStats
};