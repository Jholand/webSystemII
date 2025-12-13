import axios from 'axios';
import { getAuthHeaders } from './apiConfig';

const API_BASE_URL = 'http://localhost:8000/api';

const appointmentAPI = {
  // Get all appointments
  getAll: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.type && filters.type !== 'all') params.append('type', filters.type);
      if (filters.is_paid !== undefined) params.append('is_paid', filters.is_paid);
      if (filters.search) params.append('search', filters.search);

      const response = await axios.get(`${API_BASE_URL}/appointments?${params.toString()}`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  },

  // Get single appointment
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/appointments/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching appointment:', error);
      throw error;
    }
  },

  // Create new appointment
  create: async (appointmentData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/appointments`, appointmentData, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  },

  // Update appointment
  update: async (id, appointmentData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/appointments/${id}`, appointmentData, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  },

  // Delete appointment
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/appointments/${id}`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    }
  },

  // Update payment status
  updatePaymentStatus: async (id, isPaid, paymentId = null) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/appointments/${id}/payment-status`, {
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
  }
};

export default appointmentAPI;
