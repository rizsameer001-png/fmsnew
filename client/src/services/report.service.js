// import api from './api';

// const reportService = {
//   // Analytics data
//   getAnalytics: async (params = {}) => {
//     const response = await api.get('/reports/analytics', { params });
//     return response.data;
//   },

//   // Export functions
//   exportReport: async (params = {}) => {
//     const response = await api.post('/reports/export', params, {
//       responseType: 'blob',
//     });
//     return response.data;
//   },

//   // Attendance reports
//   getAttendanceReport: async (params) => {
//     const response = await api.post('/reports/attendance', params);
//     return response.data;
//   },

//   exportAttendanceReport: async (params, format = 'excel') => {
//     const response = await api.post(`/reports/attendance/export?format=${format}`, params, {
//       responseType: 'blob',
//     });
//     return response.data;
//   },

//   // Complaint reports
//   getComplaintReport: async (params) => {
//     const response = await api.post('/reports/complaint', params);
//     return response.data;
//   },

//   exportComplaintReport: async (params, format = 'excel') => {
//     const response = await api.post(`/reports/complaint/export?format=${format}`, params, {
//       responseType: 'blob',
//     });
//     return response.data;
//   },

//   // Financial reports
//   getFinancialReport: async (params) => {
//     const response = await api.post('/reports/financial', params);
//     return response.data;
//   },

//   exportFinancialReport: async (params, format = 'excel') => {
//     const response = await api.post(`/reports/financial/export?format=${format}`, params, {
//       responseType: 'blob',
//     });
//     return response.data;
//   },

//   // Performance reports
//   getPerformanceReport: async (params) => {
//     const response = await api.post('/reports/performance', params);
//     return response.data;
//   },

//   // Activity logs
//   getActivityLogs: async (params = {}) => {
//     const response = await api.get('/reports/activity-logs', { params });
//     return response.data;
//   },

//   // SLA reports
//   getSLAReport: async (params = {}) => {
//     const response = await api.get('/reports/sla', { params });
//     return response.data;
//   },
// };

// export default reportService;

import api from './api';

const reportService = {
  // Analytics data
  getAnalytics: async (params = {}) => {
    const response = await api.get('/reports/analytics', { params });
    return response.data;
  },

  // Export functions
  exportReport: async (params = {}) => {
    const response = await api.post('/reports/export', params, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Attendance reports
  getAttendanceReport: async (params) => {
    const response = await api.post('/reports/attendance', params);
    return response.data;
  },

  exportAttendanceReport: async (params, format = 'excel') => {
    const response = await api.post(`/reports/attendance/export?format=${format}`, params, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Complaint reports
  getComplaintReport: async (params) => {
    const response = await api.post('/reports/complaint', params);
    return response.data;
  },

  exportComplaintReport: async (params, format = 'excel') => {
    const response = await api.post(`/reports/complaint/export?format=${format}`, params, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Financial reports
  getFinancialReport: async (params) => {
    const response = await api.post('/reports/financial', params);
    return response.data;
  },

  exportFinancialReport: async (params, format = 'excel') => {
    const response = await api.post(`/reports/financial/export?format=${format}`, params, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Performance reports
  getPerformanceReport: async (params) => {
    const response = await api.post('/reports/performance', params);
    return response.data;
  },

  // Activity logs
  getActivityLogs: async (params = {}) => {
    const response = await api.get('/reports/activity-logs', { params });
    return response.data;
  },

  // SLA reports
  getSLAReport: async (params = {}) => {
    const response = await api.get('/reports/sla', { params });
    return response.data;
  },

  // ==================== SITE INSPECTION METHODS ====================
  // ⬇️⬇️⬇️ ADD THESE METHODS FOR SITE INSPECTION ⬇️⬇️⬇️
  
  // Get all inspections
  getInspections: async (params = {}) => {
    const response = await api.get('/reports/inspections', { params });
    return response.data;
  },

  // Create inspection report
  createInspection: async (data) => {
    const response = await api.post('/reports/inspections', data);
    return response.data;
  },

  // Get single inspection
  getInspection: async (id) => {
    const response = await api.get(`/reports/inspections/${id}`);
    return response.data;
  },

  // Update inspection
  updateInspection: async (id, data) => {
    const response = await api.put(`/reports/inspections/${id}`, data);
    return response.data;
  },

  // Delete inspection
  deleteInspection: async (id) => {
    const response = await api.delete(`/reports/inspections/${id}`);
    return response.data;
  },
};

export default reportService;