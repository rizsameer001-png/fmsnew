import api from './api';

const salaryConfigService = {
  // Get all salary configs
  getSalaryConfigs: async () => {
    const response = await api.get('/salary-config');
    return response.data;
  },

  // Get salary config by country
  getSalaryConfigByCountry: async (country) => {
    const response = await api.get(`/salary-config/country/${country}`);
    return response.data;
  },

  // Create salary config
  createSalaryConfig: async (data) => {
    const response = await api.post('/salary-config', data);
    return response.data;
  },

  // Update salary config
  updateSalaryConfig: async (id, data) => {
    const response = await api.put(`/salary-config/${id}`, data);
    return response.data;
  },

  // Delete salary config
  deleteSalaryConfig: async (id) => {
    const response = await api.delete(`/salary-config/${id}`);
    return response.data;
  },

  // Create default configs
  createDefaultConfigs: async () => {
    const response = await api.post('/salary-config/default/create');
    return response.data;
  },
};

export default salaryConfigService;