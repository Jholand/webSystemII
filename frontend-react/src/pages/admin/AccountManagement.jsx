import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, UserX, Key, Shield, X, Check, Users, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ModalOverlay from '../../components/ModalOverlay';
import { showDeleteConfirm, showSuccessToast, showErrorToast } from '../../utils/sweetAlertHelper';
import { userAPI } from '../../services/dataSync';
import Pagination from '../../components/Pagination';

const AccountManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [users, setUsers] = useState([]);

  // Load users from database on mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userAPI.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
      showErrorToast('Error', 'Failed to load users from database');
    } finally {
      setLoading(false);
    }
  };

  const [createFormData, setCreateFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    password_confirmation: '',
    role: 'user',
    status: 'Active',
  });

  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    username: '',
    role: '',
    status: '',
  });

  const [resetPasswordData, setResetPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const roleLabels = {
    admin: 'Administrator',
    priest: 'Priest',
    accountant: 'Accountant',
    church_admin: 'Church Admin',
    secretary: 'Secretary',
    user: 'User',
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleCreateUser = () => {
    setCreateFormData({
      name: '',
      email: '',
      username: '',
      password: '',
      password_confirmation: '',
      role: 'user',
      status: 'Active',
    });
    setShowCreateModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      status: user.status,
    });
    setShowEditModal(true);
  };

  const handleDeactivateUser = async (user) => {
    const result = await showDeleteConfirm(
      `${user.status === 'Active' ? 'Deactivate' : 'Activate'} User?`, 
      `Are you sure you want to ${user.status === 'Active' ? 'deactivate' : 'activate'} "${user.name}"?`
    );
    if (result.isConfirmed) {
      try {
        const updatedUser = await userAPI.toggleStatus(user.id);
        setUsers(users.map(u => u.id === user.id ? updatedUser : u));
        showSuccessToast('Success!', `User ${user.status === 'Active' ? 'deactivated' : 'activated'} successfully`);
      } catch (error) {
        console.error('Error toggling user status:', error);
        showErrorToast('Error', 'Failed to update user status');
      }
    }
  };

  const handleResetPassword = (user) => {
    setSelectedUser(user);
    setResetPasswordData({
      newPassword: '',
      confirmPassword: '',
    });
    setShowResetPasswordModal(true);
  };

  const handleDeleteUser = async (user) => {
    const result = await showDeleteConfirm('Delete User?', `Are you sure you want to delete user "${user.name}"? This action cannot be undone.`);
    if (result.isConfirmed) {
      try {
        await userAPI.delete(user.id);
        setUsers(users.filter(u => u.id !== user.id));
        showSuccessToast('Deleted!', 'User has been deleted successfully');
      } catch (error) {
        console.error('Error deleting user:', error);
        showErrorToast('Error', 'Failed to delete user');
      }
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (createFormData.password !== createFormData.password_confirmation) {
      showErrorToast('Validation Error', 'Passwords do not match');
      return;
    }
    
    try {
      setLoading(true);
      // Don't send password_confirmation to API
      const { password_confirmation, ...userData } = createFormData;
      console.log('Sending user data:', JSON.stringify(userData, null, 2));
      const newUser = await userAPI.create(userData);
      setUsers([...users, newUser]);
      setShowCreateModal(false);
      showSuccessToast('Success!', 'User created successfully');
    } catch (error) {
      console.error('Error creating user:', error);
      console.error('Error response:', error.response);
      // Extract validation errors from Laravel response
      if (error.response?.data?.errors) {
        const errors = Object.values(error.response.data.errors).flat();
        console.error('Validation errors:', errors);
        showErrorToast('Validation Failed', errors.join('\n'));
      } else {
        const errorMessage = error.response?.data?.message || 'Failed to create user';
        showErrorToast('Error', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updatedUser = await userAPI.update(selectedUser.id, editFormData);
      setUsers(users.map(u => u.id === selectedUser.id ? updatedUser : u));
      setShowEditModal(false);
      showSuccessToast('Success!', 'User updated successfully!');
    } catch (error) {
      console.error('Error updating user:', error);
      // Extract validation errors from Laravel response
      if (error.response?.data?.errors) {
        const errors = Object.values(error.response.data.errors).flat();
        showErrorToast('Validation Error', errors.join(', '));
      } else {
        const errorMessage = error.response?.data?.message || 'Failed to update user';
        showErrorToast('Error', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      showErrorToast('Error!', 'Passwords do not match');
      return;
    }
    try {
      setLoading(true);
      await userAPI.resetPassword(selectedUser.id, {
        password: resetPasswordData.newPassword,
        password_confirmation: resetPasswordData.confirmPassword
      });
      setShowResetPasswordModal(false);
      showSuccessToast('Success!', `Password reset successfully for ${selectedUser.name}`);
    } catch (error) {
      console.error('Error resetting password:', error);
      const errorMessage = error.response?.data?.message || 'Failed to reset password';
      showErrorToast('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Pagination logic
  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-700 border-red-200';
      case 'priest': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'accountant': return 'bg-green-100 text-green-700 border-green-200';
      case 'church_admin': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'user': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusBadgeColor = (status) => {
    return status === 'Active' 
      ? 'bg-green-100 text-green-700 border-green-200' 
      : 'bg-red-100 text-red-700 border-red-200';
  };

  return (
    <div className="min-h-screen bg-white">
      <div>
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#4158D0' }}>User Management</h1>
              <p className="text-gray-600 mt-1">Manage system users and permissions</p>
            </div>
            <button
              onClick={handleCreateUser}
              className="flex items-center gap-2 px-5 py-3 text-white rounded-lg shadow-lg transition-all font-semibold hover:shadow-xl backdrop-blur-sm"
              style={{ 
                background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
              }}
            >
              <Plus size={20} />
              Create User
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-gray-50">
          <div className="bg-white rounded-lg p-5 shadow hover:shadow-lg transition-all border border-gray-200 cursor-pointer group">
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 rounded-lg group-hover:scale-110 transition-transform" style={{ backgroundColor: '#E8E9F5' }}>
                <Users size={24} style={{ color: '#4158D0' }} />
              </div>
              <TrendingUp size={16} className="text-gray-400" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{users.length}</h3>
            <p className="text-sm font-semibold text-gray-700 mb-1">Total Users</p>
            <p className="text-xs text-gray-500">All registered accounts</p>
          </div>
          <div className="bg-white rounded-lg p-5 shadow hover:shadow-lg transition-all border border-gray-200 cursor-pointer group">
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 rounded-lg group-hover:scale-110 transition-transform" style={{ backgroundColor: '#d1fae5' }}>
                <Check size={24} style={{ color: '#10b981' }} />
              </div>
              <TrendingUp size={16} className="text-gray-400" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{users.filter(u => u.status === 'Active').length}</h3>
            <p className="text-sm font-semibold text-gray-700 mb-1">Active Users</p>
            <p className="text-xs text-gray-500">Currently active accounts</p>
          </div>
          <div className="bg-white rounded-lg p-5 shadow hover:shadow-lg transition-all border border-gray-200 cursor-pointer group">
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 rounded-lg group-hover:scale-110 transition-transform" style={{ backgroundColor: '#fee2e2' }}>
                <UserX size={24} style={{ color: '#ef4444' }} />
              </div>
              <TrendingUp size={16} className="text-gray-400" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{users.filter(u => u.status === 'Inactive').length}</h3>
            <p className="text-sm font-semibold text-gray-700 mb-1">Inactive Users</p>
            <p className="text-xs text-gray-500">Deactivated accounts</p>
          </div>
          <div className="bg-white rounded-lg p-5 shadow hover:shadow-lg transition-all border border-gray-200 cursor-pointer group">
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 rounded-lg group-hover:scale-110 transition-transform" style={{ backgroundColor: '#fef3c7' }}>
                <Shield size={24} style={{ color: '#f59e0b' }} />
              </div>
              <TrendingUp size={16} className="text-gray-400" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{users.filter(u => u.role === 'admin').length}</h3>
            <p className="text-sm font-semibold text-gray-700 mb-1">Administrators</p>
            <p className="text-xs text-gray-500">Admin role accounts</p>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="bg-white shadow-sm p-6 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Search size={20} style={{ color: '#4158D0' }} />
            <h2 className="text-lg font-bold text-gray-900">User Status</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {['all', 'Active', 'Inactive'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-6 py-2.5 rounded-xl font-semibold transition-all ${
                  filterStatus === status
                    ? 'shadow-lg'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                style={{
                  background: filterStatus === status ? 'rgba(65, 88, 208, 0.1)' : 'transparent',
                  backdropFilter: filterStatus === status ? 'blur(10px)' : 'none',
                  WebkitBackdropFilter: filterStatus === status ? 'blur(10px)' : 'none',
                  color: filterStatus === status ? '#4158D0' : undefined,
                  border: filterStatus === status ? '1px solid rgba(65, 88, 208, 0.2)' : '1px solid transparent',
                  boxShadow: filterStatus === status ? '0 4px 12px rgba(65, 88, 208, 0.15)' : 'none'
                }}
              >
                {status === 'all' ? 'All Status' : status}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow-sm p-6 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Search size={20} style={{ color: '#4158D0' }} />
            <h2 className="text-lg font-bold text-gray-900">Search & Filter</h2>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, email, or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all"
                style={{ focusRing: '2px solid rgba(102, 126, 234, 0.5)' }}
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all font-medium"
            >
              <option value="all">All Roles</option>
              <option value="admin">Administrator</option>
              <option value="priest">Priest</option>
              <option value="accountant">Accountant</option>
              <option value="church_admin">Church Admin</option>
              <option value="user">User</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        {/* Users Table */}
        {loading && users.length === 0 ? (
          <div className="bg-white p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading users...</p>
          </div>
        ) : (
          <div className="bg-white overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div 
                        className="w-10 h-10 rounded-xl shadow-lg flex items-center justify-center text-white font-semibold text-sm"
                        style={{ background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)' }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">@{user.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getRoleBadgeColor(user.role)}`}>
                      {roleLabels[user.role]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadgeColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatDate(user.last_login)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit User"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeactivateUser(user)}
                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        title={user.status === 'Active' ? 'Deactivate' : 'Activate'}
                      >
                        <UserX size={18} />
                      </button>
                      <button
                        onClick={() => handleResetPassword(user)}
                        className="p-2 text-blue-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Reset Password"
                      >
                        <Key size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete User"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            currentPage={currentPage}
            totalItems={filteredUsers.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(value) => {
              setItemsPerPage(value);
              setCurrentPage(1);
            }}
          />
          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg font-medium">No users found</p>
              <p className="text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
        )}

        {/* Role Permissions Quick Access */}
        {/* Create User Modal */}
        {showCreateModal && (
          <ModalOverlay isOpen={showCreateModal} onClose={() => setShowCreateModal(false)}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
                <h2 className="text-2xl font-bold text-white">Create New User</h2>
                <p className="text-blue-100 text-sm mt-1">Add a new user to the system</p>
              </div>
              
              <form onSubmit={handleCreateSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={createFormData.name}
                      onChange={(e) => setCreateFormData({...createFormData, name: e.target.value})}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      value={createFormData.email}
                      onChange={(e) => setCreateFormData({...createFormData, email: e.target.value})}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="user@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Username *</label>
                    <input
                      type="text"
                      value={createFormData.username}
                      onChange={(e) => setCreateFormData({...createFormData, username: e.target.value})}
                      required
                      autoComplete="username"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Password *</label>
                    <input
                      type="password"
                      value={createFormData.password}
                      onChange={(e) => setCreateFormData({...createFormData, password: e.target.value})}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="••••••••"
                    />
                    <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password *</label>
                    <input
                      type="password"
                      value={createFormData.password_confirmation}
                      onChange={(e) => setCreateFormData({...createFormData, password_confirmation: e.target.value})}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Role *</label>
                    <select
                      value={createFormData.role}
                      onChange={(e) => setCreateFormData({...createFormData, role: e.target.value})}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="user">User</option>
                      <option value="priest">Priest</option>
                      <option value="accountant">Accountant</option>
                      <option value="church_admin">Church Admin</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status *</label>
                    <select
                      value={createFormData.status}
                      onChange={(e) => setCreateFormData({...createFormData, status: e.target.value})}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 text-white rounded-lg shadow-lg hover:shadow-xl transition-all font-medium"
                    style={{ 
                      background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                    }}
                  >
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </ModalOverlay>
        )}

        {/* Edit User Modal */}
        {showEditModal && (
          <ModalOverlay isOpen={showEditModal} onClose={() => setShowEditModal(false)}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-600 to-emerald-700">
                <h2 className="text-2xl font-bold text-white">Edit User</h2>
                <p className="text-emerald-100 text-sm mt-1">Update user information</p>
              </div>
              
              <form onSubmit={handleEditSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="user@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Username *</label>
                    <input
                      type="text"
                      value={editFormData.username}
                      onChange={(e) => setEditFormData({...editFormData, username: e.target.value})}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Role *</label>
                    <select
                      value={editFormData.role}
                      onChange={(e) => setEditFormData({...editFormData, role: e.target.value})}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="user">User</option>
                      <option value="priest">Priest</option>
                      <option value="accountant">Accountant</option>
                      <option value="church_admin">Church Admin</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status *</label>
                    <select
                      value={editFormData.status}
                      onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all shadow-lg hover:shadow-xl font-medium"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </ModalOverlay>
        )}

        {/* Reset Password Modal */}
        {showResetPasswordModal && (
          <ModalOverlay isOpen={showResetPasswordModal} onClose={() => setShowResetPasswordModal(false)}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
                <h2 className="text-2xl font-bold text-white">Reset Password</h2>
                <p className="text-purple-100 text-sm mt-1">Set a new password for {selectedUser?.name}</p>
              </div>
              
              <form onSubmit={handleResetPasswordSubmit} className="p-6">
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">New Password *</label>
                    <input
                      type="password"
                      value={resetPasswordData.newPassword}
                      onChange={(e) => setResetPasswordData({...resetPasswordData, newPassword: e.target.value})}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password *</label>
                    <input
                      type="password"
                      value={resetPasswordData.confirmPassword}
                      onChange={(e) => setResetPasswordData({...resetPasswordData, confirmPassword: e.target.value})}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowResetPasswordModal(false)}
                    className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 text-white rounded-lg shadow-lg hover:shadow-xl transition-all font-medium"
                    style={{ 
                      background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                    }}
                  >
                    Reset Password
                  </button>
                </div>
              </form>
            </div>
          </ModalOverlay>
        )}
      </div>
    </div>
  );
};

export default AccountManagement;
