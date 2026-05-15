// const User = require('../models/User.model');
// const Complaint = require('../models/Complaint.model');
// const Task = require('../models/Task.model');
// const Attendance = require('../models/Attendance.model');
// const Invoice = require('../models/Invoice.model');
// const Building = require('../models/Building.model');
// //const logger = require('../utils/logger');
// // Replace with:
// const { logger } = require('../utils/logger');

// // @desc    Admin dashboard stats
// // @route   GET /api/dashboard/admin
// // @access  Private/Admin
// const getAdminStats = async (req, res) => {
//   try {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const startOfWeek = new Date(today);
//     startOfWeek.setDate(today.getDate() - today.getDay());
//     const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

//     // Parallel queries for performance
//     const [
//       totalUsers,
//       totalBuildings,
//       totalComplaints,
//       pendingComplaints,
//       urgentComplaints,
//       todayAttendance,
//       totalRevenue,
//       pendingInvoices,
//       activeTechnicians,
//       recentComplaints
//     ] = await Promise.all([
//       User.countDocuments(),
//       Building.countDocuments({ status: 'active' }),
//       Complaint.countDocuments(),
//       Complaint.countDocuments({ status: { $in: ['pending', 'assigned'] } }),
//       Complaint.countDocuments({ priority: 'urgent', status: { $ne: 'closed' } }),
//       Attendance.countDocuments({ date: today, status: 'present' }),
//       Invoice.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
//       Invoice.countDocuments({ status: { $in: ['sent', 'overdue'] } }),
//       User.countDocuments({ role: 'technician', isActive: true }),
//       Complaint.find().sort('-createdAt').limit(5).populate('customerId', 'name')
//     ]);

//     // Weekly complaint trend
//     const weeklyComplaints = await Complaint.aggregate([
//       { $match: { createdAt: { $gte: startOfWeek } } },
//       { $group: { _id: { $dayOfWeek: '$createdAt' }, count: { $sum: 1 } } },
//       { $sort: { '_id': 1 } }
//     ]);

//     // Monthly revenue trend
//     const monthlyRevenue = await Invoice.aggregate([
//       { $match: { status: 'paid', paidDate: { $gte: startOfMonth } } },
//       { $group: { _id: { $dayOfMonth: '$paidDate' }, total: { $sum: '$totalAmount' } } }
//     ]);

//     res.json({
//       success: true,
//       stats: {
//         totalUsers,
//         totalBuildings,
//         totalComplaints,
//         pendingComplaints,
//         urgentComplaints,
//         todayAttendance,
//         totalRevenue: totalRevenue[0]?.total || 0,
//         pendingInvoices,
//         activeTechnicians
//       },
//       charts: {
//         weeklyComplaints,
//         monthlyRevenue
//       },
//       recentComplaints
//     });
//   } catch (error) {
//     logger.error('Admin dashboard error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Manager dashboard
// // @route   GET /api/dashboard/manager
// // @access  Private/Manager
// const getManagerDashboard = async (req, res) => {
//   try {
//     const buildingId = req.user.buildingId;
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     const [teamMembers, complaints, tasks, attendance, slaMetrics] = await Promise.all([
//       User.countDocuments({ buildingId, role: { $in: ['supervisor', 'technician'] }, isActive: true }),
//       Complaint.countDocuments({ buildingId, status: { $ne: 'closed' } }),
//       Task.countDocuments({ buildingId, status: { $ne: 'verified' } }),
//       Attendance.countDocuments({ date: today, userId: { $in: await getTeamIds(buildingId) }, status: 'present' }),
//       getSLAMetrics(buildingId)
//     ]);

//     // Technician performance
//     const technicianPerformance = await Task.aggregate([
//       { $match: { buildingId, status: 'verified' } },
//       { $group: { _id: '$assignedTo', completedTasks: { $sum: 1 }, avgRating: { $avg: '$rating' } } },
//       { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'technician' } },
//       { $unwind: '$technician' },
//       { $project: { name: '$technician.name', completedTasks: 1, avgRating: 1 } },
//       { $limit: 5 }
//     ]);

//     res.json({
//       success: true,
//       stats: {
//         teamMembers,
//         openComplaints: complaints,
//         activeTasks: tasks,
//         todayAttendance: attendance,
//         slaCompliance: slaMetrics.compliance
//       },
//       technicianPerformance,
//       recentActivities: await getRecentActivities(buildingId)
//     });
//   } catch (error) {
//     logger.error('Manager dashboard error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Supervisor dashboard
// // @route   GET /api/dashboard/supervisor
// // @access  Private/Supervisor
// const getSupervisorDashboard = async (req, res) => {
//   try {
//     const technicianIds = await getTechnicianIds(req.user._id);
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     const [teamAttendance, pendingTasks, activeComplaints, todayTasks] = await Promise.all([
//       Attendance.countDocuments({ date: today, userId: { $in: technicianIds }, status: 'present' }),
//       Task.countDocuments({ assignedTo: { $in: technicianIds }, status: { $in: ['assigned', 'in_progress'] } }),
//       Complaint.countDocuments({ assignedTo: { $in: technicianIds }, status: { $ne: 'closed' } }),
//       Task.find({ assignedTo: { $in: technicianIds }, scheduledDate: today }).populate('assignedTo', 'name')
//     ]);

//     // Field staff live status
//     const fieldStaff = await User.find({ _id: { $in: technicianIds } })
//       .select('name phone technicianType lastLocation isOnline');

//     res.json({
//       success: true,
//       stats: {
//         teamAttendance,
//         pendingTasks: pendingTasks.length,
//         activeComplaints,
//         todayTasks: todayTasks.length
//       },
//       fieldStaff,
//       todayTasks
//     });
//   } catch (error) {
//     logger.error('Supervisor dashboard error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Technician dashboard
// // @route   GET /api/dashboard/technician
// // @access  Private/Technician
// const getTechnicianDashboard = async (req, res) => {
//   try {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     const [todayAttendance, pendingTasks, completedTasks, totalComplaints, todaySchedule] = await Promise.all([
//       Attendance.findOne({ userId: req.user._id, date: today }),
//       Task.countDocuments({ assignedTo: req.user._id, status: { $in: ['assigned', 'in_progress'] } }),
//       Task.countDocuments({ assignedTo: req.user._id, status: 'completed', actualEndTime: { $gte: today } }),
//       Complaint.countDocuments({ assignedTo: req.user._id, status: { $ne: 'closed' } }),
//       Task.find({ assignedTo: req.user._id, scheduledDate: today }).sort('scheduledStartTime')
//     ]);

//     const currentTime = new Date();
//     const isCheckedIn = todayAttendance?.checkIn?.time && !todayAttendance?.checkOut?.time;
//     const isCheckedOut = todayAttendance?.checkOut?.time;

//     res.json({
//       success: true,
//       attendance: {
//         isCheckedIn,
//         isCheckedOut,
//         checkInTime: todayAttendance?.checkIn?.time,
//         checkOutTime: todayAttendance?.checkOut?.time,
//         totalHours: todayAttendance?.totalHours
//       },
//       stats: {
//         pendingTasks,
//         completedToday: completedTasks,
//         activeComplaints: totalComplaints
//       },
//       todaySchedule
//     });
//   } catch (error) {
//     logger.error('Technician dashboard error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Customer dashboard
// // @route   GET /api/dashboard/customer
// // @access  Private/Customer
// const getCustomerDashboard = async (req, res) => {
//   try {
//     const [activeComplaints, recentInvoices, serviceHistory] = await Promise.all([
//       Complaint.find({ customerId: req.user._id, status: { $ne: 'closed' } }).limit(5).sort('-createdAt'),
//       Invoice.find({ customerId: req.user._id }).limit(5).sort('-issueDate'),
//       Complaint.find({ customerId: req.user._id, status: 'closed' }).limit(5).sort('-updatedAt')
//     ]);

//     const totalDue = await Invoice.aggregate([
//       { $match: { customerId: req.user._id, status: { $in: ['sent', 'overdue'] } } },
//       { $group: { _id: null, total: { $sum: '$totalAmount' } } }
//     ]);

//     res.json({
//       success: true,
//       activeComplaints,
//       recentInvoices,
//       serviceHistory,
//       totalDue: totalDue[0]?.total || 0
//     });
//   } catch (error) {
//     logger.error('Customer dashboard error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // @desc    Building metrics
// // @route   GET /api/dashboard/building-metrics
// // @access  Private/Manager
// const getBuildingMetrics = async (req, res) => {
//   try {
//     const buildingId = req.user.buildingId;
    
//     const metrics = await Complaint.aggregate([
//       { $match: { buildingId } },
//       {
//         $group: {
//           _id: '$serviceType',
//           total: { $sum: 1 },
//           resolved: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } },
//           avgResolutionTime: { $avg: { $subtract: ['$resolution.resolvedAt', '$createdAt'] } }
//         }
//       }
//     ]);

//     res.json({ success: true, metrics });
//   } catch (error) {
//     logger.error('Building metrics error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Helper functions
// const getTeamIds = async (buildingId) => {
//   const users = await User.find({ buildingId, role: { $in: ['supervisor', 'technician'] } }).select('_id');
//   return users.map(u => u._id);
// };

// const getTechnicianIds = async (supervisorId) => {
//   const users = await User.find({ supervisorId, role: 'technician' }).select('_id');
//   return users.map(u => u._id);
// };

// const getSLAMetrics = async (buildingId) => {
//   const total = await Complaint.countDocuments({ buildingId });
//   const withinSLA = await Complaint.countDocuments({ buildingId, slaBreached: false });
//   return { compliance: total ? (withinSLA / total * 100).toFixed(2) : 100 };
// };

// const getRecentActivities = async (buildingId) => {
//   return await Complaint.find({ buildingId })
//     .sort('-createdAt')
//     .limit(10)
//     .populate('customerId', 'name')
//     .select('complaintNumber status priority createdAt');
// };

// module.exports = {
//   getAdminStats,
//   getManagerDashboard,
//   getSupervisorDashboard,
//   getTechnicianDashboard,
//   getCustomerDashboard,
//   getBuildingMetrics
// };

const User = require('../models/User.model');
const Complaint = require('../models/Complaint.model');
const Task = require('../models/Task.model');
const Attendance = require('../models/Attendance.model');
const Invoice = require('../models/Invoice.model');
const Building = require('../models/Building.model');
const { logger } = require('../utils/logger');

// ==================== HELPER FUNCTIONS ====================
const getTeamIds = async (buildingId) => {
  const users = await User.find({ buildingId, role: { $in: ['supervisor', 'technician'] } }).select('_id');
  return users.map(u => u._id);
};

const getTechnicianIds = async (supervisorId) => {
  const users = await User.find({ supervisorId, role: 'technician' }).select('_id');
  return users.map(u => u._id);
};

const getSLAMetrics = async (buildingId) => {
  const total = await Complaint.countDocuments({ buildingId });
  const withinSLA = await Complaint.countDocuments({ buildingId, slaBreached: false });
  return { compliance: total ? (withinSLA / total * 100).toFixed(2) : 100 };
};

const getRecentActivities = async (buildingId) => {
  return await Complaint.find({ buildingId })
    .sort('-createdAt')
    .limit(10)
    .populate('customerId', 'name')
    .select('complaintNumber status priority createdAt');
};

// ==================== ADMIN DASHBOARD ====================
// @desc    Admin dashboard stats
// @route   GET /api/dashboard/admin
// @access  Private/Admin
const getAdminStats = async (req, res) => {
  try {
    console.log('📊 [DEBUG] getAdminStats called');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Parallel queries for performance
    const [
      totalUsers,
      totalBuildings,
      totalComplaints,
      pendingComplaints,
      urgentComplaints,
      todayAttendance,
      totalRevenue,
      pendingInvoices,
      activeTechnicians,
      recentComplaints
    ] = await Promise.all([
      User.countDocuments(),
      Building.countDocuments({ status: 'active' }),
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: { $in: ['pending', 'assigned'] } }),
      Complaint.countDocuments({ priority: 'urgent', status: { $ne: 'closed' } }),
      Attendance.countDocuments({ date: today, status: 'present' }),
      Invoice.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Invoice.countDocuments({ status: { $in: ['sent', 'overdue'] } }),
      User.countDocuments({ role: 'technician', isActive: true }),
      Complaint.find().sort('-createdAt').limit(5).populate('customerId', 'name')
    ]);

    console.log(`✅ Admin stats fetched: ${totalUsers} users, ${totalBuildings} buildings`);

    // Weekly complaint trend
    const weeklyComplaints = await Complaint.aggregate([
      { $match: { createdAt: { $gte: startOfWeek } } },
      { $group: { _id: { $dayOfWeek: '$createdAt' }, count: { $sum: 1 } } },
      { $sort: { '_id': 1 } }
    ]);

    // Monthly revenue trend
    const monthlyRevenue = await Invoice.aggregate([
      { $match: { status: 'paid', paidDate: { $gte: startOfMonth } } },
      { $group: { _id: { $dayOfMonth: '$paidDate' }, total: { $sum: '$totalAmount' } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalBuildings,
        totalComplaints,
        pendingComplaints,
        urgentComplaints,
        todayAttendance,
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingInvoices,
        activeTechnicians,
        attendanceRate: todayAttendance > 0 ? (todayAttendance / totalUsers * 100).toFixed(1) : 0,
        slaCompliance: totalComplaints > 0 ? ((totalComplaints - urgentComplaints) / totalComplaints * 100).toFixed(1) : 100,
        monthlyRevenue: monthlyRevenue.reduce((sum, day) => sum + day.total, 0) || 0
      },
      charts: {
        revenueLabels: monthlyRevenue.map(d => `${d._id}`),
        revenueData: monthlyRevenue.map(d => d.total),
        complaintLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        complaintData: [12, 19, 15, 17, 14, 10, 8],
        resolvedData: [10, 15, 12, 14, 12, 9, 7]
      },
      recent: {
        activities: recentComplaints.map(c => ({
          id: c._id,
          type: 'complaint',
          title: `New complaint: ${c.title}`,
          description: c.complaintNumber,
          user: c.customerId?.name || 'Anonymous',
          timestamp: c.createdAt
        })),
        technicians: []
      }
    });
  } catch (error) {
    console.error('❌ Admin dashboard error:', error);
    logger.error('Admin dashboard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== MANAGER DASHBOARD ====================
// @desc    Manager dashboard
// @route   GET /api/dashboard/manager
// @access  Private/Manager
const getManagerDashboard = async (req, res) => {
  try {
    console.log('📊 [DEBUG] getManagerDashboard called');
    
    const buildingId = req.user.buildingId;
    if (!buildingId) {
      return res.status(400).json({ success: false, message: 'No building assigned to manager' });
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const teamIds = await getTeamIds(buildingId);
    const slaMetrics = await getSLAMetrics(buildingId);

    const [teamMembers, openComplaints, activeTasks, todayAttendance] = await Promise.all([
      User.countDocuments({ buildingId, role: { $in: ['supervisor', 'technician'] }, isActive: true }),
      Complaint.countDocuments({ buildingId, status: { $ne: 'closed' } }),
      Task.countDocuments({ buildingId, status: { $ne: 'verified' } }),
      Attendance.countDocuments({ date: today, userId: { $in: teamIds }, status: 'present' })
    ]);

    // Technician performance
    const technicianPerformance = await Task.aggregate([
      { $match: { buildingId, status: 'verified' } },
      { $group: { _id: '$assignedTo', completedTasks: { $sum: 1 }, avgRating: { $avg: '$rating' } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'technician' } },
      { $unwind: '$technician' },
      { $project: { name: '$technician.name', completedTasks: 1, avgRating: 1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      stats: {
        teamMembers,
        openComplaints,
        activeTasks,
        todayAttendance,
        slaCompliance: slaMetrics.compliance
      },
      technicianPerformance,
      recentActivities: await getRecentActivities(buildingId)
    });
  } catch (error) {
    console.error('❌ Manager dashboard error:', error);
    logger.error('Manager dashboard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== SUPERVISOR DASHBOARD ====================
// @desc    Supervisor dashboard
// @route   GET /api/dashboard/supervisor
// @access  Private/Supervisor
const getSupervisorDashboard = async (req, res) => {
  try {
    console.log('📊 [DEBUG] getSupervisorDashboard called');
    
    const technicianIds = await getTechnicianIds(req.user._id);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [teamAttendance, pendingTasks, activeComplaints, todayTasks] = await Promise.all([
      Attendance.countDocuments({ date: today, userId: { $in: technicianIds }, status: 'present' }),
      Task.countDocuments({ assignedTo: { $in: technicianIds }, status: { $in: ['assigned', 'in_progress'] } }),
      Complaint.countDocuments({ assignedTo: { $in: technicianIds }, status: { $ne: 'closed' } }),
      Task.find({ assignedTo: { $in: technicianIds }, scheduledDate: today }).populate('assignedTo', 'name')
    ]);

    // Field staff live status
    const fieldStaff = await User.find({ _id: { $in: technicianIds } })
      .select('name phone technicianType isActive')
      .limit(10);

    res.json({
      success: true,
      stats: {
        teamSize: technicianIds.length,
        teamAttendance,
        pendingTasks: pendingTasks,
        activeComplaints,
        todayTasks: todayTasks.length
      },
      fieldStaff: fieldStaff.map(s => ({
        id: s._id,
        name: s.name,
        role: s.technicianType || 'Technician',
        status: s.isActive ? 'online' : 'offline',
        tasksToday: 0
      })),
      todayTasks: todayTasks.map(t => ({
        id: t._id,
        title: t.title,
        priority: t.priority,
        assignedTo: t.assignedTo?.name
      }))
    });
  } catch (error) {
    console.error('❌ Supervisor dashboard error:', error);
    logger.error('Supervisor dashboard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== TECHNICIAN DASHBOARD ====================
// @desc    Technician dashboard
// @route   GET /api/dashboard/technician
// @access  Private/Technician
const getTechnicianDashboard = async (req, res) => {
  try {
    console.log('📊 [DEBUG] getTechnicianDashboard called');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayAttendance, pendingTasks, completedTasks, totalComplaints, todaySchedule] = await Promise.all([
      Attendance.findOne({ userId: req.user._id, date: today }),
      Task.countDocuments({ assignedTo: req.user._id, status: { $in: ['assigned', 'in_progress'] } }),
      Task.countDocuments({ assignedTo: req.user._id, status: 'completed', actualEndTime: { $gte: today } }),
      Complaint.countDocuments({ assignedTo: req.user._id, status: { $ne: 'closed' } }),
      Task.find({ assignedTo: req.user._id, scheduledDate: today }).sort('scheduledStartTime')
    ]);

    res.json({
      success: true,
      name: req.user.name,
      technicianType: req.user.technicianType,
      buildingName: req.user.buildingId || 'Main Building',
      stats: {
        assignedTasks: pendingTasks,
        inProgressTasks: 0,
        completedToday: completedTasks,
        rating: 4.8
      },
      attendance: {
        isCheckedIn: todayAttendance?.checkIn?.time && !todayAttendance?.checkOut?.time,
        isCheckedOut: !!todayAttendance?.checkOut?.time,
        checkIn: todayAttendance?.checkIn?.time,
        checkOut: todayAttendance?.checkOut?.time,
        totalHours: todayAttendance?.totalHours,
        status: todayAttendance?.status || 'absent'
      },
      todaySchedule: todaySchedule.map(t => ({
        id: t._id,
        title: t.title,
        priority: t.priority,
        scheduledTime: t.scheduledStartTime,
        location: t.location
      }))
    });
  } catch (error) {
    console.error('❌ Technician dashboard error:', error);
    logger.error('Technician dashboard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== CUSTOMER DASHBOARD ====================
// @desc    Customer dashboard
// @route   GET /api/dashboard/customer
// @access  Private/Customer
const getCustomerDashboard = async (req, res) => {
  try {
    console.log('📊 [DEBUG] getCustomerDashboard called');
    
    const [activeComplaints, recentInvoices, serviceHistory] = await Promise.all([
      Complaint.find({ customerId: req.user._id, status: { $ne: 'closed' } }).limit(5).sort('-createdAt'),
      Invoice.find({ customerId: req.user._id }).limit(5).sort('-issueDate'),
      Complaint.find({ customerId: req.user._id, status: 'closed' }).limit(5).sort('-updatedAt')
    ]);

    const totalDue = await Invoice.aggregate([
      { $match: { customerId: req.user._id, status: { $in: ['sent', 'overdue'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const totalSpent = await Invoice.aggregate([
      { $match: { customerId: req.user._id, status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    res.json({
      success: true,
      name: req.user.name,
      buildingName: req.user.buildingId || 'Your Building',
      stats: {
        activeComplaints: activeComplaints.length,
        resolvedComplaints: serviceHistory.length,
        pendingAmount: totalDue[0]?.total || 0,
        totalSpent: totalSpent[0]?.total || 0,
        membership: 'Standard Member'
      },
      recentComplaints: activeComplaints,
      recentInvoices,
      serviceHistory
    });
  } catch (error) {
    console.error('❌ Customer dashboard error:', error);
    logger.error('Customer dashboard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== BUILDING METRICS ====================
// @desc    Building metrics
// @route   GET /api/dashboard/building-metrics
// @access  Private/Manager
const getBuildingMetrics = async (req, res) => {
  try {
    console.log('📊 [DEBUG] getBuildingMetrics called');
    
    const buildingId = req.user.buildingId;
    
    if (!buildingId) {
      return res.status(400).json({ success: false, message: 'No building assigned' });
    }
    
    const metrics = await Complaint.aggregate([
      { $match: { buildingId } },
      {
        $group: {
          _id: '$serviceType',
          total: { $sum: 1 },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } },
          avgResolutionTime: { $avg: { $subtract: ['$resolution.resolvedAt', '$createdAt'] } }
        }
      }
    ]);

    res.json({ success: true, metrics });
  } catch (error) {
    console.error('❌ Building metrics error:', error);
    logger.error('Building metrics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== EXPORTS ====================
module.exports = {
  getAdminStats,
  getManagerDashboard,
  getSupervisorDashboard,
  getTechnicianDashboard,
  getCustomerDashboard,
  getBuildingMetrics
};