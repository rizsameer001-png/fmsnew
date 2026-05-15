import api from './api';

const serviceConfigService = {
  // Services CRUD
  getServices: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive);
    if (filters.search) params.append('search', filters.search);
    
    const response = await api.get(`/services?${params.toString()}`);
    return response.data;
  },

  getService: async (id) => {
    const response = await api.get(`/services/${id}`);
    return response.data;
  },

  createService: async (serviceData) => {
    const response = await api.post('/services', serviceData);
    return response.data;
  },

  updateService: async (id, serviceData) => {
    const response = await api.put(`/services/${id}`, serviceData);
    return response.data;
  },

  deleteService: async (id) => {
    const response = await api.delete(`/services/${id}`);
    return response.data;
  },

  toggleServiceStatus: async (id) => {
    const response = await api.put(`/services/${id}/toggle`);
    return response.data;
  },

  getServiceCategories: async () => {
    const response = await api.get('/services/categories');
    return response.data;
  },

  // SLA Policies
  getSLAPolicies: async () => {
    const response = await api.get('/services/sla-policies');
    return response.data;
  },

  getSLAPolicy: async (id) => {
    const response = await api.get(`/services/sla-policies/${id}`);
    return response.data;
  },

  createSLAPolicy: async (policyData) => {
    const response = await api.post('/services/sla-policies', policyData);
    return response.data;
  },

  updateSLAPolicy: async (id, policyData) => {
    const response = await api.put(`/services/sla-policies/${id}`, policyData);
    return response.data;
  },

  deleteSLAPolicy: async (id) => {
    const response = await api.delete(`/services/sla-policies/${id}`);
    return response.data;
  },
};

export default serviceConfigService;