import { useState, useEffect } from 'react';
import { Calendar, Search, Eye, Clock, CheckCircle, User, TrendingUp, RefreshCw } from 'lucide-react';
import { showInfoToast } from '../../utils/sweetAlertHelper';
import { appointmentAPI } from '../../services/dataSync';
import { serviceRequestAPI } from '../../services/serviceRequestAPI';
import { scheduleService } from '../../services/churchService';
import Pagination from '../../components/Pagination';
import { formatDate } from '../../utils/dateFormatter';

const AdminSchedules = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [appointments, setAppointments] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('appointments'); // 'appointments', 'service-requests', or 'calendar-events'
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch appointments, service requests, and calendar events from database
  useEffect(() => {
    loadAppointments();
    loadServiceRequests();
    loadCalendarEvents();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentAPI.getAll();
      console.log('📅 Appointments API Response:', response);
      console.log('📅 Response type:', typeof response);
      console.log('📅 Is Array?:', Array.isArray(response));
      
      // Handle response.data if it exists, otherwise use response directly
      const data = response?.data || response || [];
      console.log('📅 Processed appointments data:', data);
      console.log('📅 Number of appointments:', Array.isArray(data) ? data.length : 0);
      
      setAppointments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('❌ Error loading appointments:', error);
      console.error('❌ Error details:', error.response?.data);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const loadServiceRequests = async () => {
    try {
      const response = await serviceRequestAPI.getAll();
      console.log('📋 Service Requests API Response:', response);
      console.log('📋 Response type:', typeof response);
      
      const data = response?.data || response || [];
      console.log('📋 Processed service requests data:', data);
      console.log('📋 Number of service requests:', Array.isArray(data) ? data.length : 0);
      
      setServiceRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('❌ Error loading service requests:', error);
      console.error('❌ Error details:', error.response?.data);
      setServiceRequests([]);
    }
  };

  const loadCalendarEvents = async () => {
    try {
      const response = await scheduleService.getAll();
      console.log('📅 Calendar Events API Response:', response);
      
      const data = response?.data || response || [];
      console.log('📅 Processed calendar events:', data);
      console.log('📅 Number of calendar events:', Array.isArray(data) ? data.length : 0);
      
      setCalendarEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('❌ Error loading calendar events:', error);
      console.error('❌ Error details:', error.response?.data);
      setCalendarEvents([]);
    }
  };

  const filteredAppointments = Array.isArray(appointments) ? appointments.filter(apt => {
    const matchesSearch = 
      (apt.clientName || apt.client_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (apt.type || apt.appointment_type || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || (apt.status || '').toLowerCase() === filterStatus.toLowerCase();
    const matchesType = filterType === 'all' || (apt.type || apt.appointment_type || '').toLowerCase() === filterType.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesType;
  }) : [];

  const filteredServiceRequests = Array.isArray(serviceRequests) ? serviceRequests.filter(req => {
    const matchesSearch = 
      (req.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.service_type?.type_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || (req.status || '').toLowerCase() === filterStatus.toLowerCase();
    const matchesType = filterType === 'all' || (req.service_type?.category || '').toLowerCase().includes(filterType.toLowerCase());
    
    return matchesSearch && matchesStatus && matchesType;
  }) : [];

  const filteredCalendarEvents = Array.isArray(calendarEvents) ? calendarEvents.filter(event => {
    const matchesSearch = 
      (event.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.location || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || (event.type || '').toLowerCase().includes(filterType.toLowerCase());
    
    return matchesSearch && matchesType;
  }) : [];

  // Pagination logic
  const currentItems = activeTab === 'appointments' ? filteredAppointments : 
                       activeTab === 'service-requests' ? filteredServiceRequests : 
                       filteredCalendarEvents;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const displayedItems = currentItems.slice(indexOfFirstItem, indexOfLastItem);

  const getStatusColor = (status) => {
    const statusLower = (status || '').toLowerCase();
    switch (statusLower) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = [
    { 
      label: 'Total Appointments', 
      value: appointments.length, 
      icon: Calendar, 
      color: '#4158D0' 
    },
    { 
      label: 'Calendar Events', 
      value: calendarEvents.length, 
      icon: Calendar, 
      color: '#10B981' 
    },
    { 
      label: 'Total Service Requests', 
      value: serviceRequests.length, 
      icon: CheckCircle, 
      color: '#8B5CF6' 
    },
    { 
      label: 'Pending Items', 
      value: appointments.filter(a => (a.status || '').toLowerCase() === 'pending' || (a.status || '').toLowerCase() === 'scheduled').length + 
             serviceRequests.filter(r => (r.status || '').toLowerCase() === 'pending').length, 
      icon: Clock, 
      color: '#F59E0B' 
    },
    { 
      label: 'Completed', 
      value: appointments.filter(a => (a.status || '').toLowerCase() === 'completed').length + 
             serviceRequests.filter(r => (r.status || '').toLowerCase() === 'approved').length, 
      icon: CheckCircle, 
      color: '#10B981' 
    },
  ];

  const handleViewDetails = (apt) => {
    showInfoToast('Appointment Details', 
      `Client: ${apt.client_name || apt.clientName || 'N/A'}\n` +
      `Event: ${apt.type || 'N/A'}\n` +
      `Date: ${apt.appointment_date || apt.appointmentDate || 'N/A'} at ${apt.appointment_time || apt.appointmentTime || 'N/A'}\n` +
      `Status: ${apt.status || 'N/A'}\n` +
      `Payment: ${(apt.is_paid || apt.isPaid) ? 'Paid' : 'Unpaid'}\n` +
      `Contact: ${apt.contact_number || apt.contactNumber || 'N/A'}\n` +
      `Email: ${apt.email || 'N/A'}\n` +
      `Fee: ₱${(apt.event_fee || apt.eventFee || 0).toLocaleString()}\n` +
      `Notes: ${apt.notes || 'None'}`
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#4158D0' }}>
                Appointments & Service Requests
              </h1>
              <p className="text-gray-600 mt-1">System Admin oversight of all scheduled appointments and service requests</p>
            </div>
            <button
              onClick={() => {
                loadAppointments();
                loadServiceRequests();
                loadCalendarEvents();
              }}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <RefreshCw size={18} />
              <span>Refresh Data</span>
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-2 mt-6">
            <button
              onClick={() => {
                setActiveTab('appointments');
                setCurrentPage(1);
              }}
              className={`px-6 py-3 font-semibold transition-all rounded-xl ${
                activeTab === 'appointments'
                  ? 'shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              style={{
                background: activeTab === 'appointments' ? 'rgba(65, 88, 208, 0.1)' : 'transparent',
                backdropFilter: activeTab === 'appointments' ? 'blur(10px)' : 'none',
                WebkitBackdropFilter: activeTab === 'appointments' ? 'blur(10px)' : 'none',
                color: activeTab === 'appointments' ? '#4158D0' : undefined,
                border: activeTab === 'appointments' ? '1px solid rgba(65, 88, 208, 0.2)' : '1px solid transparent',
                boxShadow: activeTab === 'appointments' ? '0 4px 12px rgba(65, 88, 208, 0.15)' : 'none'
              }}
            >
              Appointments ({appointments.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('service-requests');
                setCurrentPage(1);
              }}
              className={`px-6 py-3 font-semibold transition-all rounded-xl ${
                activeTab === 'service-requests'
                  ? 'shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              style={{
                background: activeTab === 'service-requests' ? 'rgba(65, 88, 208, 0.1)' : 'transparent',
                backdropFilter: activeTab === 'service-requests' ? 'blur(10px)' : 'none',
                WebkitBackdropFilter: activeTab === 'service-requests' ? 'blur(10px)' : 'none',
                color: activeTab === 'service-requests' ? '#4158D0' : undefined,
                border: activeTab === 'service-requests' ? '1px solid rgba(65, 88, 208, 0.2)' : '1px solid transparent',
                boxShadow: activeTab === 'service-requests' ? '0 4px 12px rgba(65, 88, 208, 0.15)' : 'none'
              }}
            >
              Service Requests ({serviceRequests.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('calendar-events');
                setCurrentPage(1);
              }}
              className={`px-6 py-3 font-semibold transition-all rounded-xl ${
                activeTab === 'calendar-events'
                  ? 'shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              style={{
                background: activeTab === 'calendar-events' ? 'rgba(65, 88, 208, 0.1)' : 'transparent',
                backdropFilter: activeTab === 'calendar-events' ? 'blur(10px)' : 'none',
                WebkitBackdropFilter: activeTab === 'calendar-events' ? 'blur(10px)' : 'none',
                color: activeTab === 'calendar-events' ? '#4158D0' : undefined,
                border: activeTab === 'calendar-events' ? '1px solid rgba(65, 88, 208, 0.2)' : '1px solid transparent',
                boxShadow: activeTab === 'calendar-events' ? '0 4px 12px rgba(65, 88, 208, 0.15)' : 'none'
              }}
            >
              Calendar Events ({calendarEvents.length})
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg p-5 shadow hover:shadow-lg transition-all border border-gray-200 cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <div className="p-3 rounded-lg group-hover:scale-110 transition-transform" style={{ backgroundColor: stat.color + '20' }}>
                  <stat.icon style={{ color: stat.color }} size={24} />
                </div>
                <TrendingUp size={16} className="text-gray-400" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-sm font-semibold text-gray-700">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Status Tabs */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200 mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {['all', 'scheduled', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
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
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or event type..."
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
                <option value="mass">Mass</option>
                <option value="wedding">Wedding</option>
                <option value="baptism">Baptism</option>
                <option value="funeral">Funeral</option>
                <option value="meeting">Meeting</option>
                <option value="blessing">Blessing</option>
              </select>
            </div>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                {activeTab === 'appointments' ? (
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date & Time</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Event Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Client</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Contact</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Fee</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Payment</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Created By</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Action</th>
                  </tr>
                ) : activeTab === 'service-requests' ? (
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Request ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Requestor</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Service Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Fee</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Payment</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Action</th>
                  </tr>
                ) : (
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Event Title</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date & Time</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Created By</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Action</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                        <p className="text-gray-500">Loading data...</p>
                      </div>
                    </td>
                  </tr>
                ) : displayedItems.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center">
                      <Calendar size={48} className="mx-auto mb-4 opacity-50 text-gray-400" />
                      <p className="text-gray-500">No {activeTab === 'appointments' ? 'appointments' : activeTab === 'service-requests' ? 'service requests' : 'calendar events'} found.</p>
                    </td>
                  </tr>
                ) : activeTab === 'appointments' ? (
                  displayedItems.map((apt) => {
                    // Format date
                    const appointmentDate = apt.appointment_date || apt.appointmentDate;
                    const formattedDate = appointmentDate ? formatDate(appointmentDate) : 'N/A';
                    
                    // Format time
                    const appointmentTime = apt.appointment_time || apt.appointmentTime;
                    const formattedTime = appointmentTime ? new Date('1970-01-01T' + appointmentTime).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    }) : 'N/A';
                    
                    return (
                  <tr key={apt.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{formattedDate}</div>
                      <div className="text-xs text-gray-500">{formattedTime}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
                        {apt.type || apt.appointment_type || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{apt.clientName || apt.client_name || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{apt.email || 'N/A'}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{apt.contactNumber || apt.contact_number || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">₱{(apt.eventFee || apt.event_fee || 0).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                        {apt.status || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        (apt.isPaid || apt.is_paid) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {(apt.isPaid || apt.is_paid) ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {apt.creator?.name || apt.createdBy || apt.created_by || 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleViewDetails(apt)}
                        className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                        style={{ color: '#4158D0' }}
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                  );
                  })
                ) : activeTab === 'service-requests' ? (
                  // Service Requests rows
                  displayedItems.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-gray-900">SR-{req.id}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{req.user?.name || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{req.user?.email || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                          {req.service_type?.type_name || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{req.service_type?.category || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        ₱{(req.service_type?.default_fee || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(req.status)}`}>
                          {req.status || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          req.payment_status === 'paid' || req.payment_status === 'waived' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {req.service_type?.requires_payment 
                            ? (req.payment_status === 'paid' ? 'Paid' : req.payment_status === 'waived' ? 'Waived' : 'Unpaid')
                            : 'No Fee'
                          }
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(req.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => showInfoToast('Service Request Details', 
                            `Requestor: ${req.user?.name || 'N/A'}\n` +
                            `Service: ${req.service_type?.type_name || 'N/A'}\n` +
                            `Status: ${req.status || 'N/A'}\n` +
                            `Payment: ${req.payment_status || 'N/A'}\n` +
                            `Fee: ₱${(req.service_type?.default_fee || 0).toLocaleString()}\n` +
                            `Date: ${formatDate(req.created_at)}`
                          )}
                          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                          style={{ color: '#4158D0' }}
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : activeTab === 'calendar-events' ? (
                  // Calendar Events rows
                  displayedItems.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{event.title || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{formatDate(event.start_date)}</div>
                        <div className="text-xs text-gray-500">
                          {event.start_time} {event.end_time ? `- ${event.end_time}` : ''}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          {event.type || 'Event'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{event.location || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {event.description ? (event.description.length > 50 ? event.description.substring(0, 50) + '...' : event.description) : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {event.created_by || event.creator?.name || 'Church Admin'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => showInfoToast('Calendar Event Details', 
                            `Title: ${event.title || 'N/A'}\n` +
                            `Type: ${event.type || 'N/A'}\n` +
                            `Date: ${formatDate(event.start_date)}\n` +
                            `Time: ${event.start_time} ${event.end_time ? `- ${event.end_time}` : ''}\n` +
                            `Location: ${event.location || 'N/A'}\n` +
                            `Description: ${event.description || 'None'}\n` +
                            `Created By: ${event.created_by || event.creator?.name || 'Church Admin'}`
                          )}
                          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                          style={{ color: '#4158D0' }}
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : null}
              </tbody>
            </table>
            <Pagination
              currentPage={currentPage}
              totalItems={currentItems.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(value) => {
                setItemsPerPage(value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {/* Connection Info */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-blue-200 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <User className="text-blue-600" size={20} />
              </div>
              <h3 className="font-semibold text-gray-900">Church Admin</h3>
            </div>
            <p className="text-sm text-gray-600">Creates and manages all appointments and schedules</p>
          </div>
          
          <div className="bg-white rounded-lg border border-blue-200 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="text-green-600" size={20} />
              </div>
              <h3 className="font-semibold text-gray-900">Accountant</h3>
            </div>
            <p className="text-sm text-gray-600">Views appointments and processes event fee payments</p>
          </div>
          
          <div className="bg-white rounded-lg border border-blue-200 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="text-blue-600" size={20} />
              </div>
              <h3 className="font-semibold text-gray-900">System Admin</h3>
            </div>
            <p className="text-sm text-gray-600">Oversees all appointments with read-only access</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSchedules;
