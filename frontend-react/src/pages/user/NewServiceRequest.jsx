import { useState, useEffect } from 'react';
import { 
  Baby, Cross, Heart, Church, UserCog, Upload, Award,
  Building, Package, Calendar, Home, ChevronRight, X,
  FileText, DollarSign, Clock, CheckCircle, AlertCircle, Eye
} from 'lucide-react';
import { showSuccessToast, showErrorToast } from '../../utils/sweetAlertHelper';
import api from '../../services/api';
import { serviceRequestTypeAPI } from '../../services/serviceRequestTypeAPI';
import { formatDate } from '../../utils/dateFormatter';
import ModalOverlay from '../../components/ModalOverlay';

const RequestService = () => {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});

  const icons = {
    Baby, Cross, Heart, Church, UserCog, Upload, Award,
    Building, Package, Calendar, Home, 
    UserEdit: UserCog // Map UserEdit to UserCog for backward compatibility
  };

  useEffect(() => {
    fetchServiceTypes();
    fetchMyRequests();
  }, []);

  const fetchServiceTypes = async () => {
    try {
      const data = await serviceRequestTypeAPI.getAll();
      setServiceTypes(data || []);
    } catch (error) {
      console.error('Error fetching service types:', error);
    }
  };

  const fetchMyRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/service-requests');
      setMyRequests(response.data.data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setMyRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const groupedTypes = serviceTypes.reduce((acc, type) => {
    if (!acc[type.category]) {
      acc[type.category] = [];
    }
    acc[type.category].push(type);
    return acc;
  }, {});

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setShowRequestModal(true);
    const initialData = {};
    // Parse required_fields if it's a string
    const requiredFields = typeof type.required_fields === 'string' 
      ? JSON.parse(type.required_fields) 
      : (type.required_fields || []);
    
    requiredFields.forEach(field => {
      initialData[field] = '';
    });
    setFormData(initialData);
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const requestData = {
        service_request_type_id: selectedType.id,
        category: selectedType.category,
        details_json: formData,
        service_fee: selectedType.default_fee,
        special_instructions: ''
      };

      await api.post('/service-requests', requestData);
      
      showSuccessToast('Success!', 'Your service request has been submitted successfully.');
      
      // Dispatch event to update sidebar notification counters
      window.dispatchEvent(new CustomEvent('serviceRequestUpdated'));
      
      setShowRequestModal(false);
      setSelectedType(null);
      setFormData({});
      fetchMyRequests();
    } catch (error) {
      console.error('Error submitting request:', error);
      showErrorToast('Error!', 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      scheduled: 'bg-indigo-100 text-indigo-800',
      in_progress: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      rejected: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || colors.pending;
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      unpaid: 'bg-red-100 text-red-800',
      paid: 'bg-green-100 text-green-800',
      waived: 'bg-blue-100 text-blue-800',
      partial: 'bg-orange-100 text-orange-800',
    };
    return colors[status] || colors.unpaid;
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h1 className="text-3xl font-bold" style={{ color: '#4158D0' }}>Request Service</h1>
          <p className="text-gray-600 mt-1">Request church services, schedule sacraments, or reserve facilities</p>
        </div>

        {/* Service Categories - Organized Dropdown Style */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-semibold mb-6" style={{ color: '#4158D0' }}>Browse Services by Category</h2>
          
          <div className="space-y-6">
            {Object.entries(groupedTypes).map(([category, types]) => (
              <div key={category} className="border border-gray-200 rounded-2xl overflow-hidden">
                {/* Category Header */}
                <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#4158D0' }}></div>
                    {category}
                    <span className="ml-auto text-sm font-normal text-gray-600">{types.length} services</span>
                  </h3>
                </div>
                
                {/* Category Items */}
                <div className="p-2">
                  {types.map((type) => {
                    const Icon = icons[type.icon] || FileText;
                    return (
                      <button
                        key={type.id}
                        onClick={() => handleTypeSelect(type)}
                        className="w-full flex items-center justify-between p-4 hover:bg-blue-50 rounded-xl
                                 transition-all duration-200 group border border-transparent hover:border-blue-200 hover:shadow-md"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform" style={{ 
                            background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
                            boxShadow: '0 4px 12px rgba(65, 88, 208, 0.3)'
                          }}>
                            <Icon className="text-white" size={24} />
                          </div>
                          <div className="text-left">
                            <p className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                              {type.type_name}
                            </p>
                            <p className="text-sm text-gray-500 mt-0.5">{type.description}</p>
                            <div className="flex items-center gap-3 mt-2">
                              {type.requires_payment && (
                                <span className="text-sm font-medium" style={{ color: '#4158D0' }}>
                                  ₱{parseFloat(type.default_fee).toLocaleString()}
                                </span>
                              )}
                              {type.requires_documents && (
                                <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-lg">
                                  Documents Required
                                </span>
                              )}
                              {type.requires_approval && (
                                <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-lg">
                                  Approval Needed
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" size={24} />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* My Requests */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-semibold mb-4" style={{ color: '#4158D0' }}>My Service Requests</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#4158D0' }}></div>
              <p className="text-gray-500">Loading requests...</p>
            </div>
          ) : myRequests.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <FileText className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500 font-medium">No service requests yet</p>
              <p className="text-sm text-gray-400 mt-1">Select a service above to create your first request</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myRequests.map((request) => (
                <div key={request.id} className="border border-gray-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{request.request_type}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">{request.category}</span> • 
                        <span className="ml-2">ID: #{request.id}</span>
                      </p>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
                      {request.status?.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-gray-50 rounded-lg p-4">
                    <div>
                      <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Request Date</p>
                      <p className="font-semibold text-gray-900">{formatDate(request.created_at)}</p>
                    </div>
                    {request.preferred_date && (
                      <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Preferred Date</p>
                        <p className="font-semibold text-gray-900">{formatDate(request.preferred_date)}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Service Fee</p>
                      <p className="font-semibold text-gray-900">₱{parseFloat(request.service_fee || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Payment</p>
                      <span className={`inline-block px-2.5 py-1 rounded text-xs font-semibold ${getPaymentStatusColor(request.payment_status || 'unpaid')}`}>
                        {(request.payment_status || 'unpaid').toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {request.admin_notes && (
                    <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                      <p className="text-xs font-semibold text-blue-900 mb-1 flex items-center gap-1">
                        <AlertCircle size={14} />
                        Admin Notes:
                      </p>
                      <p className="text-sm text-blue-800">{request.admin_notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Request Form Modal */}
      <ModalOverlay isOpen={showRequestModal && selectedType} onClose={() => setShowRequestModal(false)}>
        {selectedType && (
          <div className="bg-white rounded-lg shadow max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white text-gray-900 p-6 flex items-center justify-between border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold" style={{ color: '#4667CF' }}>{selectedType.type_name}</h2>
                <p className="text-gray-600 mt-1">{selectedType.description}</p>
              </div>
              <button
                onClick={() => setShowRequestModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="p-6 space-y-5">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-900">
                  <strong>Please fill in all required fields marked with *</strong>
                </p>
              </div>

              {(() => {
                const requiredFields = typeof selectedType.required_fields === 'string' 
                  ? JSON.parse(selectedType.required_fields) 
                  : (selectedType.required_fields || []);
                
                return requiredFields.map((field) => (
                <div key={field} className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 capitalize">
                    {field.replace(/_/g, ' ')} <span className="text-red-500">*</span>
                  </label>
                  {field === 'certificate_type' ? (
                    <select
                      required
                      value={formData[field] || ''}
                      onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="">Select Certificate Type</option>
                      <option value="baptism">Baptismal Certificate</option>
                      <option value="confirmation">Confirmation Certificate</option>
                      <option value="marriage">Marriage Certificate</option>
                      <option value="first_communion">First Communion Certificate</option>
                      <option value="death">Death Certificate</option>
                      <option value="membership">Church Membership Certificate</option>
                    </select>
                  ) : field === 'intention_type' ? (
                    <select
                      required
                      value={formData[field] || ''}
                      onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="">Select Intention Type</option>
                      <option value="thanksgiving">Thanksgiving</option>
                      <option value="petition">Petition</option>
                      <option value="soul_of_deceased">Soul of Deceased</option>
                      <option value="healing">Healing</option>
                      <option value="guidance">Guidance</option>
                      <option value="birthday">Birthday</option>
                      <option value="anniversary">Anniversary</option>
                    </select>
                  ) : field === 'blessing_type' ? (
                    <select
                      required
                      value={formData[field] || ''}
                      onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="">Select Blessing Type</option>
                      <option value="house">House Blessing</option>
                      <option value="vehicle">Vehicle Blessing</option>
                      <option value="business">Business Blessing</option>
                      <option value="office">Office Blessing</option>
                      <option value="other">Other</option>
                    </select>
                  ) : field === 'venue_type' ? (
                    <select
                      required
                      value={formData[field] || ''}
                      onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="">Select Venue Type</option>
                      <option value="main_church">Main Church</option>
                      <option value="chapel">Chapel</option>
                      <option value="parish_hall">Parish Hall</option>
                      <option value="meeting_room">Meeting Room</option>
                      <option value="outdoor_garden">Outdoor Garden</option>
                    </select>
                  ) : field.includes('date') ? (
                    <input
                      type="date"
                      required
                      value={formData[field] || ''}
                      onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  ) : field.includes('time') ? (
                    <input
                      type="time"
                      required
                      value={formData[field] || ''}
                      onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  ) : field.includes('details') || field.includes('notes') || field.includes('requirements') || field.includes('message') ? (
                    <textarea
                      required
                      value={formData[field] || ''}
                      onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder={`Enter ${field.replace(/_/g, ' ')}...`}
                    />
                  ) : (
                    <input
                      type="text"
                      required
                      value={formData[field] || ''}
                      onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder={`Enter ${field.replace(/_/g, ' ')}...`}
                    />
                  )}
                </div>
                ));
              })()}

              {selectedType.requires_payment && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: '#10b981' }}>
                      <DollarSign className="text-white" size={24} />
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg">Service Fee</h3>
                  </div>
                  <p className="text-3xl font-bold" style={{ color: '#10b981' }}>₱{parseFloat(selectedType.default_fee).toLocaleString()}</p>
                  <p className="text-sm text-gray-600 mt-2">
                    Payment will be required after your request is approved by the church admin.
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 text-white font-semibold rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  style={{ backgroundColor: '#4667CF' }}
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        )}
      </ModalOverlay>
    </div>
  );
};

export default RequestService;
