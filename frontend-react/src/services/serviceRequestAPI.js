import axios from 'axios';
import { getAuthHeaders } from './apiConfig';

const API_URL = 'http://localhost:8000/api/service-requests';

export const serviceRequestAPI = {
  getAll: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.type && filters.type !== 'all') params.append('type', filters.type);
      if (filters.is_paid !== undefined) params.append('is_paid', filters.is_paid);
      if (filters.search) params.append('search', filters.search);
      if (filters.user_id) params.append('user_id', filters.user_id);

      const response = await axios.get(`${API_URL}?${params.toString()}`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching service requests:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching service request:', error);
      throw error;
    }
  },

  create: async (requestData) => {
    try {
      const response = await axios.post(API_URL, requestData, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error creating service request:', error);
      throw error;
    }
  },

  update: async (id, requestData) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, requestData, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error updating service request:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/${id}`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting service request:', error);
      throw error;
    }
  },

  updatePaymentStatus: async (id, isPaid, paymentId = null) => {
    try {
      const response = await axios.put(`${API_URL}/${id}/payment-status`, {
        is_paid: isPaid,
        payment_id: paymentId
      }, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  },

  approve: async (id, notes = null) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, {
        status: 'approved',
        admin_notes: notes
      }, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error approving request:', error);
      throw error;
    }
  },

  reject: async (id, reason) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, {
        status: 'rejected',
        admin_notes: reason
      }, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error rejecting request:', error);
      throw error;
    }
  },

  assignStaff: async (id, staffId) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, {
        assigned_staff_id: staffId
      }, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error assigning staff:', error);
      throw error;
    }
  }
};
