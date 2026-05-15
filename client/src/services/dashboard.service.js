import api from './api';

const dashboardService = {
  // Admin dashboard
  getAdminStats: async (range = 'week', buildingId = 'all') => {
    const response = await api.get('/dashboard/admin', { params: { range, buildingId } });
    return response.data;
  },

  // Manager dashboard
  getManagerStats: async () => {
    const response = await api.get('/dashboard/manager');
    return response.data;
  },

  // Supervisor dashboard
  getSupervisorStats: async () => {
    const response = await api.get('/dashboard/supervisor');
    return response.data;
  },

  // Technician dashboard
  getTechnicianStats: async () => {
    const response = await api.get('/dashboard/technician');
    return response.data;
  },

  // Customer dashboard
  getCustomerStats: async () => {
    const response = await api.get('/dashboard/customer');
    return response.data;
  },

  // Building metrics
  getBuildingMetrics: async (buildingId) => {
    const response = await api.get('/dashboard/building-metrics', { params: { buildingId } });
    return response.data;
  },

  // KPI data
  getKPI: async (type, range = 'month') => {
    const response = await api.get(`/dashboard/kpi/${type}`, { params: { range } });
    return response.data;
  },
};

export default dashboardService;