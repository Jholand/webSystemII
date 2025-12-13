import { useState, useEffect } from 'react';
import { Users, Shield, Settings, Activity, Clock, DollarSign, Calendar, FileText, AlertCircle, CheckCircle, Database, UserCog, Lock, Bell, BarChart3, TrendingUp, Layers, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [systemActivities, setSystemActivities] = useState([]);
  const [systemHealth, setSystemHealth] = useState({
    database: 'healthy',
    api: 'healthy',
    storage: 'warning',
    backup: 'healthy'
  });

  // Load all system activities from different accounts
  useEffect(() => {
    const loadSystemActivities = () => {
      const activities = [];
      
      // Get audit logs from all sources
      const auditLogs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
      activities.push(...auditLogs.map(log => ({
        ...log,
        source: 'Audit System',
        type: 'audit'
      })));
      
      // Get correction requests
      const correctionRequests = JSON.parse(localStorage.getItem('correctionRequests') || '[]');
      activities.push(...correctionRequests.map(req => ({
        id: req.id,
        timestamp: req.submittedAt,
        action: `Profile Correction ${req.status}`,
        actor: req.userName || 'User',
        details: req.request,
        category: 'User Management',
        source: 'User Module',
        type: 'correction_request',
        status: req.status
      })));
      
      // Get user notifications
      const userNotifications = JSON.parse(localStorage.getItem('userNotifications') || '[]');
      activities.push(...userNotifications.map(notif => ({
        id: notif.id,
        timestamp: notif.timestamp,
        action: notif.title,
        actor: 'System Notification',
        details: notif.message,
        category: 'Notifications',
        source: 'Notification System',
        type: 'notification'
      })));
      
      // Sort by timestamp (newest first)
      activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      setSystemActivities(activities.slice(0, 100)); // Show latest 100 activities
    };
    
    loadSystemActivities();
    
    // Poll for new activities every 10 seconds
    const interval = setInterval(loadSystemActivities, 10000);
    return () => clearInterval(interval);
  }, []);

  // System statistics focused on administration
  const adminStats = [
    {
      title: 'Total Users',
      value: '47',
      subtitle: '5 Admins, 42 Members',
      icon: Users,
      color: '#4667CF',
      bgColor: '#E8E9F5',
      action: () => navigate('/admin/accounts')
    },
    {
      title: 'Active Roles',
      value: '6',
      subtitle: 'Admin, Priest, Secretary, Accountant, Church Admin, User',
      icon: Shield,
      color: '#10b981',
      bgColor: '#d1fae5',
      action: () => navigate('/admin/accounts')
    },
    {
      title: 'Categories',
      value: '24',
      subtitle: '12 Donations, 12 Event Fees',
      icon: Layers,
      color: '#f59e0b',
      bgColor: '#fef3c7',
      action: () => navigate('/admin/categories')
    },
    {
      title: 'System Health',
      value: 'Good',
      subtitle: 'All services running',
      icon: Activity,
      color: '#10b981',
      bgColor: '#d1fae5',
      action: () => {}
    },
  ];

  // Quick admin actions
  const quickActions = [
    {
      title: 'Manage Users',
      description: 'Add, edit, or remove user accounts',
      icon: UserCog,
      color: '#4667CF',
      path: '/admin/accounts'
    },
    {
      title: 'Configure Categories',
      description: 'Set donation and event categories',
      icon: Layers,
      color: '#8b5cf6',
      path: '/admin/categories'
    },
    {
      title: 'System Settings',
      description: 'Church info, templates, backups',
      icon: Settings,
      color: '#f59e0b',
      path: '/admin/settings'
    },
    {
      title: 'Audit Logs',
      description: 'View all system activities',
      icon: FileText,
      color: '#ef4444',
      path: '/admin/audit-logs'
    },
    {
      title: 'Financial Reports',
      description: 'View donation and payment reports',
      icon: BarChart3,
      color: '#10b981',
      path: '/admin/reports'
    },
    {
      title: 'Data Management',
      description: 'Backup and restore data',
      icon: Database,
      color: '#06b6d4',
      path: '/admin/data-management'
    },
  ];

  // System modules overview
  const moduleStats = [
    { module: 'User Management', status: 'active', users: 47, lastActivity: '2 mins ago' },
    { module: 'Financial System', status: 'active', records: 156, lastActivity: '15 mins ago' },
    { module: 'Event Management', status: 'active', events: 23, lastActivity: '1 hour ago' },
    { module: 'Records System', status: 'active', records: 432, lastActivity: '5 mins ago' },
  ];

  const getSourceColor = (source) => {
    const colors = {
      'Audit System': '#4667CF',
      'User Module': '#10b981',
      'Notification System': '#f59e0b',
      'Financial Module': '#8b5cf6',
      'Church Admin': '#ef4444',
    };
    return colors[source] || '#6b7280';
  };

  const getStatusBadge = (status) => {
    const badges = {
      'active': { bg: '#d1fae5', text: '#10b981', label: 'Active' },
      'warning': { bg: '#fef3c7', text: '#f59e0b', label: 'Warning' },
      'error': { bg: '#fee2e2', text: '#ef4444', label: 'Error' },
      'healthy': { bg: '#d1fae5', text: '#10b981', label: 'Healthy' },
    };
    return badges[status] || badges['active'];
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#E8E9F5' }}>
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold" style={{ color: '#4667CF' }}>Admin Dashboard</h1>
            <p className="text-gray-600 text-sm mt-1">System overview and management</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => window.location.href = '/admin/settings'}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:shadow transition-all"
            >
              <Settings size={16} className="inline mr-1.5" />
              Settings
            </button>
            <button 
              onClick={handleExport}
              className="px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-all"
              style={{ backgroundColor: '#4667CF' }}
            >
              <Download size={16} className="inline mr-1.5" />
              Export
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            
            return (
              <div 
                key={stat.title} 
                className="bg-white rounded-lg p-5 shadow hover:shadow-md transition-shadow border border-gray-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2.5 rounded-lg" style={{ backgroundColor: '#4667CF' }}>
                    <FileText size={20} className="text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-gray-600 text-xs font-medium mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.change}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => window.location.href = '/admin/accounts'}
            className="rounded-lg p-4 hover:shadow-md transition-all group border"
            style={{ backgroundColor: '#E8E9F5', borderColor: '#D9DBEF' }}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg transition-opacity group-hover:opacity-90" style={{ backgroundColor: '#4667CF' }}>
                <Users size={20} className="text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Create User</p>
                <p className="text-xs text-gray-600">Add new system user</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => window.location.href = '/admin/settings'}
            className="rounded-lg p-4 hover:shadow-md transition-all group border"
            style={{ backgroundColor: '#E8E9F5', borderColor: '#D9DBEF' }}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg transition-opacity group-hover:opacity-90" style={{ backgroundColor: '#4667CF' }}>
                <Calendar size={20} className="text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">System Settings</p>
                <p className="text-xs text-gray-600">Configure system</p>
              </div>
            </div>
          </button>

          <button
            onClick={handleExport}
            className="rounded-lg p-4 hover:shadow-md transition-all group border"
            style={{ backgroundColor: '#E8E9F5', borderColor: '#D9DBEF' }}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg transition-opacity group-hover:opacity-90" style={{ backgroundColor: '#4667CF' }}>
                <Download size={20} className="text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Export Data</p>
                <p className="text-xs text-gray-600">Download reports</p>
              </div>
            </div>
          </button>
        </div>

        {/* Analytics Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold" style={{ color: '#4667CF' }}>
              <BarChart3 size={24} className="inline mr-2" />
              Analytics Overview
            </h3>
            <select 
              className="px-4 py-2 text-sm font-medium border rounded-lg transition-all"
              style={{ borderColor: '#D9DBEF', color: '#4667CF' }}
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#E8E9F5' }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium" style={{ color: '#879BDA' }}>Total Members</p>
                <TrendingUp size={16} style={{ color: '#4667CF' }} />
              </div>
              <p className="text-2xl font-bold" style={{ color: '#4667CF' }}>1,234</p>
              <p className="text-xs mt-1" style={{ color: '#879BDA' }}>+12% from last month</p>
            </div>
            
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#E8E9F5' }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium" style={{ color: '#879BDA' }}>Active Donations</p>
                <DollarSign size={16} style={{ color: '#4667CF' }} />
              </div>
              <p className="text-2xl font-bold" style={{ color: '#4667CF' }}>₱685,000</p>
              <p className="text-xs mt-1" style={{ color: '#879BDA' }}>+8% from last month</p>
            </div>
            
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#E8E9F5' }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium" style={{ color: '#879BDA' }}>Events This Month</p>
                <Calendar size={16} style={{ color: '#4667CF' }} />
              </div>
              <p className="text-2xl font-bold" style={{ color: '#4667CF' }}>24</p>
              <p className="text-xs mt-1" style={{ color: '#879BDA' }}>+3 from last month</p>
            </div>
            
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#E8E9F5' }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium" style={{ color: '#879BDA' }}>Avg. Attendance</p>
                <Users size={16} style={{ color: '#4667CF' }} />
              </div>
              <p className="text-2xl font-bold" style={{ color: '#4667CF' }}>945</p>
              <p className="text-xs mt-1" style={{ color: '#879BDA' }}>+5% from last month</p>
            </div>
          </div>

          {/* Mini Charts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Membership Growth */}
            <div className="p-5 border rounded-xl transition-all hover:shadow-lg" style={{ borderColor: '#D9DBEF', backgroundColor: '#FAFAFB' }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#4667CF' }}>Membership Growth</p>
                  <p className="text-xs mt-1" style={{ color: '#879BDA' }}>Last 7 days</p>
                </div>
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#E8E9F5' }}>
                  <Users size={18} style={{ color: '#4667CF' }} />
                </div>
              </div>
              <div className="h-32 flex items-end justify-between gap-2">
                <svg className="w-full h-full" viewBox="0 0 280 128" preserveAspectRatio="none">
                  {/* Grid lines */}
                  <line x1="0" y1="32" x2="280" y2="32" stroke="#D9DBEF" strokeWidth="0.5" strokeDasharray="2,2" />
                  <line x1="0" y1="64" x2="280" y2="64" stroke="#D9DBEF" strokeWidth="0.5" strokeDasharray="2,2" />
                  <line x1="0" y1="96" x2="280" y2="96" stroke="#D9DBEF" strokeWidth="0.5" strokeDasharray="2,2" />
                  
                  {/* Area gradient */}
                  <defs>
                    <linearGradient id="membershipLineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#4667CF" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#4667CF" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>
                  
                  {/* Area fill */}
                  <path
                    d="M 0 78 L 46.67 48 L 93.33 33 L 140 18 L 186.67 15 L 233.33 12 L 280 6 L 280 128 L 0 128 Z"
                    fill="url(#membershipLineGradient)"
                  />
                  
                  {/* Line */}
                  <path
                    d="M 0 78 L 46.67 48 L 93.33 33 L 140 18 L 186.67 15 L 233.33 12 L 280 6"
                    fill="none"
                    stroke="#4667CF"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  
                  {/* Data points */}
                  {[1050, 1080, 1095, 1120, 1145, 1180, 1234].map((count, i) => {
                    const x = i * 46.67;
                    const height = ((count - 1000) / 250) * 100;
                    const y = 128 - height;
                    return (
                      <g key={i}>
                        <circle
                          cx={x}
                          cy={y}
                          r="3.5"
                          fill="#FAFAFB"
                          stroke="#4667CF"
                          strokeWidth="2"
                          className="hover:r-5 cursor-pointer"
                        />
                      </g>
                    );
                  })}
                </svg>
                <div className="flex justify-between w-full mt-1 px-1">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                    <span key={i} className="text-xs font-medium" style={{ color: '#BEC4E0' }}>
                      {day}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between pt-3 border-t" style={{ borderColor: '#D9DBEF' }}>
                <span className="text-xs" style={{ color: '#879BDA' }}>Total Growth</span>
                <span className="text-sm font-bold" style={{ color: '#4667CF' }}>+184 members</span>
              </div>
            </div>
            
            {/* Donation Trends */}
            <div className="p-5 border rounded-xl transition-all hover:shadow-lg" style={{ borderColor: '#D9DBEF', backgroundColor: '#FAFAFB' }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#4667CF' }}>Donation Trends</p>
                  <p className="text-xs mt-1" style={{ color: '#879BDA' }}>Last 7 days</p>
                </div>
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#E8E9F5' }}>
                  <DollarSign size={18} style={{ color: '#4667CF' }} />
                </div>
              </div>
              <div className="h-32 flex items-end justify-between gap-2">
                <svg className="w-full h-full" viewBox="0 0 280 128" preserveAspectRatio="none">
                  {/* Grid lines */}
                  <line x1="0" y1="32" x2="280" y2="32" stroke="#D9DBEF" strokeWidth="0.5" strokeDasharray="2,2" />
                  <line x1="0" y1="64" x2="280" y2="64" stroke="#D9DBEF" strokeWidth="0.5" strokeDasharray="2,2" />
                  <line x1="0" y1="96" x2="280" y2="96" stroke="#D9DBEF" strokeWidth="0.5" strokeDasharray="2,2" />
                  
                  {/* Area gradient */}
                  <defs>
                    <linearGradient id="donationAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#879BDA" stopOpacity="0.4" />
                      <stop offset="50%" stopColor="#4667CF" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#4667CF" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>
                  
                  {/* Area fill - smooth bezier curve */}
                  <path
                    d="M 0 78 Q 23.33 72, 46.67 58 Q 70 54, 93.33 62 Q 116.67 48, 140 42 Q 163.33 36, 186.67 28 Q 210 24, 233.33 18 Q 256.67 12, 280 8 L 280 128 L 0 128 Z"
                    fill="url(#donationAreaGradient)"
                  />
                  
                  {/* Line - smooth bezier curve */}
                  <path
                    d="M 0 78 Q 23.33 72, 46.67 58 Q 70 54, 93.33 62 Q 116.67 48, 140 42 Q 163.33 36, 186.67 28 Q 210 24, 233.33 18 Q 256.67 12, 280 8"
                    fill="none"
                    stroke="#4667CF"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  
                  {/* Data points */}
                  {[45000, 52000, 48000, 61000, 68000, 72000, 85000].map((amount, i) => {
                    const x = i * 46.67;
                    const height = (amount / 90000) * 100;
                    const y = 128 - height;
                    return (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r="3.5"
                        fill="#FAFAFB"
                        stroke="#4667CF"
                        strokeWidth="2"
                      />
                    );
                  })}
                </svg>
                <div className="flex justify-between w-full mt-1 px-1">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                    <span key={i} className="text-xs font-medium" style={{ color: '#BEC4E0' }}>
                      {day}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between pt-3 border-t" style={{ borderColor: '#D9DBEF' }}>
                <span className="text-xs" style={{ color: '#879BDA' }}>Weekly Total</span>
                <span className="text-sm font-bold" style={{ color: '#4667CF' }}>₱431,000</span>
              </div>
            </div>
            
            {/* Event Attendance */}
            <div className="p-5 border rounded-xl transition-all hover:shadow-lg" style={{ borderColor: '#D9DBEF', backgroundColor: '#FAFAFB' }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#4667CF' }}>Event Attendance</p>
                  <p className="text-xs mt-1" style={{ color: '#879BDA' }}>Last 7 events</p>
                </div>
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#E8E9F5' }}>
                  <Calendar size={18} style={{ color: '#4667CF' }} />
                </div>
              </div>
              <div className="h-32 flex items-end justify-between gap-2">
                {[850, 920, 880, 950, 980, 940, 1050].map((attendance, i) => {
                  const height = (attendance / 1100) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="w-full relative">
                        <div 
                          className="w-full rounded-t transition-all duration-300" 
                          style={{ 
                            height: `${height}px`,
                            backgroundColor: '#BEC4E0',
                            boxShadow: '0 -2px 8px rgba(190, 196, 224, 0.4)'
                          }}
                        >
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                            {attendance}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-medium" style={{ color: '#BEC4E0' }}>
                        E{i+1}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex items-center justify-between pt-3 border-t" style={{ borderColor: '#D9DBEF' }}>
                <span className="text-xs" style={{ color: '#879BDA' }}>Avg. Attendance</span>
                <span className="text-sm font-bold" style={{ color: '#4667CF' }}>938 people</span>
              </div>
            </div>
          </div>
        </div>

        {/* Membership Distribution */}
        <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700/30 rounded-2xl p-6 shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 animate-fade-in animation-delay-400">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <div className="w-1.5 h-8 bg-gradient-to-b from-purple-400 to-blue-400 rounded-full animate-pulse"></div>
            Membership Distribution
          </h3>
          
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-40 h-40">
                {/* Outer Ring */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Adults - 55% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="url(#gradient-blue)"
                    strokeWidth="10"
                    strokeDasharray={`${55 * 2.513} ${100 * 2.513}`}
                    strokeLinecap="round"
                  />
                  {/* Youth - 30% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="url(#gradient-cyan)"
                    strokeWidth="10"
                    strokeDasharray={`${30 * 2.513} ${100 * 2.513}`}
                    strokeDashoffset={`${-55 * 2.513}`}
                    strokeLinecap="round"
                  />
                  {/* Children - 15% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="url(#gradient-indigo)"
                    strokeWidth="10"
                    strokeDasharray={`${15 * 2.513} ${100 * 2.513}`}
                    strokeDashoffset={`${-(55 + 30) * 2.513}`}
                    strokeLinecap="round"
                  />
                  
                  <defs>
                    <linearGradient id="gradient-blue" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#2563eb" />
                      <stop offset="100%" stopColor="#1e40af" />
                    </linearGradient>
                    <linearGradient id="gradient-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#60a5fa" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                    <linearGradient id="gradient-indigo" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#93c5fd" />
                      <stop offset="100%" stopColor="#60a5fa" />
                    </linearGradient>
                  </defs>
                </svg>
                
                {/* Center Text */}
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">1,234</p>
                  <p className="text-[10px] text-blue-900 dark:text-gray-400 font-medium">Total</p>
                </div>
              </div>
            </div>
            
          <div className="space-y-3">
            {membershipDistribution.map((item) => (
              <div key={item.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${item.color}`}></div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{item.category}</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{item.count}</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>


        {/* System-Wide Activities */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#E8E9F5' }}>
                <Activity size={20} style={{ color: '#4667CF' }} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">System Activities</h3>
                <p className="text-xs text-gray-600">Real-time updates from all accounts</p>
              </div>
            </div>
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm font-bold">
              {systemActivities.length}
            </span>
          </div>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {systemActivities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Activity size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent activities</p>
              </div>
            ) : (
              systemActivities.map((activity) => (
                <div key={activity.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:shadow-sm transition-all">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${
                      activity.source === 'Church Admin' ? 'bg-purple-100' :
                      activity.source === 'User Portal' ? 'bg-blue-100' :
                      'bg-gray-100'
                    }`}>
                      {activity.source === 'Church Admin' ? (
                        <Shield size={14} className="text-blue-600" />
                      ) : activity.source === 'User Portal' ? (
                        <Users size={14} className="text-blue-600" />
                      ) : (
                        <Activity size={14} className="text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          activity.status === 'approved' ? 'bg-green-100 text-green-700' :
                          activity.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          activity.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {activity.category || 'General'}
                        </span>
                        <span className="text-xs text-gray-500">{activity.source}</span>
                      </div>
                      <h4 className="font-medium text-gray-900 text-sm mb-1">{activity.action}</h4>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">{activity.details}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="font-medium">{activity.actor || 'Unknown'}</span>
                        {activity.actorEmail && (
                          <>
                            <span>•</span>
                            <span className="truncate">{activity.actorEmail}</span>
                          </>
                        )}
                        <span>•</span>
                        <span>{new Date(activity.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Tasks & Quick Reports Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Tasks */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock size={20} className="text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Pending Tasks</h3>
                  <p className="text-xs text-gray-600">Items requiring action</p>
                </div>
              </div>
              <span className="bg-orange-600 text-white px-3 py-1 rounded-lg text-sm font-bold">{pendingTasks.length}</span>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {pendingTasks.map((task) => (
                <div key={task.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          task.priority === 'High' ? 'bg-red-100 text-red-700' :
                          task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {task.priority}
                        </span>
                        <span className="text-xs text-gray-500">{task.type}</span>
                      </div>
                      <h4 className="font-medium text-gray-900 text-sm mb-1">{task.description}</h4>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span>By {task.submittedBy}</span>
                        <span>•</span>
                        <span>{task.daysWaiting}d ago</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button className="p-1.5 text-white rounded transition-opacity hover:opacity-90" style={{ backgroundColor: '#4667CF' }}>
                        <CheckCircle size={14} />
                      </button>
                      <button className="p-1.5 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded transition-all">
                        <XCircle size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Reports Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Reports</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-100 dark:border-gray-700 hover:shadow transition-all cursor-pointer group">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: '#4667CF' }}>
                    <BarChart3 size={20} className="text-white" />
                  </div>
                  <Download size={18} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
                <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Financial Report</h4>
                <p className="text-sm text-blue-900 dark:text-gray-400 mb-4">Financial overview including donations and billings</p>
                <button className="w-full py-2 text-white rounded-lg text-sm font-medium transition-opacity hover:opacity-90" style={{ backgroundColor: '#4667CF' }}>
                  Generate Report
                </button>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-100 dark:border-gray-700 hover:shadow transition-all cursor-pointer group">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                    <PieChart size={20} className="text-white" />
                  </div>
                  <Download size={18} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
                <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Attendance Report</h4>
                <p className="text-sm text-blue-900 dark:text-gray-400 mb-4">Member attendance analytics and trends</p>
                <button className="w-full py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg text-sm font-medium transition-all">
                  Generate Report
                </button>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-100 dark:border-gray-700 hover:shadow transition-all cursor-pointer group">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg">
                    <TrendingUpIcon size={20} className="text-white" />
                  </div>
                  <Download size={18} className="text-gray-400 group-hover:text-green-600 transition-colors" />
                </div>
                <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Sacraments Report</h4>
                <p className="text-sm text-blue-900 dark:text-gray-400 mb-4">Baptisms, weddings, and funerals data</p>
                <button className="w-full py-2 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-lg text-sm font-medium transition-all">
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

