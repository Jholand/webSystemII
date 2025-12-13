import api from './api';

const API_URL = 'http://127.0.0.1:8000/api';

// Helper function to get auth headers (for non-api axios calls)
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json'
  };
};

// Correction Requests API
export const correctionRequestAPI = {
    getAll: async (params = {}) => {
        const response = await api.get('/correction-requests', { params });
        return response.data;
    },
    
    getByUserId: async (userId) => {
        const response = await api.get('/correction-requests', { 
            params: { user_id: userId }
        });
        return response.data;
    },

    // Alias for getByUserId for compatibility
    getUserRequests: async (userId) => {
        const response = await api.get('/correction-requests', { 
            params: { user_id: userId }
        });
        return response.data;
    },
    
    create: async (data) => {
        const response = await api.post('/correction-requests', data);
        return response.data;
    },
    
    update: async (id, data) => {
        const response = await api.put(`/correction-requests/${id}`, data);
        return response.data;
    },
    
    delete: async (id) => {
        const response = await api.delete(`/correction-requests/${id}`);
        return response.data;
    }
};

// User Notifications API
export const userNotificationAPI = {
    getAll: async () => {
        const response = await api.get('/user-notifications');
        return response.data;
    },

    // Alias for getAll for compatibility
    getUserNotifications: async () => {
        const response = await api.get('/user-notifications');
        return response.data;
    },
    
    create: async (data) => {
        const response = await api.post('/user-notifications', data);
        return response.data;
    },
    
    markAsRead: async (id) => {
        const response = await api.put(`/user-notifications/${id}`, { read: true });
        return response.data;
    },
    
    markAllAsRead: async () => {
        const response = await api.post('/user-notifications/mark-all-read');
        return response.data;
    }
};

// Audit Logs API
export const auditLogAPI = {
    getAll: async (params = {}) => {
        const response = await api.get('/audit-logs', { params });
        return response.data;
    },
    
    create: async (data) => {
        const response = await api.post('/audit-logs', data);
        return response.data;
    }
};

// Sync localStorage data to database
export const syncLocalStorageToDatabase = async (userId) => {
    try {
        // Sync correction requests
        const correctionRequests = JSON.parse(localStorage.getItem('correctionRequests') || '[]');
        for (const request of correctionRequests) {
            if (!request.synced) {
                await correctionRequestAPI.create({
                    ...request,
                    user_id: request.userId || userId
                });
                request.synced = true;
            }
        }
        localStorage.setItem('correctionRequests', JSON.stringify(correctionRequests));
        
        // Sync notifications
        const notifications = JSON.parse(localStorage.getItem('userNotifications') || '[]');
        for (const notif of notifications) {
            if (!notif.synced && String(notif.userId) === String(userId)) {
                await userNotificationAPI.create({
                    ...notif,
                    user_id: notif.userId || userId
                });
                notif.synced = true;
            }
        }
        localStorage.setItem('userNotifications', JSON.stringify(notifications));
        
        // Sync audit logs
        const auditLogs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
        for (const log of auditLogs) {
            if (!log.synced) {
                await auditLogAPI.create(log);
                log.synced = true;
            }
        }
        localStorage.setItem('auditLogs', JSON.stringify(auditLogs));
        
        console.log('✅ All localStorage data synced to database');
        return true;
    } catch (error) {
        console.error('❌ Error syncing localStorage to database:', error);
        return false;
    }
};

// Load data from database to localStorage (for offline capability)
export const loadDataFromDatabase = async (userId) => {
    try {
        // Load correction requests
        const correctionRequests = await correctionRequestAPI.getByUserId(userId);
        localStorage.setItem('correctionRequests', JSON.stringify(correctionRequests));
        
        // Load notifications
        const notifications = await userNotificationAPI.getAll(userId);
        localStorage.setItem('userNotifications', JSON.stringify(notifications));
        
        // Load audit logs (for admins)
        const auditLogs = await auditLogAPI.getAll();
        localStorage.setItem('auditLogs', JSON.stringify(auditLogs));
        
        console.log('✅ All data loaded from database to localStorage');
        return true;
    } catch (error) {
        console.error('❌ Error loading data from database:', error);
        return false;
    }
};

// Donation Category API
export const donationCategoryAPI = {
    getAll: async () => {
        const response = await api.get('/donation-categories');
        return response.data;
    },
    
    create: async (data) => {
        const response = await api.post('/donation-categories', data);
        return response.data;
    },
    
    update: async (id, data) => {
        const response = await api.put(`/donation-categories/${id}`, data);
        return response.data;
    },
    
    delete: async (id) => {
        const response = await api.delete(`/donation-categories/${id}`);
        return response.data;
    }
};

// Event Fee Category API
export const eventFeeCategoryAPI = {
    getAll: async () => {
        const response = await api.get('/event-fee-categories');
        return response.data;
    },
    
    create: async (data) => {
        const response = await api.post('/event-fee-categories', data);
        return response.data;
    },
    
    update: async (id, data) => {
        const response = await api.put(`/event-fee-categories/${id}`, data);
        return response.data;
    },
    
    delete: async (id) => {
        const response = await api.delete(`/event-fee-categories/${id}`);
        return response.data;
    }
};

// User Management API
export const userAPI = {
    getAll: async (params = {}) => {
        const response = await api.get('/users', { params });
        return response.data;
    },
    
    create: async (data) => {
        const response = await api.post('/users', data);
        return response.data;
    },
    
    show: async (id) => {
        const response = await api.get(`/users/${id}`);
        return response.data;
    },
    
    update: async (id, data) => {
        const response = await api.put(`/users/${id}`, data);
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
    
    toggleStatus: async (id) => {
        const response = await api.post(`/users/${id}/toggle-status`);
        return response.data;
    }
};

// Member API
export const memberAPI = {
    getAll: async (params = {}) => {
        const response = await api.get('/members', { params });
        return response.data;
    },
    create: async (data) => {
        const response = await api.post('/members', data);
        return response.data;
    },
    show: async (id) => {
        const response = await api.get(`/members/${id}`);
        return response.data;
    },
    update: async (id, data) => {
        const response = await api.put(`/members/${id}`, data);
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/members/${id}`);
        return response.data;
    },
    toggleStatus: async (id) => {
        const response = await api.post(`/members/${id}/toggle-status`);
        return response.data;
    }
};

// Priest API
export const priestAPI = {
    getAll: async (params = {}) => {
        const response = await api.get('/priests', { params });
        return response.data;
    },
    create: async (data) => {
        const response = await api.post('/priests', data);
        return response.data;
    },
    show: async (id) => {
        const response = await api.get(`/priests/${id}`);
        return response.data;
    },
    update: async (id, data) => {
        const response = await api.put(`/priests/${id}`, data);
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/priests/${id}`);
        return response.data;
    }
};

// Schedule/Appointment API
export const scheduleAPI = {
    getAll: async (params = {}) => {
        const response = await api.get('/schedules', { params });
        return response.data;
    },
    create: async (data) => {
        const response = await api.post('/schedules', data);
        return response.data;
    },
    show: async (id) => {
        const response = await api.get(`/schedules/${id}`);
        return response.data;
    },
    update: async (id, data) => {
        const response = await api.put(`/schedules/${id}`, data);
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/schedules/${id}`);
        return response.data;
    }
};

// Marriage Record API
export const marriageRecordAPI = {
    getAll: async (params = {}) => {
        const response = await api.get('/marriage-records', { params });
        return response.data;
    },
    create: async (data) => {
        const response = await api.post('/marriage-records', data);
        return response.data;
    },
    show: async (id) => {
        const response = await api.get(`/marriage-records/${id}`);
        return response.data;
    },
    update: async (id, data) => {
        const response = await api.put(`/marriage-records/${id}`, data);
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/marriage-records/${id}`);
        return response.data;
    }
};

// Baptism Record API
export const baptismRecordAPI = {
    getAll: async (params = {}) => {
        const response = await api.get('/baptism-records', { params });
        return response.data;
    },
    create: async (data) => {
        const response = await api.post('/baptism-records', data);
        return response.data;
    },
    show: async (id) => {
        const response = await api.get(`/baptism-records/${id}`);
        return response.data;
    },
    update: async (id, data) => {
        const response = await api.put(`/baptism-records/${id}`, data);
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/baptism-records/${id}`);
        return response.data;
    }
};

// Donation API
export const donationAPI = {
    getAll: async (params = {}) => {
        const response = await api.get('/donations', { params });
        return response.data;
    },
    create: async (data) => {
        const response = await api.post('/donations', data);
        return response.data;
    },
    show: async (id) => {
        const response = await api.get(`/donations/${id}`);
        return response.data;
    },
    update: async (id, data) => {
        const response = await api.put(`/donations/${id}`, data);
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/donations/${id}`);
        return response.data;
    }
};

// Payment Record API
export const paymentRecordAPI = {
    getAll: async (params = {}) => {
        const response = await api.get('/payment-records', { params });
        return response.data;
    },
    getUserPayments: async (userId) => {
        const response = await api.get(`/payment-records/user/${userId}`);
        return response.data;
    },
    create: async (data) => {
        const response = await api.post('/payment-records', data);
        return response.data;
    },
    show: async (id) => {
        const response = await api.get(`/payment-records/${id}`);
        return response.data;
    },
    update: async (id, data) => {
        const response = await api.put(`/payment-records/${id}`, data);
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/payment-records/${id}`);
        return response.data;
    }
};

// Appointments API
export const appointmentAPI = {
    getAll: async (params = {}) => {
        const response = await api.get('/appointments', { params });
        return response.data;
    },
    create: async (data) => {
        const response = await api.post('/appointments', data);
        return response.data;
    },
    show: async (id) => {
        const response = await api.get(`/appointments/${id}`);
        return response.data;
    },
    update: async (id, data) => {
        const response = await api.put(`/appointments/${id}`, data);
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/appointments/${id}`);
        return response.data;
    },
    updatePaymentStatus: async (id, data) => {
        const response = await api.put(`/appointments/${id}/payment-status`, data);
        return response.data;
    }
};

// Events API
export const eventAPI = {
    getAll: async (params = {}) => {
        const response = await api.get('/events', { params });
        return response.data;
    },
    create: async (data) => {
        const response = await api.post('/events', data);
        return response.data;
    },
    show: async (id) => {
        const response = await api.get(`/events/${id}`);
        return response.data;
    },
    update: async (id, data) => {
        const response = await api.put(`/events/${id}`, data);
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/events/${id}`);
        return response.data;
    }
};

// Certificate Requests API
export const certificateRequestAPI = {
    getAll: async (params = {}) => {
        const response = await api.get('/certificate-requests', { params });
        return response.data;
    },
    getUserRequests: async (userId) => {
        const response = await api.get('/certificate-requests', { 
            params: { user_id: userId } 
        });
        return response.data;
    }
};




