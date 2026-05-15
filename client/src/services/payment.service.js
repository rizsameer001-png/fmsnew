import api from './api';

const paymentService = {
  // Payment processing
  createOrder: async (invoiceId) => {
    const response = await api.post('/payments/create-order', { invoiceId });
    return response.data;
  },

  verifyPayment: async (orderId, paymentId, signature, invoiceId) => {
    const response = await api.post('/payments/verify', {
      orderId,
      paymentId,
      signature,
      invoiceId,
    });
    return response.data;
  },

  getPaymentHistory: async () => {
    const response = await api.get('/payments/history');
    return response.data;
  },

  // Admin functions
  getAllPayments: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page);
    
    const response = await api.get(`/payments?${params.toString()}`);
    return response.data;
  },

  refundPayment: async (id, amount = null, reason = null) => {
    const response = await api.post(`/payments/${id}/refund`, { amount, reason });
    return response.data;
  },

  getPaymentStats: async () => {
    const response = await api.get('/payments/stats');
    return response.data;
  },
};

export default paymentService;