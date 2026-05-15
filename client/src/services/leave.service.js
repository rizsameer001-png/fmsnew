import api from './api';

const leaveService = {
  // Apply for leave
  applyLeave: async (data) => {
    const response = await api.post('/leaves/apply', data);
    return response.data;
  },

  // Get my leaves
  getMyLeaves: async (params = {}) => {
    const response = await api.get('/leaves/my', { params });
    return response.data;
  },

  // Get team leaves (manager/supervisor)
  getTeamLeaves: async (params = {}) => {
    const response = await api.get('/leaves/team', { params });
    return response.data;
  },

  // Get pending leaves
  getPendingLeaves: async () => {
    const response = await api.get('/leaves/pending');
    return response.data;
  },

  // Get leave balance
  getLeaveBalance: async (year = null) => {
    const params = year ? { year } : {};
    const response = await api.get('/leaves/balance', { params });
    return response.data;
  },

  // Approve leave
  approveLeave: async (id) => {
    const response = await api.put(`/leaves/${id}/approve`);
    return response.data;
  },

  // Reject leave
  rejectLeave: async (id, reason) => {
    const response = await api.put(`/leaves/${id}/reject`, { reason });
    return response.data;
  },

  // Cancel leave
  cancelLeave: async (id) => {
    const response = await api.put(`/leaves/${id}/cancel`);
    return response.data;
  },

  // Get leave statistics
  getLeaveStats: async (params = {}) => {
    const response = await api.get('/leaves/stats', { params });
    return response.data;
  },
};

export default leaveService;