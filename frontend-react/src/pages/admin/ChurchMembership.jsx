import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Download, UserCheck, UserX } from 'lucide-react';
import ModalOverlay from '../../components/ModalOverlay';

const ChurchMembership = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const [members, setMembers] = useState([
    {
      id: 1,
      name: 'Michael James Anderson',
      email: 'michael.anderson@email.com',
      phone: '+1234567890',
      address: '123 Main St, City',
      dateJoined: '2020-01-15',
      status: 'Active',
      ministry: 'Choir',
    },
    {
      id: 2,
      name: 'Sarah Elizabeth Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1234567891',
      address: '456 Oak Ave, City',
      dateJoined: '2019-05-22',
      status: 'Active',
      ministry: 'Youth Ministry',
    },
    {
      id: 3,
      name: 'Robert David Wilson',
      email: 'robert.wilson@email.com',
      phone: '+1234567892',
      address: '789 Pine Rd, City',
      dateJoined: '2021-08-10',
      status: 'Inactive',
      ministry: 'None',
    },
    {
      id: 4,
      name: 'Emily Grace Brown',
      email: 'emily.brown@email.com',
      phone: '+1234567893',
      address: '321 Elm St, City',
      dateJoined: '2022-03-18',
      status: 'Active',
      ministry: 'Sunday School',
    },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateJoined: '',
    ministry: '',
  });

  const handleAddNew = () => {
    setModalMode('add');
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      dateJoined: '',
      ministry: '',
    });
    setShowModal(true);
  };

  const handleEdit = (member) => {
    setModalMode('edit');
    setFormData(member);
    setShowModal(true);
  };

  const handleView = (member) => {
    setModalMode('view');
    setFormData(member);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this member?')) {
      setMembers(members.filter(m => m.id !== id));
    }
  };

  const toggleStatus = (id) => {
    setMembers(members.map(m => 
      m.id === id ? { ...m, status: m.status === 'Active' ? 'Inactive' : 'Active' } : m
    ));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modalMode === 'add') {
      setMembers([...members, { ...formData, id: members.length + 1, status: 'Active' }]);
    } else if (modalMode === 'edit') {
      setMembers(members.map(m => m.id === formData.id ? formData : m));
    }
    setShowModal(false);
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.ministry.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || member.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: members.length,
    active: members.filter(m => m.status === 'Active').length,
    inactive: members.filter(m => m.status === 'Inactive').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50 dark:from-gray-900 dark:via-blue-950 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in-down">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Church Membership</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Manage church members</p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-lg hover:shadow-blue-500/50"
        >
          <Plus size={20} />
          Add New Member
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border-2 border-blue-200 rounded-2xl shadow-md p-6 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-100 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-semibold">Active Members</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{stats.active}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-3 rounded-xl">
              <UserCheck className="text-blue-700" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-semibold">Active Members</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{stats.active}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-xl">
              <UserCheck className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-blue-200 rounded-2xl shadow-md p-6 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-100 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-semibold">Inactive Members</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{stats.inactive}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-xl">
              <UserX className="text-red-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-2 border-blue-200 rounded-2xl shadow-sm p-6 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-100 transition-all duration-300">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, email, or ministry..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all text-sm text-slate-900 placeholder:text-slate-400"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all text-sm text-slate-900"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-lg hover:shadow-blue-500/50">
            <Download size={20} />
            Export
          </button>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Ministry
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Date Joined
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">{member.name}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-900 dark:text-gray-100 font-medium text-sm">{member.email}</div>
                    <div className="text-gray-600 dark:text-gray-400 text-xs">{member.phone}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{member.ministry}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{member.dateJoined}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleStatus(member.id)}
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        member.status === 'Active' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50' 
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50'
                      } transition-colors`}
                    >
                      {member.status}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleView(member)}
                        className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                        title="View"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEdit(member)}
                        className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(member.id)}
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
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <ModalOverlay isOpen={showModal} onClose={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-blue-500 ring-4 ring-blue-500/30 shadow-blue-500/50">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                {modalMode === 'add' ? 'Add New Member' : modalMode === 'edit' ? 'Edit Member' : 'View Member'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={modalMode === 'view'}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={modalMode === 'view'}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={modalMode === 'view'}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={modalMode === 'view'}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Joined
                  </label>
                  <input
                    type="date"
                    value={formData.dateJoined}
                    onChange={(e) => setFormData({...formData, dateJoined: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={modalMode === 'view'}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ministry/Service
                  </label>
                  <select
                    value={formData.ministry}
                    onChange={(e) => setFormData({...formData, ministry: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={modalMode === 'view'}
                  >
                    <option value="">Select Ministry</option>
                    <option value="Choir">Choir</option>
                    <option value="Youth Ministry">Youth Ministry</option>
                    <option value="Sunday School">Sunday School</option>
                    <option value="Ushering">Ushering</option>
                    <option value="Prayer Team">Prayer Team</option>
                    <option value="None">None</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {modalMode === 'view' ? 'Close' : 'Cancel'}
                </button>
                {modalMode !== 'view' && (
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-blue-500/50"
                  >
                    {modalMode === 'add' ? 'Add Member' : 'Save Changes'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </ModalOverlay>
      )}
      </div>
    </div>
  );
};

export default ChurchMembership;
