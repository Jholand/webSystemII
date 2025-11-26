import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, UserPlus, Shield, Lock } from 'lucide-react';
import ModalOverlay from '../../components/ModalOverlay';

const AccountManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedUser, setSelectedUser] = useState(null);

  const [users, setUsers] = useState([
    {
      id: 1,
      username: 'admin01',
      fullName: 'Administrator User',
      email: 'admin@church.com',
      role: 'admin',
      status: 'Active',
      createdDate: '2025-01-15',
      lastLogin: '2025-11-21 09:30 AM',
    },
    {
      id: 2,
      username: 'priest01',
      fullName: 'Fr. Joseph Smith',
      email: 'fr.joseph@church.com',
      role: 'priest',
      status: 'Active',
      createdDate: '2025-02-10',
      lastLogin: '2025-11-20 02:15 PM',
    },
    {
      id: 3,
      username: 'accountant01',
      fullName: 'Maria Santos',
      email: 'maria.santos@church.com',
      role: 'accountant',
      status: 'Active',
      createdDate: '2025-03-05',
      lastLogin: '2025-11-21 08:00 AM',
    },
    {
      id: 4,
      username: 'user01',
      fullName: 'John Doe',
      email: 'john.doe@church.com',
      role: 'user',
      status: 'Active',
      createdDate: '2025-04-12',
      lastLogin: '2025-11-19 04:45 PM',
    },
    {
      id: 5,
      username: 'churchadmin01',
      fullName: 'Sarah Johnson',
      email: 'sarah.j@church.com',
      role: 'church_admin',
      status: 'Active',
      createdDate: '2025-05-20',
      lastLogin: '2025-11-21 10:00 AM',
    },
    {
      id: 6,
      username: 'user02',
      fullName: 'Pedro Cruz',
      email: 'pedro.cruz@church.com',
      role: 'user',
      status: 'Inactive',
      createdDate: '2025-06-08',
      lastLogin: '2025-10-15 01:20 PM',
    },
  ]);

  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    role: 'user',
    password: '',
    confirmPassword: '',
  });

  const roleLabels = {
    admin: 'Administrator',
    priest: 'Priest',
    accountant: 'Accountant',
    church_admin: 'Church Admin',
    user: 'User',
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddUser = () => {
    setModalMode('add');
    setFormData({
      username: '',
      fullName: '',
      email: '',
      role: 'user',
      password: '',
      confirmPassword: '',
    });
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setModalMode('edit');
    setSelectedUser(user);
    setFormData({
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      password: '',
      confirmPassword: '',
    });
    setShowModal(true);
  };

  const handleViewUser = (user) => {
    setModalMode('view');
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleDeleteUser = (id) => {
    const user = users.find(u => u.id === id);
    if (window.confirm(`Are you sure you want to delete user "${user.fullName}"?`)) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const handleToggleStatus = (id) => {
    setUsers(users.map(u => 
      u.id === id 
        ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' }
        : u
    ));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    if (modalMode === 'add') {
      const newUser = {
        id: users.length + 1,
        username: formData.username,
        fullName: formData.fullName,
        email: formData.email,
        role: formData.role,
        status: 'Active',
        createdDate: new Date().toISOString().split('T')[0],
        lastLogin: 'Never',
      };
      setUsers([...users, newUser]);
    } else if (modalMode === 'edit') {
      setUsers(users.map(u => 
        u.id === selectedUser.id 
          ? { ...u, username: formData.username, fullName: formData.fullName, email: formData.email, role: formData.role }
          : u
      ));
    }
    setShowModal(false);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'priest': return 'bg-purple-100 text-purple-800';
      case 'accountant': return 'bg-green-100 text-green-800';
      case 'church_admin': return 'bg-blue-100 text-blue-800';
      case 'user': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    return status === 'Active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const stats = [
    { label: 'Total Users', value: users.length.toString(), icon: UserPlus, color: 'from-blue-600 to-blue-700' },
    { label: 'Active Users', value: users.filter(u => u.status === 'Active').length.toString(), icon: Shield, color: 'from-green-600 to-green-700' },
    { label: 'Inactive Users', value: users.filter(u => u.status === 'Inactive').length.toString(), icon: Lock, color: 'from-red-600 to-red-700' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50 dark:from-gray-900 dark:via-blue-950 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 animate-fade-in-down">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Account Management</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Manage user accounts</p>
          </div>
          <button
            onClick={handleAddUser}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-lg hover:shadow-blue-500/50"
          >
            <Plus size={20} />
            Add User
          </button>
        </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-md p-6 border-2 border-blue-200 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-100 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">{stat.value}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <stat.icon className="text-blue-600" size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-slate-200">
        <div className="flex flex-col md:flex-row gap-5">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search by username, name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Username</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Full Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Role</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Last Login</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{user.username}</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{user.fullName}</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getRoleBadgeColor(user.role)}`}>
                    {roleLabels[user.role]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleToggleStatus(user.id)}
                    className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(user.status)} cursor-pointer hover:opacity-80 transition`}
                  >
                    {user.status}
                  </button>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{user.lastLogin}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleViewUser(user)}
                      className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                      title="View"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleEditUser(user)}
                      className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            No users found matching your criteria
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <ModalOverlay isOpen={showModal} onClose={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border-2 border-blue-500 ring-4 ring-blue-500/30 shadow-blue-500/50">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900">
                {modalMode === 'add' ? 'Add New User' : modalMode === 'edit' ? 'Edit User' : 'User Details'}
              </h2>
            </div>
            
            {modalMode === 'view' ? (
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Username</p>
                    <p className="font-semibold text-slate-900">{selectedUser?.username}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Full Name</p>
                    <p className="font-semibold text-slate-900">{selectedUser?.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Email</p>
                    <p className="font-semibold text-slate-900">{selectedUser?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Role</p>
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(selectedUser?.role)}`}>
                      {roleLabels[selectedUser?.role]}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Status</p>
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedUser?.status)}`}>
                      {selectedUser?.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Created Date</p>
                    <p className="font-semibold text-slate-900">{selectedUser?.createdDate}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-slate-600">Last Login</p>
                    <p className="font-semibold text-slate-900">{selectedUser?.lastLogin}</p>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="user">User</option>
                      <option value="priest">Priest</option>
                      <option value="accountant">Accountant</option>
                      <option value="church_admin">Church Admin</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                  {modalMode === 'add' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required={modalMode === 'add'}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          required={modalMode === 'add'}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </>
                  )}
                </div>
                
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-blue-500/50"
                  >
                    {modalMode === 'add' ? 'Create User' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </ModalOverlay>
      )}
      </div>
    </div>
  );
};

export default AccountManagement;
