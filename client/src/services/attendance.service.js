import api from './api';

const attendanceService = {
  // Check-in/out with file upload support
  checkIn: async (data) => {
    // Check if data contains a file (photo)
    if (data.photo instanceof File) {
      const formData = new FormData();
      formData.append('latitude', data.latitude);
      formData.append('longitude', data.longitude);
      formData.append('address', data.address || '');
      if (data.deviceInfo) {
        formData.append('deviceInfo', JSON.stringify(data.deviceInfo));
      }
      formData.append('photo', data.photo);
      
      const response = await api.post('/attendance/checkin', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } else {
      // Regular JSON request (no photo)
      const response = await api.post('/attendance/checkin', data);
      return response.data;
    }
  },

  checkOut: async (data) => {
    // Check if data contains a file (photo)
    if (data.photo instanceof File) {
      const formData = new FormData();
      formData.append('latitude', data.latitude);
      formData.append('longitude', data.longitude);
      formData.append('address', data.address || '');
      if (data.deviceInfo) {
        formData.append('deviceInfo', JSON.stringify(data.deviceInfo));
      }
      formData.append('photo', data.photo);
      
      const response = await api.post('/attendance/checkout', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } else {
      // Regular JSON request (no photo)
      const response = await api.post('/attendance/checkout', data);
      return response.data;
    }
  },

  // My attendance
  getMyAttendance: async (params = {}) => {
    const response = await api.get('/attendance/my', { params });
    return response.data;
  },

  getTodayStatus: async () => {
    const response = await api.get('/attendance/today');
    return response.data;
  },

  // Team attendance (for managers/supervisors)
  getTeamAttendance: async (params = {}) => {
    const response = await api.get('/attendance/team', { params });
    return response.data;
  },

  // Admin functions
  getAttendanceReport: async (params = {}) => {
    const response = await api.get('/attendance/report', { params });
    return response.data;
  },

  approveAttendance: async (id, status, notes) => {
    const response = await api.put(`/attendance/${id}/approve`, { status, notes });
    return response.data;
  },

  getAttendanceStats: async (params = {}) => {
    const response = await api.get('/attendance/stats', { params });
    return response.data;
  },

  // Get all employees attendance (Admin only)
  getAllEmployeesAttendance: async (params = {}) => {
    const response = await api.get('/attendance/all', { params });
    return response.data;
  },
};

export default attendanceService;