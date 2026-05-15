import api from './api';

const approvalService = {
  // Approval CRUD
  getApprovals: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.type) params.append('type', filters.type);
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page);
    
    const response = await api.get(`/approvals?${params.toString()}`);
    return response.data;
  },

  getApproval: async (id) => {
    const response = await api.get(`/approvals/${id}`);
    return response.data;
  },

  createApproval: async (approvalData) => {
    const response = await api.post('/approvals', approvalData);
    return response.data;
  },

  processApproval: async (id, status, comments = null) => {
    const response = await api.put(`/approvals/${id}`, { status, comments });
    return response.data;
  },

  cancelApproval: async (id) => {
    const response = await api.delete(`/approvals/${id}/cancel`);
    return response.data;
  },

  // Counts
  getPendingCount: async () => {
    const response = await api.get('/approvals/pending/count');
    return response.data;
  },

  // By type
  getApprovalsByType: async (type) => {
    const response = await api.get(`/approvals/type/${type}`);
    return response.data;
  },
};

export default approvalService;