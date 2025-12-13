import { useState, useEffect } from 'react';
import { 
  FileText, Calendar, MessageSquare, DollarSign, Send, 
  CheckCircle, Clock, XCircle, Plus, Filter, Search 
} from 'lucide-react';
import Cookies from 'js-cookie';
import { showSuccessToast, showErrorToast } from '../../utils/sweetAlertHelper';
import { serviceRequestAPI, appointmentAPI, messageAPI, paymentRecordAPI } from '../../services/userInteractionAPI';
import { formatDate } from '../../utils/dateFormatter';

const UserInteractions = () => {
  const [activeTab, setActiveTab] = useState('requests');
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('');
  
  // Service Requests state
  const [serviceRequests, setServiceRequests] = useState([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [newRequest, setNewRequest] = useState({
    request_type: 'sacrament',
    service_name: '',
    description: '',
  });
  
  // Appointments state
  const [appointments, setAppointments] = useState([]);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    appointment_type: 'sacrament_schedule',
    title: '',
    description: '',
    scheduled_date: '',
    scheduled_time: '',
  });
  
  // Messages state
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  // Payments state
  const [payments, setPayments] = useState([]);

  // Hide sidebar when modals are open
  useEffect(() => {
    const sidebar = document.querySelector('aside');
    const header = document.querySelector('header');
    
    if (showRequestModal || showAppointmentModal) {
      if (sidebar) sidebar.style.display = 'none';
      if (header) header.style.display = 'none';
    } else {
      if (sidebar) sidebar.style.display = '';
      if (header) header.style.display = '';
    }
  }, [showRequestModal, showAppointmentModal]);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId') || Cookies.get('userId');
    const storedUserName = localStorage.getItem('userName') || Cookies.get('userName');
    setUserId(storedUserId);
    setUserName(storedUserName);
    
    if (storedUserId) {
      loadAllData(storedUserId);
    }
  }, []);

  const loadAllData = async (uid) => {
    await Promise.all([
      loadServiceRequests(uid),
      loadAppointments(uid),
      loadMessages(uid),
      loadPayments(uid),
    ]);
  };

  const loadServiceRequests = async (uid) => {
    try {
      const response = await serviceRequestAPI.getUserRequests(uid);
      setServiceRequests(response.data);
    } catch (error) {
      console.error('Error loading service requests:', error);
    }
  };

  const loadAppointments = async (uid) => {
    try {
      const response = await appointmentAPI.getUserAppointments(uid);
      setAppointments(response.data);
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  };

  const loadMessages = async (uid) => {
    try {
      const response = await messageAPI.getUserMessages(uid);
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const loadPayments = async (uid) => {
    try {
      const response = await paymentRecordAPI.getUserPayments(uid);
      setPayments(response.data);
    } catch (error) {
      console.error('Error loading payments:', error);
    }
  };

  const handleSubmitRequest = async () => {
    try {
      await serviceRequestAPI.create({
        ...newRequest,
        user_id: userId,
      });
      showSuccessToast('Success!', 'Service request submitted successfully');
      setShowRequestModal(false);
      setNewRequest({ request_type: 'sacrament', service_name: '', description: '' });
      loadServiceRequests(userId);
    } catch (error) {
      showErrorToast('Error', 'Failed to submit request');
    }
  };

  const handleSubmitAppointment = async () => {
    try {
      await appointmentAPI.create({
        ...newAppointment,
        user_id: userId,
      });
      showSuccessToast('Success!', 'Appointment request submitted successfully');
      setShowAppointmentModal(false);
      setNewAppointment({
        appointment_type: 'sacrament_schedule',
        title: '',
        description: '',
        scheduled_date: '',
        scheduled_time: '',
      });
      loadAppointments(userId);
    } catch (error) {
      showErrorToast('Error', 'Failed to submit appointment');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    try {
      await messageAPI.create({
        user_id: userId,
        sender_type: 'user',
        sender_id: userId,
        message: newMessage,
      });
      showSuccessToast('Success!', 'Message sent to secretary');
      setNewMessage('');
      loadMessages(userId);
    } catch (error) {
      showErrorToast('Error', 'Failed to send message');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      under_review: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      confirmed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
      completed: 'bg-purple-100 text-purple-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    if (status === 'completed' || status === 'approved' || status === 'confirmed') {
      return <CheckCircle className="w-4 h-4" />;
    } else if (status === 'pending' || status === 'under_review') {
      return <Clock className="w-4 h-4" />;
    } else {
      return <XCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Interactions</h1>
          <p className="text-gray-600 mt-1">Manage your requests, appointments, and communications</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-6 py-4 font-semibold transition-colors ${
                activeTab === 'requests'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                <span>Service Requests</span>
                {serviceRequests.filter(r => r.status === 'pending').length > 0 && (
                  <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {serviceRequests.filter(r => r.status === 'pending').length}
                  </span>
                )}
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('appointments')}
              className={`px-6 py-4 font-semibold transition-colors ${
                activeTab === 'appointments'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>Appointments</span>
                {appointments.filter(a => a.status === 'pending').length > 0 && (
                  <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {appointments.filter(a => a.status === 'pending').length}
                  </span>
                )}
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('messages')}
              className={`px-6 py-4 font-semibold transition-colors ${
                activeTab === 'messages'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                <span>Messages</span>
                {messages.filter(m => !m.is_read && m.sender_type === 'secretary').length > 0 && (
                  <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {messages.filter(m => !m.is_read && m.sender_type === 'secretary').length}
                  </span>
                )}
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-6 py-4 font-semibold transition-colors ${
                activeTab === 'payments'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                <span>Payment History</span>
              </div>
            </button>
          </div>
        </div>

        {/* Service Requests Tab */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Service Requests</h2>
              <button
                onClick={() => setShowRequestModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Request
              </button>
            </div>

            <div className="grid gap-4">
              {serviceRequests.length === 0 ? (
                <div className="bg-white rounded-lg p-8 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No service requests yet</p>
                  <button
                    onClick={() => setShowRequestModal(true)}
                    className="mt-4 text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Submit your first request
                  </button>
                </div>
              ) : (
                serviceRequests.map((request) => (
                  <div key={request.id} className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{request.service_name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{request.request_type}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        {request.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3">{request.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Requested: {formatDate(request.requested_at)}</span>
                      {request.reviewed_at && (
                        <span>Reviewed: {formatDate(request.reviewed_at)}</span>
                      )}
                    </div>
                    {request.review_notes && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-900">
                          <span className="font-semibold">Review Notes:</span> {request.review_notes}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Appointments</h2>
              <button
                onClick={() => setShowAppointmentModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Schedule Appointment
              </button>
            </div>

            <div className="grid gap-4">
              {appointments.length === 0 ? (
                <div className="bg-white rounded-lg p-8 text-center">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No appointments scheduled</p>
                  <button
                    onClick={() => setShowAppointmentModal(true)}
                    className="mt-4 text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Schedule your first appointment
                  </button>
                </div>
              ) : (
                appointments.map((appointment) => (
                  <div key={appointment.id} className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{appointment.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{appointment.appointment_type.replace('_', ' ')}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 ${getStatusColor(appointment.status)}`}>
                        {getStatusIcon(appointment.status)}
                        {appointment.status}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3">{appointment.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {formatDate(appointment.scheduled_date)}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        {appointment.scheduled_time}
                      </div>
                    </div>
                    {appointment.notes && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-900">
                          <span className="font-semibold">Notes:</span> {appointment.notes}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Messages with Secretary</h2>
              <p className="text-sm text-gray-600 mt-1">Chat with the parish secretary</p>
            </div>
            
            <div className="h-96 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No messages yet</p>
                  <p className="text-sm text-gray-500 mt-1">Start a conversation below</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-3 rounded-lg ${
                        message.sender_type === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p className={`text-xs mt-1 ${message.sender_type === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                        {new Date(message.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-6 border-t">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Payment History</h2>
            
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {payments.length === 0 ? (
                <div className="p-8 text-center">
                  <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No payment records found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Service</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Method</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {payments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 text-sm text-gray-600">
                            {formatDate(payment.payment_date)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{payment.service_name || '-'}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{payment.payment_type}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{payment.payment_method}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">
                            ₱{Number(payment.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan="4" className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                          Total:
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                          ₱{payments.reduce((sum, p) => sum + Number(p.amount), 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Request Service Modal */}
        {showRequestModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Request Service</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Request Type</label>
                  <select
                    value={newRequest.request_type}
                    onChange={(e) => setNewRequest({ ...newRequest, request_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="sacrament">Sacrament</option>
                    <option value="document">Document</option>
                    <option value="certificate">Certificate</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Service Name</label>
                  <input
                    type="text"
                    value={newRequest.service_name}
                    onChange={(e) => setNewRequest({ ...newRequest, service_name: e.target.value })}
                    placeholder="e.g., Baptism, Wedding, Birth Certificate"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newRequest.description}
                    onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                    rows={4}
                    placeholder="Provide details about your request..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitRequest}
                  disabled={!newRequest.service_name || !newRequest.description}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        )}

        {/* New Appointment Modal */}
        {showAppointmentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Schedule Appointment</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Appointment Type</label>
                  <select
                    value={newAppointment.appointment_type}
                    onChange={(e) => setNewAppointment({ ...newAppointment, appointment_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="sacrament_schedule">Sacrament Schedule</option>
                    <option value="consultation">Consultation</option>
                    <option value="document_pickup">Document Pickup</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={newAppointment.title}
                    onChange={(e) => setNewAppointment({ ...newAppointment, title: e.target.value })}
                    placeholder="e.g., Baptism Consultation"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={newAppointment.scheduled_date}
                    onChange={(e) => setNewAppointment({ ...newAppointment, scheduled_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Time</label>
                  <input
                    type="text"
                    value={newAppointment.scheduled_time}
                    onChange={(e) => setNewAppointment({ ...newAppointment, scheduled_time: e.target.value })}
                    placeholder="e.g., 2:00 PM - 3:00 PM"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newAppointment.description}
                    onChange={(e) => setNewAppointment({ ...newAppointment, description: e.target.value })}
                    rows={3}
                    placeholder="Additional details..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAppointmentModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitAppointment}
                  disabled={!newAppointment.title || !newAppointment.scheduled_date || !newAppointment.scheduled_time}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Schedule
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserInteractions;
