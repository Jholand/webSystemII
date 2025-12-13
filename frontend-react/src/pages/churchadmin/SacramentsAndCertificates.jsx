import { useState, useEffect } from 'react';
import { FileText, Upload, Eye, CheckCircle, XCircle, Clock, AlertCircle, Filter, Download, File, Plus, Edit, Trash2, X, Search, Calendar as CalendarIcon, User, Baby, Heart, Users } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../contexts/AuthContext';
import { showSuccessToast, showErrorToast, showDeleteConfirm, showInfoToast } from '../../utils/sweetAlertHelper';
import { baptismRecordAPI, marriageRecordAPI, confirmationRecordAPI } from '../../services/dataSync';
import { 
  getAllCertificateRequests, 
  updateCertificateStatus, 
  uploadCertificateFile,
  viewCertificate,
  downloadSupportingDocument
} from '../../services/certificateRequestAPI';
import { logActivity, auditActions, auditModules } from '../../utils/auditLogger';
import Pagination from '../../components/Pagination';
import { formatDate } from '../../utils/dateFormatter';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const SacramentsAndCertificates = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('sacraments');
  const [subTab, setSubTab] = useState('baptism');
  const [loading, setLoading] = useState(false);
  
  // Sacrament Records States
  const [baptismRecords, setBaptismRecords] = useState([]);
  const [marriageRecords, setMarriageRecords] = useState([]);
  const [confirmationRecords, setConfirmationRecords] = useState([]);
  const [showSacramentModal, setShowSacramentModal] = useState(false);
  const [sacramentModalMode, setSacramentModalMode] = useState('create');
  const [editingSacrament, setEditingSacrament] = useState(null);
  const [sacramentForm, setSacramentForm] = useState({});
  
  // Certificate Requests States
  const [certificateRequests, setCertificateRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  
  // Search & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const isChurchAdmin = user?.role === 'church_admin';

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [certificateRequests, statusFilter, typeFilter]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadSacramentRecords(),
        loadCertificateRequests()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSacramentRecords = async () => {
    try {
      const [baptisms, marriages, confirmations] = await Promise.all([
        baptismRecordAPI.getAll().catch(() => ({ data: [] })),
        marriageRecordAPI.getAll().catch(() => ({ data: [] })),
        confirmationRecordAPI.getAll().catch(() => ({ data: [] }))
      ]);

      setBaptismRecords(Array.isArray(baptisms?.data) ? baptisms.data : (Array.isArray(baptisms) ? baptisms : []));
      setMarriageRecords(Array.isArray(marriages?.data) ? marriages.data : (Array.isArray(marriages) ? marriages : []));
      setConfirmationRecords(Array.isArray(confirmations?.data) ? confirmations.data : (Array.isArray(confirmations) ? confirmations : []));
    } catch (error) {
      console.error('Error loading sacrament records:', error);
    }
  };

  const loadCertificateRequests = async () => {
    try {
      const data = await getAllCertificateRequests();
      setCertificateRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading certificate requests:', error);
    }
  };

  const filterRequests = () => {
    let filtered = [...certificateRequests];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(req => req.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(req => req.certificate_type === typeFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(req => 
        req.requester_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.subject_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.certificate_type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
    setCurrentPage(1);
  };

  // Sacrament Record Handlers
  const handleOpenSacramentModal = (type, mode, record = null) => {
    setSubTab(type);
    setSacramentModalMode(mode);
    setEditingSacrament(record);
    
    if (mode === 'edit' && record) {
      setSacramentForm(record);
    } else {
      setSacramentForm(getEmptyFormForType(type));
    }
    
    setShowSacramentModal(true);
  };

  const getEmptyFormForType = (type) => {
    const today = new Date().toISOString().split('T')[0];
    
    switch(type) {
      case 'baptism':
        return {
          child_name: '',
          baptism_date: today,
          baptism_time: '10:00',
          father_name: '',
          mother_name: '',
          godfather_name: '',
          godmother_name: '',
          place_of_birth: '',
          date_of_birth: '',
          minister: 'Fr. Joseph Smith'
        };
      case 'marriage':
        return {
          groom_name: '',
          bride_name: '',
          marriage_date: today,
          marriage_time: '14:00',
          marriage_location: 'Church',
          witness1_name: '',
          witness2_name: '',
          minister: 'Fr. Joseph Smith'
        };
      case 'confirmation':
        return {
          confirmand_name: '',
          confirmation_date: today,
          sponsor_name: '',
          minister: 'Fr. Joseph Smith',
          place_of_confirmation: 'Church'
        };
      default:
        return {};
    }
  };

  const handleSaveSacrament = async (e) => {
    e.preventDefault();
    
    try {
      let api, action;
      
      switch(subTab) {
        case 'baptism':
          api = baptismRecordAPI;
          break;
        case 'marriage':
          api = marriageRecordAPI;
          break;
        case 'confirmation':
          api = confirmationRecordAPI;
          break;
        default:
          return;
      }

      if (sacramentModalMode === 'create') {
        await api.create(sacramentForm);
        action = auditActions.CREATE;
        showSuccessToast('Success!', `${subTab} record created successfully`);
      } else {
        await api.update(editingSacrament.id, sacramentForm);
        action = auditActions.UPDATE;
        showSuccessToast('Success!', `${subTab} record updated successfully`);
      }

      await logActivity({
        action,
        module: auditModules.SACRAMENTS,
        details: `${sacramentModalMode === 'create' ? 'Created' : 'Updated'} ${subTab} record: ${sacramentForm.child_name || sacramentForm.groom_name || sacramentForm.confirmand_name}`,
        userId: user?.id,
        userName: user?.name || 'Unknown',
        userRole: user?.role || 'church_admin',
        newValue: sacramentForm
      });

      setShowSacramentModal(false);
      loadSacramentRecords();
    } catch (error) {
      console.error('Error saving sacrament:', error);
      showErrorToast('Error', 'Failed to save sacrament record');
    }
  };

  const handleDeleteSacrament = async (type, record) => {
    const result = await showDeleteConfirm('Delete Record?', `Are you sure you want to delete this ${type} record?`);
    
    if (result.isConfirmed) {
      try {
        let api;
        switch(type) {
          case 'baptism':
            api = baptismRecordAPI;
            break;
          case 'marriage':
            api = marriageRecordAPI;
            break;
          case 'confirmation':
            api = confirmationRecordAPI;
            break;
          default:
            return;
        }

        await api.delete(record.id);

        await logActivity({
          action: auditActions.DELETE,
          module: auditModules.SACRAMENTS,
          details: `Deleted ${type} record`,
          userId: user?.id,
          userName: user?.name || 'Unknown',
          userRole: user?.role || 'church_admin',
          oldValue: record
        });

        showSuccessToast('Deleted!', 'Record deleted successfully');
        loadSacramentRecords();
      } catch (error) {
        console.error('Error deleting record:', error);
        showErrorToast('Error', 'Failed to delete record');
      }
    }
  };

  // Certificate Request Handlers
  const handleGenerateCertificate = async (request) => {
    try {
      // Create one-time PDF certificate
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Our Lady of Peace and Good Voyage', 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Mission Area', 105, 28, { align: 'center' });
      doc.text('Dalapian St, Brgy Centro', 105, 35, { align: 'center' });
      
      // Certificate Title
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(`CERTIFICATE OF ${request.certificate_type.toUpperCase()}`, 105, 55, { align: 'center' });
      
      // Certificate Content
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      const yStart = 75;
      
      doc.text('This is to certify that:', 20, yStart);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text(request.subject_name || 'N/A', 105, yStart + 15, { align: 'center' });
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      
      // Add details based on certificate type
      let detailsY = yStart + 30;
      if (request.certificate_type === 'baptism') {
        doc.text(`Was baptized on: ${formatDate(request.event_date || 'N/A')}`, 20, detailsY);
        doc.text(`Parents: ${request.additional_details || 'N/A'}`, 20, detailsY + 10);
      } else if (request.certificate_type === 'marriage') {
        doc.text(`Was married on: ${formatDate(request.event_date || 'N/A')}`, 20, detailsY);
        doc.text(`To: ${request.additional_details || 'N/A'}`, 20, detailsY + 10);
      } else if (request.certificate_type === 'confirmation') {
        doc.text(`Was confirmed on: ${formatDate(request.event_date || 'N/A')}`, 20, detailsY);
        doc.text(`Sponsor: ${request.additional_details || 'N/A'}`, 20, detailsY + 10);
      }
      
      // Footer
      doc.text(`Issued on: ${formatDate(new Date())}`, 20, 250);
      doc.text(`Certificate ID: CERT-${request.id}-${Date.now()}`, 20, 260);
      
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(10);
      doc.text('This is a computer-generated certificate. One-time download only.', 105, 275, { align: 'center' });
      
      // Save PDF
      doc.save(`Certificate_${request.certificate_type}_${request.subject_name}_${Date.now()}.pdf`);
      
      showSuccessToast('Certificate Generated!', 'One-time PDF certificate downloaded successfully');

      await logActivity({
        action: auditActions.DOWNLOAD,
        module: auditModules.CERTIFICATES,
        details: `Generated one-time PDF certificate for ${request.subject_name}`,
        userId: user?.id,
        userName: user?.name || 'Unknown',
        userRole: user?.role || 'church_admin',
        targetId: request.id
      });
    } catch (error) {
      console.error('Error generating certificate:', error);
      showErrorToast('Error', 'Failed to generate certificate');
    }
  };

  const handleUpdateCertificateStatus = async (requestId, newStatus) => {
    try {
      await updateCertificateStatus(requestId, newStatus, user?.id);
      showSuccessToast('Success!', `Certificate request ${newStatus}`);
      loadCertificateRequests();

      await logActivity({
        action: auditActions.UPDATE,
        module: auditModules.CERTIFICATES,
        details: `Updated certificate request status to ${newStatus}`,
        userId: user?.id,
        userName: user?.name || 'Unknown',
        userRole: user?.role || 'church_admin',
        targetId: requestId
      });
    } catch (error) {
      console.error('Error updating status:', error);
      showErrorToast('Error', 'Failed to update certificate status');
    }
  };

  const handleViewDocument = async (documentPath) => {
    try {
      await viewCertificate(documentPath);
    } catch (error) {
      console.error('Error viewing document:', error);
      showErrorToast('Error', 'Failed to view document');
    }
  };

  // Get current records based on active tab
  const getCurrentRecords = () => {
    switch(subTab) {
      case 'baptism':
        return baptismRecords;
      case 'marriage':
        return marriageRecords;
      case 'confirmation':
        return confirmationRecords;
      default:
        return [];
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved' },
      processing: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Processing' },
      ready: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Ready' },
      completed: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Completed' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' }
    };
    
    const badge = badges[status?.toLowerCase()] || badges.pending;
    return `px-3 py-1 text-xs font-semibold rounded-full ${badge.bg} ${badge.text}`;
  };

  const tabs = [
    { id: 'sacraments', label: 'Sacrament Records', icon: FileText },
    { id: 'certificates', label: 'Certificate Requests', icon: Upload }
  ];

  const sacramentTabs = [
    { id: 'baptism', label: 'Baptism', icon: Baby },
    { id: 'marriage', label: 'Marriage', icon: Heart },
    { id: 'confirmation', label: 'Confirmation', icon: CheckCircle }
  ];

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRecords = activeTab === 'sacraments' 
    ? getCurrentRecords().slice(indexOfFirstItem, indexOfLastItem)
    : filteredRequests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = activeTab === 'sacraments'
    ? Math.ceil(getCurrentRecords().length / itemsPerPage)
    : Math.ceil(filteredRequests.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: '#4158D0' }}>
                Sacraments & Certificates
              </h1>
              <p className="text-gray-600">
                Manage sacrament records and generate certificates
              </p>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(65, 88, 208, 0.1)' }}>
              <FileText style={{ color: '#4158D0' }} size={32} />
            </div>
          </div>
        </div>

        {/* Main Tabs */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
          <div className="flex gap-2 mb-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                    activeTab === tab.id ? 'shadow-lg' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  style={{
                    background: activeTab === tab.id ? 'rgba(65, 88, 208, 0.1)' : 'transparent',
                    color: activeTab === tab.id ? '#4158D0' : undefined,
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: activeTab === tab.id ? 'rgba(65, 88, 208, 0.2)' : 'transparent',
                    boxShadow: activeTab === tab.id ? '0 4px 12px rgba(65, 88, 208, 0.15)' : 'none'
                  }}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === 'sacraments' && (
              <SacramentRecordsTab
                subTab={subTab}
                setSubTab={setSubTab}
                sacramentTabs={sacramentTabs}
                records={getCurrentRecords()}
                onAdd={() => handleOpenSacramentModal(subTab, 'create')}
                onEdit={(record) => handleOpenSacramentModal(subTab, 'edit', record)}
                onDelete={(record) => handleDeleteSacrament(subTab, record)}
                isChurchAdmin={isChurchAdmin}
                loading={loading}
              />
            )}

            {activeTab === 'certificates' && (
              <CertificateRequestsTab
                requests={currentRecords}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                typeFilter={typeFilter}
                setTypeFilter={setTypeFilter}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                onGenerate={handleGenerateCertificate}
                onUpdateStatus={handleUpdateCertificateStatus}
                onViewDocument={handleViewDocument}
                getStatusBadge={getStatusBadge}
                isChurchAdmin={isChurchAdmin}
                loading={loading}
              />
            )}
          </div>

          {/* Pagination */}
          {!loading && (activeTab === 'sacraments' ? getCurrentRecords().length : filteredRequests.length) > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>

      {/* Sacrament Modal */}
      {showSacramentModal && createPortal(
        <SacramentModal
          mode={sacramentModalMode}
          type={subTab}
          form={sacramentForm}
          setForm={setSacramentForm}
          onSave={handleSaveSacrament}
          onClose={() => setShowSacramentModal(false)}
        />,
        document.body
      )}
    </div>
  );
};

// Sacrament Records Tab Component
const SacramentRecordsTab = ({ subTab, setSubTab, sacramentTabs, records, onAdd, onEdit, onDelete, isChurchAdmin, loading }) => {
  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="flex gap-2">
        {sacramentTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                subTab === tab.id ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {isChurchAdmin && (
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all"
          style={{
            background: 'rgba(16, 185, 129, 0.1)',
            color: '#10B981',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'rgba(16, 185, 129, 0.2)'
          }}
        >
          <Plus size={18} />
          Add {subTab.charAt(0).toUpperCase() + subTab.slice(1)} Record
        </button>
      )}

      {/* Records Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No {subTab} records found. Add your first record!
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                {subTab === 'baptism' && (
                  <>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Child Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Baptism Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Parents</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Godparents</th>
                  </>
                )}
                {subTab === 'marriage' && (
                  <>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Groom</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Bride</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Marriage Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Location</th>
                  </>
                )}
                {subTab === 'confirmation' && (
                  <>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Confirmand Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Confirmation Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Sponsor</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Minister</th>
                  </>
                )}
                {isChurchAdmin && <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {records.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  {subTab === 'baptism' && (
                    <>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{record.child_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatDate(record.baptism_date)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{record.father_name} & {record.mother_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{record.godfather_name} & {record.godmother_name}</td>
                    </>
                  )}
                  {subTab === 'marriage' && (
                    <>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{record.groom_name}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{record.bride_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatDate(record.marriage_date)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{record.marriage_location}</td>
                    </>
                  )}
                  {subTab === 'confirmation' && (
                    <>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{record.confirmand_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatDate(record.confirmation_date)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{record.sponsor_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{record.minister}</td>
                    </>
                  )}
                  {isChurchAdmin && (
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => onEdit(record)}
                          className="p-2 hover:bg-blue-50 rounded transition-colors"
                          style={{ color: '#4158D0' }}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => onDelete(record)}
                          className="p-2 hover:bg-red-50 rounded transition-colors text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// Certificate Requests Tab Component
const CertificateRequestsTab = ({ requests, statusFilter, setStatusFilter, typeFilter, setTypeFilter, searchTerm, setSearchTerm, onGenerate, onUpdateStatus, onViewDocument, getStatusBadge, isChurchAdmin, loading }) => {
  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="processing">Processing</option>
            <option value="ready">Ready</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="baptism">Baptism</option>
            <option value="marriage">Marriage</option>
            <option value="confirmation">Confirmation</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No certificate requests found
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Requester</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Subject Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Date</th>
                {isChurchAdmin && <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{request.requester_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{request.subject_name}</td>
                  <td className="px-4 py-3">
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {request.certificate_type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={getStatusBadge(request.status)}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(request.created_at)}</td>
                  {isChurchAdmin && (
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {request.status === 'approved' && (
                          <button
                            onClick={() => onGenerate(request)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all"
                            style={{
                              background: 'rgba(16, 185, 129, 0.1)',
                              color: '#10B981',
                              borderWidth: '1px',
                              borderStyle: 'solid',
                              borderColor: 'rgba(16, 185, 129, 0.2)'
                            }}
                          >
                            <Download size={14} />
                            Generate PDF
                          </button>
                        )}
                        {request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => onUpdateStatus(request.id, 'approved')}
                              className="p-2 hover:bg-green-50 rounded transition-colors text-green-600"
                              title="Approve"
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button
                              onClick={() => onUpdateStatus(request.id, 'rejected')}
                              className="p-2 hover:bg-red-50 rounded transition-colors text-red-600"
                              title="Reject"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                        {request.supporting_document_path && (
                          <button
                            onClick={() => onViewDocument(request.supporting_document_path)}
                            className="p-2 hover:bg-blue-50 rounded transition-colors"
                            style={{ color: '#4158D0' }}
                            title="View Document"
                          >
                            <Eye size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// Sacrament Modal Component
const SacramentModal = ({ mode, type, form, setForm, onSave, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-5 flex justify-between items-center border-b border-gray-200" style={{ backgroundColor: 'rgba(65, 88, 208, 0.05)' }}>
          <div>
            <h2 className="text-2xl font-bold" style={{ color: '#4158D0' }}>
              {mode === 'create' ? 'Add' : 'Edit'} {type.charAt(0).toUpperCase() + type.slice(1)} Record
            </h2>
            <p className="text-sm text-gray-600 mt-1">Fill in the required information</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:bg-gray-100"
            style={{ color: '#4158D0' }}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={onSave} className="p-6 space-y-5">
          {type === 'baptism' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Child Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.child_name || ''}
                  onChange={(e) => setForm({ ...form, child_name: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Baptism Date</label>
                  <input
                    type="date"
                    value={form.baptism_date || ''}
                    onChange={(e) => setForm({ ...form, baptism_date: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Baptism Time</label>
                  <input
                    type="time"
                    value={form.baptism_time || ''}
                    onChange={(e) => setForm({ ...form, baptism_time: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Father's Name</label>
                  <input
                    type="text"
                    value={form.father_name || ''}
                    onChange={(e) => setForm({ ...form, father_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Mother's Name</label>
                  <input
                    type="text"
                    value={form.mother_name || ''}
                    onChange={(e) => setForm({ ...form, mother_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Godfather's Name</label>
                  <input
                    type="text"
                    value={form.godfather_name || ''}
                    onChange={(e) => setForm({ ...form, godfather_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Godmother's Name</label>
                  <input
                    type="text"
                    value={form.godmother_name || ''}
                    onChange={(e) => setForm({ ...form, godmother_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Minister/Priest</label>
                <input
                  type="text"
                  value={form.minister || ''}
                  onChange={(e) => setForm({ ...form, minister: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                />
              </div>
            </>
          )}

          {type === 'marriage' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Groom's Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.groom_name || ''}
                    onChange={(e) => setForm({ ...form, groom_name: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Bride's Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.bride_name || ''}
                    onChange={(e) => setForm({ ...form, bride_name: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Marriage Date</label>
                  <input
                    type="date"
                    value={form.marriage_date || ''}
                    onChange={(e) => setForm({ ...form, marriage_date: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Marriage Time</label>
                  <input
                    type="time"
                    value={form.marriage_time || ''}
                    onChange={(e) => setForm({ ...form, marriage_time: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={form.marriage_location || ''}
                  onChange={(e) => setForm({ ...form, marriage_location: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Witness 1</label>
                  <input
                    type="text"
                    value={form.witness1_name || ''}
                    onChange={(e) => setForm({ ...form, witness1_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Witness 2</label>
                  <input
                    type="text"
                    value={form.witness2_name || ''}
                    onChange={(e) => setForm({ ...form, witness2_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Minister/Priest</label>
                <input
                  type="text"
                  value={form.minister || ''}
                  onChange={(e) => setForm({ ...form, minister: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                />
              </div>
            </>
          )}

          {type === 'confirmation' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirmand Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.confirmand_name || ''}
                  onChange={(e) => setForm({ ...form, confirmand_name: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirmation Date</label>
                <input
                  type="date"
                  value={form.confirmation_date || ''}
                  onChange={(e) => setForm({ ...form, confirmation_date: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Sponsor Name</label>
                <input
                  type="text"
                  value={form.sponsor_name || ''}
                  onChange={(e) => setForm({ ...form, sponsor_name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Minister/Priest</label>
                <input
                  type="text"
                  value={form.minister || ''}
                  onChange={(e) => setForm({ ...form, minister: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Place of Confirmation</label>
                <input
                  type="text"
                  value={form.place_of_confirmation || ''}
                  onChange={(e) => setForm({ ...form, place_of_confirmation: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                />
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              className="flex-1 px-6 py-3 rounded-xl font-semibold text-white transition-all"
              style={{
                background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
                boxShadow: '0 4px 12px rgba(65, 88, 208, 0.3)'
              }}
            >
              {mode === 'create' ? 'Create' : 'Update'} Record
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl font-semibold transition-all hover:bg-gray-100"
              style={{
                background: 'white',
                color: '#6b7280',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: '#d1d5db'
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SacramentsAndCertificates;
