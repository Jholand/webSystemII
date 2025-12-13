import { useState, useEffect } from 'react';
import { FileText, Upload, Eye, CheckCircle, XCircle, Clock, AlertCircle, Filter, Download, File, PlayCircle, CheckCheck } from 'lucide-react';
import Cookies from 'js-cookie';
import { showSuccessToast, showErrorToast } from '../../utils/sweetAlertHelper';
import { 
  getAllCertificateRequests, 
  updateCertificateStatus, 
  uploadCertificateFile,
  viewCertificate,
  downloadSupportingDocument
} from '../../services/certificateRequestAPI';
import Swal from 'sweetalert2';
import Pagination from '../../components/Pagination';
import { formatDate } from '../../utils/dateFormatter';

const ChurchAdminCertificates = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adminId, setAdminId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const id = localStorage.getItem('userId') || Cookies.get('userId');
    setAdminId(id);
    loadRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, statusFilter, typeFilter, paymentFilter]);

  // Hide sidebar when modal is open
  useEffect(() => {
    const sidebar = document.querySelector('aside');
    const header = document.querySelector('header');
    
    if (showUploadModal) {
      if (sidebar) sidebar.style.display = 'none';
      if (header) header.style.display = 'none';
    } else {
      if (sidebar) sidebar.style.display = '';
      if (header) header.style.display = '';
    }
  }, [showUploadModal]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await getAllCertificateRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading requests:', error);
      showErrorToast('Failed to load certificate requests');
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = [...requests];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(req => req.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(req => req.certificate_type === typeFilter);
    }

    if (paymentFilter !== 'all') {
      filtered = filtered.filter(req => req.payment_status === paymentFilter);
    }

    setFilteredRequests(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleStatusUpdate = async (requestId, newStatus) => {
    const result = await Swal.fire({
      title: `${newStatus === 'approved' ? 'Approve' : newStatus === 'rejected' ? 'Reject' : 'Update'} Request?`,
      text: newStatus === 'rejected' ? 'Please provide a reason' : 'Are you sure you want to update this request?',
      input: newStatus === 'rejected' ? 'textarea' : null,
      inputPlaceholder: newStatus === 'rejected' ? 'Reason for rejection...' : null,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: newStatus === 'rejected' ? '#dc2626' : '#4667CF',
      confirmButtonText: 'Yes, proceed',
    });

    if (!result.isConfirmed) return;

    try {
      const updateData = {
        status: newStatus,
        rejection_reason: (newStatus === 'rejected' && result.value) ? result.value : null,
      };
      
      // Only include approved_by for approved status
      if (newStatus === 'approved' && adminId) {
        updateData.approved_by = parseInt(adminId);
      }
      
      await updateCertificateStatus(requestId, updateData);

      showSuccessToast(`Request ${newStatus} successfully!`);
      loadRequests();
    } catch (error) {
      console.error('Error updating status:', error);
      showErrorToast('Failed to update request status');
    }
  };

  const handleUploadCertificate = async () => {
    if (!uploadFile) {
      showErrorToast('Please select a PDF file');
      return;
    }

    if (uploadFile.type !== 'application/pdf') {
      showErrorToast('Only PDF files are allowed');
      return;
    }

    if (uploadFile.size > 5 * 1024 * 1024) { // 5MB limit
      showErrorToast('File size must be less than 5MB');
      return;
    }

    try {
      await uploadCertificateFile(selectedRequest.id, uploadFile);
      showSuccessToast('Certificate uploaded successfully!');
      setShowUploadModal(false);
      setSelectedRequest(null);
      setUploadFile(null);
      loadRequests();
    } catch (error) {
      console.error('Error uploading certificate:', error);
      showErrorToast('Failed to upload certificate');
    }
  };

  const handleViewCertificate = async (requestId) => {
    try {
      await viewCertificate(requestId);
    } catch (error) {
      console.error('Error viewing certificate:', error);
      showErrorToast('Failed to view certificate');
    }
  };

  const handleDownloadDocument = async (requestId, documentIndex, documentName) => {
    try {
      await downloadSupportingDocument(requestId, documentIndex);
      showSuccessToast(`Downloaded ${documentName}`);
    } catch (error) {
      console.error('Error downloading document:', error);
      if (error.response?.status === 404) {
        showErrorToast('File not found. This is test data without actual files. To download real documents, users need to upload actual files.');
      } else {
        showErrorToast('Failed to download document');
      }
    }
  };

  const handleViewDocuments = async (request) => {
    if (!request.supporting_documents || request.supporting_documents.length === 0) {
      showErrorToast('No documents uploaded for this request');
      return;
    }

    const documentsList = request.supporting_documents.map((doc, index) => `
      <div class="text-left p-3 border-b hover:bg-gray-50 cursor-pointer flex items-center justify-between" data-index="${index}">
        <div class="flex items-center">
          <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0010.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
          </svg>
          <span class="text-sm">${doc.original_name}</span>
        </div>
        <button class="download-btn text-blue-600 hover:text-blue-800" data-request-id="${request.id}" data-index="${index}" data-name="${doc.original_name}">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
          </svg>
        </button>
      </div>
    `).join('');

    const result = await Swal.fire({
      title: 'Supporting Documents',
      html: `<div class="max-h-96 overflow-y-auto">${documentsList}</div>`,
      showConfirmButton: false,
      showCloseButton: true,
      width: '500px',
      didOpen: () => {
        // Add click event listeners to download buttons
        const downloadBtns = document.querySelectorAll('.download-btn');
        downloadBtns.forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const requestId = btn.getAttribute('data-request-id');
            const index = btn.getAttribute('data-index');
            const name = btn.getAttribute('data-name');
            handleDownloadDocument(requestId, index, name);
          });
        });
      }
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="text-yellow-500" size={18} />;
      case 'processing': return <AlertCircle className="text-blue-500" size={18} />;
      case 'approved': return <CheckCircle className="text-green-500" size={18} />;
      case 'completed': return <CheckCircle className="text-green-600" size={18} />;
      case 'rejected': return <XCircle className="text-red-500" size={18} />;
      default: return <Clock className="text-gray-500" size={18} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="min-h-screen bg-white">
      <div className="space-y-6">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 bg-white">
          <h1 className="text-2xl font-bold mb-1" style={{ color: '#4158D0' }}>Certificate Requests</h1>
          <p className="text-gray-600 text-sm">Manage and process certificate requests</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="approved">Approved</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Certificate Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="all">All Types</option>
                <option value="baptism">Baptism</option>
                <option value="marriage">Marriage</option>
                <option value="confirmation">Confirmation</option>
                <option value="death">Death</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="all">All Payment</option>
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
                <option value="waived">Waived</option>
              </select>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Total: <span className="font-semibold">{filteredRequests.length}</span> requests
            </div>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white border border-gray-200 rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#4158D0' }}></div>
              <p className="text-gray-500 mt-4">Loading requests...</p>
            </div>
          ) : currentItems.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="mx-auto text-gray-300 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No requests found</h3>
              <p className="text-gray-600">No certificate requests match your filters</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Requester
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Purpose
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Fee / Payment
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Documents
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {currentItems.map((request) => (
                      <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {request.user?.name || 'Unknown'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {request.user?.email}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900 capitalize">
                            {request.certificate_type}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-900">{request.purpose}</div>
                          {request.details && (
                            <div className="text-xs text-gray-500 mt-1">{request.details}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ₱{parseFloat(request.certificate_fee || 0).toFixed(2)}
                          </div>
                          <span className={`inline-block px-2 py-1 text-xs font-semibold rounded mt-1 ${
                            request.payment_status === 'paid' 
                              ? 'bg-green-100 text-green-800' 
                              : request.payment_status === 'waived'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {request.payment_status ? request.payment_status.toUpperCase() : 'UNPAID'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {request.supporting_documents && request.supporting_documents.length > 0 ? (
                            <button
                              onClick={() => handleViewDocuments(request)}
                              className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-xs"
                            >
                              <File size={14} className="mr-1" />
                              {request.supporting_documents.length} {request.supporting_documents.length === 1 ? 'file' : 'files'}
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400">No documents</span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(request.status)}
                            <span className={`px-2 py-1 text-xs font-semibold rounded ${getStatusColor(request.status)}`}>
                              {request.status.toUpperCase()}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                          {formatDate(request.created_at)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            {request.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleStatusUpdate(request.id, 'processing')}
                                  className="p-1.5 hover:bg-blue-50 rounded transition-colors"
                                  style={{ color: '#4158D0' }}
                                  title="Process"
                                >
                                  <PlayCircle size={16} />
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(request.id, 'approved')}
                                  className="p-1.5 hover:bg-green-50 rounded transition-colors"
                                  style={{ color: '#10b981' }}
                                  title="Approve"
                                >
                                  <CheckCircle size={16} />
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(request.id, 'rejected')}
                                  className="p-1.5 hover:bg-red-50 rounded transition-colors"
                                  style={{ color: '#ef4444' }}
                                  title="Reject"
                                >
                                  <XCircle size={16} />
                                </button>
                              </>
                            )}
                            {request.status === 'processing' && (
                              <>
                                <button
                                  onClick={() => handleStatusUpdate(request.id, 'approved')}
                                  className="p-1.5 hover:bg-green-50 rounded transition-colors"
                                  style={{ color: '#10b981' }}
                                  title="Approve"
                                >
                                  <CheckCircle size={16} />
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(request.id, 'rejected')}
                                  className="p-1.5 hover:bg-red-50 rounded transition-colors"
                                  style={{ color: '#ef4444' }}
                                  title="Reject"
                                >
                                  <XCircle size={16} />
                                </button>
                              </>
                            )}
                            {request.status === 'approved' && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    setShowUploadModal(true);
                                  }}
                                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                  title="Upload Certificate"
                                >
                                  <Upload size={18} />
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(request.id, 'completed')}
                                  className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                  title="Mark as Completed"
                                >
                                  <CheckCheck size={18} />
                                </button>
                              </>
                            )}
                            {request.status === 'completed' && request.certificate_file && (
                              <button
                                onClick={() => handleViewCertificate(request.id)}
                                className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                title="View Certificate"
                              >
                                <Eye size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalItems={filteredRequests.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
              />
            </>
          )}
        </div>
      </div>

      {/* Upload Certificate Modal */}
      {showUploadModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Upload Certificate</h3>
            
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Requester:</span> {selectedRequest.user?.name}
              </p>
              <p className="text-sm text-gray-700 mt-1">
                <span className="font-semibold">Type:</span> {selectedRequest.certificate_type}
              </p>
              <p className="text-sm text-gray-700 mt-1">
                <span className="font-semibold">Purpose:</span> {selectedRequest.purpose}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Certificate File (PDF only) <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {uploadFile && (
                  <p className="text-sm text-gray-600 mt-2">
                    Selected: {uploadFile.name} ({(uploadFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">Maximum file size: 5MB</p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedRequest(null);
                  setUploadFile(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadCertificate}
                disabled={!uploadFile}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Upload Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChurchAdminCertificates;
