import { useState, useEffect } from 'react';
import { Calendar, Eye, Filter, Search, Clock } from 'lucide-react';
import api from '../../services/api';

const MyServiceRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/service-requests');
      setRequests(response.data.data || []);
    } catch (err) {
      setError('Failed to load your requests');
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      approved: 'bg-green-50 text-green-700 border-green-200',
      rejected: 'bg-red-50 text-red-700 border-red-200',
      completed: 'bg-blue-50 text-blue-700 border-blue-200',
      processing: 'bg-purple-50 text-purple-700 border-purple-200'
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium border ${statusStyles[status] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
        {status?.toUpperCase()}
      </span>
    );
  };

  const getPaymentStatusBadge = (status) => {
    const statusStyles = {
      paid: 'bg-green-50 text-green-700 border-green-200',
      unpaid: 'bg-red-50 text-red-700 border-red-200',
      processing: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      waived: 'bg-blue-50 text-blue-700 border-blue-200'
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium border ${statusStyles[status] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
        {status?.toUpperCase()}
      </span>
    );
  };

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
    // Auto-switch to the request's category tab
    if (request.category && request.category !== filterCategory) {
      setFilterCategory(request.category);
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || request.category === filterCategory;
    const matchesSearch = request.service_request_type?.type_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          request.category?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white overflow-hidden flex flex-col p-6">
      <div className="flex-1 flex flex-col space-y-6 overflow-hidden">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 flex-shrink-0">
          <h1 className="text-2xl font-semibold text-gray-900">Service Request Records</h1>
          <p className="text-sm text-gray-600 mt-1">Track and view all your service requests</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4 flex-shrink-0">
          {/* Status Filter */}
          <div>
            <label className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-2 block">Status</label>
            <div className="flex flex-wrap gap-2">
              {['all', 'pending', 'processing', 'approved', 'completed', 'rejected'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filterStatus === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-2 block">Category</label>
            <div className="flex flex-wrap gap-2">
              {['all', 'sacrament', 'document', 'facility'].map((category) => (
                <button
                  key={category}
                  onClick={() => setFilterCategory(category)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filterCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category === 'all' ? 'All' : 
                   category === 'sacrament' ? 'Sacrament & Schedule' :
                   category === 'document' ? 'Document Request' :
                   'Facility & Event'}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div>
            <label className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-2 block">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by service type or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-600 flex-shrink-0">
          Showing <span className="font-medium text-gray-900">{filteredRequests.length}</span> of <span className="font-medium text-gray-900">{requests.length}</span> requests
        </div>

        {/* Requests Table */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex-shrink-0">
            {error}
          </div>
        )}

        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center flex-shrink-0">
            <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Requests Found</h3>
            <p className="text-sm text-gray-600">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your filters' 
                : "You haven't made any service requests yet"}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden flex-1 flex flex-col min-h-0">
            <div className="overflow-auto flex-1">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Service Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Scheduled</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Payment</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Fee</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(request.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                        {request.service_request_type?.type_name || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="text-gray-700 capitalize">{request.category || 'N/A'}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {request.scheduled_date ? (
                          <div>
                            <div className="font-medium">
                              {new Date(request.scheduled_date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                            {request.scheduled_time && (
                              <div className="text-xs text-gray-600">{request.scheduled_time}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">Not scheduled</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-4 py-3">
                        {request.service_request_type?.requires_payment ? (
                          getPaymentStatusBadge(request.payment_status || 'unpaid')
                        ) : (
                          <span className="text-xs text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {request.service_fee ? `₱${parseFloat(request.service_fee).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '₱0.00'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleViewRequest(request)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          <Eye size={14} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Request Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Basic Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Request ID</label>
                  <p className="text-sm font-medium text-gray-900 mt-1">#{selectedRequest.id}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Submitted</label>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {new Date(selectedRequest.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Service Type</label>
                  <p className="text-sm font-medium text-gray-900 mt-1">{selectedRequest.service_request_type?.type_name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Category</label>
                  <p className="text-sm font-medium text-gray-900 mt-1 capitalize">{selectedRequest.category || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                </div>
                {selectedRequest.service_request_type?.requires_payment && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Payment</label>
                    <div className="mt-1">{getPaymentStatusBadge(selectedRequest.payment_status || 'unpaid')}</div>
                  </div>
                )}
              </div>

              {/* Scheduled Info */}
              {(selectedRequest.scheduled_date || selectedRequest.scheduled_time) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <label className="text-xs font-medium text-blue-900 uppercase">Scheduled Appointment</label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    {selectedRequest.scheduled_date && (
                      <div>
                        <p className="text-xs text-blue-700">Date</p>
                        <p className="text-sm font-semibold text-blue-900 mt-0.5">
                          {new Date(selectedRequest.scheduled_date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    )}
                    {selectedRequest.scheduled_time && (
                      <div>
                        <p className="text-xs text-blue-700">Time</p>
                        <p className="text-sm font-semibold text-blue-900 mt-0.5">{selectedRequest.scheduled_time}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Service Fee */}
              {selectedRequest.service_fee && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <label className="text-xs font-medium text-green-900 uppercase">Service Fee</label>
                  <p className="text-2xl font-bold text-green-900 mt-1">
                    ₱{parseFloat(selectedRequest.service_fee).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              )}

              {/* Request Details */}
              {selectedRequest.details_json && Object.keys(selectedRequest.details_json).length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Request Details</h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
                    {Object.entries(selectedRequest.details_json).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="font-medium text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                        <span className="text-gray-900">{value || 'N/A'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preferred Date */}
              {selectedRequest.preferred_date && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <label className="text-xs font-medium text-yellow-900 uppercase">Preferred Date</label>
                  <p className="text-sm font-semibold text-yellow-900 mt-1">
                    {new Date(selectedRequest.preferred_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}

              {/* Admin Notes */}
              {selectedRequest.admin_notes && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Admin Notes</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700">{selectedRequest.admin_notes}</p>
                  </div>
                </div>
              )}

              {/* Assigned Staff */}
              {selectedRequest.assigned_staff && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <label className="text-xs font-medium text-purple-900 uppercase">Assigned Staff</label>
                  <p className="text-sm font-semibold text-purple-900 mt-1">{selectedRequest.assigned_staff.name}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
              <button
                onClick={() => setShowModal(false)}
                className="w-full px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyServiceRequests;
