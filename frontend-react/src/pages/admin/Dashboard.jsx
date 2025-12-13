import { useState, useEffect, useMemo } from 'react';
import { Users, Shield, Settings, Activity, FileText, Database, UserCog, Layers, BarChart3, Clock, Bell, CheckCircle, AlertCircle, TrendingUp, RefreshCw, Calendar, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { userAPI, memberAPI, donationCategoryAPI, eventFeeCategoryAPI, auditLogAPI, scheduleAPI, marriageRecordAPI, baptismRecordAPI, appointmentAPI, eventAPI } from '../../services/dataSync';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [systemActivities, setSystemActivities] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMembers: 0,
    totalDonationCategories: 0,
    totalEventFeeCategories: 0,
    totalSchedules: 0,
    totalMarriageRecords: 0,
    totalBaptismRecords: 0,
    totalAppointments: 0,
    totalEvents: 0
  });
  const [analyticsData, setAnalyticsData] = useState({
    monthlyRecords: [],
    recordsByType: [],
    schedulesByStatus: [],
    userRoles: []
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load all data from database
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      if (!loading) setIsRefreshing(true);
      setLoading(true);
      
      // Fetch only essential data in parallel (optimized for speed)
      const [
        users,
        membersResponse,
        donationCategories,
        eventFeeCategories,
        schedules,
        marriageRecordsResponse,
        baptismRecordsResponse,
        appointmentsResponse,
        eventsResponse,
        auditLogs
      ] = await Promise.all([
        userAPI.getAll().catch(() => []),
        memberAPI.getAll().catch(() => ({ data: [] })),
        donationCategoryAPI.getAll().catch(() => []),
        eventFeeCategoryAPI.getAll().catch(() => []),
        scheduleAPI.getAll().catch(() => []),
        marriageRecordAPI.getAll().catch(() => ({ data: [] })),
        baptismRecordAPI.getAll().catch(() => ({ data: [] })),
        appointmentAPI.getAll().catch(() => []),
        eventAPI.getAll().catch(() => []),
        auditLogAPI.getAll().catch(() => [])
      ]);

      // Extract data from responses (handle both paginated and wrapped responses)
      const members = Array.isArray(membersResponse) ? membersResponse : (membersResponse.data || []);
      const marriageRecords = Array.isArray(marriageRecordsResponse) ? marriageRecordsResponse : (marriageRecordsResponse.data || []);
      const baptismRecords = Array.isArray(baptismRecordsResponse) ? baptismRecordsResponse : (baptismRecordsResponse.data || []);
      const appointments = Array.isArray(appointmentsResponse) ? appointmentsResponse : (appointmentsResponse.data || []);
      const events = Array.isArray(eventsResponse) ? eventsResponse : (eventsResponse.data || []);

      // Update stats (count only for performance)
      setStats({
        totalUsers: users.length || 0,
        totalMembers: members.length || 0,
        totalDonationCategories: donationCategories.length || 0,
        totalEventFeeCategories: eventFeeCategories.length || 0,
        totalSchedules: schedules.length || 0,
        totalMarriageRecords: marriageRecords.length || 0,
        totalBaptismRecords: baptismRecords.length || 0,
        totalAppointments: appointments.length || 0,
        totalEvents: events.length || 0
      });

      // Process only recent 10 audit logs for activities (reduced from 100 for faster load)
      const activities = auditLogs.slice(0, 10).map(log => ({
        ...log,
        source: 'Audit System',
        type: 'audit'
      }));

      activities.sort((a, b) => new Date(b.timestamp || b.created_at) - new Date(a.timestamp || a.created_at));
      setSystemActivities(activities);
      
      // Generate analytics data from database
      generateAnalytics(marriageRecords, baptismRecords, schedules, users, members);
      
      setLastUpdate(new Date());
      setLoading(false);
      setIsRefreshing(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const generateAnalytics = (marriageRecords, baptismRecords, schedules, users, members) => {
    // Ensure all parameters are arrays
    const safeMarriageRecords = Array.isArray(marriageRecords) ? marriageRecords : [];
    const safeBaptismRecords = Array.isArray(baptismRecords) ? baptismRecords : [];
    const safeSchedules = Array.isArray(schedules) ? schedules : [];
    const safeUsers = Array.isArray(users) ? users : [];
    const safeMembers = Array.isArray(members) ? members : [];

    // 1. Monthly Records Trend (Last 6 Months)
    const monthlyData = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = month.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      monthlyData[monthKey] = { month: monthKey, marriages: 0, baptisms: 0, schedules: 0 };
    }

    safeMarriageRecords.forEach(record => {
      if (record.marriage_date) {
        const date = new Date(record.marriage_date);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        if (monthlyData[monthKey]) monthlyData[monthKey].marriages++;
      }
    });

    safeBaptismRecords.forEach(record => {
      if (record.baptism_date) {
        const date = new Date(record.baptism_date);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        if (monthlyData[monthKey]) monthlyData[monthKey].baptisms++;
      }
    });

    safeSchedules.forEach(schedule => {
      if (schedule.start_time || schedule.date) {
        const date = new Date(schedule.start_time || schedule.date);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        if (monthlyData[monthKey]) monthlyData[monthKey].schedules++;
      }
    });

    // 2. Records by Type
    const recordsByType = [
      { name: 'Marriage', value: safeMarriageRecords.length, color: '#8b5cf6' },
      { name: 'Baptism', value: safeBaptismRecords.length, color: '#10b981' },
      { name: 'Members', value: safeMembers.length, color: '#f59e0b' },
      { name: 'Schedules', value: safeSchedules.length, color: '#4158D0' }
    ];

    // 3. Schedules by Status
    const scheduleStatus = {};
    safeSchedules.forEach(schedule => {
      const status = schedule.status || 'pending';
      scheduleStatus[status] = (scheduleStatus[status] || 0) + 1;
    });

    const schedulesByStatus = Object.entries(scheduleStatus).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: name === 'completed' ? '#10b981' : name === 'pending' ? '#f59e0b' : name === 'approved' ? '#4158D0' : '#ef4444'
    }));

    // 4. User Roles Distribution
    const roleCount = {};
    safeUsers.forEach(user => {
      const role = user.role || 'user';
      roleCount[role] = (roleCount[role] || 0) + 1;
    });

    const userRoles = Object.entries(roleCount).map(([name, value]) => ({
      name: name.replace('_', ' ').toUpperCase(),
      value,
      color: name === 'admin' ? '#ef4444' : name === 'priest' ? '#8b5cf6' : name === 'church_admin' ? '#4158D0' : name === 'accountant' ? '#10b981' : '#6b7280'
    }));

    setAnalyticsData({
      monthlyRecords: Object.values(monthlyData),
      recordsByType,
      schedulesByStatus,
      userRoles
    });
  };

  const handleManualRefresh = () => {
    loadDashboardData();
  };

  const formatLastUpdate = () => {
    if (!lastUpdate) return 'Never';
    const now = new Date();
    const diff = Math.floor((now - lastUpdate) / 1000); // seconds
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return lastUpdate.toLocaleTimeString();
  };

  // Memoize computed values to prevent unnecessary recalculations
  const adminStats = useMemo(() => [
    {
      title: 'Total Users',
      value: loading ? '...' : stats.totalUsers.toString(),
      subtitle: `System users and accounts`,
      icon: Users,
      color: '#4158D0',
      bgColor: '#E8E9F5',
      action: () => navigate('/admin/accounts')
    },
    {
      title: 'Church Members',
      value: loading ? '...' : stats.totalMembers.toString(),
      subtitle: 'Registered members',
      icon: Users,
      color: '#10b981',
      bgColor: '#d1fae5',
      action: () => navigate('/admin/membership')
    },
    {
      title: 'Categories',
      value: loading ? '...' : (stats.totalDonationCategories + stats.totalEventFeeCategories).toString(),
      subtitle: `${stats.totalDonationCategories} Donations, ${stats.totalEventFeeCategories} Event Fees`,
      icon: Layers,
      color: '#f59e0b',
      bgColor: '#fef3c7',
      action: () => navigate('/admin/categories')
    },
    {
      title: 'Sacrament Records',
      value: loading ? '...' : (stats.totalMarriageRecords + stats.totalBaptismRecords).toString(),
      subtitle: `${stats.totalMarriageRecords} Marriage, ${stats.totalBaptismRecords} Baptism`,
      icon: FileText,
      color: '#8b5cf6',
      bgColor: '#ede9fe',
      action: () => navigate('/admin/records')
    },
    {
      title: 'Appointments',
      value: loading ? '...' : stats.totalAppointments.toString(),
      subtitle: 'All user appointments',
      icon: Calendar,
      color: '#4158D0',
      bgColor: 'rgba(65, 88, 208, 0.1)',
      action: () => navigate('/admin/schedules')
    },
    {
      title: 'Events',
      value: loading ? '...' : stats.totalEvents.toString(),
      subtitle: 'Scheduled church events',
      icon: Activity,
      color: '#ec4899',
      bgColor: '#fce7f3',
      action: () => navigate('/admin/schedules')
    },
  ], [loading, stats, navigate]);

  const quickActions = [
    {
      title: 'Manage Users & Roles',
      description: 'Add, edit, or remove user accounts and assign permissions',
      icon: UserCog,
      color: '#4158D0',
      path: '/admin/accounts'
    },
    {
      title: 'Configure Categories',
      description: 'Set donation and event fee categories with amounts',
      icon: Layers,
      color: '#8b5cf6',
      path: '/admin/categories'
    },
    {
      title: 'System Settings',
      description: 'Church information, certificate templates, and backups',
      icon: Settings,
      color: '#f59e0b',
      path: '/admin/settings'
    },
    {
      title: 'View Audit Logs',
      description: 'Monitor all system activities and user actions',
      icon: FileText,
      color: '#ef4444',
      path: '/admin/audit-log'
    },
    {
      title: 'Financial Reports',
      description: 'View donation and payment reports (Read-only)',
      icon: BarChart3,
      color: '#10b981',
      path: '/admin/payment-reports'
    },
    {
      title: 'Data Management',
      description: 'Backup, restore, and manage system data',
      icon: Database,
      color: '#06b6d4',
      path: '/admin/data-mgmt'
    },
  ];

  // Memoize module stats with real data
  const moduleStats = useMemo(() => {
    const getRecentActivity = (records) => {
      if (!records || records.length === 0) return 'No activity';
      const latest = records.reduce((prev, curr) => {
        const prevDate = new Date(prev.created_at || prev.updated_at || 0);
        const currDate = new Date(curr.created_at || curr.updated_at || 0);
        return currDate > prevDate ? curr : prev;
      });
      const activityDate = new Date(latest.created_at || latest.updated_at);
      const now = new Date();
      const diffMs = now - activityDate;
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    };

    return [
      { 
        module: 'User Management', 
        status: 'active', 
        count: stats.totalUsers + stats.totalMembers, 
        lastActivity: getRecentActivity([]) 
      },
      { 
        module: 'Financial System', 
        status: 'active', 
        count: stats.totalDonationCategories + stats.totalEventFeeCategories, 
        lastActivity: 'Live' 
      },
      { 
        module: 'Event Management', 
        status: 'active', 
        count: stats.totalSchedules, 
        lastActivity: getRecentActivity([]) 
      },
      { 
        module: 'Records System', 
        status: 'active', 
        count: stats.totalMarriageRecords + stats.totalBaptismRecords, 
        lastActivity: getRecentActivity([]) 
      },
    ];
  }, [stats]);

  const getSourceColor = (source) => {
    const colors = {
      'Audit System': '#4158D0',
      'User Module': '#10b981',
      'Notification System': '#f59e0b',
      'Financial Module': '#8b5cf6',
      'Church Admin': '#ef4444',
    };
    return colors[source] || '#6b7280';
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="space-y-6">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#4158D0' }}>System Dashboard</h1>
              <p className="text-gray-600 mt-1">Overview of church management system</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className={`p-3 rounded-lg shadow transition-all ${
                  isRefreshing ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
                }`}
                style={{
                  background: isRefreshing ? '#e5e7eb' : 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
                  color: 'white'
                }}
                title="Refresh"
              >
                <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
              </button>
              <button 
                onClick={() => navigate('/admin/settings')}
                className="p-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                title="Settings"
              >
                <Settings size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {adminStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div 
                key={stat.title}
                onClick={stat.action}
                className="bg-white p-5 rounded-lg shadow border border-gray-200 hover:shadow-lg transition-all cursor-pointer group"
              >
                {loading && !stats.totalUsers ? (
                  <div className="animate-pulse">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                      <div className="w-4 h-4 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-3">
                      <div 
                        className="p-3 rounded-lg group-hover:scale-110 transition-transform"
                        style={{ backgroundColor: stat.bgColor }}
                      >
                        <Icon size={24} style={{ color: stat.color }} />
                      </div>
                      <TrendingUp size={16} className="text-gray-400" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                    <p className="text-sm font-semibold text-gray-700 mb-1">{stat.title}</p>
                    <p className="text-xs text-gray-500">{stat.subtitle}</p>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Analytics Line Graph */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp size={20} style={{ color: '#4158D0' }} />
              Records Trend
            </h2>
            <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Last 6 months</span>
          </div>
          <div className="h-80">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#4158D0' }}></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData.monthlyRecords}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px',
                      padding: '10px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="marriages" 
                    stroke="rgba(65, 88, 208, 0.8)" 
                    strokeWidth={3}
                    name="Marriages"
                    dot={{ fill: '#4158D0', r: 5 }}
                    activeDot={{ r: 7, fill: '#4158D0' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="baptisms" 
                    stroke="rgba(65, 88, 208, 0.5)" 
                    strokeWidth={3}
                    name="Baptisms"
                    dot={{ fill: 'rgba(65, 88, 208, 0.6)', r: 5 }}
                    activeDot={{ r: 7, fill: '#4158D0' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="schedules" 
                    stroke="rgba(65, 88, 208, 0.3)" 
                    strokeWidth={3}
                    name="Schedules"
                    dot={{ fill: 'rgba(65, 88, 208, 0.4)', r: 5 }}
                    activeDot={{ r: 7, fill: '#4158D0' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* System Activities */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Activity size={20} style={{ color: '#4158D0' }} />
              Recent Activities
            </h2>
            <button 
              onClick={() => navigate('/admin/audit-log')}
              className="text-sm px-4 py-2 rounded-lg transition-all font-medium hover:shadow-md"
              style={{
                background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
                color: 'white'
              }}
            >
              View All
            </button>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#4158D0' }}></div>
              </div>
            ) : systemActivities.length > 0 ? (
              systemActivities.slice(0, 8).map((activity, index) => (
                <div 
                  key={activity.id || index}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-blue-50/50 hover:border-blue-200 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span 
                          className="text-xs font-semibold px-2.5 py-1 rounded uppercase tracking-wide"
                          style={{ 
                            backgroundColor: `${getSourceColor(activity.source)}15`,
                            color: getSourceColor(activity.source)
                          }}
                        >
                          {activity.source}
                        </span>
                        {activity.status && (
                          <span className={`text-xs font-medium px-2.5 py-1 rounded uppercase ${
                            activity.status === 'approved' ? 'bg-green-100 text-green-700' :
                            activity.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            activity.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {activity.status}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">{activity.action}</p>
                      <p className="text-xs text-gray-600">
                        by {activity.actor} • {activity.category}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {activity.timestamp ? new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Bell size={48} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium">No recent activities</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
