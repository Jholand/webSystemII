import { useState, useEffect } from 'react';
import { Search, Filter, Eye, Edit, UserPlus, Phone, Mail, MapPin, Calendar, Users, Download, ChevronDown, X } from 'lucide-react';
import ModalOverlay from '../../components/ModalOverlay';

const MemberRecords = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);

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
    dateOfBirth: '',
    baptismDate: '',
    confirmationDate: '',
    ministry: '',
    status: 'Active'
  });

  const members = [
    { 
      id: 1, 
      name: 'John Dela Cruz', 
      email: 'john.dc@email.com', 
      phone: '+63 912 345 6789',
      address: '123 Main St, Manila',
      dateOfBirth: '1985-05-15',
      baptismDate: '1985-06-20',
      confirmationDate: '1997-04-10',
      ministry: 'Choir',
      status: 'Active',
      joinedDate: '2020-01-15'
    },
    { 
      id: 2, 
      name: 'Maria Santos', 
      email: 'maria.s@email.com', 
      phone: '+63 917 234 5678',
      address: '456 Church Ave, Quezon City',
      dateOfBirth: '1990-08-22',
      baptismDate: '1990-09-15',
      confirmationDate: '2002-05-18',
      ministry: 'Youth Ministry',
      status: 'Active',
      joinedDate: '2019-03-10'
    },
    { 
      id: 3, 
      name: 'Pedro Reyes', 
      email: 'pedro.r@email.com', 
      phone: '+63 918 345 6789',
      address: '789 Parish Rd, Makati',
      dateOfBirth: '1978-12-05',
      baptismDate: '1979-01-10',
      confirmationDate: '1990-06-22',
      ministry: 'Lector',
      status: 'Active',
      joinedDate: '2018-07-20'
    },
    { 
      id: 4, 
      name: 'Ana Garcia', 
      email: 'ana.g@email.com', 
      phone: '+63 919 456 7890',
      address: '321 Chapel St, Pasig',
      dateOfBirth: '1995-03-18',
      baptismDate: '1995-04-25',
      confirmationDate: '2007-07-14',
      ministry: 'Altar Server',
      status: 'Active',
      joinedDate: '2021-02-05'
    },
    { 
      id: 5, 
      name: 'Carlos Mendoza', 
      email: 'carlos.m@email.com', 
      phone: '+63 920 567 8901',
      address: '654 Faith Blvd, Taguig',
      dateOfBirth: '1982-11-30',
      baptismDate: '1983-01-08',
      confirmationDate: '1994-08-20',
      ministry: 'Eucharistic Minister',
      status: 'Inactive',
      joinedDate: '2017-09-12'
    },
  ];

  const ministries = ['Choir', 'Youth Ministry', 'Lector', 'Altar Server', 'Eucharistic Minister', 'Usher', 'Finance Committee'];

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || member.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

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
        dateOfBirth: '',
        baptismDate: '',
        confirmationDate: '',
        ministry: '',
        status: 'Active'
      });
    }
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Member Records</h1>
            <p className="text-blue-900 mt-1">Manage church membership database</p>
          </div>
          <button 
            onClick={() => handleOpenModal('add')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-black via-[#0A1628] to-[#1E3A8A] text-white rounded-xl hover:from-[#1E3A8A] hover:to-blue-700 transition-all shadow-lg hover:shadow-blue-900/50"
          >
            <UserPlus size={20} />
            Add New Member
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-900 text-sm">Total Members</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{members.length}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-black via-[#0A1628] to-[#1E3A8A] rounded-xl">
                <Users className="text-white" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-900 text-sm">Active Members</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{members.filter(m => m.status === 'Active').length}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl">
                <Users className="text-white" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-900 text-sm">Inactive Members</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{members.filter(m => m.status === 'Inactive').length}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl">
                <Users className="text-white" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-900 text-sm">Ministries</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{ministries.length}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-black via-[#0A1628] to-[#1E3A8A] rounded-xl">
                <Users className="text-white" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-200/50">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg transition-all ${filterStatus === 'all' ? 'bg-gradient-to-br from-black via-[#0A1628] to-[#1E3A8A] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('Active')}
                className={`px-4 py-2 rounded-lg transition-all ${filterStatus === 'Active' ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Active
              </button>
              <button
                onClick={() => setFilterStatus('Inactive')}
                className={`px-4 py-2 rounded-lg transition-all ${filterStatus === 'Inactive' ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Inactive
              </button>
              <button className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-2">
                <Download size={18} />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Members Table */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-200/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Member</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Ministry</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{member.name}</p>
                        <p className="text-sm text-gray-600">{member.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone size={14} />
                          {member.phone}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin size={14} />
                          {member.address}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-900">
                        {member.ministry}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        member.status === 'Active' 
                          ? 'bg-emerald-100 text-emerald-900' 
                          : 'bg-amber-100 text-amber-900'
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={14} />
                        {member.joinedDate}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleOpenModal('view', member)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handleOpenModal('edit', member)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Edit size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Baptism Date</label>
                    <input
                      type="date"
                      value={formData.baptismDate}
                      onChange={(e) => setFormData({...formData, baptismDate: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirmation Date</label>
                    <input
                      type="date"
                      value={formData.confirmationDate}
                      onChange={(e) => setFormData({...formData, confirmationDate: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="px-6 py-2 bg-gradient-to-br from-black via-[#0A1628] to-[#1E3A8A] text-white rounded-lg hover:from-[#1E3A8A] hover:to-blue-700 transition-all shadow-lg hover:shadow-blue-900/50"
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
