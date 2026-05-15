const User = require('../models/User.model');
const Attendance = require('../models/Attendance.model');
const Geofence = require('../models/Geofence.model');
const { validateGeofence } = require('../services/geofence.service');
const logger = require('../utils/logger');

module.exports = (socket, io, onlineUsers) => {
  
  // Update live location
  socket.on('update_location', async (data) => {
    try {
      const { latitude, longitude, accuracy, speed, heading } = data;
      const userId = socket.user?.userId;
      const userRole = socket.user?.role;
      
      // Only technicians and field staff should update location
      if (!['technician', 'supervisor', 'security', 'cleaning'].includes(userRole)) {
        return;
      }
      
      const locationData = {
        userId,
        name: socket.user?.name,
        role: userRole,
        technicianType: socket.user?.technicianType,
        latitude,
        longitude,
        accuracy,
        speed,
        heading,
        lastUpdate: new Date(),
        isOnline: true
      };
      
      // Store in memory (accessible via controller)
      if (!global.liveLocations) global.liveLocations = new Map();
      global.liveLocations.set(userId, locationData);
      
      // Update user's last location in database
      await User.findByIdAndUpdate(userId, {
        'lastLocation.latitude': latitude,
        'lastLocation.longitude': longitude,
        'lastLocation.updatedAt': new Date(),
        'lastLocation.accuracy': accuracy,
        isOnline: true
      });
      
      // Check geofence status
      const geofenceCheck = await validateGeofence(userId, latitude, longitude);
      const isInsideGeofence = geofenceCheck.valid;
      
      // Broadcast to supervisors and managers
      io.to('role_supervisor').to('role_manager').to('role_admin').emit('technician_location', {
        ...locationData,
        isInsideGeofence,
        distanceToGeofence: geofenceCheck.distance
      });
      
      // Check for geofence boundary crossing
      const user = await User.findById(userId);
      const wasInside = user?.lastLocation?.isInsideGeofence;
      
      if (wasInside !== undefined && wasInside !== isInsideGeofence) {
        // User crossed boundary
        io.to(`role_${user?.supervisorId ? `user_${user.supervisorId}` : 'supervisor'}`).emit('geofence_alert', {
          userId,
          userName: socket.user?.name,
          action: isInsideGeofence ? 'entered' : 'exited',
          location: { latitude, longitude },
          timestamp: new Date()
        });
      }
      
      // Update isInsideGeofence
      await User.findByIdAndUpdate(userId, {
        'lastLocation.isInsideGeofence': isInsideGeofence
      });
      
    } catch (error) {
      logger.error('Update location error:', error);
      socket.emit('location_error', { message: error.message });
    }
  });
  
  // Get live location of specific user (for supervisors/managers)
  socket.on('get_user_location', async (data) => {
    try {
      const { targetUserId } = data;
      const requesterRole = socket.user?.role;
      const requesterId = socket.user?.userId;
      
      // Check authorization
      if (!['super_admin', 'manager', 'supervisor'].includes(requesterRole)) {
        socket.emit('error', { message: 'Not authorized' });
        return;
      }
      
      // Verify relationship (supervisor can only see their team)
      if (requesterRole === 'supervisor') {
        const technician = await User.findById(targetUserId);
        if (technician?.supervisorId?.toString() !== requesterId) {
          socket.emit('error', { message: 'Not authorized to view this user' });
          return;
        }
      }
      
      const location = global.liveLocations?.get(targetUserId);
      socket.emit('user_location', {
        userId: targetUserId,
        location: location || null,
        isOnline: onlineUsers.has(targetUserId)
      });
      
    } catch (error) {
      logger.error('Get user location error:', error);
      socket.emit('error', { message: error.message });
    }
  });
  
  // Get all live locations (for map view)
  socket.on('get_all_locations', async () => {
    try {
      const requesterRole = socket.user?.role;
      
      if (!['super_admin', 'manager', 'supervisor'].includes(requesterRole)) {
        socket.emit('error', { message: 'Not authorized' });
        return;
      }
      
      let locations = [];
      
      if (global.liveLocations) {
        locations = Array.from(global.liveLocations.values());
        
        // Filter for managers (only their building)
        if (requesterRole === 'manager' && socket.user?.buildingId) {
          const technicianIds = await getTechniciansByBuilding(socket.user.buildingId);
          locations = locations.filter(loc => technicianIds.includes(loc.userId));
        }
        
        // Filter for supervisors (only their team)
        if (requesterRole === 'supervisor') {
          const technicianIds = await getTechniciansBySupervisor(socket.user.userId);
          locations = locations.filter(loc => technicianIds.includes(loc.userId));
        }
      }
      
      socket.emit('all_locations', locations);
      
    } catch (error) {
      logger.error('Get all locations error:', error);
      socket.emit('error', { message: error.message });
    }
  });
  
  // Subscribe to live location updates
  socket.on('subscribe_locations', () => {
    const role = socket.user?.role;
    if (['super_admin', 'manager', 'supervisor'].includes(role)) {
      socket.join('location_subscribers');
      socket.emit('location_subscribed', { success: true });
    }
  });
  
  // Unsubscribe from live location updates
  socket.on('unsubscribe_locations', () => {
    socket.leave('location_subscribers');
  });
  
  // Send emergency alert
  socket.on('emergency_alert', async (data) => {
    try {
      const { latitude, longitude, message } = data;
      const userId = socket.user?.userId;
      const userName = socket.user?.name;
      const userRole = socket.user?.role;
      
      // Get supervisors and managers
      const user = await User.findById(userId);
      const supervisors = await User.find({ 
        buildingId: user?.buildingId, 
        role: { $in: ['supervisor', 'manager'] }
      });
      
      const alertData = {
        userId,
        userName,
        userRole,
        location: { latitude, longitude },
        message: message || 'Emergency situation detected',
        timestamp: new Date()
      };
      
      // Send to all supervisors and managers
      for (const supervisor of supervisors) {
        io.to(`user_${supervisor._id}`).emit('emergency_alert', alertData);
      }
      
      // Also send to admin
      io.to('role_admin').emit('emergency_alert', alertData);
      
      // Log emergency
      logger.warn(`Emergency alert from ${userName} (${userId}) at ${latitude},${longitude}`);
      
      socket.emit('emergency_sent', { success: true });
      
    } catch (error) {
      logger.error('Emergency alert error:', error);
      socket.emit('error', { message: error.message });
    }
  });
  
};

// Helper functions
async function getTechniciansByBuilding(buildingId) {
  const users = await User.find({ buildingId, role: 'technician' }).select('_id');
  return users.map(u => u._id.toString());
}

async function getTechniciansBySupervisor(supervisorId) {
  const users = await User.find({ supervisorId, role: 'technician' }).select('_id');
  return users.map(u => u._id.toString());
}