import api from './api';

const attendanceService = {
  // Check-in/out
  checkIn: async (data) => {
    const response = await api.post('/attendance/checkin', data);
    return response.data;
  },

  checkOut: async (data) => {
    const response = await api.post('/attendance/checkout', data);
    return response.data;
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
};

export default attendanceService;