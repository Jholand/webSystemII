import { useState, useEffect } from 'react';
import { Search, Eye, FileText, Clock, CheckCircle, XCircle, DollarSign, User, Calendar } from 'lucide-react';
import { serviceRequestAPI } from '../../services/serviceRequestAPI';
import { showInfoToast, showErrorToast } from '../../utils/sweetAlertHelper';

const PriestServiceRequests = () => {
  const [serviceRequests, setServiceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadServiceRequests();
  }, []);

  const loadServiceRequests = async () => {
    try {
      setLoading(true);
      const response = await serviceRequestAPI.getAll();
      setServiceRequests(response.data || []);
    } catch (error) {
      console.error('Error loading service requests:', error);
      showErrorToast('Failed to load service requests');
      setServiceRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = serviceRequests.filter(req => {
    const matchesSearch = 
      req.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.service_type?.type_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || req.status?.toLowerCase() === filterStatus.toLowerCase();
    const matchesCategory = filterCategory === 'all' || req.service_type?.category === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case 'pending':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium flex items-center gap-1">
          <Clock size={14} /> Pending
        </span>;
      case 'approved':
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center gap-1">
          <CheckCircle size={14} /> Approved
        </span>;
      case 'rejected':
        return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium flex items-center gap-1">
          <XCircle size={14} /> Rejected
        </span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
          {status || 'Unknown'}
        </span>;
    }
  };

  const getPaymentBadge = (paymentStatus) => {
    const statusLower = paymentStatus?.toLowerCase() || '';
    switch (statusLower) {
      case 'paid':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">Paid</span>;
      case 'waived':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">Waived</span>;
      case 'unpaid':
        return <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">Unpaid</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">N/A</span>;
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
    // Auto-switch to the request's category tab
    if (request.service_type?.category && request.service_type.category !== filterCategory) {
      setFilterCategory(request.service_type.category);
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

  const stats = [
    {
      label: 'Total Requests',
      value: serviceRequests.length,
      icon: FileText,
      color: 'bg-blue-500'
    },
    {
      label: 'Pending',
      value: serviceRequests.filter(r => r.status?.toLowerCase() === 'pending').length,
      icon: Clock,
      color: 'bg-yellow-500'
    },
    {
      label: 'Approved',
      value: serviceRequests.filter(r => r.status?.toLowerCase() === 'approved').length,
      icon: CheckCircle,
      color: 'bg-green-500'
    },
    {
      label: 'Requires Payment',
      value: serviceRequests.filter(r => r.service_type?.requires_payment && r.payment_status === 'unpaid').length,
      icon: DollarSign,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Service Requests</h1>
          <p className="text-gray-600 mt-1">View all service requests from parishioners (Read Only)</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name or service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="Sacrament & Schedule">Sacrament & Schedule</option>
              <option value="Document">Document</option>
              <option value="Facility & Event">Facility & Event</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Request ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Requestor</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Service Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    Loading service requests...
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    No service requests found
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">SR-{request.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-900">{request.user?.name || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{request.service_type?.type_name || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-gray-600">{request.service_type?.category || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={14} />
                        {new Date(request.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-6 py-4">
                      {request.service_type?.requires_payment ? getPaymentBadge(request.payment_status) : (
                        <span className="text-xs text-gray-500">No Fee</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewDetails(request)}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-1"
                      >
                        <Eye size={16} />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Details Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Service Request Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Request Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Request ID</label>
                  <p className="text-base font-semibold text-gray-900">SR-{selectedRequest.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                  {getStatusBadge(selectedRequest.status)}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Requestor</label>
                  <p className="text-base text-gray-900">{selectedRequest.user?.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Service Type</label>
                  <p className="text-base text-gray-900">{selectedRequest.service_type?.type_name || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Category</label>
                  <p className="text-base text-gray-900">{selectedRequest.service_type?.category || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Submitted Date</label>
                  <p className="text-base text-gray-900">
                    {new Date(selectedRequest.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Payment Info */}
              {selectedRequest.service_type?.requires_payment && (
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Fee Amount</label>
                      <p className="text-base font-semibold text-gray-900">
                        ₱{Number(selectedRequest.service_type?.default_fee || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Payment Status</label>
                      {getPaymentBadge(selectedRequest.payment_status)}
                    </div>
                  </div>
                </div>
              )}

              {/* Request Details */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Request Details</h4>
                {selectedRequest.request_data && Object.keys(selectedRequest.request_data).length > 0 ? (
                  <div className="grid grid-cols-1 gap-3">
                    {Object.entries(selectedRequest.request_data).map(([key, value]) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-600 mb-1 capitalize">
                          {key.replace(/_/g, ' ')}
                        </label>
                        <p className="text-base text-gray-900">
                          {typeof value === 'object' ? JSON.stringify(value) : value || 'N/A'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No additional details provided</p>
                )}
              </div>

              {/* Processing Info */}
              {selectedRequest.processed_by_user && (
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Processing Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Processed By</label>
                      <p className="text-base text-gray-900">{selectedRequest.processed_by_user?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Processed Date</label>
                      <p className="text-base text-gray-900">
                        {selectedRequest.processed_at ? new Date(selectedRequest.processed_at).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    {selectedRequest.admin_notes && (
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-600 mb-1">Admin Notes</label>
                        <p className="text-base text-gray-900">{selectedRequest.admin_notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
              <button
                onClick={() => setShowModal(false)}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
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

export default PriestServiceRequests;
