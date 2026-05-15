import api from './api';

const complaintService = {
  // Complaint CRUD
  getComplaints: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.assignedTo) params.append('assignedTo', filters.assignedTo);
    if (filters.buildingId) params.append('buildingId', filters.buildingId);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    
    const response = await api.get(`/complaints?${params.toString()}`);
    return response.data;
  },

  getComplaint: async (id) => {
    const response = await api.get(`/complaints/${id}`);
    return response.data;
  },

  createComplaint: async (complaintData) => {
    const response = await api.post('/complaints', complaintData);
    return response.data;
  },

  updateComplaint: async (id, complaintData) => {
    const response = await api.put(`/complaints/${id}`, complaintData);
    return response.data;
  },

  deleteComplaint: async (id) => {
    const response = await api.delete(`/complaints/${id}`);
    return response.data;
  },

  // Complaint workflow
  assignComplaint: async (id, technicianId) => {
    const response = await api.put(`/complaints/${id}/assign`, { technicianId });
    return response.data;
  },

  updateStatus: async (id, status, notes = null) => {
    const response = await api.put(`/complaints/${id}/status`, { status, notes });
    return response.data;
  },

  addRating: async (id, rating, feedback) => {
    const response = await api.post(`/complaints/${id}/rate`, { rating, feedback });
    return response.data;
  },

  escalateComplaint: async (id, reason) => {
    const response = await api.post(`/complaints/${id}/escalate`, { reason });
    return response.data;
  },

  addComment: async (id, comment) => {
    const response = await api.post(`/complaints/${id}/comments`, { comment });
    return response.data;
  },

  // Statistics
  getStats: async () => {
    const response = await api.get('/complaints/stats');
    return response.data;
  },

  getSLAReport: async (filters = {}) => {
    const response = await api.get('/complaints/sla-report', { params: filters });
    return response.data;
  },
};

export default complaintService;