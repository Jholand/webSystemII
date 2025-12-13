import { useState, useEffect } from 'react';
import { Plus, Eye, Calendar, Upload as UploadIcon, Download, FileCheck, FileText, Clock, CheckCircle, XCircle, AlertCircle, Award } from 'lucide-react';
import { showSuccessToast, showErrorToast } from '../../utils/sweetAlertHelper';
import { serviceRequestAPI } from '../../services/serviceRequestAPI';
import ModalOverlay from '../../components/ModalOverlay';
import Pagination from '../../components/Pagination';
import Cookies from 'js-cookie';
import { 
  getUserCertificateRequests, 
  createCertificateRequest, 
  downloadCertificate 
} from '../../services/certificateRequestAPI';
import { formatDate, formatDateTimeShort } from '../../utils/dateFormatter';

const UserServiceRequests = () => {
  const [activeTab, setActiveTab] = useState('requests');
  const [showModal, setShowModal] = useState(false);
  const [serviceType, setServiceType] = useState('');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [certCurrentPage, setCertCurrentPage] = useState(1);
  const [certItemsPerPage, setCertItemsPerPage] = useState(10);
  
  // Certificate requests state
  const [certificateRequests, setCertificateRequests] = useState([]);
  const [showCertModal, setShowCertModal] = useState(false);
  const [userId, setUserId] = useState(null);
  const [newCertRequest, setNewCertRequest] = useState({
    certificate_type: 'baptism',
    purpose: '',
    details: '',
    supporting_documents: [],
  });
  
  const [formData, setFormData] = useState({
    // Baptism
    childName: '',
    childBirthdate: '',
    fatherName: '',
    motherName: '',
    godfather: '',
    godmother: '',
    // Wedding
    groomName: '',
    brideName: '',
    weddingDate: '',
    weddingTime: '',
    // Funeral
    deceasedName: '',
    dateOfDeath: '',
    funeralDate: '',
    funeralTime: '',
    // Common
    preferredDate: '',
    preferredTime: '',
    contactPerson: '',
    contactPhone: '',
    notes: '',
  });
  const [attachments, setAttachments] = useState([]);

  useEffect(() => {
    const id = localStorage.getItem('userId') || Cookies.get('userId') || 1;
    setUserId(id);
    fetchRequests();
    loadCertificateRequests(id);
  }, []);

  // Hide sidebar and header when modals are open
  useEffect(() => {
    const sidebar = document.querySelector('aside');
    const header = document.querySelector('header');
    
    if (showModal || showCertModal) {
      if (sidebar) sidebar.style.display = 'none';
      if (header) header.style.display = 'none';
    } else {
      if (sidebar) sidebar.style.display = '';
      if (header) header.style.display = '';
    }
  }, [showModal, showCertModal]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId') || 1; // Get from auth context
      const data = await serviceRequestAPI.getAll();
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      showErrorToast('Error', 'Failed to load service requests');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCertificateRequests = async (uid) => {
    try {
      const data = await getUserCertificateRequests(uid);
      setCertificateRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading certificate requests:', error);
    }
  };

  // Pagination logic for service requests
  const indexOfLastRequest = currentPage * itemsPerPage;
  const indexOfFirstRequest = indexOfLastRequest - itemsPerPage;
  const currentRequests = requests.slice(indexOfFirstRequest, indexOfLastRequest);

  // Pagination logic for certificate requests
  const indexOfLastCert = certCurrentPage * certItemsPerPage;
  const indexOfFirstCert = indexOfLastCert - certItemsPerPage;
  const currentCertificates = certificateRequests.slice(indexOfFirstCert, indexOfLastCert);

  const handleOpenModal = (type) => {
    setServiceType(type);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setServiceType('');
    setFormData({
      childName: '', childBirthdate: '', fatherName: '', motherName: '', godfather: '', godmother: '',
      groomName: '', brideName: '', weddingDate: '', weddingTime: '',
      deceasedName: '', dateOfDeath: '', funeralDate: '', funeralTime: '',
      preferredDate: '', preferredTime: '', contactPerson: '', contactPhone: '', notes: ''
    });
    setAttachments([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Get participant name based on service type
      let participantName = '';
      const details = {};
      
      switch(serviceType) {
        case 'Baptism':
          participantName = formData.childName;
          details.childBirthdate = formData.childBirthdate;
          details.fatherName = formData.fatherName;
          details.motherName = formData.motherName;
          details.godfather = formData.godfather;
          details.godmother = formData.godmother;
          break;
        case 'Wedding':
          participantName = `${formData.groomName} & ${formData.brideName}`;
          details.groomName = formData.groomName;
          details.brideName = formData.brideName;
          details.weddingDate = formData.weddingDate;
          details.weddingTime = formData.weddingTime;
          break;
        case 'Funeral':
          participantName = formData.deceasedName;
          details.dateOfDeath = formData.dateOfDeath;
          details.funeralDate = formData.funeralDate;
          details.funeralTime = formData.funeralTime;
          break;
        case 'Mass Intention':
          participantName = formData.notes || 'Mass Intention';
          break;
        default:
          participantName = formData.notes || serviceType;
      }
      
      const requestData = {
        request_type: serviceType,
        participant_name: participantName,
        requestor_name: localStorage.getItem('userName') || 'User',
        contact_number: formData.contactPhone,
        email: localStorage.getItem('userEmail') || '',
        preferred_date: formData.preferredDate || null,
        preferred_time: formData.preferredTime || null,
        details: details,
        special_requirements: formData.notes
      };
      
      await serviceRequestAPI.create(requestData);
      showSuccessToast('Success!', `${serviceType} request submitted successfully! The secretary will process your request.`);
      await fetchRequests();
      handleCloseModal();
    } catch (error) {
      console.error('Error submitting request:', error);
      showErrorToast('Error', 'Failed to submit service request');
    } finally {
      setLoading(false);
    }
  };

  // Certificate request handlers
  const handleSubmitCertRequest = async () => {
    if (!newCertRequest.purpose || !newCertRequest.certificate_type) {
      showErrorToast('Please fill in all required fields');
      return;
    }

    try {
      await createCertificateRequest({
        ...newCertRequest,
        user_id: userId,
      });
      
      showSuccessToast('Certificate request submitted successfully!');
      setShowCertModal(false);
      setNewCertRequest({
        certificate_type: 'baptism',
        purpose: '',
        details: '',
        supporting_documents: [],
      });
      loadCertificateRequests(userId);
    } catch (error) {
      console.error('Error submitting request:', error);
      showErrorToast('Failed to submit certificate request');
    }
  };

  const handleDownloadCertificate = async (requestId) => {
    try {
      await downloadCertificate(requestId);
      showSuccessToast('Certificate downloaded successfully!');
      loadCertificateRequests(userId);
    } catch (error) {
      if (error.message === 'Certificate has already been downloaded') {
        showErrorToast('This certificate has already been downloaded once');
      } else {
        showErrorToast('Failed to download certificate');
      }
    }
  };

  const getCertStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="text-yellow-500" size={20} />;
      case 'processing': return <AlertCircle className="text-blue-500" size={20} />;
      case 'approved': return <CheckCircle className="text-green-500" size={20} />;
      case 'completed': return <CheckCircle className="text-green-600" size={20} />;
      case 'rejected': return <XCircle className="text-red-500" size={20} />;
      default: return <Clock className="text-gray-500" size={20} />;
    }
  };

  const getCertStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': 
      case 'scheduled':
        return 'bg-green-100 text-green-800';
      case 'pending': 
        return 'bg-yellow-100 text-yellow-800';
      case 'completed': 
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'approved':
        return 'bg-purple-100 text-purple-800';
      default: 
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Sample sacraments data for My Sacraments tab
  const sacraments = [
    { 
      id: 1, 
      type: 'Baptism', 
      date: '1985-04-20', 
      location: 'St. Mary\'s Church',
      officiant: 'Fr. John Smith',
      status: 'Completed',
      certificateReady: true
    },
    { 
      id: 2, 
      type: 'First Communion', 
      date: '1993-05-15', 
      location: 'St. Mary\'s Church',
      officiant: 'Fr. Robert Johnson',
      status: 'Completed',
      certificateReady: true
    },
    { 
      id: 3, 
      type: 'Confirmation', 
      date: '1995-06-10', 
      location: 'St. Mary\'s Church',
      officiant: 'Bishop Michael Brown',
      status: 'Completed',
      certificateReady: false
    },
    { 
      id: 4, 
      type: 'Marriage', 
      date: '2010-03-20', 
      location: 'St. Mary\'s Church',
      officiant: 'Fr. David Garcia',
      status: 'Completed',
      certificateReady: true
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#4158D0' }}>Service Request Records</h1>
              <p className="text-gray-600 text-sm mt-1">Track and view all your service requests</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('requests')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-all ${
                  activeTab === 'requests'
                    ? 'border-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
                style={activeTab === 'requests' ? { 
                  borderColor: '#4158D0', 
                  color: '#4158D0',
                  background: 'rgba(65, 88, 208, 0.1)',
                  backdropFilter: 'blur(10px)'
                } : {}}
              >
                Service Requests
              </button>
              <button
                onClick={() => setActiveTab('certificates')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-all ${
                  activeTab === 'certificates'
                    ? 'border-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
                style={activeTab === 'certificates' ? { 
                  borderColor: '#4158D0', 
                  color: '#4158D0',
                  background: 'rgba(65, 88, 208, 0.1)',
                  backdropFilter: 'blur(10px)'
                } : {}}
              >
                <Award size={16} className="inline mr-1.5" />
                Certificate Requests
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content: My Requests */}
        {activeTab === 'requests' && (
          <>
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-lg font-semibold mb-4" style={{ color: '#4158D0' }}>Request Service</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => handleOpenModal('Baptism')}
                  className="p-4 border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 rounded-2xl transition-all text-left hover:shadow-lg"
                >
                  <Plus size={24} className="mb-2" style={{ color: '#4158D0' }} />
                  <p className="font-semibold text-gray-900 text-sm">Baptism Registration</p>
                </button>
                <button
                  onClick={() => handleOpenModal('Wedding')}
                  className="p-4 border-2 border-purple-200 bg-purple-50 hover:bg-purple-100 rounded-2xl transition-all text-left hover:shadow-lg"
                >
                  <Plus size={24} className="text-purple-600 mb-2" />
                  <p className="font-semibold text-gray-900 text-sm">Wedding Booking</p>
                </button>
                <button
                  onClick={() => handleOpenModal('Funeral')}
                  className="p-4 border-2 border-gray-300 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all text-left hover:shadow-lg"
                >
                  <Plus size={24} className="text-gray-600 mb-2" />
                  <p className="font-semibold text-gray-900 text-sm">Funeral Service</p>
                </button>
              </div>
            </div>

            {/* Requests List */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Request ID</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Service Type</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Participant(s)</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Request Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Preferred Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center">
                          <div className="flex justify-center items-center gap-2">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: '#4158D0' }}></div>
                            <p className="text-gray-500">Loading requests...</p>
                          </div>
                        </td>
                      </tr>
                    ) : requests.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center">
                          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                          <p className="text-gray-500">No service requests yet. Create a new request above.</p>
                        </td>
                      </tr>
                    ) : (
                      currentRequests.map((request) => (
                        <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm font-mono text-gray-900">REQ-{String(request.id).padStart(3, '0')}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900">{request.request_type}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{request.participant_name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {formatDate(request.created_at)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {request.preferred_date ? formatDate(request.preferred_date) : 'Not specified'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(request.status)}`}>
                              {request.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                              style={{ color: '#4158D0' }}
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {requests.length > 0 && (
                <div className="border-t-2 border-purple-200">
                  <Pagination
                    currentPage={currentPage}
                    totalItems={requests.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={setItemsPerPage}
                  />
                </div>
              )}
            </div>
          </>
        )}

        {/* Tab Content: Certificate Requests */}
        {activeTab === 'certificates' && (
          <>
            {/* New Certificate Request Button */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Certificate Requests</h2>
                  <p className="text-sm text-gray-600 mt-1">Request certificates for your sacramental records</p>
                </div>
                <button
                  onClick={() => setShowCertModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={20} />
                  New Request
                </button>
              </div>
            </div>

            {/* Certificate Requests Table */}
            <div className="bg-white border-2 border-purple-100 rounded-2xl shadow-2xl overflow-hidden">
              {loading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="text-gray-500 mt-4">Loading certificate requests...</p>
                </div>
              ) : certificateRequests.length === 0 ? (
                <div className="p-12 text-center">
                  <FileText className="mx-auto text-purple-400 mb-4" size={48} />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No certificate requests yet</h3>
                  <p className="text-gray-600 mb-4">Start by requesting a certificate</p>
                  <button
                    onClick={() => setShowCertModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-all"
                    style={{ backgroundColor: '#4667CF' }}
                  >
                    <Plus size={20} />
                    New Request
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-purple-50 to-blue-50 border-b-2 border-purple-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-purple-700 uppercase">
                          Certificate Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-purple-700 uppercase">
                          Purpose
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-purple-700 uppercase">
                          Fee / Payment
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-purple-700 uppercase">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-purple-700 uppercase">
                          Request Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-purple-700 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-100">
                      {currentCertificates.map((request) => (
                        <tr key={request.id} className="hover:bg-purple-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <FileText className="text-purple-600" size={16} />
                              <span className="font-medium text-sm text-gray-900 capitalize">
                                {request.certificate_type}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-900">{request.purpose}</div>
                            {request.details && (
                              <div className="text-xs text-gray-500 mt-1">{request.details}</div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-semibold text-gray-900">₱{parseFloat(request.certificate_fee || 50).toFixed(2)}</div>
                            <div className="flex items-center gap-1 mt-1">
                              {request.payment_status === 'paid' ? (
                                <span className="px-2 py-0.5 text-xs font-medium rounded bg-green-100 text-green-800">
                                  PAID
                                </span>
                              ) : request.payment_status === 'waived' ? (
                                <span className="px-2 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-800">
                                  WAIVED
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 text-xs font-medium rounded bg-yellow-100 text-yellow-800">
                                  UNPAID
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {getCertStatusIcon(request.status)}
                              <span className={`px-2 py-1 text-xs font-medium rounded ${getCertStatusColor(request.status)}`}>
                                {request.status.toUpperCase()}
                              </span>
                            </div>
                            {request.status === 'rejected' && request.rejection_reason && (
                              <div className="text-xs text-red-600 mt-1">
                                Reason: {request.rejection_reason}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {formatDate(request.created_at)}
                          </td>
                          <td className="px-4 py-3">
                            {request.status === 'completed' && request.certificate_file && (
                              <button
                                onClick={() => handleDownloadCertificate(request.id)}
                                disabled={request.downloaded}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                  request.downloaded
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-green-600 text-white hover:bg-green-700'
                                }`}
                                title={request.downloaded ? 'Already downloaded' : 'Download certificate'}
                              >
                                <Download size={14} />
                                {request.downloaded ? 'Downloaded' : 'Download'}
                              </button>
                            )}
                            {request.status === 'pending' && (
                              <span className="text-xs text-gray-500">Waiting for approval</span>
                            )}
                            {request.status === 'processing' && (
                              <span className="text-xs text-blue-600">Being processed...</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {certificateRequests.length > 0 && (
                <div className="border-t-2 border-purple-200">
                  <Pagination
                    currentPage={certCurrentPage}
                    totalItems={certificateRequests.length}
                    itemsPerPage={certItemsPerPage}
                    onPageChange={setCertCurrentPage}
                    onItemsPerPageChange={setCertItemsPerPage}
                  />
                </div>
              )}
            </div>
          </>
        )}

        {/* Service Request Modal */}
        <ModalOverlay isOpen={showModal} onClose={handleCloseModal}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full my-8">
            <div className="max-h-[85vh] overflow-y-auto p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {serviceType} Request Form
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Baptism Form */}
                {serviceType === 'Baptism' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Child's Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="childName"
                        value={formData.childName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="childBirthdate"
                        value={formData.childBirthdate}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Father's Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="fatherName"
                          value={formData.fatherName}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mother's Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="motherName"
                          value={formData.motherName}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Godfather</label>
                        <input
                          type="text"
                          name="godfather"
                          value={formData.godfather}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Godmother</label>
                        <input
                          type="text"
                          name="godmother"
                          value={formData.godmother}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Wedding Form */}
                {serviceType === 'Wedding' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Groom's Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="groomName"
                          value={formData.groomName}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bride's Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="brideName"
                          value={formData.brideName}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Preferred Wedding Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          name="weddingDate"
                          value={formData.weddingDate}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Preferred Time <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="time"
                          name="weddingTime"
                          value={formData.weddingTime}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Funeral Form */}
                {serviceType === 'Funeral' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name of Deceased <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="deceasedName"
                        value={formData.deceasedName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Death <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="dateOfDeath"
                        value={formData.dateOfDeath}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Preferred Funeral Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          name="funeralDate"
                          value={formData.funeralDate}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Preferred Time <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="time"
                          name="funeralTime"
                          value={formData.funeralTime}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Common Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Person <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Document Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Required Documents
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <UploadIcon size={24} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Birth certificate, IDs, etc.</p>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="document-upload"
                    />
                    <label
                      htmlFor="document-upload"
                      className="inline-block px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                    >
                      Choose Files
                    </label>
                  </div>
                  {attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm text-gray-700">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 justify-end pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-all"
                    style={{ backgroundColor: '#4667CF' }}
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        </ModalOverlay>

        {/* Certificate Request Modal */}
        {showCertModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">New Certificate Request</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Certificate Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newCertRequest.certificate_type}
                    onChange={(e) => setNewCertRequest({ ...newCertRequest, certificate_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="baptism">Baptism Certificate</option>
                    <option value="marriage">Marriage Certificate</option>
                    <option value="confirmation">Confirmation Certificate</option>
                    <option value="death">Death Certificate</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Purpose <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newCertRequest.purpose}
                    onChange={(e) => setNewCertRequest({ ...newCertRequest, purpose: e.target.value })}
                    placeholder="e.g., School Requirement, Employment, Travel"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Additional Details (Optional)
                  </label>
                  <textarea
                    value={newCertRequest.details}
                    onChange={(e) => setNewCertRequest({ ...newCertRequest, details: e.target.value })}
                    rows={4}
                    placeholder="Provide any additional information..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Supporting Documents (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <UploadIcon size={24} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Upload supporting documents (Birth certificate, IDs, etc.)</p>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const files = Array.from(e.target.files);
                        setNewCertRequest({ ...newCertRequest, supporting_documents: [...newCertRequest.supporting_documents, ...files] });
                      }}
                      className="hidden"
                      id="cert-document-upload"
                    />
                    <label
                      htmlFor="cert-document-upload"
                      className="inline-block px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                    >
                      Choose Files
                    </label>
                  </div>
                  {newCertRequest.supporting_documents.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {newCertRequest.supporting_documents.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm text-gray-700">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newDocs = newCertRequest.supporting_documents.filter((_, i) => i !== index);
                              setNewCertRequest({ ...newCertRequest, supporting_documents: newDocs });
                            }}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowCertModal(false);
                    setNewCertRequest({
                      certificate_type: 'baptism',
                      purpose: '',
                      details: '',
                      supporting_documents: [],
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitCertRequest}
                  disabled={!newCertRequest.purpose || !newCertRequest.certificate_type}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserServiceRequests;
