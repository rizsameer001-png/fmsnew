const Complaint = require('../models/Complaint.model');
const Task = require('../models/Task.model');
const Attendance = require('../models/Attendance.model');
const Invoice = require('../models/Invoice.model');
const User = require('../models/User.model');
const logger = require('../utils/logger');

module.exports = (socket, io, onlineUsers) => {
  
  // Subscribe to real-time dashboard updates
  socket.on('subscribe_dashboard', async (data) => {
    try {
      const { dashboardType } = data; // 'admin', 'manager', 'supervisor', 'technician'
      const userRole = socket.user?.role;
      const userId = socket.user?.userId;
      
      // Verify subscription matches user role
      if (dashboardType !== userRole && userRole !== 'super_admin') {
        socket.emit('error', { message: 'Not authorized for this dashboard' });
        return;
      }
      
      socket.join(`dashboard_${dashboardType}`);
      socket.emit('dashboard_subscribed', { dashboardType, success: true });
      
    } catch (error) {
      logger.error('Subscribe dashboard error:', error);
    }
  });
  
  // Unsubscribe from dashboard updates
  socket.on('unsubscribe_dashboard', (data) => {
    const { dashboardType } = data;
    socket.leave(`dashboard_${dashboardType}`);
  });
  
  // Send real-time dashboard stats (called periodically from server)
  const sendDashboardStats = async () => {
    try {
      // Admin Dashboard Stats
      const [totalUsers, totalBuildings, totalComplaints, pendingComplaints] = await Promise.all([
        User.countDocuments(),
        require('../models/Building.model').countDocuments({ status: 'active' }),
        Complaint.countDocuments(),
        Complaint.countDocuments({ status: { $in: ['pending', 'assigned'] } })
      ]);
      
      const adminStats = {
        totalUsers,
        totalBuildings,
        totalComplaints,
        pendingComplaints,
        timestamp: new Date()
      };
      
      io.to('dashboard_admin').emit('dashboard_stats', { type: 'admin', data: adminStats });
      
      // Manager Dashboard Stats - per building
      const managers = await User.find({ role: 'manager' });
      for (const manager of managers) {
        const buildingId = manager.buildingId;
        if (buildingId) {
          const [openComplaints, activeTasks, todayAttendance] = await Promise.all([
            Complaint.countDocuments({ buildingId, status: { $ne: 'closed' } }),
            Task.countDocuments({ buildingId, status: { $ne: 'completed' } }),
            Attendance.countDocuments({ 
              buildingId, 
              date: { $gte: new Date().setHours(0, 0, 0, 0) },
              status: 'present'
            })
          ]);
          
          io.to(`user_${manager._id}`).emit('dashboard_stats', {
            type: 'manager',
            data: { openComplaints, activeTasks, todayAttendance, timestamp: new Date() }
          });
        }
      }
      
      // Supervisor Dashboard Stats
      const supervisors = await User.find({ role: 'supervisor' });
      for (const supervisor of supervisors) {
        const technicians = await User.find({ supervisorId: supervisor._id, role: 'technician' });
        const techIds = technicians.map(t => t._id);
        
        const [teamAttendance, pendingTasks] = await Promise.all([
          Attendance.countDocuments({ 
            userId: { $in: techIds }, 
            date: { $gte: new Date().setHours(0, 0, 0, 0) },
            status: 'present'
          }),
          Task.countDocuments({ 
            assignedTo: { $in: techIds }, 
            status: { $in: ['assigned', 'in_progress'] }
          })
        ]);
        
        io.to(`user_${supervisor._id}`).emit('dashboard_stats', {
          type: 'supervisor',
          data: { teamAttendance, pendingTasks, onlineTechnicians: getOnlineTechnicians(techIds), timestamp: new Date() }
        });
      }
      
    } catch (error) {
      logger.error('Send dashboard stats error:', error);
    }
  };
  
  // Helper to get online technicians
  const getOnlineTechnicians = (techIds) => {
    let count = 0;
    for (const techId of techIds) {
      if (onlineUsers.has(techId.toString())) count++;
    }
    return count;
  };
  
  // Send real-time updates when new complaint is created
  socket.on('new_complaint_update', async (data) => {
    try {
      const { complaint } = data;
      
      // Update admin dashboard
      io.to('dashboard_admin').emit('new_complaint_alert', {
        complaintId: complaint._id,
        complaintNumber: complaint.complaintNumber,
        title: complaint.title,
        priority: complaint.priority,
        timestamp: new Date()
      });
      
      // Update relevant manager dashboard
      if (complaint.buildingId) {
        const manager = await User.findOne({ buildingId: complaint.buildingId, role: 'manager' });
        if (manager) {
          io.to(`user_${manager._id}`).emit('new_complaint_alert', {
            complaintId: complaint._id,
            complaintNumber: complaint.complaintNumber,
            title: complaint.title
          });
        }
      }
      
      // Update dashboard counters
      sendDashboardStats();
      
    } catch (error) {
      logger.error('New complaint update error:', error);
    }
  });
  
  // Send real-time attendance updates
  socket.on('attendance_update', async (data) => {
    try {
      const { userId, action, timestamp } = data;
      
      const user = await User.findById(userId);
      if (!user) return;
      
      // Update supervisor dashboard
      if (user.supervisorId) {
        io.to(`user_${user.supervisorId}`).emit('attendance_alert', {
          userId,
          userName: user.name,
          action, // 'checkin' or 'checkout'
          timestamp
        });
      }
      
      // Update manager dashboard
      if (user.buildingId) {
        const manager = await User.findOne({ buildingId: user.buildingId, role: 'manager' });
        if (manager) {
          io.to(`user_${manager._id}`).emit('attendance_update_alert', {
            userId,
            userName: user.name,
            action,
            timestamp
          });
        }
      }
      
      // Update attendance counters
      sendDashboardStats();
      
    } catch (error) {
      logger.error('Attendance update error:', error);
    }
  });
  
  // Send real-time task updates
  socket.on('task_update', async (data) => {
    try {
      const { taskId, status, assignedTo } = data;
      
      const task = await Task.findById(taskId).populate('assignedTo', 'name');
      if (!task) return;
      
      // Notify supervisor
      if (task.assignedBy) {
        io.to(`user_${task.assignedBy}`).emit('task_status_update', {
          taskId,
          taskNumber: task.taskNumber,
          status,
          technicianName: task.assignedTo?.name,
          timestamp: new Date()
        });
      }
      
      // Update dashboard counters
      sendDashboardStats();
      
    } catch (error) {
      logger.error('Task update error:', error);
    }
  });
  
  // Send real-time invoice/payment updates
  socket.on('payment_update', async (data) => {
    try {
      const { invoiceId, customerId, amount, status } = data;
      
      // Update customer dashboard
      io.to(`user_${customerId}`).emit('payment_status_update', {
        invoiceId,
        amount,
        status,
        timestamp: new Date()
      });
      
      // Update admin dashboard for revenue
      io.to('dashboard_admin').emit('revenue_update', {
        amount,
        status,
        timestamp: new Date()
      });
      
    } catch (error) {
      logger.error('Payment update error:', error);
    }
  });
  
  // Start periodic dashboard stats (every 30 seconds)
  setInterval(() => {
    sendDashboardStats();
  }, 30000);
  
};