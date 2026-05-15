const User = require('../models/User.model');
const Geofence = require('../models/Geofence.model');
const ActivityLog = require('../models/ActivityLog.model');
const Notification = require('../models/Notification.model');
const { getIO } = require('../config/socketio');
//const logger = require('../utils/logger');
// Replace with:
const { logger } = require('../utils/logger');

// Store live locations in memory (use Redis in production)
const liveLocations = new Map();

// @desc    Update technician location
// @route   POST /api/gps/location
// @access  Private/Technician
const updateLocation = async (req, res) => {
  try {
    const { latitude, longitude, accuracy, speed } = req.body;

    const locationData = {
      userId: req.user._id,
      name: req.user.name,
      role: req.user.role,
      technicianType: req.user.technicianType,
      latitude,
      longitude,
      accuracy,
      speed,
      lastUpdate: new Date(),
      isOnline: true
    };

    liveLocations.set(req.user._id.toString(), locationData);

    // Update user's last known location in database (optional)
    await User.findByIdAndUpdate(req.user._id, {
      'lastLocation.latitude': latitude,
      'lastLocation.longitude': longitude,
      'lastLocation.updatedAt': new Date(),
      isOnline: true
    });

    // Broadcast to supervisors and managers via socket
    const io = getIO();
    io.to('role_supervisor').to('role_manager').emit('technician_location_update', locationData);

    res.json({ success: true });
  } catch (error) {
    logger.error('Update location error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get live locations of all technicians
// @route   GET /api/gps/live
// @access  Private/Supervisor/Manager/Admin
const getLiveLocations = async (req, res) => {
  try {
    let technicians = [];

    if (req.user.role === 'supervisor') {
      // Get technicians under this supervisor
      const techIds = await getTechnicianIds(req.user._id);
      technicians = Array.from(liveLocations.values())
        .filter(loc => techIds.includes(loc.userId));
    } else if (req.user.role === 'manager') {
      // Get technicians in manager's building
      const techIds = await getTechniciansByBuilding(req.user.buildingId);
      technicians = Array.from(liveLocations.values())
        .filter(loc => techIds.includes(loc.userId));
    } else {
      // Admin gets all
      technicians = Array.from(liveLocations.values());
    }

    // Add offline status for technicians without recent updates
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    technicians = technicians.map(tech => ({
      ...tech,
      isOnline: tech.lastUpdate > tenMinutesAgo
    }));

    res.json({ success: true, technicians });
  } catch (error) {
    logger.error('Get live locations error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single technician location history
// @route   GET /api/gps/technician/:userId
// @access  Private/Manager/Supervisor
const getTechnicianLocation = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check authorization
    if (req.user.role === 'supervisor') {
      const techIds = await getTechnicianIds(req.user._id);
      if (!techIds.includes(userId)) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }
    }

    const location = liveLocations.get(userId);
    const user = await User.findById(userId).select('name technicianType');

    res.json({ 
      success: true, 
      location: location || null,
      user
    });
  } catch (error) {
    logger.error('Get technician location error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get location history from database
// @route   GET /api/gps/history/:userId
// @access  Private/Admin/Manager
const getLocationHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate, page = 1, limit = 100 } = req.query;

    // This would typically query a LocationHistory collection
    // For now, return stored location if within timeframe
    const location = liveLocations.get(userId);
    
    res.json({ 
      success: true, 
      history: location ? [location] : [],
      message: 'Location history requires LocationHistory model implementation'
    });
  } catch (error) {
    logger.error('Get location history error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send emergency alert
// @route   POST /api/gps/emergency
// @access  Private/Technician
const sendEmergencyAlert = async (req, res) => {
  try {
    const { latitude, longitude, message } = req.body;

    // Get supervisor and manager contacts
    const supervisor = await User.findOne({ 
      buildingId: req.user.buildingId, 
      role: 'supervisor' 
    });
    
    const manager = await User.findOne({ 
      buildingId: req.user.buildingId, 
      role: 'manager' 
    });

    const recipients = [supervisor, manager].filter(Boolean);
    const io = getIO();

    for (const recipient of recipients) {
      // Send real-time alert
      io.to(`user_${recipient._id}`).emit('emergency_alert', {
        technician: {
          id: req.user._id,
          name: req.user.name,
          phone: req.user.phone
        },
        location: { latitude, longitude },
        message: message || 'Emergency situation detected',
        timestamp: new Date()
      });

      // Create notification
      await Notification.create({
        userId: recipient._id,
        title: '🚨 EMERGENCY ALERT',
        body: `${req.user.name} has triggered an emergency alert!`,
        type: 'emergency',
        priority: 'urgent',
        data: { latitude, longitude, message },
        channels: ['push', 'email', 'sms']
      });
    }

    // Log emergency
    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'EMERGENCY_ALERT',
      entityType: 'user',
      entityId: req.user._id,
      details: { location: { latitude, longitude }, message },
      ipAddress: req.ip
    });

    res.json({ success: true, message: 'Emergency alert sent' });
  } catch (error) {
    logger.error('Emergency alert error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Validate geofence for check-in/out
// @route   POST /api/gps/validate-geofence
// @access  Private/Technician
const validateGeofence = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const buildingId = req.user.buildingId;

    if (!buildingId) {
      return res.json({ success: true, isValid: true, message: 'No building assigned' });
    }

    const geofence = await Geofence.findOne({ buildingId, isActive: true });
    
    if (!geofence) {
      return res.json({ success: true, isValid: true, message: 'No geofence configured' });
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
    } else {
      // Polygon validation
      isValid = isPointInPolygon(
        latitude, longitude,
        geofence.coordinates.polygon
      );
    }

    res.json({ 
      success: true, 
      isValid, 
      distance: Math.round(distance),
      radius: geofence.shape === 'circle' ? geofence.coordinates.radius : null
    });
  } catch (error) {
    logger.error('Validate geofence error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper functions
const getTechnicianIds = async (supervisorId) => {
  const users = await User.find({ supervisorId, role: 'technician' }).select('_id');
  return users.map(u => u._id.toString());
};

const getTechniciansByBuilding = async (buildingId) => {
  const users = await User.find({ buildingId, role: 'technician' }).select('_id');
  return users.map(u => u._id.toString());
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
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

const isPointInPolygon = (lat, lng, polygon) => {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].latitude, yi = polygon[i].longitude;
    const xj = polygon[j].latitude, yj = polygon[j].longitude;
    
    const intersect = ((yi > lng) != (yj > lng)) &&
      (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
};

module.exports = {
  updateLocation,
  getLiveLocations,
  getTechnicianLocation,
  getLocationHistory,
  sendEmergencyAlert,
  validateGeofence
};