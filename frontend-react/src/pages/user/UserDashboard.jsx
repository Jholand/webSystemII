import { Users, FileText, Calendar, Upload, DollarSign, Clock, CheckCircle, Bell, Activity, ArrowUpRight, Plus, Heart, Baby, Church, MessageSquare, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ModalOverlay from '../../components/ModalOverlay';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    if (showRequestModal) {
      const header = document.querySelector('header');
      const sidebar = document.querySelector('aside');
      if (header) header.style.display = 'none';
      if (sidebar) sidebar.style.display = 'none';
    } else {
      const header = document.querySelector('header');
      const sidebar = document.querySelector('aside');
      if (header) header.style.display = '';
      if (sidebar) sidebar.style.display = '';
    }
  }, [showRequestModal]);

  const stats = [
    { 
      label: 'My Requests', 
      value: '4', 
      icon: FileText, 
      change: '2 pending'
    },
    { 
      label: 'Pending Bills', 
      value: '₱17,500', 
      icon: Clock, 
      change: '2 bills'
    },
    { 
      label: 'Upcoming Events', 
      value: '3', 
      icon: Calendar, 
      change: 'This week'
    },
    { 
      label: 'My Documents', 
      value: '8', 
      icon: Upload, 
      change: 'All verified'
    },
  ];

  const upcomingEvents = [
    { id: 1, title: 'Sunday Mass', date: '2025-11-24', time: '8:00 AM', location: 'Main Church', type: 'Mass' },
    { id: 2, title: 'Baptism - Baby Sofia', date: '2025-12-15', time: '10:00 AM', location: 'Baptistry', type: 'Baptism' },
    { id: 3, title: 'Christmas Eve Mass', date: '2025-12-24', time: '11:00 PM', location: 'Main Church', type: 'Mass' }
  ];

  const massSchedule = [
    { day: 'Monday - Friday', time: '6:00 AM', type: 'Morning Mass' },
    { day: 'Saturday', time: '6:00 PM', type: 'Anticipated Sunday Mass' },
    { day: 'Sunday', time: '6:00 AM, 8:00 AM, 10:00 AM, 6:00 PM', type: 'Sunday Mass' }
  ];

  const myRequests = [
    { id: 1, type: 'Baptism', name: 'Baby Sofia Reyes', status: 'Approved', date: '2025-12-15' },
    { id: 2, type: 'Wedding', name: 'John & Maria Santos', status: 'Pending', date: '2026-02-14' },
    { id: 3, type: 'Counseling', name: 'Marriage Counseling', status: 'Approved', date: '2025-11-28' }
  ];

  const quickActions = [
    { title: 'Request Baptism', icon: Baby, service: 'baptism' },
    { title: 'Request Wedding', icon: Heart, service: 'wedding' },
    { title: 'Request Funeral', icon: Church, service: 'funeral' },
    { title: 'Request Counseling', icon: MessageSquare, service: 'counseling' },
    { title: 'Upload Documents', icon: Upload, path: '/user/upload' },
    { title: 'View My Requests', icon: FileText, path: '/user/my-requests' }
  ];

  const handleQuickAction = (action) => {
    if (action.path) {
      navigate(action.path);
    } else if (action.service) {
      setSelectedService(action.service);
      setShowRequestModal(true);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Approved': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Completed': return 'bg-gray-100 text-gray-700 border-gray-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Header with Gradient Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-black via-[#0A1628] to-[#1E3A8A] rounded-xl shadow-lg p-8">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Welcome Back 👋</h1>
              <p className="text-blue-100 text-lg">Dalapian Church Member Portal</p>
              <p className="text-blue-200/80 text-sm mt-1">Here's your church activity overview</p>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <button className="p-3 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all border border-white/20">
                <Bell className="text-white" size={20} />
              </button>
              <button className="p-3 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all border border-white/20">
                <Activity className="text-white" size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg p-5 shadow hover:shadow-md transition-shadow border border-gray-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-gradient-to-br from-black via-[#0A1628] to-[#1E3A8A] rounded-lg">
                  <stat.icon className="text-white" size={20} />
                </div>
                <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                  {stat.change}
                </span>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Request Church Services</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleQuickAction(action)}
                className="bg-white rounded-lg p-5 shadow hover:shadow-md transition-all text-left border border-gray-200 hover:border-blue-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-gradient-to-br from-black via-[#0A1628] to-[#1E3A8A] rounded-lg">
                    <action.icon className="text-white" size={22} />
                  </div>
                  <ArrowUpRight className="text-gray-400" size={18} />
                </div>
                <h4 className="font-semibold text-gray-900">{action.title}</h4>
              </button>
            ))}
          </div>
        </div>

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Events */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-gradient-to-br from-black via-[#0A1628] to-[#1E3A8A] rounded">
                <Calendar className="text-white" size={18} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Events</h3>
            </div>
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="p-3 border border-gray-200 rounded-lg hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                  <h4 className="font-semibold text-gray-900 mb-2">{event.title}</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p className="flex items-center gap-2">
                      <Calendar size={14} />
                      {event.date}
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock size={14} />
                      {event.time}
                    </p>
                    <p className="text-xs text-gray-500">{event.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mass Schedule */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-gradient-to-br from-black via-[#0A1628] to-[#1E3A8A] rounded">
                <Clock className="text-white" size={18} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Mass Schedule</h3>
            </div>
            <div className="space-y-3">
              {massSchedule.map((schedule, idx) => (
                <div key={idx} className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-1">{schedule.day}</h4>
                  <p className="text-sm text-blue-600 font-medium">{schedule.time}</p>
                  <p className="text-xs text-gray-600 mt-1">{schedule.type}</p>
                </div>
              ))}
            </div>
          </div>

          {/* My Requests */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-black via-[#0A1628] to-[#1E3A8A] rounded">
                  <FileText className="text-white" size={18} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">My Requests</h3>
              </div>
              <button 
                onClick={() => navigate('/user/my-requests')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View All
              </button>
            </div>
            <div className="space-y-3">
              {myRequests.map((request) => (
                <div key={request.id} className="p-3 border border-gray-200 rounded-lg hover:border-blue-200 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{request.type}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded border ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{request.name}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar size={12} />
                    {request.date}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Billing Reminder */}
        <div className="bg-blue-50 rounded-lg shadow border border-blue-200 p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gradient-to-br from-black via-[#0A1628] to-[#1E3A8A] rounded-lg">
                <DollarSign className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Billing Reminder</h3>
                <p className="text-gray-700 mb-3">You have pending bills totaling <span className="font-semibold text-blue-700">₱17,500</span></p>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate('/user/payments-billing')}
                    className="px-4 py-2 bg-gradient-to-r from-black via-[#0A1628] to-[#1E3A8A] text-white rounded-lg hover:opacity-90 transition-all font-medium"
                  >
                    View Bills
                  </button>
                  <button
                    onClick={() => navigate('/user/payments-billing')}
                    className="px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Pay Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Request Service Modal */}
      {showRequestModal && (
        <ModalOverlay isOpen={showRequestModal} onClose={() => { setShowRequestModal(false); setSelectedService(null); }}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-blue-500 ring-4 ring-blue-500/30">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Request Service</h2>
                <button
                  onClick={() => {
                    setShowRequestModal(false);
                    setSelectedService(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="text-gray-500" size={24} />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">Fill out the form to submit your service request</p>
            </div>

            <div className="p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-blue-900">
                  <strong>Note:</strong> All requests are subject to approval. You will receive a confirmation email within 2-3 business days.
                </p>
              </div>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Type *</label>
                  <select
                    value={selectedService || ''}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a service...</option>
                    <option value="baptism">Baptism</option>
                    <option value="wedding">Wedding</option>
                    <option value="funeral">Funeral</option>
                    <option value="counseling">Counseling</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number *</label>
                    <input
                      type="tel"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                    <input
                      type="email"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date *</label>
                    <input
                      type="date"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time *</label>
                    <input
                      type="time"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                  <textarea
                    rows={4}
                    placeholder="Any special requests or additional information..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRequestModal(false);
                      setSelectedService(null);
                    }}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Request submitted successfully!');
                      setShowRequestModal(false);
                      setSelectedService(null);
                    }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium shadow-lg"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
};

export default UserDashboard;
