import { useState, useEffect } from 'react';
import { Calendar, Search, Eye, CheckCircle, Clock, User, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import appointmentAPI from '../../services/appointmentAPI';
import { serviceRequestAPI } from '../../services/serviceRequestAPI';
import Pagination from '../../components/Pagination';

const Appointments = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [loading, setLoading] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch appointments from database
  const [appointments, setAppointments] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);

  useEffect(() => {
    fetchAppointments();
    fetchServiceRequests();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await appointmentAPI.getAll();
      setAppointments(data);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceRequests = async () => {
    try {
      const response = await serviceRequestAPI.getAll({ category: 'sacrament' });
      // Filter only requests that require payment and are schedule-related
      const scheduleRequests = (response.data || []).filter(
        r => r.service_request_type?.requires_payment
      );
      setServiceRequests(scheduleRequests);
    } catch (error) {
      console.error('Failed to load service requests:', error);
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = 
      apt.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.id?.toString().includes(searchTerm);
    
    const matchesStatus = filterStatus === 'all' || apt.status === filterStatus;
    const matchesType = filterType === 'all' || apt.type === filterType;
    const matchesPayment = filterPayment === 'all' || 
      (filterPayment === 'paid' && apt.is_paid) ||
      (filterPayment === 'unpaid' && !apt.is_paid);
    
    return matchesSearch && matchesStatus && matchesType && matchesPayment;
  });

  // Convert service requests to appointment-like format
  const serviceRequestAppointments = serviceRequests
    .filter(req => {
      const matchesSearch = 
        req.service_request_type?.type_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.id?.toString().includes(searchTerm);
      
      const matchesPayment = filterPayment === 'all' || 
        (filterPayment === 'paid' && req.payment_status === 'paid') ||
        (filterPayment === 'unpaid' && req.payment_status === 'unpaid');
      
      return matchesSearch && matchesPayment;
    })
    .map(req => ({
      id: `SR-${req.id}`,
      client_name: req.user?.name || 'N/A',
      type: req.service_request_type?.type_name || 'Service Request',
      appointment_date: req.preferred_date || req.created_at,
      status: req.status === 'pending' ? 'Pending' : req.status === 'approved' ? 'Confirmed' : 'Pending',
      event_fee: req.service_fee,
      is_paid: req.payment_status === 'paid' || req.payment_status === 'waived',
      payment_status: req.payment_status,
      notes: req.special_instructions,
      isServiceRequest: true,
      originalRequest: req
    }));

  // Combine both arrays
  const allAppointments = [...filteredAppointments, ...serviceRequestAppointments];

  // Pagination logic
  const indexOfLastAppointment = currentPage * itemsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - itemsPerPage;
  const currentAppointments = allAppointments.slice(indexOfFirstAppointment, indexOfLastAppointment);

  const handleRecordPayment = (apt) => {
    // If it's a service request, navigate to service payments page
    if (apt.isServiceRequest) {
      navigate('/accountant/service-payments');
      return;
    }
    
    // Navigate to record payment with pre-filled data for regular appointments
    const rolePrefix = user?.role === 'church_admin' ? 'church-admin' : 'accountant';
    navigate(`/${rolePrefix}/payments/new`, { 
      state: { 
        appointment: apt,
        paymentType: 'eventfee',
        category: apt.type,
        amount: apt.event_fee,
        donorName: apt.client_name,
        notes: `Payment for ${apt.type} appointment on ${apt.appointment_date}`
      } 
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Confirmed': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = [
    { 
      label: 'Total Appointments', 
      value: appointments.length + serviceRequests.length, 
      icon: Calendar, 
      color: '#4667CF' 
    },
    { 
      label: 'Unpaid', 
      value: appointments.filter(a => !a.is_paid).length + serviceRequests.filter(r => r.payment_status === 'unpaid').length, 
      icon: Clock, 
      color: '#EF4444' 
    },
    { 
      label: 'Confirmed', 
      value: appointments.filter(a => a.status === 'Confirmed').length, 
      icon: CheckCircle, 
      color: '#10B981' 
    },
    { 
      label: 'Total Fees', 
      value: `₱${appointments.reduce((sum, a) => sum + (parseFloat(a.event_fee) || 0), 0).toLocaleString()}`, 
      icon: DollarSign, 
      color: '#8B5CF6' 
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div>
        {/* Header */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#4158D0' }}>
              Event Appointments
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              {user?.role === 'accountant' ? 'View scheduled events and process payments' : 'View and manage scheduled events'}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border border-gray-200 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-transparent rounded-full transform translate-x-12 -translate-y-12 opacity-50"></div>
              <div className="relative flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl shadow-lg transform group-hover:scale-110 transition-transform" style={{ 
                  background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
                  boxShadow: '0 4px 12px rgba(65, 88, 208, 0.3)'
                }}>
                  <stat.icon className="text-white" size={24} />
                </div>
              </div>
              <div className="relative">
                <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">{stat.value}</h3>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Status Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
          <div className="flex flex-wrap gap-2 mb-4">
            {['all', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map((status) => (
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
                {status === 'all' ? 'All Status' : status}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by Event ID, name, or type..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="Wedding">Wedding</option>
                <option value="Baptism">Baptism</option>
                <option value="Funeral">Funeral</option>
                <option value="Mass Intention">Mass Intention</option>
                <option value="Blessing">Blessing</option>
              </select>
            </div>
            {user?.role === 'accountant' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                <select
                  value={filterPayment}
                  onChange={(e) => setFilterPayment(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                <option value="all">All Payments</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>
            )}
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-purple-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">ID</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">Date & Time</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">Event Type</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">Client</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">Contact</th>
                  {user?.role === 'accountant' && (
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">Fee</th>
                  )}
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                  {user?.role === 'accountant' && (
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase">Payment</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-3">
                      <span className="text-xs font-bold text-purple-600">#{apt.id}</span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="text-xs font-medium text-gray-900">{apt.appointment_date}</div>
                      <div className="text-xs text-gray-500">{apt.appointment_time}</div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium whitespace-nowrap">
                        {apt.type}
                      </span>
                      {apt.isServiceRequest && (
                        <div className="mt-1">
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">SR</span>
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <div className="text-xs font-medium text-gray-900 max-w-[150px] truncate" title={apt.client_name}>
                        {apt.client_name}
                      </div>
                      <div className="text-xs text-gray-500 max-w-[150px] truncate" title={apt.email}>
                        {apt.email}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-600">{apt.contact_number}</td>
                    {user?.role === 'accountant' && (
                      <td className="px-3 py-3 text-xs font-bold text-gray-900">₱{parseFloat(apt.event_fee || 0).toLocaleString()}</td>
                    )}
                    <td className="px-3 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(apt.status)}`}>
                        {apt.status}
                      </span>
                    </td>
                    {user?.role === 'accountant' && (
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                          apt.is_paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {apt.is_paid ? (
                            <>
                              <CheckCircle size={12} />
                              Paid
                            </>
                          ) : (
                            <>
                              <Clock size={12} />
                              Unpaid
                            </>
                          )}
                        </span>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              currentPage={currentPage}
              totalItems={filteredAppointments.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(value) => {
                setItemsPerPage(value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {filteredAppointments.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Calendar size={48} className="mx-auto mb-4 opacity-50" />
            <p>No appointments found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointments;
