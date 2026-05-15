import api from './api';

const salaryConfigService = {
  // Main CRUD
  getSalaryConfigs: async () => {
    const response = await api.get('/salary-config');
    return response.data;
  },

  getSalaryConfigById: async (id) => {
    const response = await api.get(`/salary-config/${id}`);
    return response.data;
  },

  getSalaryConfigByCountry: async (country) => {
    const response = await api.get(`/salary-config/country/${country}`);
    return response.data;
  },

  createSalaryConfig: async (data) => {
    const response = await api.post('/salary-config', data);
    return response.data;
  },

  updateSalaryConfig: async (id, data) => {
    const response = await api.put(`/salary-config/${id}`, data);
    return response.data;
  },

  deleteSalaryConfig: async (id) => {
    const response = await api.delete(`/salary-config/${id}`);
    return response.data;
  },

  createDefaultConfigs: async () => {
    const response = await api.post('/salary-config/default/create');
    return response.data;
  },

  // Earning Components
  addEarningComponent: async (id, data) => {
    const response = await api.post(`/salary-config/${id}/earnings`, data);
    return response.data;
  },

  updateEarningComponent: async (id, componentId, data) => {
    const response = await api.put(`/salary-config/${id}/earnings/${componentId}`, data);
    return response.data;
  },

  deleteEarningComponent: async (id, componentId) => {
    const response = await api.delete(`/salary-config/${id}/earnings/${componentId}`);
    return response.data;
  },

  // Deduction Components
  addDeductionComponent: async (id, data) => {
    const response = await api.post(`/salary-config/${id}/deductions`, data);
    return response.data;
  },

  updateDeductionComponent: async (id, componentId, data) => {
    const response = await api.put(`/salary-config/${id}/deductions/${componentId}`, data);
    return response.data;
  },

  deleteDeductionComponent: async (id, componentId) => {
    const response = await api.delete(`/salary-config/${id}/deductions/${componentId}`);
    return response.data;
  },
};

export default salaryConfigService;