import api from './api';

const billingService = {
  // Get all billings
  getAll: async () => {
    const response = await api.get('/billings');
    return response.data;
  },

  // Get single billing
  getById: async (id) => {
    const response = await api.get(`/billings/${id}`);
    return response.data;
  },

  // Create new billing
  create: async (billingData) => {
    const response = await api.post('/billings', billingData);
    return response.data;
  },

  // Update billing
  update: async (id, billingData) => {
    const response = await api.put(`/billings/${id}`, billingData);
    return response.data;
  },

  // Delete billing
  delete: async (id) => {
    const response = await api.delete(`/billings/${id}`);
    return response.data;
  },

  // Mark as paid
  markAsPaid: async (id) => {
    const response = await api.put(`/billings/${id}`, { 
      status: 'Paid',
      date_paid: new Date().toISOString().split('T')[0]
    });
    return response.data;
  }
};

export default billingService;
