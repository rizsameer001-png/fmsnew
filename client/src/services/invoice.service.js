import api from './api';

const invoiceService = {
  // Invoice CRUD
  getInvoices: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.customerId) params.append('customerId', filters.customerId);
    if (filters.page) params.append('page', filters.page);
    
    const response = await api.get(`/invoices?${params.toString()}`);
    return response.data;
  },

  getMyInvoices: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page);
    
    const response = await api.get(`/invoices/my?${params.toString()}`);
    return response.data;
  },

  getInvoice: async (id) => {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
  },

  createInvoice: async (invoiceData) => {
    const response = await api.post('/invoices', invoiceData);
    return response.data;
  },

  updateInvoice: async (id, invoiceData) => {
    const response = await api.put(`/invoices/${id}`, invoiceData);
    return response.data;
  },

  deleteInvoice: async (id) => {
    const response = await api.delete(`/invoices/${id}`);
    return response.data;
  },

  // PDF generation
  downloadInvoicePDF: async (id) => {
    const response = await api.get(`/invoices/${id}/pdf`, {
      responseType: 'blob',
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `invoice_${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return response.data;
  },

  // Invoice actions
  sendInvoice: async (id) => {
    const response = await api.post(`/invoices/${id}/send`);
    return response.data;
  },

  markAsPaid: async (id, paymentDetails) => {
    const response = await api.put(`/invoices/${id}/mark-paid`, paymentDetails);
    return response.data;
  },
};

export default invoiceService;