import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Users, UserCheck, UserX, Crown, Download, X } from 'lucide-react';
import ModalOverlay from '../../components/ModalOverlay';
import { memberService, priestService } from '../../services/churchService';
import Swal from 'sweetalert2';
import { formatDate } from '../../utils/dateFormatter';
import { showDeleteConfirm, showSuccessToast, showErrorToast, showError } from '../../utils/sweetAlertHelper';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Pagination from '../../components/Pagination';

const ChurchMembership = () => {
  const [activeTab, setActiveTab] = useState('members');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showPriestModal, setShowPriestModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [priestModalMode, setPriestModalMode] = useState('add');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [priestCurrentPage, setPriestCurrentPage] = useState(1);
  const [priestItemsPerPage, setPriestItemsPerPage] = useState(10);
  
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [priests, setPriests] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateJoined: '',
    ministry: '',
  });

  const [priestFormData, setPriestFormData] = useState({
    name: '',
    email: '',
    phone: '',
    ordainedDate: '',
    specialty: '',
  });

  // Fetch members on component mount and when filters change
  useEffect(() => {
    fetchMembers();
  }, [searchTerm, filterStatus]);

  // Fetch priests when tab changes to priests
  useEffect(() => {
    if (activeTab === 'priests') {
      fetchPriests();
    }
  }, [activeTab]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm || undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
      };
      const response = await memberService.getAll(params);
      setMembers(response.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load members');
      console.error('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPriests = async () => {
    try {
      setLoading(true);
      const response = await priestService.getAll();
      setPriests(response.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load priests');
      console.error('Error fetching priests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.setTextColor(70, 103, 207);
    doc.text('Church Membership', 105, 20, { align: 'center' });
    
    // Add subtitle with date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`, 105, 28, { align: 'center' });
    
    // Prepare table data
    const tableData = members.map((member) => [
      member.name || member.full_name || 'N/A',
      member.email || 'N/A',
      member.phone || member.contact_number || 'N/A',
      member.address || 'N/A',
      member.dateJoined || member.date_joined 
        ? formatDate(member.dateJoined || member.date_joined) 
        : 'N/A',
      member.ministry || 'N/A',
      member.status || 'Active'
    ]);
    
    // Add table using autoTable
    autoTable(doc, {
      startY: 35,
      head: [['Name', 'Email', 'Phone', 'Address', 'Date Joined', 'Ministry', 'Status']],
      body: tableData,
      theme: 'striped',
      styles: {
        overflow: 'linebreak',
        cellPadding: 2
      },
      headStyles: {
        fillColor: [70, 103, 207],
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 7,
        textColor: [50, 50, 50]
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250]
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 28 },
        2: { cellWidth: 22 },
        3: { cellWidth: 30 },
        4: { cellWidth: 22, halign: 'center' },
        5: { cellWidth: 25 },
        6: { cellWidth: 18, halign: 'center' }
      },
      margin: { top: 35, left: 10, right: 10, bottom: 20 }
    });
    
    // Add page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(150);
      doc.text(
        `Page ${i} of ${pageCount}`,
        105,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
    
    // Save the PDF
    const fileName = `Church_Membership_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

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
    // Convert API date format to form format and ensure no null values
    setFormData({
      id: member.id,
      name: member.name || '',
      email: member.email || '',
      phone: member.phone || '',
      address: member.address || '',
      dateJoined: member.date_joined || member.dateJoined || '',
      ministry: member.ministry || '',
      status: member.status || 'Active',
    });
    setShowModal(true);
  };

  const handleView = (member) => {
    setModalMode('view');
    // Ensure no null values
    setFormData({
      id: member.id,
      name: member.name || '',
      email: member.email || '',
      phone: member.phone || '',
      address: member.address || '',
      dateJoined: member.date_joined || member.dateJoined || '',
      ministry: member.ministry || '',
      status: member.status || 'Active',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const result = await showDeleteConfirm('Delete Member?', 'Are you sure you want to delete this member?');
    if (result.isConfirmed) {
      try {
        await memberService.delete(id);
        await fetchMembers();
        showSuccessToast('Deleted!', 'Member has been deleted successfully');
      } catch (err) {
        showErrorToast('Error!', 'Failed to delete member');
        console.error('Error deleting member:', err);
      }
    }
  };

  const toggleStatus = async (id) => {
    try {
      await memberService.toggleStatus(id);
      await fetchMembers();
    } catch (err) {
      showErrorToast('Error!', 'Failed to update status');
      console.error('Error toggling status:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Convert dateJoined to date_joined for API
      const apiData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        date_joined: formData.dateJoined || formData.date_joined,
        ministry: formData.ministry,
        status: formData.status,
      };

      if (modalMode === 'add') {
        await memberService.create(apiData);
      } else if (modalMode === 'edit') {
        await memberService.update(formData.id, apiData);
      }
      
      await fetchMembers();
      setShowModal(false);
      showSuccessToast('Success!', `Member ${modalMode === 'add' ? 'created' : 'updated'} successfully`);
    } catch (err) {
      showErrorToast('Error!', 'Failed to save member: ' + (err.response?.data?.message || err.message));
      console.error('Error saving member:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPriest = () => {
    setPriestModalMode('add');
    setPriestFormData({
      name: '',
      email: '',
      phone: '',
      ordainedDate: '',
      specialty: '',
    });
    setShowPriestModal(true);
  };

  const handleEditPriest = (priest) => {
    setPriestModalMode('edit');
    // Convert API date format to form format and ensure no null values
    setPriestFormData({
      id: priest.id,
      name: priest.name || '',
      email: priest.email || '',
      phone: priest.phone || '',
      ordainedDate: priest.ordained_date || priest.ordainedDate || '',
      specialty: priest.specialty || '',
      status: priest.status || 'active',
    });
    setShowPriestModal(true);
  };

  const handleDeletePriest = async (id) => {
    const result = await showDeleteConfirm('Delete Priest?', 'Are you sure you want to delete this priest?');
    if (result.isConfirmed) {
      try {
        await priestService.delete(id);
        await fetchPriests();
        showSuccessToast('Deleted!', 'Priest has been deleted successfully');
      } catch (err) {
        showErrorToast('Error!', 'Failed to delete priest');
        console.error('Error deleting priest:', err);
      }
    }
  };

  const handlePriestSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Convert ordainedDate to ordained_date for API
      const apiData = {
        name: priestFormData.name,
        email: priestFormData.email,
        phone: priestFormData.phone,
        ordained_date: priestFormData.ordainedDate || priestFormData.ordained_date,
        specialty: priestFormData.specialty || '',
        status: priestFormData.status || 'active',
      };

      if (priestModalMode === 'add') {
        await priestService.create(apiData);
      } else if (priestModalMode === 'edit') {
        await priestService.update(priestFormData.id, apiData);
      }
      
      await fetchPriests();
      setShowPriestModal(false);
      showSuccessToast('Success!', `Priest ${priestModalMode === 'add' ? 'created' : 'updated'} successfully`);
    } catch (err) {
      // Display validation errors if available
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        const errorMessages = Object.entries(errors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('\n');
        showError('Validation Errors', errorMessages);
      } else {
        showErrorToast('Error!', 'Failed to save priest: ' + (err.response?.data?.message || err.message));
      }
      console.error('Error saving priest:', err);
      console.error('Response data:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  // Since we're filtering on the backend, we can just use members directly
  const filteredMembers = members;

  // Pagination logic for members
  const indexOfLastMember = currentPage * itemsPerPage;
  const indexOfFirstMember = indexOfLastMember - itemsPerPage;
  const currentMembers = filteredMembers.slice(indexOfFirstMember, indexOfLastMember);

  // Pagination logic for priests
  const indexOfLastPriest = priestCurrentPage * priestItemsPerPage;
  const indexOfFirstPriest = indexOfLastPriest - priestItemsPerPage;
  const currentPriests = priests.slice(indexOfFirstPriest, indexOfLastPriest);

  const stats = {
    total: members.length,
    active: members.filter(m => m.status === 'Active').length,
    inactive: members.filter(m => m.status === 'Inactive').length,
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#4158D0' }}>Church Membership</h1>
              <p className="text-gray-600 mt-1">Manage church members and priests</p>
            </div>
            <button
              onClick={activeTab === 'members' ? handleAddNew : handleAddPriest}
              className="flex items-center gap-2 px-5 py-3 text-white rounded-lg shadow-lg transition-all font-semibold hover:shadow-xl"
              style={{ 
                background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
              }}
            >
              <Plus size={20} />
              {activeTab === 'members' ? 'Add New Member' : 'Add New Priest'}
            </button>
          </div>
        </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('members')}
            className={`flex-1 px-4 py-3 text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'members'
                ? 'text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            style={{
              background: activeTab === 'members' ? 'rgba(65, 88, 208, 0.1)' : 'transparent',
              backdropFilter: activeTab === 'members' ? 'blur(10px)' : 'none',
              WebkitBackdropFilter: activeTab === 'members' ? 'blur(10px)' : 'none',
              color: activeTab === 'members' ? '#4158D0' : undefined,
              border: activeTab === 'members' ? '1px solid rgba(65, 88, 208, 0.2)' : '1px solid transparent',
              boxShadow: activeTab === 'members' ? '0 4px 12px rgba(65, 88, 208, 0.15)' : 'none'
            }}
          >
            <Users size={18} />
            Members
          </button>
          <button
            onClick={() => setActiveTab('priests')}
            className={`flex-1 px-4 py-3 text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'priests'
                ? 'text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            style={{
              background: activeTab === 'priests' ? 'rgba(65, 88, 208, 0.1)' : 'transparent',
              backdropFilter: activeTab === 'priests' ? 'blur(10px)' : 'none',
              WebkitBackdropFilter: activeTab === 'priests' ? 'blur(10px)' : 'none',
              color: activeTab === 'priests' ? '#4158D0' : undefined,
              border: activeTab === 'priests' ? '1px solid rgba(65, 88, 208, 0.2)' : '1px solid transparent',
              boxShadow: activeTab === 'priests' ? '0 4px 12px rgba(65, 88, 208, 0.15)' : 'none'
            }}
          >
            <Users size={18} />
            Priests
          </button>
        </div>
      </div>

      {/* Stats */}
      {activeTab === 'members' && (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Members</p>
              <p className="text-2xl font-semibold mt-1" style={{ color: '#4158D0' }}>{stats.total}</p>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: '#E8E9F5' }}>
              <Users style={{ color: '#4158D0' }} size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Active Members</p>
              <p className="text-2xl font-semibold text-green-600 mt-1">{stats.active}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <UserCheck className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Inactive Members</p>
              <p className="text-2xl font-semibold text-red-600 mt-1">{stats.inactive}</p>
            </div>
            <div className="p-3 rounded-lg bg-red-50">
              <UserX className="text-red-600" size={24} />
            </div>
          </div>
        </div>
      </div>
      )}

      {activeTab === 'members' && (
      <>
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-5">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, email, or ministry..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 placeholder:text-gray-400"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <button 
            onClick={handleExportPDF}
            className="flex items-center gap-2 text-white px-4 py-2 text-sm font-medium rounded-lg shadow-lg transition-all hover:shadow-xl" 
            style={{ 
              background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
            }}
          >
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        {loading && (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        )}
        {error && (
          <div className="p-8 text-center text-red-600">
            <p>{error}</p>
            <button onClick={fetchMembers} className="mt-2 px-4 py-2 text-white rounded-lg shadow-lg hover:shadow-xl transition-all" style={{ 
              background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
            }}>
              Retry
            </button>
          </div>
        )}
        {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Ministry
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Date Joined
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 text-sm">{member.name}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-900 font-medium text-sm">{member.email}</div>
                    <div className="text-gray-600 text-xs">{member.phone}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{member.ministry}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{member.date_joined || member.dateJoined}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleStatus(member.id)}
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        member.status === 'Active' 
                          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      } transition-colors`}
                    >
                      {member.status}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleView(member)}
                        className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                        style={{ color: '#4158D0' }}
                        title="View"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEdit(member)}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(member.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
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
          <Pagination
            currentPage={currentPage}
            totalItems={filteredMembers.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(value) => {
              setItemsPerPage(value);
              setCurrentPage(1);
            }}
          />
        </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <ModalOverlay isOpen={showModal} onClose={() => setShowModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {modalMode === 'add' ? 'Add New Member' : modalMode === 'edit' ? 'Edit Member' : 'View Member'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
              >
                <X size={20} />
              </button>
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
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {modalMode === 'view' ? 'Close' : 'Cancel'}
                </button>
                {modalMode !== 'view' && (
                  <button
                    type="submit"
                    className="px-4 py-2 text-white text-sm font-medium rounded-lg shadow-lg hover:shadow-xl transition-all"
                    style={{ 
                      background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                    }}
                  >
                    {modalMode === 'add' ? 'Add Member' : 'Save Changes'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </ModalOverlay>
      )}
      </>
      )}

      {/* Priests Tab Content */}
      {activeTab === 'priests' && (
        <>
          {/* Priests Table */}
          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Contact
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Ordained Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Specialty
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentPriests.map((priest) => (
                    <tr key={priest.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 text-sm">{priest.name}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-900 font-medium text-sm">{priest.email}</div>
                        <div className="text-gray-600 text-xs">{priest.phone}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{priest.ordained_date || priest.ordainedDate}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{priest.specialty}</td>
                      <td className="px-4 py-3">
                        <button
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            priest.status === 'Active' 
                              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          } transition-colors`}
                        >
                          {priest.status}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditPriest(priest)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeletePriest(priest.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
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
              <Pagination
                currentPage={priestCurrentPage}
                totalItems={priests.length}
                itemsPerPage={priestItemsPerPage}
                onPageChange={setPriestCurrentPage}
                onItemsPerPageChange={(value) => {
                  setPriestItemsPerPage(value);
                  setPriestCurrentPage(1);
                }}
              />
            </div>
          </div>

          {/* Priest Modal */}
          <ModalOverlay isOpen={showPriestModal} onClose={() => setShowPriestModal(false)}>
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {priestModalMode === 'add' ? 'Add New Priest' : 'Edit Priest'}
                </h2>
                <button 
                  onClick={() => setShowPriestModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handlePriestSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={priestFormData.name}
                      onChange={(e) => setPriestFormData({...priestFormData, name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Fr. John Doe"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={priestFormData.email}
                      onChange={(e) => setPriestFormData({...priestFormData, email: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={priestFormData.phone}
                      onChange={(e) => setPriestFormData({...priestFormData, phone: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ordained Date
                    </label>
                    <input
                      type="date"
                      value={priestFormData.ordainedDate}
                      onChange={(e) => setPriestFormData({...priestFormData, ordainedDate: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Specialty/Ministry
                    </label>
                    <input
                      type="text"
                      value={priestFormData.specialty}
                      onChange={(e) => setPriestFormData({...priestFormData, specialty: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Marriage Counseling, Youth Ministry"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPriestModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-white text-sm font-medium rounded-lg shadow-lg hover:shadow-xl transition-all"
                    style={{ 
                      background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                    }}
                  >
                    {priestModalMode === 'add' ? 'Add Priest' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </ModalOverlay>
        </>
      )}
      </div>
    </div>
  );
};

export default ChurchMembership;
