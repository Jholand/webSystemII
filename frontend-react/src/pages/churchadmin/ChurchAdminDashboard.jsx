import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Users, TrendingUp, FileText, Upload, Plus, CheckCircle, Clock, Megaphone, BarChart3, UserCog, ArrowUpRight, Bell, Activity, X, Shield } from 'lucide-react';
import { correctionRequestAPI, userNotificationAPI, memberAPI, scheduleAPI, appointmentAPI, eventAPI, auditLogAPI, marriageRecordAPI, baptismRecordAPI, donationAPI, paymentRecordAPI } from '../../services/dataSync';
import ModalOverlay from '../../components/ModalOverlay';
import { formatDate } from '../../utils/dateFormatter';

const ChurchAdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('daily');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [correctionRequests, setCorrectionRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [stats, setStats] = useState({
    totalMembers: 0,
    pendingRequests: 0,
    upcomingEvents: 0,
    activeAnnouncements: 0
  });
  const [todayEvents, setTodayEvents] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [monthlyActivities, setMonthlyActivities] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load all dashboard data from database
  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [
        membersRes,
        schedulesRes,
        appointmentsRes,
        eventsRes,
        correctionRequestsRes,
        marriageRecordsRes,
        baptismRecordsRes,
        notificationsRes
      ] = await Promise.all([
        memberAPI.getAll().catch(() => ({ data: [] })),
        scheduleAPI.getAll().catch(() => []),
        appointmentAPI.getAll().catch(() => []),
        eventAPI.getAll().catch(() => ({ data: [] })),
        correctionRequestAPI.getAll().catch(() => ({ data: [] })),
        marriageRecordAPI.getAll().catch(() => ({ data: [] })),
        baptismRecordAPI.getAll().catch(() => ({ data: [] })),
        userNotificationAPI.getAll().catch(() => [])
      ]);

      // Extract data from responses (handle both paginated and wrapped responses)
      const members = membersRes?.data || (Array.isArray(membersRes) ? membersRes : []);
      const schedules = schedulesRes?.data || (Array.isArray(schedulesRes) ? schedulesRes : []);
      const appointments = appointmentsRes?.data || (Array.isArray(appointmentsRes) ? appointmentsRes : []);
      const events = eventsRes?.data || (Array.isArray(eventsRes) ? eventsRes : []);
      const correctionReqs = correctionRequestsRes?.data || (Array.isArray(correctionRequestsRes) ? correctionRequestsRes : []);
      const marriageRecords = marriageRecordsRes?.data || (Array.isArray(marriageRecordsRes) ? marriageRecordsRes : []);
      const baptismRecords = baptismRecordsRes?.data || (Array.isArray(baptismRecordsRes) ? baptismRecordsRes : []);
      const notifs = Array.isArray(notificationsRes) ? notificationsRes : (notificationsRes?.data || []);

      console.log('Loaded ChurchAdmin data:', { 
        members: members.length, 
        schedules: schedules.length, 
        appointments: appointments.length,
        events: events.length,
        correctionReqs: correctionReqs.length,
        marriageRecords: marriageRecords.length,
        baptismRecords: baptismRecords.length,
        notifications: notifs.length
      });

      // Filter data
      const pendingCorrections = correctionReqs.filter(req => req.status === 'pending' || req.status === 'Pending');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];
      
      // Today's schedules
      const todaySchedules = schedules.filter(s => {
        const scheduleDate = s.date || s.scheduled_date || s.event_date;
        if (!scheduleDate) return false;
        const dateStr = new Date(scheduleDate).toISOString().split('T')[0];
        return dateStr === todayStr;
      });

      // Upcoming events (this week)
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      const upcomingSchedules = schedules.filter(s => {
        const scheduleDate = new Date(s.date || s.scheduled_date || s.event_date);
        return scheduleDate >= today && scheduleDate <= weekFromNow;
      });

      // Get upcoming events for the card (next 7 days)
      const upcoming = [...schedules, ...appointments]
        .filter(item => {
          const itemDate = new Date(item.date || item.scheduled_date || item.event_date);
          return itemDate >= today && itemDate <= weekFromNow;
        })
        .sort((a, b) => {
          const dateA = new Date(a.date || a.scheduled_date || a.event_date);
          const dateB = new Date(b.date || b.scheduled_date || b.event_date);
          return dateA - dateB;
        })
        .slice(0, 5)
        .map(item => ({
          id: item.id,
          title: item.title || item.type || 'Event',
          date: item.date || item.scheduled_date || item.event_date,
          time: item.time || item.scheduled_time || '07:00',
          type: item.type || 'Event'
        }));
      
      setUpcomingEvents(upcoming);

      const pendingAppts = appointments.filter(a => 
        a.status === 'Pending' || a.status === 'pending'
      ).slice(0, 3);

      // Active announcements (not expired)
      const activeAnnouncements = events.filter(e => {
        if (e.is_active === false) return false;
        if (e.end_date) {
          return new Date(e.end_date) >= today;
        }
        return true;
      });

      // Calculate monthly activities (last 6 months)
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const activities = [];
      const now = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        const monthEvents = schedules.filter(s => s.date?.startsWith(monthStr)).length;
        const monthMembers = members.filter(m => new Date(m.date_joined || m.created_at) <= date).length;
        const monthSacraments = [
          ...marriageRecords.filter(r => r.marriage_date?.startsWith(monthStr)),
          ...baptismRecords.filter(r => r.baptism_date?.startsWith(monthStr))
        ].length;
        
        activities.push({
          month: monthNames[date.getMonth()],
          events: monthEvents,
          members: monthMembers,
          sacraments: monthSacraments
        });
      }

      // Update state
      setStats({
        totalMembers: members.length,
        pendingRequests: pendingCorrections.length,
        upcomingEvents: upcomingSchedules.length,
        activeAnnouncements: activeAnnouncements.length
      });
      
      setTodayEvents(todaySchedules.map(s => ({
        id: s.id,
        title: s.title,
        time: s.time,
        priest: s.priest_name || 'TBA',
        status: s.status || 'Scheduled'
      })));
      
      setPendingRequests(pendingAppts.map(a => ({
        id: a.id,
        type: a.type,
        requester: a.client_name,
        requestDate: new Date(a.created_at).toISOString().split('T')[0],
        status: a.status
      })));
      
      setCorrectionRequests(pendingCorrections);
      setMonthlyActivities(activities);
      setNotifications(notifs);
      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoading(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const statsDisplay = [
    { 
      label: 'Total Members', 
      value: loading ? '...' : stats.totalMembers.toString(), 
      icon: Users, 
      change: '+12%',
      color: '#4667CF',
      bgColor: '#E8E9F5'
    },
    { 
      label: 'Pending Requests', 
      value: loading ? '...' : stats.pendingRequests.toString(), 
      icon: Clock, 
      change: '+3',
      color: '#f59e0b',
      bgColor: '#fef3c7'
    },
    { 
      label: 'Upcoming Events', 
      value: loading ? '...' : stats.upcomingEvents.toString(), 
      icon: Calendar, 
      change: 'This week',
      color: '#10b981',
      bgColor: '#d1fae5'
    },
    { 
      label: 'Active Announcements', 
      value: loading ? '...' : stats.activeAnnouncements.toString(), 
      icon: Megaphone, 
      change: '2 urgent',
      color: '#8b5cf6',
      bgColor: '#ede9fe'
    },
  ];

  const markAsRead = async (notificationId) => {
    try {
      await userNotificationAPI.markAsRead(notificationId);
      const updated = notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      );
      setNotifications(updated);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Mark all notifications as read in the database
      await Promise.all(notifications.map(n => 
        !n.read ? userNotificationAPI.markAsRead(n.id) : Promise.resolve()
      ));
      const updated = notifications.map(n => ({ ...n, read: true }));
      setNotifications(updated);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const clearNotification = async (notificationId) => {
    try {
      await userNotificationAPI.delete(notificationId);
      const updated = notifications.filter(n => n.id !== notificationId);
      setNotifications(updated);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const quickActions = [
    { title: 'Member Records', description: 'View and manage church members', icon: Users, path: '/church-admin/members' },
    { title: 'Service Requests', description: 'Approve service requests', icon: CheckCircle, path: '/church-admin/service-requests' },
    { title: 'Appointments', description: 'View appointments & events', icon: Calendar, path: '/church-admin/appointments' },
    { title: 'Event Planning', description: 'Plan church events', icon: Plus, path: '/church-admin/events' },
    { title: 'Audit Logs', description: 'Track admin actions', icon: Shield, path: '/church-admin/audit-logs' },
    { title: 'Reports', description: 'View activity reports', icon: BarChart3, path: '/church-admin/reports' },
    { title: 'Documents', description: 'Upload certificates & forms', icon: FileText, path: '/church-admin/documents' },
    { title: 'Announcements', description: 'Post parish announcements', icon: Megaphone, path: '/church-admin/announcements' },
  ];

  const handleApproveRequest = async (requestId) => {
    try {
      const allRequests = await correctionRequestAPI.getAll();
      const request = allRequests.data.find(req => req.id === requestId);
      
      // Update request status
      await correctionRequestAPI.update(requestId, { 
        status: 'approved', 
        reviewed_at: new Date().toISOString(),
        reviewed_by: 'Church Admin'
      });
      
      // Create notification for user
      const notification = {
        user_id: request.user_id,
        type: 'correction_approved',
        title: 'Correction Request Approved',
        message: `Your request to edit ${request.fields_to_edit?.length || 0} field(s) has been approved by the church admin. You can now edit your profile.`,
        read: false,
        request_id: requestId,
      };
      await userNotificationAPI.create(notification);
      
      console.log('📬 Created approval notification for user:', request.user_id);
      
      // Refresh all dashboard data
      loadDashboardData();
      setShowRequestModal(false);
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const allRequests = await correctionRequestAPI.getAll();
      const request = allRequests.data.find(req => req.id === requestId);
      
      // Update request status
      await correctionRequestAPI.update(requestId, { 
        status: 'rejected', 
        reviewed_at: new Date().toISOString(),
        reviewed_by: 'Church Admin'
      });
      
      // Create notification for user
      const notification = {
        user_id: request.user_id,
        type: 'correction_rejected',
        title: 'Correction Request Rejected',
        message: `Your profile correction request has been rejected by the church admin. Please contact the church office if you have questions.`,
        read: false,
        request_id: requestId,
      };
      await userNotificationAPI.create(notification);
      
      console.log('📬 Created rejection notification for user:', request.user_id);
      
      // Refresh correction requests
      const updatedResponse = await correctionRequestAPI.getAll();
      setCorrectionRequests(updatedResponse.data.filter(req => req.status === 'pending'));
      setShowRequestModal(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#4158D0' }}>Church Administration</h1>
              <p className="text-gray-600 text-sm mt-1">Church Record Management System - Church Admin Control Panel</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-3 text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-all"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {unreadCount}
                    </span>
                  )}
                </button>
              
              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllAsRead}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <Bell size={32} className="mx-auto mb-2 text-gray-300" />
                      <p>No notifications</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 hover:bg-gray-50 transition-colors ${
                            !notification.read ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-gray-900 text-sm">
                                  {notification.title}
                                </h4>
                                {!notification.read && (
                                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{notification.message}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(notification.timestamp).toLocaleString()}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                clearNotification(notification.id);
                              }}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <button 
              className="p-3 text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-all"
            >
              <Activity size={20} />
            </button>
          </div>
        </div>
      </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsDisplay.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border border-gray-200 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-transparent rounded-full transform translate-x-12 -translate-y-12 opacity-50"></div>
                <div className="relative flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl shadow-lg transform group-hover:scale-110 transition-transform" style={{ 
                    background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
                    boxShadow: '0 4px 12px rgba(65, 88, 208, 0.3)'
                  }}>
                    <Icon className="text-white" size={24} />
                  </div>
                </div>
                <div className="relative">
                  <h3 className="text-3xl font-bold mb-2" style={{ color: '#4158D0' }}>{stat.value}</h3>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Activity Overview */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Activity size={20} style={{ color: '#4158D0' }} />
              Activity Overview
            </h2>
            <div className="flex gap-2">
              <button 
                onClick={() => setActiveTab('daily')}
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                style={activeTab === 'daily' ? {
                  background: 'rgba(65, 88, 208, 0.1)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid rgba(65, 88, 208, 0.2)',
                  color: '#4158D0',
                  boxShadow: '0 4px 12px rgba(65, 88, 208, 0.15)'
                } : {
                  background: 'transparent',
                  border: '1px solid transparent',
                  color: '#6b7280'
                }}
              >
                Daily
              </button>
              <button 
                onClick={() => setActiveTab('monthly')}
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                style={activeTab === 'monthly' ? {
                  background: 'rgba(65, 88, 208, 0.1)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid rgba(65, 88, 208, 0.2)',
                  color: '#4158D0',
                  boxShadow: '0 4px 12px rgba(65, 88, 208, 0.15)'
                } : {
                  background: 'transparent',
                  border: '1px solid transparent',
                  color: '#6b7280'
                }}
              >
                Monthly
              </button>
              <button 
                onClick={() => setActiveTab('yearly')}
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                style={activeTab === 'yearly' ? {
                  background: 'rgba(65, 88, 208, 0.1)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid rgba(65, 88, 208, 0.2)',
                  color: '#4158D0',
                  boxShadow: '0 4px 12px rgba(65, 88, 208, 0.15)'
                } : {
                  background: 'transparent',
                  border: '1px solid transparent',
                  color: '#6b7280'
                }}
              >
                Yearly
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Total Events</p>
              <p className="text-2xl font-bold text-blue-600">45</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">New Members</p>
              <p className="text-2xl font-bold text-green-600">12</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Requests</p>
              <p className="text-2xl font-bold text-purple-600">8</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Schedules</p>
              <p className="text-2xl font-bold text-orange-600">23</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Shield size={20} style={{ color: '#4158D0' }} />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              const colors = [
                '#4667CF', '#10b981', '#f59e0b', '#8b5cf6', 
                '#ef4444', '#06b6d4', '#ec4899', '#14b8a6'
              ];
              const color = colors[index % colors.length];
              return (
                <button
                  key={index}
                  onClick={() => navigate(action.path)}
                  className="text-left p-4 border-2 border-gray-200 rounded-xl hover:shadow-lg transition-all group"
                  style={{ borderColor: '#e5e7eb' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(65, 88, 208, 0.3)';
                    e.currentTarget.style.backgroundColor = 'rgba(65, 88, 208, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div 
                      className="p-2.5 rounded-lg group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: `${color}15` }}
                    >
                      <Icon size={20} style={{ color: color }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                      <p className="text-xs text-gray-600">{action.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Upcoming Events Card */}
          <div 
            className="rounded-3xl p-6" 
            style={{
              background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF5FF 100%)',
              border: '1px solid rgba(139, 92, 246, 0.15)',
              boxShadow: '0 8px 32px rgba(139, 92, 246, 0.12)'
            }}
          >
            <h2 className="text-xl font-bold mb-6" style={{ color: '#8B5CF6' }}>
              Upcoming Events
            </h2>
            <div className="space-y-3">
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar size={40} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No upcoming events</p>
                </div>
              ) : (
                upcomingEvents.map((event) => {
                  const eventDate = new Date(event.date);
                  const formattedDate = eventDate.toISOString().split('T')[0];
                  const displayDate = formattedDate.replace(/(\d{4})-(\d{2})-(\d{2})/, '$1-$2-$3');
                  
                  return (
                    <div 
                      key={event.id} 
                      className="p-4 rounded-2xl transition-all"
                      style={{
                        background: 'rgba(255, 255, 255, 0.6)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        border: '1px solid rgba(139, 92, 246, 0.15)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                        e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.6)';
                        e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.15)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="flex items-center justify-center w-12 h-12 rounded-xl"
                          style={{ 
                            background: 'rgba(139, 92, 246, 0.1)',
                            border: '1px solid rgba(139, 92, 246, 0.2)'
                          }}
                        >
                          <Calendar size={20} style={{ color: '#8B5CF6' }} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-1">
                            {event.title}
                          </h3>
                          <div className="flex items-center gap-3 text-xs" style={{ color: '#64748B' }}>
                            <span>{displayDate} • {event.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Today's Events */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">Today's Events</h3>
              <span className="text-xs font-medium text-gray-600 px-2 py-1 bg-gray-100 rounded">
                {todayEvents.length} events
              </span>
            </div>
            <div className="space-y-3">
              {todayEvents.map((event) => (
                <div key={event.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{event.title}</h4>
                      <p className="text-xs text-gray-600 mb-2">{event.priest}</p>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-xs text-gray-600">
                          <Clock size={12} />
                          {event.time}
                        </span>
                        <span className="px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-600">
                          {event.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Service Requests */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">Pending Requests</h3>
              <button 
                onClick={() => navigate('/church-admin/service-requests')}
                className="text-xs font-medium hover:underline" style={{ color: '#4158D0' }}
              >
                View All
              </button>
            </div>
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <div key={request.id} className="p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-all cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{request.type}</h4>
                      <p className="text-xs text-gray-600 mb-2">{request.requester}</p>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-xs text-gray-600">
                          <Calendar size={12} />
                          {request.requestDate}
                        </span>
                        <span className="px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-600">
                          {request.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Profile Correction Requests */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-gray-900">Profile Correction Requests</h3>
                {correctionRequests.length > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-red-100 text-red-600">
                    {correctionRequests.length}
                  </span>
                )}
              </div>
              <button 
                onClick={() => navigate('/church-admin/members')}
                className="text-xs font-medium hover:underline" style={{ color: '#4158D0' }}
              >
                View All
              </button>
            </div>
            <div className="space-y-3">
              {correctionRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText size={40} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No pending correction requests</p>
                </div>
              ) : (
                correctionRequests.slice(0, 3).map((request) => (
                  <div 
                    key={request.id} 
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowRequestModal(true);
                    }}
                    className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{request.user_name || request.userName}</h4>
                          <span className="px-2 py-0.5 text-xs font-medium rounded bg-yellow-100 text-yellow-700">
                            {request.member_id || request.memberId}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{request.user_email || request.userEmail}</p>
                        <p className="text-sm text-gray-700 mb-2 line-clamp-2">{request.request}</p>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-xs text-gray-600">
                            <Clock size={12} />
                            {formatDate(request.submitted_at || request.submittedAt)}
                          </span>
                          <span className="px-2 py-0.5 text-xs font-medium rounded bg-yellow-100 text-yellow-700">
                            Click to Review
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Membership Growth Chart */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Membership Growth (Last 6 Months)</h3>
            <div className="h-64 flex items-end justify-between gap-2">
              {monthlyActivities.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col items-center">
                    <div 
                      className="w-full rounded-t transition-all hover:opacity-80"
                      style={{ 
                        height: `${(data.members / 150) * 100}%`,
                        backgroundColor: '#4158D0',
                        minHeight: '20px'
                      }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600 font-medium">{data.month}</span>
                  <span className="text-xs font-bold text-gray-900">{data.members}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sacraments Overview */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Sacraments Administered</h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Baptisms</span>
                  <span className="text-sm font-bold text-gray-900">35</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="h-2 rounded-full" style={{ width: '70%', backgroundColor: '#4667CF' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Confirmations</span>
                  <span className="text-sm font-bold text-gray-900">28</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="h-2 rounded-full" style={{ width: '56%', backgroundColor: '#10b981' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Weddings</span>
                  <span className="text-sm font-bold text-gray-900">12</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="h-2 rounded-full" style={{ width: '24%', backgroundColor: '#f59e0b' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">First Communions</span>
                  <span className="text-sm font-bold text-gray-900">42</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="h-2 rounded-full" style={{ width: '84%', backgroundColor: '#8b5cf6' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Correction Request Review Modal */}
      <ModalOverlay isOpen={showRequestModal && selectedRequest} onClose={() => {
        setShowRequestModal(false);
        setSelectedRequest(null);
      }}>
        {selectedRequest && (
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="max-h-[85vh] overflow-y-auto p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Profile Correction Request</h3>
              <button
                onClick={() => {
                  setShowRequestModal(false);
                  setSelectedRequest(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {/* Member Info */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="text-sm font-semibold text-blue-900 mb-3">Member Information</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <p className="font-semibold text-gray-900">{selectedRequest.user_name || selectedRequest.userName}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Member ID:</span>
                    <p className="font-semibold text-gray-900">{selectedRequest.member_id || selectedRequest.memberId}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Email:</span>
                    <p className="font-semibold text-gray-900">{selectedRequest.user_email || selectedRequest.userEmail}</p>
                  </div>
                </div>
              </div>

              {/* Fields to Edit */}
              {selectedRequest.fields_to_edit && selectedRequest.fields_to_edit.length > 0 && (
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <h4 className="text-sm font-semibold text-purple-900 mb-2">Fields Requested for Editing:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRequest.fields_to_edit.map((field) => (
                      <span key={field} className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                        {field === 'emergencyContactName' ? 'Emergency Contact Name' :
                         field === 'emergencyContactPhone' ? 'Emergency Contact Phone' :
                         field === 'emergencyContactRelation' ? 'Emergency Contact Relationship' :
                         field === 'postalCode' ? 'Postal Code' :
                         field.charAt(0).toUpperCase() + field.slice(1)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Request Details */}
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <h4 className="text-sm font-semibold text-yellow-900 mb-2">Reason for Correction</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedRequest.request}</p>
              </div>

              {/* Submission Info */}
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span>Submitted: {new Date(selectedRequest.submittedAt || selectedRequest.submitted_at || selectedRequest.created_at).toLocaleString()}</span>
                </div>
                <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 font-medium">
                  Pending Review
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end border-t pt-4">
              <button
                onClick={() => {
                  setShowRequestModal(false);
                  setSelectedRequest(null);
                }}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await handleRejectRequest(selectedRequest.id);
                  setShowRequestModal(false);
                  setSelectedRequest(null);
                }}
                className="px-6 py-2.5 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
              >
                Reject Request
              </button>
              <button
                onClick={async () => {
                  await handleApproveRequest(selectedRequest.id);
                  setShowRequestModal(false);
                  setSelectedRequest(null);
                }}
                className="px-6 py-2.5 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-all"
                style={{ backgroundColor: '#4667CF' }}
              >
                Approve & Update
              </button>
            </div>
          </div>
        </div>
        )}
      </ModalOverlay>
    </div>
  );
};

export default ChurchAdminDashboard;
