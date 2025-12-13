import api from './api';

// Message API
export const messageAPI = {
  getAll: (params) => api.get('/messages', { params }),
  getUserMessages: (userId) => api.get(`/messages?user_id=${userId}`),
  create: (data) => api.post('/messages', data),
  update: (id, data) => api.put(`/messages/${id}`, data),
  markAsRead: (id) => api.post(`/messages/${id}/mark-read`),
  markAllAsRead: (userId) => api.post('/messages/mark-all-read', { user_id: userId }),
  delete: (id) => api.delete(`/messages/${id}`),
};

// Payment Record API
export const paymentRecordAPI = {
  getAll: (params) => api.get('/payment-records', { params }),
  getUserPayments: (userId) => api.get(`/payment-records/user/${userId}`),
  create: (data) => api.post('/payment-records', data),
  update: (id, data) => api.put(`/payment-records/${id}`, data),
  delete: (id) => api.delete(`/payment-records/${id}`),
};

// Service Request API (already exists, but adding here for completeness)
export const serviceRequestAPI = {
  getAll: (params) => api.get('/service-requests', { params }),
  getUserRequests: (userId) => api.get(`/service-requests?user_id=${userId}`),
  create: (data) => api.post('/service-requests', data),
  update: (id, data) => api.put(`/service-requests/${id}`, data),
  updatePaymentStatus: (id, data) => api.put(`/service-requests/${id}/payment-status`, data),
  delete: (id) => api.delete(`/service-requests/${id}`),
};

// Appointment API
export const appointmentAPI = {
  getAll: (params) => api.get('/appointments', { params }),
  getUserAppointments: (userId) => api.get(`/appointments?user_id=${userId}`),
  create: (data) => api.post('/appointments', data),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  updatePaymentStatus: (id, data) => api.put(`/appointments/${id}/payment-status`, data),
  delete: (id) => api.delete(`/appointments/${id}`),
};
