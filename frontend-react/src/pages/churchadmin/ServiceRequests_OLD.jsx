import { useState, useEffect } from 'react';
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, FileText, Calendar, MessageSquare, User, DollarSign } from 'lucide-react';
import ModalOverlay from '../../components/ModalOverlay';
import { serviceRequestAPI } from '../../services/serviceRequestAPI';
import api from '../../services/api';
import { showSuccessToast, showErrorToast, showConfirmDialog } from '../../utils/sweetAlertHelper';

const ServiceRequests = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [staffMembers, setStaffMembers] = useState([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchRequests();
    fetchStaffMembers();
  }, [filterStatus, filterCategory, searchTerm]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const filters = {
        status: filterStatus,
        category: filterCategory,
        search: searchTerm
      };
      const response = await serviceRequestAPI.getAll(filters);
      setServiceRequests(response.data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      showErrorToast('Error', 'Failed to load service requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffMembers = async () => {
    try {
      const response = await api.get('/users?role=priest,church_admin');
      setStaffMembers(response.data || []);
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const handleApprove = async (requestId) => {
    const result = await showConfirmDialog(
      'Approve Request',
      'Are you sure you want to approve this service request?',
      'Yes, approve it'
    );
    
    if (result.isConfirmed) {
      try {
        await serviceRequestAPI.approve(requestId, notes);
        showSuccessToast('Success', 'Service request approved');
        setNotes('');
        setShowModal(false);
        await fetchRequests();
      } catch (error) {
        console.error('Error approving request:', error);
        showErrorToast('Error', 'Failed to approve request');
      }
    }
  };

  const handleReject = async (requestId) => {
    const result = await showConfirmDialog(
      'Reject Request',
      'Please provide a reason for rejection',
      'Reject',
      true
    );
    
    if (result.isConfirmed && result.value) {
      try {
        await serviceRequestAPI.reject(requestId, result.value);
        showSuccessToast('Success', 'Service request rejected');
        setShowModal(false);
        await fetchRequests();
      } catch (error) {
        console.error('Error rejecting request:', error);
        showErrorToast('Error', 'Failed to reject request');
      }
    }
  };

  const handleAssignStaff = async (requestId, staffId) => {
    try {
      await serviceRequestAPI.assignStaff(requestId, staffId);
      showSuccessToast('Success', 'Staff assigned successfully');
      await fetchRequests();
    } catch (error) {
      console.error('Error assigning staff:', error);
      showErrorToast('Error', 'Failed to assign staff');
    }
  };

  const stats = [
    { label: 'Total Requests', value: serviceRequests.length, color: 'from-blue-500 to-blue-600', icon: FileText },
    { label: 'Pending', value: serviceRequests.filter(r => r.status === 'pending').length, color: 'from-yellow-500 to-yellow-600', icon: Clock },
    { label: 'Approved', value: serviceRequests.filter(r => r.status === 'approved').length, color: 'from-green-500 to-green-600', icon: CheckCircle },
    { label: 'Completed', value: serviceRequests.filter(r => r.status === 'completed').length, color: 'from-emerald-500 to-emerald-600', icon: CheckCircle },
  ];

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
      processing: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Processing' },
      completed: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Completed' }
    };
    const badge = badges[status] || badges.pending;
    return `px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`;
  };

  const getPaymentStatusBadge = (status) => {
    const badges = {
      unpaid: { bg: 'bg-red-100', text: 'text-red-800', label: 'Unpaid' },
      paid: { bg: 'bg-green-100', text: 'text-green-800', label: 'Paid' },
      processing: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Processing' },
      waived: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Waived' }
    };
    const badge = badges[status] || badges.unpaid;
    return `px-2 py-1 rounded text-xs font-medium ${badge.bg} ${badge.text}`;
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#E8E9F5' }}>
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: '#4667CF' }}>Service Requests</h1>
          <p className="text-gray-600 text-sm mt-1">Manage and approve church service requests</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg p-5 shadow hover:shadow-md transition-shadow border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-xs font-medium mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                </div>
                <div className="p-2.5 rounded-lg" style={{ backgroundColor: '#4667CF' }}>
                  <FileText className="text-white" size={20} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg p-5 shadow border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by requester or service type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg transition-all ${filterStatus === 'all' ? 'text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                style={filterStatus === 'all' ? { backgroundColor: '#4667CF' } : {}}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('Pending')}
                className={`px-4 py-2 rounded-lg transition-all ${filterStatus === 'Pending' ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilterStatus('Approved')}
                className={`px-4 py-2 rounded-lg transition-all ${filterStatus === 'Approved' ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Approved
              </button>
              <button
                onClick={() => setFilterStatus('Rejected')}
                className={`px-4 py-2 rounded-lg transition-all ${filterStatus === 'Rejected' ? 'bg-gradient-to-br from-rose-500 to-rose-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Rejected
              </button>
            </div>
          </div>
        </div>

        {/* Requests Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {loading ? (
            <div className="col-span-2 text-center py-12 text-gray-500">Loading requests...</div>
          ) : serviceRequests.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-gray-500">No service requests found</div>
          ) : (
            serviceRequests.map((request) => {
              const ServiceIcon = getServiceIcon(request.request_type);
              return (
                <div key={request.id} className="bg-white rounded-xl shadow-sm border border-blue-200/50 p-6 hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl" style={{ backgroundColor: '#4667CF' }}>
                        <ServiceIcon className="text-white" size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{request.request_type}</h3>
                        <p className="text-sm text-gray-600">{request.requestor_name}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      request.status === 'pending' ? 'bg-amber-100 text-amber-900' :
                      request.status === 'approved' ? 'bg-emerald-100 text-emerald-900' :
                      request.status === 'scheduled' ? 'bg-blue-100 text-blue-900' :
                      request.status === 'completed' ? 'bg-green-100 text-green-900' :
                      'bg-rose-100 text-rose-900'
                    }`}>
                      {request.status}
                    </span>
                  </div>

                  {request.participant_name && (
                    <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-900">
                        <span className="font-medium">Name: </span>
                        {request.participant_name}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar size={16} />
                      <span>Request Date: {new Date(request.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock size={16} />
                      <span>Preferred Date: {request.preferred_date ? new Date(request.preferred_date).toLocaleDateString() : 'Not specified'}</span>
                    </div>
                    {request.assigned_priest && (
                      <div className="flex items-center gap-2 text-sm text-emerald-600">
                        <User size={16} />
                        <span>Assigned: {request.assigned_priest}</span>
                      </div>
                    )}
                  </div>

                  {request.special_requirements && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{request.special_requirements}</p>
                    </div>
                )}

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => handleViewDetails(request)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <Eye size={16} />
                    View Details
                  </button>
                  {request.status === 'Pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(request.id)}
                        className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-all text-sm font-medium flex items-center gap-2"
                        style={{ backgroundColor: '#10b981' }}
                      >
                        <CheckCircle size={16} />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(request.id)}
                        className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-all text-sm font-medium flex items-center gap-2"
                        style={{ backgroundColor: '#ef4444' }}
                      >
                        <XCircle size={16} />
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showModal && selectedRequest && (
        <ModalOverlay isOpen={showModal && selectedRequest} onClose={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">{selectedRequest.type} Request Details</h2>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700">Requester</label>
                  <p className="mt-1 text-gray-900">{selectedRequest.requester}</p>
                </div>
                {(selectedRequest.childName || selectedRequest.deceasedName) && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      {selectedRequest.childName ? 'Child Name' : 'Deceased Name'}
                    </label>
                    <p className="mt-1 text-gray-900">{selectedRequest.childName || selectedRequest.deceasedName}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-700">Phone</label>
                  <p className="mt-1 text-gray-900">{selectedRequest.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-gray-900">{selectedRequest.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Request Date</label>
                  <p className="mt-1 text-gray-900">{selectedRequest.requestDate}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Preferred Date</label>
                  <p className="mt-1 text-gray-900">{selectedRequest.preferredDate}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <p className="mt-1">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedRequest.status === 'Pending' ? 'bg-amber-100 text-amber-900' :
                      selectedRequest.status === 'Approved' ? 'bg-emerald-100 text-emerald-900' :
                      'bg-rose-100 text-rose-900'
                    }`}>
                      {selectedRequest.status}
                    </span>
                  </p>
                </div>
                {selectedRequest.assignedPriest && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Assigned Priest</label>
                    <p className="mt-1 text-gray-900">{selectedRequest.assignedPriest}</p>
                  </div>
                )}
              </div>

              {selectedRequest.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Notes</label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-900">{selectedRequest.notes}</p>
                  </div>
                </div>
              )}

              {selectedRequest.rejectionReason && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Rejection Reason</label>
                  <div className="mt-2 p-4 bg-rose-50 rounded-lg">
                    <p className="text-rose-900">{selectedRequest.rejectionReason}</p>
                  </div>
                </div>
              )}

              {selectedRequest.documents && selectedRequest.documents.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Required Documents</label>
                  <div className="space-y-2">
                    {selectedRequest.documents.map((doc, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                        <FileText size={16} className="text-blue-600" />
                        <span className="text-sm text-blue-900">{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedRequest.status === 'Pending' && (
                <div className="pt-4 border-t border-gray-200">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Assign Priest</label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4">
                    <option value="">Select Priest</option>
                    <option value="Fr. Joseph Smith">Fr. Joseph Smith</option>
                    <option value="Fr. Michael Brown">Fr. Michael Brown</option>
                    <option value="Fr. David Martinez">Fr. David Martinez</option>
                  </select>

                  <label className="text-sm font-medium text-gray-700 mb-2 block">Response Message (Optional)</label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                    rows="3"
                    placeholder="Add any additional notes or instructions..."
                  ></textarea>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
              {selectedRequest.status === 'Pending' && (
                <>
                  <button
                    onClick={() => {
                      handleReject(selectedRequest.id);
                      setShowModal(false);
                    }}
                    className="px-6 py-2 bg-gradient-to-br from-rose-500 to-rose-600 text-white rounded-lg hover:from-rose-600 hover:to-rose-700 transition-all"
                  >
                    Reject Request
                  </button>
                  <button
                    onClick={() => {
                      handleApprove(selectedRequest.id);
                      setShowModal(false);
                    }}
                    className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition-all"
                    style={{ backgroundColor: '#10b981' }}
                  >
                    Approve Request
                  </button>
                </>
              )}
            </div>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
};

export default ServiceRequests;
