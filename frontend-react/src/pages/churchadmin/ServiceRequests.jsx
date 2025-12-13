import { useState, useEffect } from 'react';
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, FileText, Calendar, User, DollarSign, AlertCircle } from 'lucide-react';
import Pagination from '../../components/Pagination';
import { serviceRequestAPI } from '../../services/serviceRequestAPI';
import api from '../../services/api';
import { showSuccessToast, showErrorToast, showConfirm, showInputDialog } from '../../utils/sweetAlertHelper';
import { formatDate } from '../../utils/dateFormatter';

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
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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
    // Check if request requires payment and payment is not processed
    const request = serviceRequests.find(r => r.id === requestId) || selectedRequest;
    
    if (request?.service_request_type?.requires_payment && request?.payment_status === 'unpaid') {
      showErrorToast(
        'Payment Required',
        'This request requires payment processing by the accountant before it can be approved.'
      );
      return;
    }
    
    const result = await showConfirm(
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
        
        // Dispatch event to update sidebar notification
        window.dispatchEvent(new CustomEvent('serviceRequestUpdated'));
        
        await fetchRequests();
      } catch (error) {
        console.error('Error approving request:', error);
        showErrorToast('Error', 'Failed to approve request');
      }
    }
  };

  const handleReject = async (requestId) => {
    const result = await showInputDialog({
      title: 'Reject Request',
      text: 'Please provide a reason for rejection',
      inputPlaceholder: 'Enter rejection reason...',
      confirmButtonText: 'Reject',
      inputValidator: (value) => {
        if (!value) {
          return 'You need to provide a reason!';
        }
      }
    });
    
    if (result.isConfirmed && result.value) {
      try {
        await serviceRequestAPI.reject(requestId, result.value);
        showSuccessToast('Success', 'Service request rejected');
        setShowModal(false);
        
        // Dispatch event to update sidebar notification
        window.dispatchEvent(new CustomEvent('serviceRequestUpdated'));
        
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
      setShowModal(false);
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

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
    // Auto-switch to the request's category tab
    if (request.category && request.category !== filterCategory) {
      setFilterCategory(request.category);
    }
    
    // Mark request as viewed in localStorage
    const viewedRequests = JSON.parse(localStorage.getItem('viewedServiceRequests') || '[]');
    if (!viewedRequests.includes(request.id)) {
      viewedRequests.push(request.id);
      localStorage.setItem('viewedServiceRequests', JSON.stringify(viewedRequests));
      
      // Dispatch event to update sidebar notification
      window.dispatchEvent(new CustomEvent('serviceRequestViewed'));
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      approved: { bg: 'bg-green-100', text: 'text-green-800' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800' },
      processing: { bg: 'bg-blue-100', text: 'text-blue-800' },
      completed: { bg: 'bg-emerald-100', text: 'text-emerald-800' }
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {status?.toUpperCase()}
      </span>
    );
  };

  const getPaymentStatusBadge = (status) => {
    if (!status) return null;
    const badges = {
      unpaid: { bg: 'bg-red-100', text: 'text-red-800' },
      paid: { bg: 'bg-green-100', text: 'text-green-800' },
      processing: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      waived: { bg: 'bg-blue-100', text: 'text-blue-800' }
    };
    const badge = badges[status] || badges.unpaid;
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${badge.bg} ${badge.text}`}>
        {status?.toUpperCase()}
      </span>
    );
  };
  
  // Pagination logic
  const totalPages = Math.ceil(serviceRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRequests = serviceRequests.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-white">
      <div className="space-y-6">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 bg-white">
          <h1 className="text-2xl font-bold mb-1" style={{ color: '#4158D0' }}>Service Requests</h1>
          <p className="text-gray-600 text-sm">Review and approve church service requests</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            const colors = ['#4158D0', '#f59e0b', '#10b981', '#8b5cf6'];
            const color = colors[index % colors.length];
            return (
              <div key={index} className="bg-white rounded-lg p-5 shadow hover:shadow-lg transition-all border border-gray-200 cursor-pointer group">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 rounded-lg group-hover:scale-110 transition-transform" style={{ backgroundColor: color + '20' }}>
                    <IconComponent style={{ color: color }} size={24} />
                  </div>
                  <IconComponent size={16} className="text-gray-400" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-sm font-semibold text-gray-700">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Status Tabs */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-5 mb-5">
          <div className="flex flex-wrap gap-2 mb-4">
            {['all', 'pending', 'processing', 'approved', 'completed', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setFilterStatus(status);
                  setCurrentPage(1);
                }}
                className={`px-6 py-2.5 rounded-xl font-semibold transition-all ${
                  filterStatus === status
                    ? 'shadow-lg'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                style={{
                  background: filterStatus === status ? 'rgba(65, 88, 208, 0.1)' : 'transparent',
                  backdropFilter: filterStatus === status ? 'blur(10px)' : 'none',
                  WebkitBackdropFilter: filterStatus === status ? 'blur(10px)' : 'none',
                  color: filterStatus === status ? '#4158D0' : undefined,
                  border: filterStatus === status ? '1px solid rgba(65, 88, 208, 0.2)' : '1px solid transparent',
                  boxShadow: filterStatus === status ? '0 4px 12px rgba(65, 88, 208, 0.15)' : 'none'
                }}
              >
                {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="all">All Categories</option>
                <option value="sacrament">Sacrament & Schedule</option>
                <option value="document">Document Request</option>
                <option value="facility">Facility & Event</option>
              </select>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Total: <span className="font-semibold">{serviceRequests.length}</span> requests
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
          ) : serviceRequests.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="mx-auto text-gray-300 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No requests found</h3>
              <p className="text-gray-600">No service requests match your filters</p>
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
                        Service Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Category
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Fee / Payment
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
                    {currentRequests.map((request) => (
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
                          <span className="text-sm font-medium text-gray-900">
                            {request.service_request_type?.type_name || 'N/A'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-sm text-gray-900 capitalize">
                            {request.category || 'N/A'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ₱{parseFloat(request.service_fee || 0).toFixed(2)}
                          </div>
                          {request.service_request_type?.requires_payment && (
                            <span className={`inline-block px-2 py-1 text-xs font-semibold rounded mt-1 ${
                              request.payment_status === 'paid' 
                                ? 'bg-green-100 text-green-800' 
                                : request.payment_status === 'waived'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {request.payment_status ? request.payment_status.toUpperCase() : 'UNPAID'}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {request.status === 'pending' && <Clock className="text-yellow-500" size={18} />}
                            {request.status === 'processing' && <AlertCircle className="text-blue-500" size={18} />}
                            {request.status === 'approved' && <CheckCircle className="text-green-500" size={18} />}
                            {request.status === 'completed' && <CheckCircle className="text-green-600" size={18} />}
                            {request.status === 'rejected' && <XCircle className="text-red-500" size={18} />}
                            {getStatusBadge(request.status)}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                          {formatDate(request.created_at)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleViewDetails(request)}
                              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                              style={{ color: '#4158D0' }}
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                            {request.status === 'pending' && (
                              <>
                                {request.service_request_type?.requires_payment && request.payment_status === 'unpaid' ? (
                                  <button
                                    className="p-1.5 bg-orange-100 text-orange-600 rounded cursor-not-allowed"
                                    title="Awaiting Payment"
                                    disabled
                                  >
                                    <AlertCircle size={16} />
                                  </button>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => handleApprove(request.id)}
                                      className="p-1.5 hover:bg-green-50 rounded transition-colors"
                                      style={{ color: '#10b981' }}
                                      title="Approve"
                                    >
                                      <CheckCircle size={16} />
                                    </button>
                                    <button
                                      onClick={() => handleReject(request.id)}
                                      className="p-1.5 hover:bg-red-50 rounded transition-colors"
                                      style={{ color: '#ef4444' }}
                                      title="Reject"
                                    >
                                      <XCircle size={16} />
                                    </button>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              {serviceRequests.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  onItemsPerPageChange={setItemsPerPage}
                  totalItems={serviceRequests.length}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* View Details Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Request Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Payment Warning Banner */}
              {selectedRequest.service_request_type?.requires_payment && selectedRequest.payment_status === 'unpaid' && (
                <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-orange-400 mr-3" />
                    <div>
                      <h3 className="text-sm font-semibold text-orange-800">Payment Processing Required</h3>
                      <p className="text-sm text-orange-700 mt-1">
                        This request requires payment of ₱{parseFloat(selectedRequest.service_fee || 0).toFixed(2)}. 
                        The accountant must process the payment before this request can be approved.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600">Request ID</label>
                  <p className="text-gray-900">#{selectedRequest.id}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Service Type</label>
                  <p className="text-gray-900">{selectedRequest.service_request_type?.type_name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Category</label>
                  <p className="text-gray-900 capitalize">{selectedRequest.category || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Requested By</label>
                  <p className="text-gray-900">{selectedRequest.user?.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Submitted Date</label>
                  <p className="text-gray-900">
                    {formatDate(selectedRequest.created_at)}
                  </p>
                </div>
              </div>

              {/* Payment Info */}
              {selectedRequest.service_request_type?.requires_payment && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">Payment Information</h3>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-blue-800">Service Fee</p>
                      <p className="text-2xl font-bold text-blue-900">
                        ₱{parseFloat(selectedRequest.service_fee || 0).toFixed(2)}
                      </p>
                    </div>
                    <div>{getPaymentStatusBadge(selectedRequest.payment_status)}</div>
                  </div>
                </div>
              )}

              {/* Request Details */}
              {selectedRequest.details_json && Object.keys(selectedRequest.details_json).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Request Details</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    {Object.entries(selectedRequest.details_json).map(([key, value]) => (
                      <div key={key} className="flex justify-between border-b border-gray-200 pb-2">
                        <span className="text-sm font-medium text-gray-600 capitalize">
                          {key.replace(/_/g, ' ')}:
                        </span>
                        <span className="text-sm text-gray-900">{value || 'N/A'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preferred Date */}
              {selectedRequest.preferred_date && (
                <div>
                  <label className="text-sm font-semibold text-gray-600">Preferred Date</label>
                  <p className="text-gray-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {formatDate(selectedRequest.preferred_date)}
                  </p>
                </div>
              )}

              {/* Admin Notes */}
              {selectedRequest.admin_notes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Admin Notes</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-gray-700">{selectedRequest.admin_notes}</p>
                  </div>
                </div>
              )}

              {/* Assigned Staff */}
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-2">Assign Staff</label>
                <select
                  value={selectedRequest.assigned_staff_id || ''}
                  onChange={(e) => handleAssignStaff(selectedRequest.id, e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Staff Member</option>
                  {staffMembers.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.name} - {staff.role}
                    </option>
                  ))}
                </select>
                {selectedRequest.assigned_staff && (
                  <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                    <User className="w-4 h-4" />
                    Currently assigned to: {selectedRequest.assigned_staff.name}
                  </p>
                )}
              </div>

              {/* Admin Notes Input */}
              {selectedRequest.status === 'pending' && (
                <div>
                  <label className="text-sm font-semibold text-gray-600 block mb-2">Add Notes (Optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    placeholder="Add any notes or comments..."
                  ></textarea>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3">
              {selectedRequest.status === 'pending' ? (
                <>
                  {selectedRequest.service_request_type?.requires_payment && selectedRequest.payment_status === 'unpaid' ? (
                    <div className="flex-1 px-4 py-3 bg-orange-100 text-orange-800 rounded-lg flex items-center justify-center gap-2 border border-orange-300">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-medium">Awaiting Payment Processing by Accountant</span>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => handleApprove(selectedRequest.id)}
                        className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Approve Request
                      </button>
                      <button
                        onClick={() => handleReject(selectedRequest.id)}
                        className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-5 h-5" />
                        Reject Request
                      </button>
                    </>
                  )}
                </>
              ) : (
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceRequests;
