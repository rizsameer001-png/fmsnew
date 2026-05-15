import api from './api';

const gpsService = {
  // Location tracking
  updateLocation: async (latitude, longitude, accuracy = null, speed = null) => {
    const response = await api.post('/gps/location', {
      latitude,
      longitude,
      accuracy,
      speed,
    });
    return response.data;
  },

  getLiveLocations: async () => {
    const response = await api.get('/gps/live');
    return response.data;
  },

  getTechnicianLocation: async (userId) => {
    const response = await api.get(`/gps/technician/${userId}`);
    return response.data;
  },

  getLocationHistory: async (userId, startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await api.get(`/gps/history/${userId}?${params.toString()}`);
    return response.data;
  },

  // Emergency alerts
  sendEmergencyAlert: async (latitude, longitude, message = null) => {
    const response = await api.post('/gps/emergency', {
      latitude,
      longitude,
      message,
    });
    return response.data;
  },

  // Geofence validation
  validateGeofence: async (latitude, longitude) => {
    const response = await api.post('/gps/validate-geofence', {
      latitude,
      longitude,
    });
    return response.data;
  },

  // Geofence management (admin)
  getGeofences: async () => {
    const response = await api.get('/gps/geofences');
    return response.data;
  },

  createGeofence: async (geofenceData) => {
    const response = await api.post('/gps/geofences', geofenceData);
    return response.data;
  },

  updateGeofence: async (id, geofenceData) => {
    const response = await api.put(`/gps/geofences/${id}`, geofenceData);
    return response.data;
  },

  deleteGeofence: async (id) => {
    const response = await api.delete(`/gps/geofences/${id}`);
    return response.data;
  },
};

export default gpsService;