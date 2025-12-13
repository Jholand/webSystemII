import api from './api';

export const serviceRequestTypeAPI = {
  getAll: async () => {
    const response = await api.get('/service-request-types');
    return response.data;
  },
  
  show: async (id) => {
    const response = await api.get(`/service-request-types/${id}`);
    return response.data;
  }
};
