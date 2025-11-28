import api from './api';

export const memberService = {
  // Get all members with optional filters
  getAll: async (params = {}) => {
    const response = await api.get('/members', { params });
    return response.data;
  },

  // Get single member
  getById: async (id) => {
    const response = await api.get(`/members/${id}`);
    return response.data;
  },

  // Create new member
  create: async (memberData) => {
    const response = await api.post('/members', memberData);
    return response.data;
  },

  // Update member
  update: async (id, memberData) => {
    const response = await api.put(`/members/${id}`, memberData);
    return response.data;
  },

  // Delete member
  delete: async (id) => {
    const response = await api.delete(`/members/${id}`);
    return response.data;
  },

  // Toggle member status
  toggleStatus: async (id) => {
    const response = await api.post(`/members/${id}/toggle-status`);
    return response.data;
  },
};

export const priestService = {
  // Get all priests
  getAll: async () => {
    const response = await api.get('/priests');
    return response.data;
  },

  // Get single priest
  getById: async (id) => {
    const response = await api.get(`/priests/${id}`);
    return response.data;
  },

  // Create new priest
  create: async (priestData) => {
    const response = await api.post('/priests', priestData);
    return response.data;
  },

  // Update priest
  update: async (id, priestData) => {
    const response = await api.put(`/priests/${id}`, priestData);
    return response.data;
  },

  // Delete priest
  delete: async (id) => {
    const response = await api.delete(`/priests/${id}`);
    return response.data;
  },
};

export const scheduleService = {
  // Get all schedules with optional filters
  getAll: async (params = {}) => {
    const response = await api.get('/schedules', { params });
    return response.data;
  },

  // Get single schedule
  getById: async (id) => {
    const response = await api.get(`/schedules/${id}`);
    return response.data;
  },

  // Create new schedule
  create: async (scheduleData) => {
    const response = await api.post('/schedules', scheduleData);
    return response.data;
  },

  // Update schedule
  update: async (id, scheduleData) => {
    const response = await api.put(`/schedules/${id}`, scheduleData);
    return response.data;
  },

  // Delete schedule
  delete: async (id) => {
    const response = await api.delete(`/schedules/${id}`);
    return response.data;
  },
};
