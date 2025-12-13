import api from './api';

// Get all certificate requests (admin view)
export const getAllCertificateRequests = async (filters = {}) => {
  try {
    // Debug: Check token
    const token = localStorage.getItem('token');
    console.log('Token exists:', !!token);
    console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'null');
    
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/certificate-requests?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching certificate requests:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

// Get certificate requests for a specific user
export const getUserCertificateRequests = async (userId) => {
  try {
    const response = await api.get(`/certificate-requests/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user certificate requests:', error);
    throw error;
  }
};

// Create new certificate request
export const createCertificateRequest = async (requestData) => {
  try {
    const formData = new FormData();
    
    // Append regular fields
    Object.keys(requestData).forEach(key => {
      if (key !== 'supporting_documents') {
        formData.append(key, requestData[key]);
      }
    });
    
    // Append files if present
    if (requestData.supporting_documents && requestData.supporting_documents.length > 0) {
      requestData.supporting_documents.forEach((file) => {
        formData.append('supporting_documents[]', file);
      });
    }
    
    const response = await api.post('/certificate-requests', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating certificate request:', error);
    throw error;
  }
};

// Update certificate request status
export const updateCertificateStatus = async (id, statusData) => {
  try {
    console.log('Sending status update:', { id, statusData });
    const response = await api.put(`/certificate-requests/${id}/status`, statusData);
    return response.data;
  } catch (error) {
    console.error('Error updating certificate status:', error);
    console.error('Response data:', JSON.stringify(error.response?.data, null, 2));
    console.error('Status code:', error.response?.status);
    throw error;
  }
};

// Upload certificate file
export const uploadCertificateFile = async (id, file) => {
  try {
    const formData = new FormData();
    formData.append('certificate_file', file);
    
    const response = await api.post(`/certificate-requests/${id}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading certificate:', error);
    throw error;
  }
};

// Download certificate (one-time download)
export const downloadCertificate = async (id) => {
  try {
    const response = await api.get(`/certificate-requests/${id}/download`, {
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `certificate-${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 403) {
      throw new Error('Certificate has already been downloaded');
    }
    console.error('Error downloading certificate:', error);
    throw error;
  }
};

// View certificate (admin - no download restriction)
export const viewCertificate = async (id) => {
  try {
    const response = await api.get(`/certificate-requests/${id}/view`, {
      responseType: 'blob'
    });
    
    // Open PDF in new tab
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    window.open(url, '_blank');
    
    return response.data;
  } catch (error) {
    console.error('Error viewing certificate:', error);
    throw error;
  }
};

// Get single certificate request details
export const getCertificateRequest = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/certificate-requests/${id}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching certificate request:', error);
    throw error;
  }
};

// Delete certificate request
export const deleteCertificateRequest = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/certificate-requests/${id}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting certificate request:', error);
    throw error;
  }
};

// Download supporting document
export const downloadSupportingDocument = async (requestId, documentIndex) => {
  try {
    const response = await axios.get(
      `${API_URL}/certificate-requests/${requestId}/document/${documentIndex}`,
      { 
        responseType: 'blob',
        headers: getAuthHeaders()
      }
    );
    
    // Extract filename from content-disposition header or use default
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'document.pdf';
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return response.data;
  } catch (error) {
    console.error('Error downloading document:', error);
    throw error;
  }
};
