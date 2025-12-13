import api from './api';

// Donation Service
export const donationService = {
  getAll: async (params = {}) => {
    const response = await api.get('/donations', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/donations/${id}`);
    return response.data;
  },

  create: async (donationData) => {
    const response = await api.post('/donations', donationData);
    return response.data;
  },

  update: async (id, donationData) => {
    const response = await api.put(`/donations/${id}`, donationData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/donations/${id}`);
    return response.data;
  },
};

// Event Service
export const eventService = {
  getAll: async (params = {}) => {
    const response = await api.get('/events', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  create: async (eventData) => {
    const response = await api.post('/events', eventData);
    return response.data;
  },

  update: async (id, eventData) => {
    const response = await api.put(`/events/${id}`, eventData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },
};

// Announcement Service
export const announcementService = {
  getAll: async (params = {}) => {
    const response = await api.get('/announcements', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/announcements/${id}`);
    return response.data;
  },

  create: async (announcementData) => {
    const response = await api.post('/announcements', announcementData);
    return response.data;
  },

  update: async (id, announcementData) => {
    const response = await api.put(`/announcements/${id}`, announcementData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/announcements/${id}`);
    return response.data;
  },
};

// Document Service
export const documentService = {
  getAll: async (params = {}) => {
    const response = await api.get('/documents', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },

  create: async (documentData) => {
    const response = await api.post('/documents', documentData);
    return response.data;
  },

  update: async (id, documentData) => {
    const response = await api.put(`/documents/${id}`, documentData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  },
};

// Service Request Service
export const serviceRequestService = {
  getAll: async (params = {}) => {
    const response = await api.get('/service-requests', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/service-requests/${id}`);
    return response.data;
  },

  create: async (requestData) => {
    const response = await api.post('/service-requests', requestData);
    return response.data;
  },

  update: async (id, requestData) => {
    const response = await api.put(`/service-requests/${id}`, requestData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/service-requests/${id}`);
    return response.data;
  },

  updatePaymentStatus: async (id, paymentData) => {
    const response = await api.put(`/service-requests/${id}/payment-status`, paymentData);
    return response.data;
  },
};

// Birth Record Service
export const birthRecordService = {
  getAll: async (params = {}) => {
    const response = await api.get('/birth-records', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/birth-records/${id}`);
    return response.data;
  },

  create: async (recordData) => {
    const response = await api.post('/birth-records', recordData);
    return response.data;
  },

  update: async (id, recordData) => {
    const response = await api.put(`/birth-records/${id}`, recordData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/birth-records/${id}`);
    return response.data;
  },
};

// Message Service
export const messageService = {
  getAll: async (params = {}) => {
    const response = await api.get('/messages', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/messages/${id}`);
    return response.data;
  },

  create: async (messageData) => {
    const response = await api.post('/messages', messageData);
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await api.post(`/messages/${id}/mark-read`);
    return response.data;
  },

  markAllAsRead: async (userId) => {
    const response = await api.post('/messages/mark-all-read', { user_id: userId });
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/messages/${id}`);
    return response.data;
  },
};

// User Service
export const userService = {
  getAll: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  create: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  update: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  resetPassword: async (id, passwordData) => {
    const response = await api.post(`/users/${id}/reset-password`, passwordData);
    return response.data;
  },
};
