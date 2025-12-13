import { useState, useEffect } from 'react';
import { FileText, Plus, Download, Clock, CheckCircle, XCircle, AlertCircle, Eye } from 'lucide-react';
import Cookies from 'js-cookie';
import { showSuccessToast, showErrorToast } from '../../utils/sweetAlertHelper';
import { 
  getUserCertificateRequests, 
  createCertificateRequest, 
  downloadCertificate 
} from '../../services/certificateRequestAPI';
import { formatDate } from '../../utils/dateFormatter';

const UserCertificateRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [userId, setUserId] = useState(null);
  const [newRequest, setNewRequest] = useState({
    certificate_type: 'baptism',
    purpose: '',
    details: '',
  });

  useEffect(() => {
    const id = localStorage.getItem('userId') || Cookies.get('userId');
    setUserId(id);
    if (id) {
      loadRequests(id);
    }
  }, []);

  // Hide sidebar and header when modal is open
  useEffect(() => {
    const sidebar = document.querySelector('aside');
    const header = document.querySelector('header');
    
    if (showModal) {
      if (sidebar) sidebar.style.display = 'none';
      if (header) header.style.display = 'none';
    } else {
      if (sidebar) sidebar.style.display = '';
      if (header) header.style.display = '';
    }
  }, [showModal]);

  const loadRequests = async (uid) => {
    try {
      setLoading(true);
      const data = await getUserCertificateRequests(uid);
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading requests:', error);
      showErrorToast('Failed to load certificate requests');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!newRequest.purpose || !newRequest.certificate_type) {
      showErrorToast('Please fill in all required fields');
      return;
    }

    try {
      await createCertificateRequest({
        ...newRequest,
      });
      
      showSuccessToast('Certificate request submitted successfully!');
      setShowModal(false);
      setNewRequest({
        certificate_type: 'baptism',
        purpose: '',
        details: '',
      });
      loadRequests(userId);
    } catch (error) {
      console.error('Error submitting request:', error);
      showErrorToast('Failed to submit certificate request');
    }
  };

  const handleDownload = async (requestId) => {
    try {
      await downloadCertificate(requestId);
      showSuccessToast('Certificate downloaded successfully!');
      loadRequests(userId); // Refresh to update download status
    } catch (error) {
      if (error.message === 'Certificate has already been downloaded') {
        showErrorToast('This certificate has already been downloaded once');
      } else {
        showErrorToast('Failed to download certificate');
      }
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="text-yellow-500" size={20} />;
      case 'processing': return <AlertCircle className="text-blue-500" size={20} />;
      case 'approved': return <CheckCircle className="text-green-500" size={20} />;
      case 'completed': return <CheckCircle className="text-green-600" size={20} />;
      case 'rejected': return <XCircle className="text-red-500" size={20} />;
      default: return <Clock className="text-gray-500" size={20} />;
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

  return (
    <div className="min-h-screen bg-white">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Certificate Requests</h1>
            <p className="text-gray-600 mt-1">Request and manage your church certificates</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            New Request
          </button>
        </div>

        {/* Requests List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No certificate requests yet</h3>
              <p className="text-gray-600 mb-4">Start by requesting a certificate</p>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} />
                New Request
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Certificate Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Purpose
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Request Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <FileText className="text-blue-600" size={18} />
                          <span className="font-medium text-gray-900 capitalize">
                            {request.certificate_type}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{request.purpose}</div>
                        {request.details && (
                          <div className="text-xs text-gray-500 mt-1">{request.details}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(request.status)}
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                            {request.status.toUpperCase()}
                          </span>
                        </div>
                        {request.status === 'rejected' && request.rejection_reason && (
                          <div className="text-xs text-red-600 mt-1">
                            Reason: {request.rejection_reason}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(request.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {request.status === 'completed' && request.certificate_file && (
                          <button
                            onClick={() => handleDownload(request.id)}
                            disabled={request.downloaded}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                              request.downloaded
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                            title={request.downloaded ? 'Already downloaded' : 'Download certificate'}
                          >
                            <Download size={16} />
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
        </div>
      </div>

      {/* New Request Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">New Certificate Request</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Certificate Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={newRequest.certificate_type}
                  onChange={(e) => setNewRequest({ ...newRequest, certificate_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="baptism">Baptism Certificate</option>
                  <option value="marriage">Marriage Certificate</option>
                  <option value="confirmation">Confirmation Certificate</option>
                  <option value="birth">Birth Certificate</option>
                  <option value="death">Death Certificate</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Purpose <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newRequest.purpose}
                  onChange={(e) => setNewRequest({ ...newRequest, purpose: e.target.value })}
                  placeholder="e.g., School Requirement, Employment, Travel"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Additional Details (Optional)
                </label>
                <textarea
                  value={newRequest.details}
                  onChange={(e) => setNewRequest({ ...newRequest, details: e.target.value })}
                  rows={4}
                  placeholder="Provide any additional information..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setNewRequest({
                    certificate_type: 'baptism',
                    purpose: '',
                    details: '',
                  });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!newRequest.purpose || !newRequest.certificate_type}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserCertificateRequests;
