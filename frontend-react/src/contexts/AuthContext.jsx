import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // Load user from localStorage or use default
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('churchUser');
    if (savedUser) {
      return JSON.parse(savedUser);
    }
    return {
      id: 1,
      name: 'Administrator User',
      email: 'admin@church.com',
      role: 'admin', // 'admin', 'priest', 'accountant', 'church_admin', 'user'
    };
  });

  // Auto-detect role from URL path
  useEffect(() => {
    const path = window.location.pathname;
    let detectedRole = 'admin'; // default
    
    if (path.startsWith('/accountant')) {
      detectedRole = 'accountant';
    } else if (path.startsWith('/priest')) {
      detectedRole = 'priest';
    } else if (path.startsWith('/church-admin')) {
      detectedRole = 'church_admin';
    } else if (path.startsWith('/user')) {
      detectedRole = 'user';
    } else if (path.startsWith('/admin')) {
      detectedRole = 'admin';
    }

    // Update role if different from current
    if (user.role !== detectedRole) {
      const roleNames = {
        accountant: 'Accountant',
        priest: 'Priest',
        church_admin: 'Church Admin',
        user: 'User',
        admin: 'Administrator'
      };
      
      setUser(prev => ({
        ...prev,
        role: detectedRole,
        name: `${roleNames[detectedRole]} User`
      }));
    }
  }, [window.location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Save user to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('churchUser', JSON.stringify(user));
  }, [user]);

  const hasPermission = (permission) => {
    const permissions = {
      admin: ['view_all', 'edit_all', 'delete_all', 'view_finances', 'edit_finances', 'view_schedules', 'edit_schedules', 'upload_files', 'view_analytics', 'view_donations', 'view_donation_reports'],
      priest: ['view_schedules', 'view_records', 'upload_files', 'view_donations_total', 'view_own_schedule', 'view_donations', 'view_donation_reports'],
      accountant: ['view_finances', 'edit_finances', 'delete_finances', 'upload_files', 'view_financial_analytics', 'view_donations', 'edit_donations', 'delete_donations', 'encode_donations', 'view_donation_reports'],
      church_admin: ['view_all', 'edit_records', 'view_schedules', 'edit_schedules', 'upload_files', 'view_operational_analytics', 'view_donations', 'view_donation_reports'],
      user: ['view_own_profile', 'view_own_donations'],
    };

    return permissions[user.role]?.includes(permission) || false;
  };

  const changeRole = (newRole) => {
    setUser({ ...user, role: newRole });
  };

  const logout = () => {
    localStorage.removeItem('churchUser');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, hasPermission, changeRole, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
