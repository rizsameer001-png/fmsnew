const Geofence = require('../models/Geofence.model');
const Attendance = require('../models/Attendance.model');
const User = require('../models/User.model');
const { getIO } = require('../config/socketio');
//const logger = require('../utils/logger');
const { logger } = require('../utils/logger');  // Fixed: use destructuring

// Calculate distance between two points (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

// Check if point is within circle geofence
const isPointInCircleGeofence = (pointLat, pointLng, centerLat, centerLng, radiusMeters) => {
  const distance = calculateDistance(pointLat, pointLng, centerLat, centerLng);
  return distance <= radiusMeters;
};

// Check if point is within polygon geofence (Ray casting algorithm)
const isPointInPolygon = (pointLat, pointLng, polygon) => {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].latitude;
    const yi = polygon[i].longitude;
    const xj = polygon[j].latitude;
    const yj = polygon[j].longitude;
    
    const intersect = ((yi > pointLng) !== (yj > pointLng)) &&
      (pointLat < (xj - xi) * (pointLng - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
};

// Validate location against geofence
const validateGeofence = async (userId, latitude, longitude, action = 'checkin') => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.buildingId) {
      return { valid: true, message: 'No geofence configured for this user' };
    }
    
    const geofence = await Geofence.findOne({ 
      buildingId: user.buildingId, 
      isActive: true 
    });
    
    if (!geofence) {
      return { valid: true, message: 'No active geofence for this building' };
    }
    
    // Check if user role is allowed
    if (!geofence.allowedRoles.includes('all') && 
        !geofence.allowedRoles.includes(user.role)) {
      return { valid: false, message: 'Your role is not allowed to use this geofence' };
    }
    
    // Check time restrictions
    if (geofence.allowedCheckInTime && action === 'checkin') {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const [startHour, startMin] = geofence.allowedCheckInTime.start.split(':');
      const [endHour, endMin] = geofence.allowedCheckInTime.end.split(':');
      const startTime = parseInt(startHour) * 60 + parseInt(startMin);
      const endTime = parseInt(endHour) * 60 + parseInt(endMin);
      
      if (currentTime < startTime || currentTime > endTime) {
        return { 
          valid: false, 
          message: `Check-in only allowed between ${geofence.allowedCheckInTime.start} and ${geofence.allowedCheckInTime.end}` 
        };
      }
    }
    
    let isValid = false;
    let distance = 0;
    
    if (geofence.shape === 'circle') {
      distance = calculateDistance(
        latitude, longitude,
        geofence.coordinates.center.latitude,
        geofence.coordinates.center.longitude
      );
      isValid = distance <= geofence.coordinates.radius;
    } else if (geofence.shape === 'polygon' && geofence.coordinates.polygon) {
      isValid = isPointInPolygon(latitude, longitude, geofence.coordinates.polygon);
    }
    
    if (!isValid) {
      return { 
        valid: false, 
        message: `You are outside the allowed geofence area. ${geofence.shape === 'circle' ? `Distance: ${Math.round(distance)}m` : ''}`,
        distance: distance
      };
    }
    
    return { valid: true, message: 'Location validated successfully', distance };
  } catch (error) {
    logger.error('Validate geofence error:', error);
    return { valid: false, message: 'Error validating location' };
  }
};

// Create geofence
const createGeofence = async (geofenceData) => {
  try {
    const geofence = await Geofence.create(geofenceData);
    logger.info(`Geofence created for building: ${geofence.buildingId}`);
    return geofence;
  } catch (error) {
    logger.error('Create geofence error:', error);
    throw error;
  }
};

// Update geofence
const updateGeofence = async (geofenceId, updateData) => {
  try {
    const geofence = await Geofence.findByIdAndUpdate(
      geofenceId,
      updateData,
      { new: true, runValidators: true }
    );
    logger.info(`Geofence updated: ${geofenceId}`);
    return geofence;
  } catch (error) {
    logger.error('Update geofence error:', error);
    throw error;
  }
};

// Delete geofence
const deleteGeofence = async (geofenceId) => {
  try {
    await Geofence.findByIdAndDelete(geofenceId);
    logger.info(`Geofence deleted: ${geofenceId}`);
    return true;
  } catch (error) {
    logger.error('Delete geofence error:', error);
    throw error;
  }
};

// Get geofence by building
const getGeofenceByBuilding = async (buildingId) => {
  try {
    const geofence = await Geofence.findOne({ buildingId, isActive: true });
    return geofence;
  } catch (error) {
    logger.error('Get geofence by building error:', error);
    return null;
  }
};

// Get all geofences
const getAllGeofences = async (filters = {}) => {
  try {
    const query = {};
    if (filters.buildingId) query.buildingId = filters.buildingId;
    if (filters.isActive !== undefined) query.isActive = filters.isActive;
    
    const geofences = await Geofence.find(query).populate('buildingId', 'name code');
    return geofences;
  } catch (error) {
    logger.error('Get all geofences error:', error);
    return [];
  }
};

// Track user movement and trigger alerts
const trackUserMovement = async (userId, latitude, longitude) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.buildingId) return;
    
    const geofence = await Geofence.findOne({ buildingId: user.buildingId, isActive: true });
    if (!geofence) return;
    
    let isInside = false;
    if (geofence.shape === 'circle') {
      const distance = calculateDistance(
        latitude, longitude,
        geofence.coordinates.center.latitude,
        geofence.coordinates.center.longitude
      );
      isInside = distance <= geofence.coordinates.radius;
    } else if (geofence.shape === 'polygon') {
      isInside = isPointInPolygon(latitude, longitude, geofence.coordinates.polygon);
    }
    
    // Check for boundary crossing
    const previousLocation = user.lastLocation;
    if (previousLocation && previousLocation.isInside !== undefined && previousLocation.isInside !== isInside) {
      // User crossed boundary
      const io = getIO();
      io.to(`role_supervisor`).to(`role_manager`).emit('geofence_boundary_cross', {
        userId: user._id,
        userName: user.name,
        buildingId: user.buildingId,
        action: isInside ? 'entered' : 'exited',
        location: { latitude, longitude },
        timestamp: new Date()
      });
      
      // Create notification for supervisor
      await Notification.create({
        userId: user.supervisorId,
        title: `Geofence ${isInside ? 'Entry' : 'Exit'} Alert`,
        body: `${user.name} has ${isInside ? 'entered' : 'exited'} the geofence area`,
        type: 'attendance',
        priority: 'medium',
        data: { userId: user._id, action: isInside ? 'enter' : 'exit', location: { latitude, longitude } }
      });
    }
    
    // Update user's last location
    user.lastLocation = {
      latitude,
      longitude,
      isInside,
      updatedAt: new Date()
    };
    await user.save();
    
    return { isInside };
  } catch (error) {
    logger.error('Track user movement error:', error);
    return null;
  }
};

// Auto check-out when leaving geofence
const autoCheckOut = async (userId) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const attendance = await Attendance.findOne({
      userId,
      date: today,
      'checkIn.time': { $exists: true },
      'checkOut.time': { $exists: false }
    });
    
    if (attendance) {
      attendance.checkOut = {
        time: new Date(),
        location: { latitude: 0, longitude: 0 },
        autoCheckedOut: true
      };
      attendance.totalHours = (attendance.checkOut.time - attendance.checkIn.time) / (1000 * 60 * 60);
      await attendance.save();
      
      logger.info(`Auto check-out for user ${userId} due to geofence exit`);
      return attendance;
    }
    
    return null;
  } catch (error) {
    logger.error('Auto check-out error:', error);
    return null;
  }
};

// Get geofence statistics
const getGeofenceStats = async (buildingId, startDate, endDate) => {
  try {
    const geofence = await Geofence.findOne({ buildingId });
    if (!geofence) return null;
    
    const users = await User.find({ buildingId, isActive: true });
    const totalUsers = users.length;
    
    // Get users currently inside geofence
    let currentlyInside = 0;
    for (const user of users) {
      if (user.lastLocation && user.lastLocation.isInside === true) {
        currentlyInside++;
      }
    }
    
    // Get geofence violation count
    const violations = await Attendance.countDocuments({
      userId: { $in: users.map(u => u._id) },
      date: { $gte: startDate, $lte: endDate },
      geofenceViolation: true
    });
    
    return {
      buildingId,
      shape: geofence.shape,
      center: geofence.coordinates.center,
      radius: geofence.coordinates.radius,
      totalAssignedUsers: totalUsers,
      currentlyInside: currentlyInside,
      violations: violations,
      complianceRate: totalUsers > 0 ? (currentlyInside / totalUsers) * 100 : 0
    };
  } catch (error) {
    logger.error('Get geofence stats error:', error);
    return null;
  }
};

module.exports = {
  calculateDistance,
  isPointInCircleGeofence,
  isPointInPolygon,
  validateGeofence,
  createGeofence,
  updateGeofence,
  deleteGeofence,
  getGeofenceByBuilding,
  getAllGeofences,
  trackUserMovement,
  autoCheckOut,
  getGeofenceStats
};