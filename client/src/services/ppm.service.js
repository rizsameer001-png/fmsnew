import api from './api';

const ppmService = {
  // PPM Schedule CRUD
  getSchedules: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.buildingId) params.append('buildingId', filters.buildingId);
    if (filters.status) params.append('status', filters.status);
    if (filters.frequency) params.append('frequency', filters.frequency);
    if (filters.page) params.append('page', filters.page);
    
    const response = await api.get(`/ppm?${params.toString()}`);
    return response.data;
  },

  getSchedule: async (id) => {
    const response = await api.get(`/ppm/${id}`);
    return response.data;
  },

  createSchedule: async (scheduleData) => {
    const response = await api.post('/ppm', scheduleData);
    return response.data;
  },

  updateSchedule: async (id, scheduleData) => {
    const response = await api.put(`/ppm/${id}`, scheduleData);
    return response.data;
  },

  deleteSchedule: async (id) => {
    const response = await api.delete(`/ppm/${id}`);
    return response.data;
  },

  toggleScheduleStatus: async (id) => {
    const response = await api.put(`/ppm/${id}/toggle-status`);
    return response.data;
  },

  // Task generation
  generateTasks: async () => {
    const response = await api.post('/ppm/generate-tasks');
    return response.data;
  },

  getUpcomingTasks: async (filters = {}) => {
    const response = await api.get('/ppm/upcoming/tasks', { params: filters });
    return response.data;
  },

  // Schedule by building
  getSchedulesByBuilding: async (buildingId) => {
    const response = await api.get(`/ppm/building/${buildingId}`);
    return response.data;
  },

  // History
  getScheduleHistory: async (id) => {
    const response = await api.get(`/ppm/${id}/history`);
    return response.data;
  },
};

export default ppmService;