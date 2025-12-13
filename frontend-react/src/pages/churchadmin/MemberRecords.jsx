import { useState, useEffect } from 'react';
import { Search, Filter, Eye, Edit, UserPlus, Phone, Mail, MapPin, Calendar, Users, Download, ChevronDown, X } from 'lucide-react';
import ModalOverlay from '../../components/ModalOverlay';
import Pagination from '../../components/Pagination';
import { memberAPI } from '../../services/dataSync';
import { showSuccessToast, showErrorToast } from '../../utils/sweetAlertHelper';

const MemberRecords = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch members from database
  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await memberAPI.getAll();
      // Handle both paginated and direct array responses
      const membersData = response?.data || response || [];
      setMembers(Array.isArray(membersData) ? membersData : []);
    } catch (error) {
      console.error('Error fetching members:', error);
      showErrorToast('Error', 'Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showModal) {
      const header = document.querySelector('header');
      const sidebar = document.querySelector('aside');
      if (header) header.style.display = 'none';
      if (sidebar) sidebar.style.display = 'none';
    } else {
      const header = document.querySelector('header');
      const sidebar = document.querySelector('aside');
      if (header) header.style.display = '';
      if (sidebar) sidebar.style.display = '';
    }
  }, [showModal]);
  const [modalMode, setModalMode] = useState('add');
  const [selectedMember, setSelectedMember] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    date_joined: '',
    ministry: '',
    status: 'Active'
  });

  const ministries = ['Choir', 'Youth Ministry', 'Lector', 'Altar Server', 'Eucharistic Minister', 'Usher', 'Finance Committee'];

  const filteredMembers = members.filter(member => {
    const matchesSearch = (member.name || member.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (member.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || member.status === filterStatus;
    return matchesSearch && matchesFilter;
  });
  
  // Pagination logic
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMembers = filteredMembers.slice(startIndex, endIndex);

  const handleOpenModal = (mode, member = null) => {
    setModalMode(mode);
    if (member) {
      setSelectedMember(member);
      setFormData(member);
    } else {
      setSelectedMember(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        date_joined: '',
        ministry: '',
        status: 'Active'
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === 'add') {
        await memberAPI.create(formData);
        showSuccessToast('Success', 'Member added successfully');
      } else {
        await memberAPI.update(selectedMember.id, formData);
        showSuccessToast('Success', 'Member updated successfully');
      }
      await fetchMembers(); // Refresh the list
      setShowModal(false);
    } catch (error) {
      console.error('Error saving member:', error);
      showErrorToast('Error', 'Failed to save member');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="space-y-6">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1" style={{ color: '#4158D0' }}>Member Records</h1>
              <p className="text-gray-600 text-sm">Manage church membership database</p>
            </div>
            <button 
              onClick={() => handleOpenModal('add')}
              className="px-6 py-3 text-white rounded-lg font-semibold hover:opacity-90 transition-all flex items-center gap-2 shadow-lg"
              style={{ 
                background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
                boxShadow: '0 4px 12px rgba(65, 88, 208, 0.3)'
              }}
            >
              <UserPlus size={20} />
              Add Member
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-5 shadow hover:shadow-lg transition-all border border-gray-200 cursor-pointer group">
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 rounded-lg group-hover:scale-110 transition-transform" style={{ backgroundColor: '#4158D020' }}>
                <Users style={{ color: '#4158D0' }} size={24} />
              </div>
              <Users size={16} className="text-gray-400" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{members.length}</h3>
            <p className="text-sm font-semibold text-gray-700">Total Members</p>
          </div>
          <div className="bg-white rounded-lg p-5 shadow hover:shadow-lg transition-all border border-gray-200 cursor-pointer group">
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 rounded-lg group-hover:scale-110 transition-transform" style={{ backgroundColor: '#10b98120' }}>
                <Users style={{ color: '#10b981' }} size={24} />
              </div>
              <Users size={16} className="text-gray-400" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{members.filter(m => m.status === 'Active').length}</h3>
            <p className="text-sm font-semibold text-gray-700">Active Members</p>
          </div>
          <div className="bg-white rounded-lg p-5 shadow hover:shadow-lg transition-all border border-gray-200 cursor-pointer group">
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 rounded-lg group-hover:scale-110 transition-transform" style={{ backgroundColor: '#f59e0b20' }}>
                <Users style={{ color: '#f59e0b' }} size={24} />
              </div>
              <Users size={16} className="text-gray-400" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{members.filter(m => m.status === 'Inactive').length}</h3>
            <p className="text-sm font-semibold text-gray-700">Inactive Members</p>
          </div>
          <div className="bg-white rounded-lg p-5 shadow hover:shadow-lg transition-all border border-gray-200 cursor-pointer group">
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 rounded-lg group-hover:scale-110 transition-transform" style={{ backgroundColor: '#8b5cf620' }}>
                <Users style={{ color: '#8b5cf6' }} size={24} />
              </div>
              <Users size={16} className="text-gray-400" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{ministries.length}</h3>
            <p className="text-sm font-semibold text-gray-700">Ministries</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg p-5 shadow border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status Filter</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilterStatus('all')}
                  className="flex-1 px-3 py-2 rounded-lg transition-all text-sm font-medium"
                  style={filterStatus === 'all' ? {
                    background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
                    color: 'white'
                  } : {
                    background: '#f3f4f6',
                    color: '#374151'
                  }}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterStatus('Active')}
                  className="flex-1 px-3 py-2 rounded-lg transition-all text-sm font-medium"
                  style={filterStatus === 'Active' ? {
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white'
                  } : {
                    background: '#f3f4f6',
                    color: '#374151'
                  }}
                >
                  Active
                </button>
                <button
                  onClick={() => setFilterStatus('Inactive')}
                  className="flex-1 px-3 py-2 rounded-lg transition-all text-sm font-medium"
                  style={filterStatus === 'Inactive' ? {
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: 'white'
                  } : {
                    background: '#f3f4f6',
                    color: '#374151'
                  }}
                >
                  Inactive
                </button>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-2 text-sm font-medium transition-colors">
              <Download size={18} />
              Export
            </button>
          </div>
        </div>

        {/* Members Table */}
        <div className="bg-white border border-gray-200 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Member</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Ministry</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Joined</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      Loading members...
                    </td>
                  </tr>
                ) : filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No members found
                    </td>
                  </tr>
                ) : (
                  currentMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{member.name || member.full_name}</p>
                        <p className="text-xs text-gray-600">{member.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Phone size={14} />
                          {member.phone || member.contact_number || 'N/A'}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <MapPin size={14} />
                          {member.address || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs font-medium rounded bg-purple-100 text-purple-800">
                        {member.ministry || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        member.status === 'Active' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Calendar size={14} />
                        {member.joinedDate || member.joined_date || member.created_at?.split('T')[0] || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => handleOpenModal('view', member)}
                          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                          style={{ color: '#4158D0' }}
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleOpenModal('edit', member)}
                          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                          style={{ color: '#4158D0' }}
                        >
                          <Edit size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
          
          {filteredMembers.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-500">
              <Users size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No members found</p>
            </div>
          )}
        </div>
        
        {/* Pagination */}
        {currentMembers.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={filteredMembers.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        )}
      </div>

      {/* Modal */}
      <ModalOverlay isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {modalMode === 'add' ? 'Add New Member' : modalMode === 'edit' ? 'Edit Member' : 'Member Details'}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {modalMode === 'view' ? (
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <p className="mt-1 text-gray-900">{selectedMember?.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-gray-900">{selectedMember?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                    <p className="mt-1 text-gray-900">{selectedMember?.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Address</label>
                    <p className="mt-1 text-gray-900">{selectedMember?.address}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Date of Birth</label>
                    <p className="mt-1 text-gray-900">{selectedMember?.dateOfBirth}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Baptism Date</label>
                    <p className="mt-1 text-gray-900">{selectedMember?.baptismDate}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Confirmation Date</label>
                    <p className="mt-1 text-gray-900">{selectedMember?.confirmationDate}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Ministry</label>
                    <p className="mt-1 text-gray-900">{selectedMember?.ministry}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <p className="mt-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        selectedMember?.status === 'Active' 
                          ? 'bg-emerald-100 text-emerald-900' 
                          : 'bg-amber-100 text-amber-900'
                      }`}>
                        {selectedMember?.status}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Joined Date</label>
                    <p className="mt-1 text-gray-900">{selectedMember?.joinedDate}</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date Joined *</label>
                    <input
                      type="date"
                      value={formData.date_joined}
                      onChange={(e) => setFormData({...formData, date_joined: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ministry</label>
                    <select
                      value={formData.ministry}
                      onChange={(e) => setFormData({...formData, ministry: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Ministry</option>
                      {ministries.map((ministry) => (
                        <option key={ministry} value={ministry}>{ministry}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition-all shadow-lg"
                    style={{ backgroundColor: '#4158D0' }}
                  >
                    {modalMode === 'add' ? 'Add Member' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>
      </ModalOverlay>
    </div>
  );
};

export default MemberRecords;
