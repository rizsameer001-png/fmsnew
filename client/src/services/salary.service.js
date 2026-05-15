import api from './api';

const salaryService = {
  // Generate salary
  generateSalary: async (data) => {
    const response = await api.post('/salaries/generate', data);
    return response.data;
  },

  // Bulk generate salaries
  bulkGenerateSalary: async (data) => {
    const response = await api.post('/salaries/bulk-generate', data);
    return response.data;
  },

  // Get all salaries (admin/manager)
  getSalaries: async (params = {}) => {
    const response = await api.get('/salaries', { params });
    return response.data;
  },

  // Get my salary (employee)
  getMySalary: async (params = {}) => {
    const response = await api.get('/salaries/my', { params });
    return response.data;
  },

  // Get monthly attendance for salary calculation
  getMonthlyAttendance: async (params = {}) => {
    const response = await api.get('/salaries/monthly-attendance', { params });
    return response.data;
  },

  // Approve salary
  approveSalary: async (id) => {
    const response = await api.put(`/salaries/${id}/approve`);
    return response.data;
  },

  // Mark as paid
  markAsPaid: async (id, data) => {
    const response = await api.put(`/salaries/${id}/mark-paid`, data);
    return response.data;
  },

  // ✅ NEW - Export salary report to Excel
  exportSalary: async (params = {}) => {
    const response = await api.get('/salaries/export/excel', {
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  // ✅ NEW - Export individual salary slip
  exportSalarySlip: async (id) => {
    const response = await api.get(`/salaries/${id}/export-slip`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // ✅ NEW - Get salary by ID
  getSalaryById: async (id) => {
    const response = await api.get(`/salaries/${id}`);
    return response.data;
  },

  // ✅ NEW - Update salary components
  updateSalaryComponents: async (id, data) => {
    const response = await api.put(`/salaries/${id}/update`, data);
    return response.data;
  },

  // ✅ NEW - Delete salary record
  deleteSalary: async (id) => {
    const response = await api.delete(`/salaries/${id}`);
    return response.data;
  },

  // Add these functions to your salary.service.js

// Send salary slip email to individual employee
sendSalarySlipEmail: async (id) => {
  const response = await api.post(`/salaries/${id}/send-email`);
  return response.data;
},

// Send bulk salary slips
sendBulkSalarySlipsEmail: async (params = {}) => {
  const response = await api.post('/salaries/bulk-send-email', null, { params });
  return response.data;
},
};


export default salaryService;