import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const documentAPI = {
  // Get all documents for the authenticated user
  getMyDocuments: async (filters = {}) => {
    try {
      const response = await axios.get(`${API_URL}/documents`, {
        headers: getAuthHeaders(),
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  },

  // Download a document
  downloadDocument: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/documents/${id}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      console.error('Error downloading document:', error);
      throw error;
    }
  }
};

export default documentAPI;
