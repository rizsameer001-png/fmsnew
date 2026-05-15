import api from './api';

const userService = {
  // User CRUD
  getUsers: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.role) params.append('role', filters.role);
    if (filters.status) params.append('isActive', filters.status === 'active');
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    
    const response = await api.get(`/users?${params.toString()}`);
    return response.data;
  },

  getUser: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  createUser: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Specialized queries
  getTechniciansByType: async (type, buildingId = null) => {
    const params = buildingId ? `?buildingId=${buildingId}` : '';
    const response = await api.get(`/users/technicians/${type}${params}`);
    return response.data;
  },

  getAllTechnicians: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.buildingId) params.append('buildingId', filters.buildingId);
    if (filters.type) params.append('type', filters.type);
    const response = await api.get(`/users/technicians?${params.toString()}`);
    return response.data;
  },

  getUserStats: async () => {
    const response = await api.get('/users/stats');
    return response.data;
  },

  getMyTeam: async () => {
    const response = await api.get('/users/team');
    return response.data;
  },
};

export default userService;