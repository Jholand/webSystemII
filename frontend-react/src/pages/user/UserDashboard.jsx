import { Users, FileText, Calendar, Upload, DollarSign, Clock, CheckCircle, Bell, Activity, ArrowUpRight, Plus, Heart, Baby, Church, MessageSquare, X, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ModalOverlay from '../../components/ModalOverlay';
import Cookies from 'js-cookie';
import { userNotificationAPI } from '../../services/dataSync';
import { formatDateTimeShort } from '../../utils/dateFormatter';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Get user info from cookies
  useEffect(() => {
    const name = Cookies.get('userName') || 'User';
    const id = localStorage.getItem('userId') || Cookies.get('userId');
    setUserName(name);
    setUserId(id);
    if (id) {
      loadNotifications();
    }
  }, []);
  
  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await userNotificationAPI.getUserNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showNotificationModal) {
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
  }, [showNotificationModal]);

  const myRequests = [];

  const unreadCount = notifications.filter(n => !n.read).length;

  const stats = [
    { 
      label: 'My Interactions', 
      value: '0', 
      icon: MessageSquare, 
      change: 'Requests & Messages',
      path: '/user/requests'
    },
    { 
      label: 'My Sacraments', 
      value: '0', 
      icon: Church, 
      change: 'No certificates',
      path: '/user/requests'
    },
    { 
      label: 'My Donations', 
      value: '₱0', 
      icon: DollarSign, 
      change: 'This year',
      path: '/user/payments'
    },
    { 
      label: 'Notifications', 
      value: unreadCount.toString(), 
      icon: Bell, 
      change: `${unreadCount} unread`,
      action: 'modal'
    },
  ];

  const upcomingEvents = [];

  const massSchedule = [
    { day: 'Monday - Friday', time: '6:00 AM', type: 'Morning Mass' },
    { day: 'Saturday', time: '6:00 PM', type: 'Anticipated Sunday Mass' },
    { day: 'Sunday', time: '6:00 AM, 8:00 AM, 10:00 AM, 6:00 PM', type: 'Sunday Mass' }
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Approved': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Completed': return 'bg-gray-100 text-gray-700 border-gray-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#4158D0' }}>Welcome, {userName}!</h1>
              <p className="text-gray-600 text-sm mt-1">Dalapian Church Member Portal - Your church activity overview</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            return (
              <div 
                key={index} 
                onClick={() => {
                  if (stat.action === 'modal') {
                    setShowNotificationModal(true);
                  } else if (stat.path) {
                    navigate(stat.path);
                  }
                }}
                className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border border-gray-200 group relative overflow-hidden ${stat.path || stat.action ? 'cursor-pointer' : ''}`}
              >
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
                  <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Analytics Section */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-transparent rounded-full transform translate-x-32 -translate-y-32 opacity-40"></div>
          <div className="relative flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl shadow-lg" style={{ 
              background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
              boxShadow: '0 4px 12px rgba(65, 88, 208, 0.3)'
            }}>
              <Activity size={20} className="text-white" />
            </div>
            <h3 className="text-xl font-bold" style={{ color: '#4158D0' }}>
              My Activity Overview
            </h3>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-gradient-to-br from-blue-50 to-white border border-gray-200 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gray-700">Service Requests</p>
                <FileText size={20} style={{ color: '#4158D0' }} />
              </div>
              <p className="text-3xl font-bold" style={{ color: '#4158D0' }}>0</p>
              <p className="text-sm mt-2 text-gray-600">No pending requests</p>
            </div>
              
            <div className="p-5 rounded-xl bg-gradient-to-br from-green-50 to-white border border-gray-200 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gray-700">YTD Donations</p>
                <DollarSign size={20} style={{ color: '#10b981' }} />
              </div>
              <p className="text-3xl font-bold" style={{ color: '#10b981' }}>₱0</p>
              <p className="text-sm mt-2 text-gray-600">0 transactions</p>
            </div>
              
            <div className="p-5 rounded-xl bg-gradient-to-br from-purple-50 to-white border border-gray-200 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gray-700">Certificates</p>
                <CheckCircle size={20} style={{ color: '#8b5cf6' }} />
              </div>
              <p className="text-3xl font-bold" style={{ color: '#8b5cf6' }}>0</p>
              <p className="text-sm mt-2 text-gray-600">No certificates yet</p>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 shadow-sm mt-3">
            <p className="text-xs font-semibold mb-3" style={{ color: '#4158D0' }}>Monthly Activity Progress</p>
            <div className="space-y-3 mb-3">
              {[
                { label: 'Donations', value: 0, count: '0/10', color: '#4158D0' },
                { label: 'Mass Attendance', value: 0, count: '0/20', color: '#10b981' },
                { label: 'Events Joined', value: 0, count: '0/5', color: '#f59e0b' }
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-gray-700">{item.label}</span>
                    <span className="text-xs font-bold" style={{ color: item.color }}>{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${item.value}%`,
                        backgroundColor: item.color
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="pt-3 border-t border-gray-200">
              <p className="text-xs font-semibold mb-2" style={{ color: '#4158D0' }}>Recent Activity</p>
              <div className="space-y-1.5">
                {[
                  { action: 'Donation recorded', amount: '₱5,000', date: 'Dec 1, 2025' },
                  { action: 'Wedding booking confirmed', amount: null, date: 'Nov 28, 2025' },
                  { action: 'Certificate downloaded', amount: 'Baptism', date: 'Nov 25, 2025' }
                ].map((activity, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white hover:bg-blue-50 transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#4158D0' }} />
                      <div>
                        <p className="text-xs font-medium text-gray-900">{activity.action}</p>
                        {activity.amount && <p className="text-xs text-gray-500">{activity.amount}</p>}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{activity.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>


        {/* Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Upcoming Events */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg" style={{ 
                background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)'
              }}>
                <Calendar size={14} className="text-white" />
              </div>
              <h3 className="text-sm font-semibold" style={{ color: '#4158D0' }}>Upcoming Events</h3>
            </div>
            <div className="space-y-2">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="p-2 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/30 transition-all">
                  <h4 className="text-xs font-semibold text-gray-900 mb-1.5">{event.title}</h4>
                  <div className="space-y-0.5 text-xs text-gray-600">
                    <p className="flex items-center gap-1">
                      <Calendar size={10} />
                      {event.date}
                    </p>
                    <p className="flex items-center gap-1">
                      <Clock size={10} />
                      {event.time}
                    </p>
                    <p className="text-xs text-gray-500">{event.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mass Schedule */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg" style={{ 
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
              }}>
                <Clock className="text-white" size={14} />
              </div>
              <h3 className="text-sm font-semibold" style={{ color: '#4158D0' }}>Mass Schedule</h3>
            </div>
            <div className="space-y-2">
              {massSchedule.map((schedule, idx) => (
                <div key={idx} className="p-2 bg-gray-50 border border-gray-200 rounded-lg hover:shadow-sm transition-all">
                  <h4 className="text-xs font-semibold text-gray-900 mb-0.5">{schedule.day}</h4>
                  <p className="text-xs font-medium" style={{ color: '#4158D0' }}>{schedule.time}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{schedule.type}</p>
                </div>
              ))}
            </div>
          </div>

          {/* My Requests */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg" style={{ 
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
                }}>
                  <FileText className="text-white" size={14} />
                </div>
                <h3 className="text-sm font-semibold" style={{ color: '#4158D0' }}>My Requests</h3>
              </div>
              <button 
                onClick={() => navigate('/user/requests')}
                className="text-xs font-medium hover:opacity-80 transition-opacity"
                style={{ color: '#4158D0' }}
              >
                View All
              </button>
            </div>
            <div className="space-y-2">
              {myRequests.map((request) => (
                <div key={request.id} className="p-2 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="text-xs font-semibold text-gray-900">{request.type}</h4>
                    <span className={`px-1.5 py-0.5 text-xs font-medium rounded border ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-0.5">{request.name}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar size={10} />
                    {request.date}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Notification Modal */}
      {showNotificationModal && (
        <ModalOverlay isOpen={showNotificationModal} onClose={() => setShowNotificationModal(false)}>
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-100">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold" style={{ color: '#4158D0' }}>Notifications</h2>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                  </p>
                </div>
                <button
                  onClick={() => setShowNotificationModal(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="text-gray-500" size={18} />
                </button>
              </div>
            </div>

            <div className="p-4">
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border transition-all hover:shadow-sm ${
                      !notification.read ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h4 className={`text-sm font-semibold ${
                        !notification.read ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {notification.title}
                      </h4>
                      {!notification.read && (
                        <span className="w-1.5 h-1.5 rounded-full ml-2 mt-1.5" style={{ backgroundColor: '#4158D0' }}></span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{notification.message}</p>
                    <p className="text-xs text-gray-500">{formatDateTimeShort(notification.created_at || notification.date)}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowNotificationModal(false);
                    navigate('/user/notifications');
                  }}
                  className="w-full px-4 py-2 text-white rounded-lg hover:opacity-90 transition-all font-medium text-sm"
                  style={{ 
                    background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)'
                  }}
                >
                  View All Notifications
                </button>
              </div>
            </div>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
};

export default UserDashboard;
