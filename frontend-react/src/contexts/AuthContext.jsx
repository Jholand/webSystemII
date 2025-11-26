import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // Mock user - in production, this would come from your backend
  const [user, setUser] = useState({
    id: 1,
    name: 'Administrator User',
    email: 'admin@church.com',
    role: 'admin', // 'admin', 'priest', 'accountant', 'church_admin', 'user'
  });

  const hasPermission = (permission) => {
    const permissions = {
      admin: ['view_all', 'edit_all', 'delete_all', 'view_finances', 'edit_finances', 'view_schedules', 'edit_schedules', 'upload_files', 'view_analytics'],
      priest: ['view_schedules', 'view_records', 'upload_files', 'view_donations_total', 'view_own_schedule'],
      accountant: ['view_finances', 'edit_finances', 'delete_finances', 'upload_files', 'view_financial_analytics'],
      church_admin: ['view_all', 'edit_records', 'view_schedules', 'edit_schedules', 'upload_files', 'view_operational_analytics'],
      user: ['view_own_profile'],
    };

    return permissions[user.role]?.includes(permission) || false;
  };

  const changeRole = (newRole) => {
    setUser({ ...user, role: newRole });
  };

  const logout = () => {
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, hasPermission, changeRole, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
