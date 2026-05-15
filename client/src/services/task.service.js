import api from './api';

const taskService = {
  // Task CRUD
  getTasks: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.assignedTo) params.append('assignedTo', filters.assignedTo);
    if (filters.buildingId) params.append('buildingId', filters.buildingId);
    if (filters.page) params.append('page', filters.page);
    
    const response = await api.get(`/tasks?${params.toString()}`);
    return response.data;
  },

  getMyTasks: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    const response = await api.get(`/tasks/my?${params.toString()}`);
    return response.data;
  },

  getTask: async (id) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  createTask: async (taskData) => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  updateTask: async (id, taskData) => {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  },

  deleteTask: async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },

  // Task workflow
  assignTask: async (id, technicianId) => {
    const response = await api.put(`/tasks/${id}/assign`, { technicianId });
    return response.data;
  },

  updateTaskStatus: async (id, status, notes = null) => {
    const response = await api.put(`/tasks/${id}/status`, { status, notes });
    return response.data;
  },

  verifyTask: async (id, verificationNotes, rating = null) => {
    const response = await api.put(`/tasks/${id}/verify`, { verificationNotes, rating });
    return response.data;
  },

  uploadCompletionProof: async (id, images) => {
    const response = await api.post(`/tasks/${id}/upload-proof`, { images });
    return response.data;
  },

  // Task scheduling
  getSchedule: async (date) => {
    const response = await api.get(`/tasks/schedule?date=${date}`);
    return response.data;
  },

  rescheduleTask: async (id, scheduledDate) => {
    const response = await api.put(`/tasks/${id}/reschedule`, { scheduledDate });
    return response.data;
  },
};

export default taskService;