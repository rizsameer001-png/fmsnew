const Complaint = require('../models/Complaint.model');
const Notification = require('../models/Notification.model');
const User = require('../models/User.model');
const logger = require('../utils/logger');

module.exports = (socket, io, onlineUsers) => {
  
  // Subscribe to complaint updates for a specific complaint
  socket.on('subscribe_complaint', async (data) => {
    try {
      const { complaintId } = data;
      const userId = socket.user?.userId;
      
      const complaint = await Complaint.findById(complaintId);
      if (!complaint) {
        socket.emit('error', { message: 'Complaint not found' });
        return;
      }
      
      // Check if user is authorized to view this complaint
      const isAuthorized = (
        socket.user?.role === 'super_admin' ||
        socket.user?.role === 'manager' ||
        complaint.customerId.toString() === userId ||
        complaint.assignedTo?.toString() === userId ||
        complaint.assignedBy?.toString() === userId
      );
      
      if (!isAuthorized) {
        socket.emit('error', { message: 'Not authorized' });
        return;
      }
      
      socket.join(`complaint_${complaintId}`);
      socket.emit('complaint_subscribed', { complaintId, success: true });
      
    } catch (error) {
      logger.error('Subscribe complaint error:', error);
    }
  });
  
  // Unsubscribe from complaint updates
  socket.on('unsubscribe_complaint', (data) => {
    const { complaintId } = data;
    socket.leave(`complaint_${complaintId}`);
  });
  
  // Complaint status update (emitted from controller, handled here for broadcasting)
  socket.on('complaint_status_update', async (data) => {
    try {
      const { complaintId, status, notes } = data;
      const userId = socket.user?.userId;
      
      const complaint = await Complaint.findById(complaintId)
        .populate('customerId', 'name email')
        .populate('assignedTo', 'name');
      
      if (!complaint) {
        socket.emit('error', { message: 'Complaint not found' });
        return;
      }
      
      // Verify user is authorized to update status
      const isAuthorized = (
        socket.user?.role === 'super_admin' ||
        socket.user?.role === 'manager' ||
        complaint.assignedTo?.toString() === userId ||
        complaint.assignedBy?.toString() === userId
      );
      
      if (!isAuthorized) {
        socket.emit('error', { message: 'Not authorized' });
        return;
      }
      
      // Update complaint status
      complaint.status = status;
      if (notes) {
        if (!complaint.updates) complaint.updates = [];
        complaint.updates.push({
          status,
          notes,
          updatedBy: userId,
          updatedAt: new Date()
        });
      }
      await complaint.save();
      
      // Broadcast to all subscribers
      io.to(`complaint_${complaintId}`).emit('complaint_updated', {
        complaintId,
        status,
        notes,
        updatedBy: socket.user?.name,
        updatedAt: new Date()
      });
      
      // If status changed to resolved, notify customer
      if (status === 'resolved') {
        io.to(`user_${complaint.customerId._id}`).emit('complaint_resolved', {
          complaintId,
          complaintNumber: complaint.complaintNumber,
          message: `Your complaint has been resolved. Please provide your feedback.`
        });
      }
      
    } catch (error) {
      logger.error('Complaint status update error:', error);
      socket.emit('error', { message: error.message });
    }
  });
  
  // New complaint created (emitted from controller)
  socket.on('new_complaint_created', async (data) => {
    try {
      const { complaintId } = data;
      const complaint = await Complaint.findById(complaintId)
        .populate('customerId', 'name');
      
      if (!complaint) return;
      
      // Find available technicians to assign
      const technicians = await User.find({
        role: 'technician',
        technicianType: complaint.serviceType,
        isActive: true,
        buildingId: complaint.buildingId
      });
      
      // Notify all relevant technicians
      for (const technician of technicians) {
        io.to(`user_${technician._id}`).emit('new_complaint', {
          complaintId,
          complaintNumber: complaint.complaintNumber,
          title: complaint.title,
          priority: complaint.priority,
          customerName: complaint.customerId?.name
        });
      }
      
      // Notify supervisors and managers
      io.to('role_supervisor').to('role_manager').emit('new_complaint_admin', {
        complaintId,
        complaintNumber: complaint.complaintNumber,
        title: complaint.title,
        priority: complaint.priority,
        buildingId: complaint.buildingId
      });
      
    } catch (error) {
      logger.error('New complaint created error:', error);
    }
  });
  
  // Complaint assigned to technician
  socket.on('complaint_assigned', async (data) => {
    try {
      const { complaintId, technicianId } = data;
      
      const complaint = await Complaint.findById(complaintId);
      if (!complaint) return;
      
      // Notify technician
      io.to(`user_${technicianId}`).emit('complaint_assigned_to_you', {
        complaintId,
        complaintNumber: complaint.complaintNumber,
        title: complaint.title,
        priority: complaint.priority
      });
      
      // Notify customer
      io.to(`user_${complaint.customerId}`).emit('complaint_assigned', {
        complaintId,
        complaintNumber: complaint.complaintNumber,
        message: `Your complaint has been assigned to a technician.`
      });
      
    } catch (error) {
      logger.error('Complaint assigned error:', error);
    }
  });
  
  // Add comment to complaint
  socket.on('add_complaint_comment', async (data) => {
    try {
      const { complaintId, comment } = data;
      const userId = socket.user?.userId;
      
      const complaint = await Complaint.findById(complaintId);
      if (!complaint) {
        socket.emit('error', { message: 'Complaint not found' });
        return;
      }
      
      if (!complaint.comments) complaint.comments = [];
      complaint.comments.push({
        userId,
        userName: socket.user?.name,
        userRole: socket.user?.role,
        comment,
        createdAt: new Date()
      });
      await complaint.save();
      
      // Broadcast to all subscribers
      io.to(`complaint_${complaintId}`).emit('new_comment', {
        complaintId,
        comment: complaint.comments[complaint.comments.length - 1]
      });
      
    } catch (error) {
      logger.error('Add complaint comment error:', error);
      socket.emit('error', { message: error.message });
    }
  });
  
  // Escalate complaint
  socket.on('escalate_complaint', async (data) => {
    try {
      const { complaintId, reason } = data;
      
      const complaint = await Complaint.findById(complaintId);
      if (!complaint) return;
      
      const escalationLevel = complaint.escalationLevel + 1;
      complaint.escalationLevel = escalationLevel;
      complaint.escalationHistory.push({
        escalatedAt: new Date(),
        escalatedBy: socket.user?.userId,
        reason,
        fromRole: socket.user?.role,
        toRole: escalationLevel === 1 ? 'supervisor' : escalationLevel === 2 ? 'manager' : 'admin'
      });
      await complaint.save();
      
      // Notify next level
      io.to(`role_${escalationLevel === 1 ? 'supervisor' : escalationLevel === 2 ? 'manager' : 'admin'}`).emit('complaint_escalated', {
        complaintId,
        complaintNumber: complaint.complaintNumber,
        reason,
        escalatedBy: socket.user?.name
      });
      
      socket.emit('complaint_escalated_confirmed', { success: true });
      
    } catch (error) {
      logger.error('Escalate complaint error:', error);
      socket.emit('error', { message: error.message });
    }
  });
  
};