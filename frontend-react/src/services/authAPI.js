import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const authAPI = {
  register: async (userData) => {
    try {
      console.log('Registering user with data:', userData);
      const response = await axios.post(`${API_URL}/register`, userData);
      console.log('Registration response:', response.data);
      
      // Store token and user info
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('userId', response.data.user.id);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error registering user:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  login: async (credentials) => {
    try {
      console.log('Login attempt with email:', credentials.email);
      const response = await axios.post(`${API_URL}/login`, credentials);
      
      // Store token and user info
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('userId', response.data.user.id);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error logging in:', error);
      console.error('Error response:', error.response?.data);
      console.error('Status:', error.response?.status);
      throw error;
    }
  },

  logout: async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await axios.post(`${API_URL}/logout`, {}, {
          headers: getAuthHeaders()
        });
      }
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      // Always clear local storage even if API call fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
    }
  },

  getProfile: async () => {
    try {
      const response = await axios.get(`${API_URL}/profile`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await axios.put(`${API_URL}/profile`, profileData, {
        headers: getAuthHeaders()
      });
      
      // Update stored user info
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }
};
