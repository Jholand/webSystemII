import { auditLogAPI } from '../services/dataSync';

/**
 * Centralized audit logging utility
 * Logs all user activities across the system
 */
export const logActivity = async ({
  action,
  module,
  details,
  userId,
  userName,
  userRole,
  recordId = null,
  oldValue = null,
  newValue = null,
  metadata = {}
}) => {
  try {
    const auditData = {
      user_id: userId,
      user_name: userName,
      user_role: userRole,
      action: action, // CREATE, UPDATE, DELETE, VIEW, EXPORT, LOGIN, LOGOUT, etc.
      module: module, // e.g., 'Donations', 'Service Payments', 'Members', etc.
      details: details,
      record_id: recordId,
      old_value: oldValue ? JSON.stringify(oldValue) : null,
      new_value: newValue ? JSON.stringify(newValue) : null,
      ip_address: metadata.ip || 'N/A',
      user_agent: metadata.userAgent || navigator.userAgent,
      timestamp: new Date().toISOString(),
      metadata: JSON.stringify(metadata)
    };

    // Save to backend
    await auditLogAPI.create(auditData);

    // Also save to localStorage as backup
    const localLogs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
    localLogs.unshift(auditData);
    // Keep only last 1000 logs in localStorage
    if (localLogs.length > 1000) {
      localLogs.pop();
    }
    localStorage.setItem('auditLogs', JSON.stringify(localLogs));

    // Dispatch event to notify audit log page
    window.dispatchEvent(new CustomEvent('auditLogUpdated', { detail: auditData }));

    console.log('✅ Audit log created:', action, module, details);
  } catch (error) {
    console.error('❌ Error creating audit log:', error);
    // Still save to localStorage if backend fails
    try {
      const localLogs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
      localLogs.unshift({
        user_id: userId,
        user_name: userName,
        user_role: userRole,
        action,
        module,
        details,
        timestamp: new Date().toISOString(),
        synced: false
      });
      localStorage.setItem('auditLogs', JSON.stringify(localLogs));
    } catch (localError) {
      console.error('Failed to save audit log to localStorage:', localError);
    }
  }
};

/**
 * Helper functions for common audit actions
 */
export const auditActions = {
  // Authentication
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  
  // CRUD operations
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  VIEW: 'VIEW',
  
  // Special actions
  EXPORT: 'EXPORT',
  IMPORT: 'IMPORT',
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
  VOID: 'VOID',
  RESTORE: 'RESTORE',
  DOWNLOAD: 'DOWNLOAD',
  UPLOAD: 'UPLOAD',
  PRINT: 'PRINT',
  SEND: 'SEND',
  PAYMENT: 'PAYMENT',
  REFUND: 'REFUND'
};

/**
 * Helper functions for common modules
 */
export const auditModules = {
  USERS: 'User Management',
  MEMBERS: 'Member Records',
  DONATIONS: 'Donations & Collections',
  PAYMENTS: 'Payment Records',
  SERVICE_REQUESTS: 'Service Requests',
  APPOINTMENTS: 'Appointments',
  EVENTS: 'Events',
  SCHEDULES: 'Schedules',
  MARRIAGE: 'Marriage Records',
  BAPTISM: 'Baptism Records',
  BIRTH: 'Birth Records',
  DEATH: 'Death Records',
  CERTIFICATES: 'Certificates',
  FINANCIAL_DOCS: 'Financial Documents',
  REPORTS: 'Reports',
  SETTINGS: 'System Settings',
  CATEGORIES: 'Categories & Settings'
};

export default logActivity;
