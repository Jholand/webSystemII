import { useState } from 'react';
import { Users, Baby, Heart, Calendar, TrendingUp, TrendingDown, Activity, Clock, MapPin, DollarSign, UserPlus, Shield, FileText, AlertCircle, CheckCircle, XCircle, Download, BarChart3, PieChart, TrendingUpIcon, Edit, Trash2, Plus, Settings, Search } from 'lucide-react';

const AdminDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleExport = () => {
    // Create CSV content
    const csvData = [
      ['Dashboard Statistics Report', '', '', '', ''],
      ['Generated:', new Date().toLocaleString(), '', '', ''],
      ['', '', '', '', ''],
      ['Metric', 'Value', 'Change', '', ''],
      ...stats.map(stat => [stat.title, stat.value, stat.change, '', '']),
      ['', '', '', '', ''],
      ['Monthly Data', '', '', '', ''],
      ['Month', 'Members', 'Births', 'Marriages', 'Donations'],
      ...monthlyData.map(d => [d.month, d.members, d.births, d.marriages, d.donations])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `dashboard_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Mock data for charts
  const monthlyData = [
    { month: 'Jan', members: 1050, births: 38, marriages: 12, donations: 45000, events: 8, attendance: 850, billings: 28000 },
    { month: 'Feb', members: 1080, births: 42, marriages: 15, donations: 52000, events: 10, attendance: 920, billings: 31000 },
    { month: 'Mar', members: 1110, births: 45, marriages: 18, donations: 48000, events: 9, attendance: 880, billings: 29500 },
    { month: 'Apr', members: 1125, births: 40, marriages: 14, donations: 55000, events: 11, attendance: 950, billings: 33000 },
    { month: 'May', members: 1150, births: 48, marriages: 16, donations: 60000, events: 12, attendance: 980, billings: 35000 },
    { month: 'Jun', members: 1175, births: 52, marriages: 20, donations: 58000, events: 10, attendance: 940, billings: 32000 },
    { month: 'Jul', members: 1190, births: 45, marriages: 17, donations: 62000, events: 13, attendance: 1000, billings: 36000 },
    { month: 'Aug', members: 1205, births: 50, marriages: 19, donations: 68000, events: 14, attendance: 1050, billings: 38000 },
    { month: 'Sep', members: 1215, births: 43, marriages: 15, donations: 54000, events: 9, attendance: 890, billings: 30000 },
    { month: 'Oct', members: 1225, births: 46, marriages: 16, donations: 57000, events: 11, attendance: 920, billings: 31500 },
    { month: 'Nov', members: 1234, births: 41, marriages: 13, donations: 61000, events: 12, attendance: 960, billings: 34000 },
  ];

  const totalDonations = monthlyData.reduce((sum, d) => sum + d.donations, 0);
  const totalEvents = monthlyData.reduce((sum, d) => sum + d.events, 0);
  const totalBillings = monthlyData.reduce((sum, d) => sum + d.billings, 0);
  const avgAttendance = Math.round(monthlyData.reduce((sum, d) => sum + d.attendance, 0) / monthlyData.length);

  // System users data
  const systemUsers = [
    { id: 1, name: 'Fr. Joseph Smith', role: 'Priest', status: 'Active', lastActive: '2 mins ago', email: 'fr.joseph@church.com' },
    { id: 2, name: 'Maria Santos', role: 'Accountant', status: 'Active', lastActive: '5 mins ago', email: 'maria.s@church.com' },
    { id: 3, name: 'John Dela Cruz', role: 'Church Admin', status: 'Active', lastActive: '1 hour ago', email: 'john.dc@church.com' },
    { id: 4, name: 'Sarah Williams', role: 'User', status: 'Active', lastActive: '3 hours ago', email: 'sarah.w@email.com' },
    { id: 5, name: 'Michael Brown', role: 'User', status: 'Inactive', lastActive: '2 days ago', email: 'michael.b@email.com' },
  ];

  // Audit logs
  const auditLogs = [
    { id: 1, action: 'User Login', user: 'Fr. Joseph Smith', details: 'Logged in successfully', timestamp: '2025-11-23 09:15 AM', type: 'success' },
    { id: 2, action: 'Record Updated', user: 'Maria Santos', details: 'Updated billing record #1234', timestamp: '2025-11-23 09:10 AM', type: 'info' },
    { id: 3, action: 'User Created', user: 'Admin', details: 'Created new user account: John Doe', timestamp: '2025-11-23 08:45 AM', type: 'success' },
    { id: 4, action: 'Failed Login', user: 'Unknown', details: 'Failed login attempt from IP 192.168.1.100', timestamp: '2025-11-23 08:30 AM', type: 'error' },
    { id: 5, action: 'Schedule Added', user: 'John Dela Cruz', details: 'Added new event: Sunday Mass', timestamp: '2025-11-23 08:00 AM', type: 'info' },
    { id: 6, action: 'Billing Approved', user: 'Maria Santos', details: 'Approved billing invoice #5678', timestamp: '2025-11-22 04:30 PM', type: 'success' },
  ];

  // Pending approvals
  const pendingApprovals = [
    { id: 1, type: 'Billing', description: 'Invoice #5680 - Wedding Service', amount: '₱15,000', submittedBy: 'Sarah Williams', date: '2025-11-23' },
    { id: 2, type: 'Schedule', description: 'Baptism Ceremony Request', amount: '-', submittedBy: 'John Doe', date: '2025-11-22' },
    { id: 3, type: 'Record', description: 'Birth Certificate Update', amount: '-', submittedBy: 'Maria Garcia', date: '2025-11-22' },
  ];

  const stats = [
    {
      title: 'Total Members',
      value: '1,234',
      change: '+12%',
      trend: 'up',
      icon: Users
    },
    {
      title: 'Total Donations',
      value: `₱${(totalDonations / 1000).toFixed(0)}K`,
      change: '+15%',
      trend: 'up',
      icon: DollarSign
    },
    {
      title: 'Total Billings',
      value: `₱${(totalBillings / 1000).toFixed(0)}K`,
      change: '+10%',
      trend: 'up',
      icon: FileText
    },
    {
      title: 'Avg. Attendance',
      value: avgAttendance.toString(),
      change: '+8%',
      trend: 'up',
      icon: Activity
    },
    {
      title: 'Total Events',
      value: totalEvents.toString(),
      change: '+8%',
      trend: 'up',
      icon: Calendar
    },
    {
      title: 'Birth Records',
      value: '456',
      change: '+8%',
      trend: 'up',
      icon: Baby
    },
    {
      title: 'System Users',
      value: systemUsers.length.toString(),
      change: '+2',
      trend: 'up',
      icon: Shield
    },
    {
      title: 'Pending Approvals',
      value: pendingApprovals.length.toString(),
      change: 'Requires Action',
      trend: 'neutral',
      icon: AlertCircle
    },
  ];

  // Membership distribution data for pie chart
  const membershipDistribution = [
    { category: 'Active Members', count: 856, percentage: 69 },
    { category: 'Youth', count: 234, percentage: 19 },
    { category: 'Senior', count: 144, percentage: 12 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
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
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-black via-[#0A1628] to-[#1E3A8A] rounded-lg hover:opacity-90 transition-all"
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
                className="bg-white rounded-lg p-4 shadow hover:shadow-md transition-shadow border border-gray-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-gradient-to-br from-black via-[#0A1628] to-[#1E3A8A] rounded-lg">
                    <Icon size={18} className="text-white" />
                  </div>
                  {stat.trend === 'up' && (
                    <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      {stat.change}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-gray-600 text-xs mb-2">{stat.title}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Donations & Events Chart */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Donations & Events
            </h3>
            <div className="h-72">
              <div className="h-full flex items-end justify-between gap-1.5">
                {monthlyData.map((data, index) => {
                  const maxDonation = Math.max(...monthlyData.map(d => d.donations));
                  const maxEvents = Math.max(...monthlyData.map(d => d.events));
                  const donationHeight = (data.donations / maxDonation) * 100;
                  const eventsHeight = (data.events / maxEvents) * 80;
                  
                  return (
                    <div key={data.month} className="flex-1 flex flex-col items-center gap-1.5">
                      <div className="w-full flex flex-col items-center gap-1">
                        {/* Donations Bar */}
                        <div className="w-full relative group">
                          <div 
                            className="w-full bg-blue-700 rounded-t transition-all duration-300 hover:bg-blue-600 cursor-pointer"
                            style={{ height: `${donationHeight * 1.5}px` }}
                          >
                            <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-blue-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap transition-opacity z-10">
                              ₱{(data.donations / 1000).toFixed(0)}K
                            </div>
                          </div>
                        </div>
                        
                        {/* Events Bar */}
                        <div className="w-full relative group">
                          <div 
                            className="w-full bg-blue-400 rounded-t transition-all duration-300 hover:bg-blue-500 cursor-pointer"
                            style={{ height: `${eventsHeight}px` }}
                          >
                            <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-blue-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap transition-opacity z-10">
                              {data.events} events
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <span className="text-[10px] font-semibold text-blue-900 dark:text-gray-400 mt-1">{data.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Legend */}
            <div className="flex items-center justify-center gap-8 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-blue-700 rounded-lg"></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Donations</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-blue-400 rounded-lg"></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Events</span>
              </div>
            </div>
          </div>

          {/* Members Growth Chart */}
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Members Growth
            </h3>
            <div className="h-64">
              {/* Bar Chart */}
              <div className="h-full flex items-end justify-between gap-1.5">
                {monthlyData.map((data, index) => {
                  const maxValue = Math.max(...monthlyData.map(d => d.members));
                  const heightPercentage = (data.members / maxValue) * 100;
                  
                  return (
                    <div key={data.month} className="flex-1 flex flex-col items-center gap-1.5">
                      <div className="w-full flex flex-col items-center gap-1">
                        {/* Members Bar */}
                        <div className="w-full relative group">
                          <div 
                            className="w-full bg-blue-600 rounded-t transition-all duration-300 hover:bg-blue-500 cursor-pointer"
                            style={{ height: `${heightPercentage * 0.5}px` }}
                          >
                            <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-blue-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap transition-opacity z-10">
                              {data.members}
                            </div>
                          </div>
                        </div>
                        
                        {/* Births Bar */}
                        <div className="w-full relative group">
                          <div 
                            className="w-full bg-blue-400 rounded-t transition-all duration-300 hover:bg-blue-500 cursor-pointer"
                            style={{ height: `${(data.births / 60) * 60}px` }}
                          >
                            <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-blue-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap transition-opacity z-10">
                              {data.births}
                            </div>
                          </div>
                        </div>
                        
                        {/* Marriages Bar */}
                        <div className="w-full relative group">
                          <div 
                            className="w-full bg-blue-300 rounded-t transition-all duration-300 hover:bg-blue-400 cursor-pointer"
                            style={{ height: `${(data.marriages / 25) * 50}px` }}
                          >
                            <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-blue-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap transition-opacity z-10">
                              {data.marriages}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <span className="text-[10px] font-semibold text-blue-900 dark:text-gray-400 mt-1">{data.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-600 rounded"></div>
                <span className="text-xs font-medium text-blue-900 dark:text-gray-400">Members</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-400 rounded"></div>
                <span className="text-xs font-medium text-blue-900 dark:text-gray-400">Births</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-300 rounded"></div>
                <span className="text-xs font-medium text-blue-900 dark:text-gray-400">Marriages</span>
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

        {/* Pending Approvals - Priority Section */}
        <div className="bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-red-900/20 dark:via-orange-900/20 dark:to-yellow-900/20 border border-red-200 dark:border-red-700 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <AlertCircle size={20} className="text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Pending Approvals</h3>
                <p className="text-xs text-blue-900 dark:text-gray-400">Requires attention</p>
              </div>
            </div>
            <span className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-bold">{pendingApprovals.length} Pending</span>
          </div>
          <div className="space-y-2">
            {pendingApprovals.map((approval) => (
              <div key={approval.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700 hover:shadow transition-all">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      approval.type === 'Billing' ? 'bg-gradient-to-br from-purple-500 to-purple-600' : 
                      approval.type === 'Schedule' ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 
                      'bg-gradient-to-br from-green-500 to-green-600'
                    }`}>
                      {approval.type === 'Billing' && <DollarSign size={18} className="text-white" />}
                      {approval.type === 'Schedule' && <Calendar size={18} className="text-white" />}
                      {approval.type === 'Record' && <FileText size={18} className="text-white" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{approval.description}</h4>
                      <div className="flex items-center gap-2 text-xs text-blue-900 dark:text-gray-400 mt-1">
                        <span>By {approval.submittedBy}</span>
                        <span>•</span>
                        <span>{approval.date}</span>
                        {approval.amount !== '-' && (
                          <>
                            <span>•</span>
                            <span className="font-semibold text-purple-600 dark:text-purple-400">{approval.amount}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-all">
                      Approve
                    </button>
                    <button className="px-4 py-2 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg text-xs font-medium transition-all">
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Users Management */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">User Management</h3>
              <p className="text-sm text-blue-900 dark:text-gray-400 mt-1">Manage user accounts and permissions</p>
            </div>
            <button 
              onClick={() => setShowUserModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-black via-[#0A1628] to-[#1E3A8A] hover:from-[#1E3A8A] hover:to-blue-700 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2 hover:shadow-blue-900/50">
              <Plus size={16} />
              Add User
            </button>
          </div>

          {/* Search and Filter */}
          <div className="mb-4 flex gap-3">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search users..." 
                className="w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <select className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 transition-all">
              <option>All Roles</option>
              <option>Priest</option>
              <option>Accountant</option>
              <option>Church Admin</option>
              <option>User</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-blue-900 dark:text-gray-400 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-blue-900 dark:text-gray-400 uppercase">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-blue-900 dark:text-gray-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-blue-900 dark:text-gray-400 uppercase">Last Active</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-blue-900 dark:text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {systemUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-black via-[#0A1628] to-[#1E3A8A] flex items-center justify-center text-white font-semibold text-sm">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{user.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        user.role === 'Priest' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' :
                        user.role === 'Accountant' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                        user.role === 'Church Admin' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                        'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${
                        user.status === 'Active' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-blue-900 dark:text-gray-400">{user.lastActive}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors" title="Edit">
                          <Edit size={16} />
                        </button>
                        <button className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Logs & System Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Audit Logs</h3>
              <p className="text-sm text-blue-900 dark:text-gray-400 mt-1">System activity and security logs</p>
            </div>
            <button className="px-4 py-2 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium transition-all flex items-center gap-2">
              <Download size={16} />
              Export
            </button>
          </div>
          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors border border-gray-100 dark:border-gray-700/50">
                <div className="flex-shrink-0">
                  {log.type === 'success' && (
                    <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                    </div>
                  )}
                  {log.type === 'error' && (
                    <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <XCircle size={16} className="text-red-600 dark:text-red-400" />
                    </div>
                  )}
                  {log.type === 'info' && (
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Activity size={16} className="text-blue-600 dark:text-blue-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">{log.action}</h4>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      log.type === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                      log.type === 'error' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                      'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    }`}>
                      {log.type}
                    </span>
                  </div>
                  <p className="text-xs text-blue-900 dark:text-gray-400 mb-1">{log.details}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                    <span className="font-medium">{log.user}</span>
                    <span>•</span>
                    <span>{log.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <button className="w-full py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-lg transition-colors border border-gray-200 dark:border-gray-700">
              View All Logs
            </button>
          </div>
        </div>

        {/* Quick Reports Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Reports</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-100 dark:border-gray-700 hover:shadow transition-all cursor-pointer group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-gradient-to-br from-black via-[#0A1628] to-[#1E3A8A] rounded-lg">
                  <BarChart3 size={20} className="text-white" />
                </div>
                <Download size={18} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Financial Report</h4>
              <p className="text-sm text-blue-900 dark:text-gray-400 mb-4">Financial overview including donations and billings</p>
              <button className="w-full py-2 bg-gradient-to-r from-black via-[#0A1628] to-[#1E3A8A] hover:from-[#1E3A8A] hover:to-blue-700 text-white rounded-lg text-sm font-medium transition-all hover:shadow-blue-900/50">
                Generate Report
              </button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-100 dark:border-gray-700 hover:shadow transition-all cursor-pointer group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                  <PieChart size={20} className="text-white" />
                </div>
                <Download size={18} className="text-gray-400 group-hover:text-purple-600 transition-colors" />
              </div>
              <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Attendance Report</h4>
              <p className="text-sm text-blue-900 dark:text-gray-400 mb-4">Member attendance analytics and trends</p>
              <button className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg text-sm font-medium transition-all">
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
  );
};

export default AdminDashboard;
