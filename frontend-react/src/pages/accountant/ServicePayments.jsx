import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Search, Filter, Eye, Calendar, User, FileText, Plus, CheckCircle, Receipt, X, Clock, AlertCircle, Download, TrendingUp, Activity, CreditCard, RotateCcw } from 'lucide-react';
import { serviceRequestAPI } from '../../services/serviceRequestAPI';
import { paymentRecordAPI } from '../../services/dataSync';
import { showSuccessToast, showErrorToast, showDeleteConfirm } from '../../utils/sweetAlertHelper';
import { formatDate } from '../../utils/dateFormatter';
import api from '../../services/api';
import Pagination from '../../components/Pagination';
import { jsPDF } from 'jspdf';

const ServicePayments = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchPayableRequests();
    
    // Listen for payment updates
    const handlePaymentUpdate = () => {
      console.log('💰 Payment updated event received, refreshing service requests...');
      fetchPayableRequests();
    };
    
    window.addEventListener('paymentUpdated', handlePaymentUpdate);
    
    return () => {
      window.removeEventListener('paymentUpdated', handlePaymentUpdate);
    };
  }, [filterPaymentStatus, filterCategory, searchTerm]);

  const fetchPayableRequests = async () => {
    try {
      setLoading(true);
      console.log('=== FETCHING SERVICE REQUESTS ===');
      const response = await serviceRequestAPI.getAll();
      console.log('Raw response:', response);
      
      // Get all requests from response
      const allRequests = response.data || response || [];
      console.log('Total requests received:', allRequests.length);
      console.log('First request sample:', allRequests[0]);
      
      // First, filter to only show requests that have a service fee (payable requests)
      let filtered = allRequests.filter(r => {
        // Check multiple possible fee fields
        const serviceFee = parseFloat(r.service_fee || 0);
        const defaultFee = parseFloat(r.service_request_type?.default_fee || 0);
        const fee = serviceFee > 0 ? serviceFee : defaultFee;
        
        console.log(`Request ID ${r.id}: service_fee="${r.service_fee}", default_fee="${r.service_request_type?.default_fee}", final fee=${fee}, has fee: ${fee > 0}`);
        return fee > 0;
      });
      
      console.log('Requests with fees:', filtered.length);
      
      // Apply payment status filter
      if (filterPaymentStatus !== 'all') {
        console.log('Applying payment status filter:', filterPaymentStatus);
        filtered = filtered.filter(r => r.payment_status === filterPaymentStatus);
      }
      
      // Apply category filter  
      if (filterCategory !== 'all') {
        console.log('Applying category filter:', filterCategory);
        filtered = filtered.filter(r => {
          const category = (r.category || '').toLowerCase();
          const serviceTypeCategory = (r.service_request_type?.category || '').toLowerCase();
          const filterCat = filterCategory.toLowerCase();
          
          console.log(`Request ${r.id}: category="${r.category}", service_type_category="${r.service_request_type?.category}", filterCat="${filterCat}"`);
          
          // Check both the request category and service type category
          const categoryToCheck = category || serviceTypeCategory;
          
          // Handle both 'sacrament' and 'Sacrament & Schedule' formats
          if (filterCat === 'sacrament') {
            const match = categoryToCheck === 'sacrament' || categoryToCheck.includes('sacrament');
            console.log(`  Sacrament check: ${match}`);
            return match;
          } else if (filterCat === 'document') {
            const match = categoryToCheck === 'document' || categoryToCheck.includes('document');
            console.log(`  Document check: ${match}`);
            return match;
          } else if (filterCat === 'facility') {
            const match = categoryToCheck === 'facility' || categoryToCheck.includes('facility');
            console.log(`  Facility check: ${match}`);
            return match;
          }
          return categoryToCheck === filterCat;
        });
        console.log('After category filter:', filtered.length);
      }
      
      // Apply search filter
      if (searchTerm) {
        console.log('Applying search term:', searchTerm);
        filtered = filtered.filter(r => {
          const serviceName = r.service_request_type?.type_name || r.request_type || '';
          const category = r.category || '';
          const userName = r.user?.name || '';
          const detailsName = r.details_json?.full_name || r.details_json?.baby_name || '';
          
          return serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 detailsName.toLowerCase().includes(searchTerm.toLowerCase());
        });
      }
      
      console.log('Final filtered requests:', filtered.length);
      console.log('Setting service requests:', filtered);
      setServiceRequests(filtered);
    } catch (error) {
      console.error('Error fetching requests:', error);
      showErrorToast('Error', 'Failed to load payment requests');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordWalkInPayment = (request) => {
    // Navigate to Record Walk-In Payment page with pre-filled data
    navigate('/accountant/payments/new', {
      state: {
        fromServiceRequest: true,
        serviceRequestId: request.id,
        paymentType: 'service_fee',
        guestName: request.user?.name || request.details_json?.full_name || 'Unknown',
        guestContact: request.user?.email || '',
        category: request.service_request_type?.type_name || request.category,
        amount: request.service_fee,
        notes: `Payment for ${request.service_request_type?.type_name || 'service request'} (Request ID: ${request.id})`
      }
    });
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRequests = serviceRequests.slice(indexOfFirstItem, indexOfLastItem);

  const stats = [
    {
      label: 'Total Payable',
      value: serviceRequests.length,
      color: 'from-blue-500 to-blue-600',
      icon: DollarSign
    },
    {
      label: 'Unpaid',
      value: serviceRequests.filter(r => r.payment_status === 'unpaid').length,
      color: 'from-red-500 to-red-600',
      icon: FileText
    },
    {
      label: 'Paid',
      value: serviceRequests.filter(r => r.payment_status === 'paid').length,
      color: 'from-green-500 to-green-600',
      icon: CheckCircle
    },
    {
      label: 'Total Amount',
      value: `₱${serviceRequests.reduce((sum, r) => sum + parseFloat(r.service_fee || 0), 0).toFixed(2)}`,
      color: 'from-purple-500 to-purple-600',
      icon: Receipt
    }
  ];

  const getPaymentStatusBadge = (status) => {
    const badges = {
      unpaid: { bg: 'bg-red-100', text: 'text-red-800' },
      paid: { bg: 'bg-green-100', text: 'text-green-800' },
      processing: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      waived: { bg: 'bg-blue-100', text: 'text-blue-800' }
    };
    const badge = badges[status] || badges.unpaid;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {status?.toUpperCase()}
      </span>
    );
  };

  const handleViewDetails = (request) => {
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
      window.dispatchEvent(new CustomEvent('paymentViewed'));
    }
    
    // Dispatch event to refresh sidebar count
    window.dispatchEvent(new CustomEvent('paymentViewed'));
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#4158D0' }}>Service Payments</h1>
            <p className="text-gray-600 mt-1">Manage and process service fee payments</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border border-gray-200 group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-transparent rounded-full transform translate-x-12 -translate-y-12 opacity-50"></div>
                <div className="relative flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl shadow-lg transform group-hover:scale-110 transition-transform" style={{ 
                    background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
                    boxShadow: '0 4px 12px rgba(65, 88, 208, 0.3)'
                  }}>
                    <IconComponent className="text-white" size={24} />
                  </div>
                </div>
                <div className="relative">
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">{stat.value}</h3>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Payment Status Tabs */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-6">
          <div className="flex flex-wrap gap-2">
            {['all', 'unpaid', 'processing', 'paid', 'waived'].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setFilterPaymentStatus(status);
                  setCurrentPage(1);
                }}
                className={`px-6 py-2.5 rounded-xl font-semibold transition-all ${
                  filterPaymentStatus === status
                    ? 'shadow-lg'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                style={{
                  background: filterPaymentStatus === status ? 'rgba(65, 88, 208, 0.1)' : 'transparent',
                  backdropFilter: filterPaymentStatus === status ? 'blur(10px)' : 'none',
                  WebkitBackdropFilter: filterPaymentStatus === status ? 'blur(10px)' : 'none',
                  color: filterPaymentStatus === status ? '#4158D0' : undefined,
                  border: filterPaymentStatus === status ? '1px solid rgba(65, 88, 208, 0.2)' : '1px solid transparent',
                  boxShadow: filterPaymentStatus === status ? '0 4px 12px rgba(65, 88, 208, 0.15)' : 'none'
                }}
              >
                {status === 'all' ? 'All Payments' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Category</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'All Categories' },
              { value: 'sacrament', label: 'Sacrament & Schedule' },
              { value: 'document', label: 'Document Request' },
              { value: 'facility', label: 'Facility & Event' }
            ].map((category) => (
              <button
                key={category.value}
                onClick={() => {
                  console.log('Category button clicked:', category.value);
                  setFilterCategory(category.value);
                  setCurrentPage(1);
                }}
                className={`px-6 py-2.5 rounded-xl font-semibold transition-all ${
                  filterCategory === category.value
                    ? 'shadow-lg'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                style={{
                  background: filterCategory === category.value ? 'rgba(65, 88, 208, 0.1)' : 'transparent',
                  backdropFilter: filterCategory === category.value ? 'blur(10px)' : 'none',
                  WebkitBackdropFilter: filterCategory === category.value ? 'blur(10px)' : 'none',
                  color: filterCategory === category.value ? '#4158D0' : undefined,
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: filterCategory === category.value ? 'rgba(65, 88, 208, 0.2)' : 'transparent',
                  boxShadow: filterCategory === category.value ? '0 4px 12px rgba(65, 88, 208, 0.15)' : 'none'
                }}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Filter */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by service type or user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-2xl shadow-2xl border border-purple-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="ml-4 text-gray-600">Loading payment requests...</p>
            </div>
          ) : serviceRequests.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <DollarSign className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-semibold mb-2">No payment requests found</p>
              <p className="text-sm">Service requests with fees will appear here when users submit them.</p>
              <p className="text-xs mt-2 text-gray-400">Make sure service types have default fees configured.</p>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg inline-block">
                <p className="text-xs text-blue-700">
                  <strong>Debug Info:</strong><br/>
                  Check browser console (F12) for detailed logs
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Service Type</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Payment Status</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{request.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="font-medium">{request.service_request_type?.type_name || 'N/A'}</div>
                        <div className="text-xs text-gray-500 capitalize">{request.category}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {request.user?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(request.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        ₱{parseFloat(request.service_fee || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPaymentStatusBadge(request.payment_status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleViewDetails(request)}
                            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {request.payment_status === 'unpaid' && (
                            <button
                              onClick={() => handleRecordWalkInPayment(request)}
                              className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                              title="Record walk-in payment for this request"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Pagination */}
        {!loading && serviceRequests.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={serviceRequests.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        )}
      </div>

      {/* View Details Modal */}
      {showModal && selectedRequest && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Payment Details</h2>
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
              {/* Payment Summary */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-blue-100 text-sm mb-1">Service Fee</p>
                    <p className="text-4xl font-bold">₱{parseFloat(selectedRequest.service_fee || 0).toFixed(2)}</p>
                  </div>
                  <div className="bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                    {getPaymentStatusBadge(selectedRequest.payment_status)}
                  </div>
                </div>
              </div>

              {/* Request Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600">Request ID</label>
                  <p className="text-gray-900">#{selectedRequest.id}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Service Type</label>
                  <p className="text-gray-900">{selectedRequest.service_request_type?.type_name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Requested By</label>
                  <p className="text-gray-900">{selectedRequest.user?.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Request Date</label>
                  <p className="text-gray-900">
                    {new Date(selectedRequest.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Request Details */}
              {selectedRequest.details_json && Object.keys(selectedRequest.details_json).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Service Details</h3>
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

              {/* Payment History/Notes */}
              {selectedRequest.admin_notes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-gray-700">{selectedRequest.admin_notes}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ServicePayments;
