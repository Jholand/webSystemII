import { useState } from 'react';
import { BarChart3, Users, Calendar, TrendingUp, Download, FileText, Eye } from 'lucide-react';

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedYear, setSelectedYear] = useState('2025');

  const reports = [
    {
      id: 1,
      title: 'Membership Report',
      description: 'Total active members, new registrations, and demographics',
      icon: Users,
      type: 'Membership',
      lastGenerated: '2025-11-23',
      status: 'Available'
    },
    {
      id: 2,
      title: 'Event Attendance Report',
      description: 'Attendance statistics for masses and church events',
      icon: Calendar,
      type: 'Events',
      lastGenerated: '2025-11-22',
      status: 'Available'
    },
    {
      id: 3,
      title: 'Sacramental Records Report',
      description: 'Baptisms, weddings, confirmations, and other sacraments',
      icon: FileText,
      type: 'Sacraments',
      lastGenerated: '2025-11-20',
      status: 'Available'
    },
    {
      id: 4,
      title: 'Ministry Participation Report',
      description: 'Active ministries and volunteer participation rates',
      icon: TrendingUp,
      type: 'Ministries',
      lastGenerated: '2025-11-18',
      status: 'Available'
    },
    {
      id: 5,
      title: 'Service Requests Report',
      description: 'Pending, approved, and completed service requests',
      icon: FileText,
      type: 'Services',
      lastGenerated: '2025-11-23',
      status: 'Available'
    },
    {
      id: 6,
      title: 'Quarterly Activity Report',
      description: 'Comprehensive overview of all church activities',
      icon: BarChart3,
      type: 'General',
      lastGenerated: '2025-11-01',
      status: 'Available'
    },
  ];

  const stats = {
    totalMembers: 1234,
    activeMembers: 1050,
    newMembersThisMonth: 45,
    totalEvents: 156,
    avgAttendance: 420,
    sacraments: 89,
    ministries: 12,
    volunteers: 245
  };

  const monthlyData = [
    { month: 'Jan', members: 1050, events: 12, attendance: 380 },
    { month: 'Feb', members: 1080, events: 15, attendance: 420 },
    { month: 'Mar', members: 1110, events: 13, attendance: 395 },
    { month: 'Apr', members: 1125, events: 16, attendance: 450 },
    { month: 'May', members: 1150, events: 14, attendance: 410 },
    { month: 'Jun', members: 1175, events: 18, attendance: 480 },
    { month: 'Jul', members: 1190, events: 15, attendance: 425 },
    { month: 'Aug', members: 1205, events: 17, attendance: 465 },
    { month: 'Sep', members: 1215, events: 13, attendance: 390 },
    { month: 'Oct', members: 1225, events: 16, attendance: 435 },
    { month: 'Nov', members: 1234, events: 14, attendance: 415 },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="space-y-6">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 bg-white">
          <h1 className="text-2xl font-bold mb-1" style={{ color: '#4158D0' }}>Reports & Analytics</h1>
          <p className="text-gray-600 text-sm">Generate and view church activity reports</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Members', value: stats.totalMembers, icon: Users, color: '#4158D0' },
            { label: 'Total Events', value: stats.totalEvents, icon: Calendar, color: '#f59e0b' },
            { label: 'Avg Attendance', value: stats.avgAttendance, icon: TrendingUp, color: '#10b981' },
            { label: 'Volunteers', value: stats.volunteers, icon: Users, color: '#8b5cf6' }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg p-5 shadow hover:shadow-lg transition-all border border-gray-200 cursor-pointer group">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 rounded-lg group-hover:scale-110 transition-transform" style={{ backgroundColor: stat.color + '20' }}>
                    <Icon style={{ color: stat.color }} size={24} />
                  </div>
                  <Icon size={16} className="text-gray-400" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-sm font-semibold text-gray-700">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Chart */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#E8E9F5' }}>
                <BarChart3 size={20} style={{ color: '#4158D0' }} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Activity Trends</h3>
            </div>
            <div className="flex gap-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </select>
            </div>
          </div>

          <div className="h-80 flex items-end justify-between gap-3 bg-gray-50 rounded-lg p-6">
            {monthlyData.map((data, index) => {
              const maxValue = Math.max(...monthlyData.map(d => Math.max(d.members / 3, d.events * 20, d.attendance)));
              const membersHeight = ((data.members / 3) / maxValue) * 100;
              const eventsHeight = ((data.events * 20) / maxValue) * 100;
              const attendanceHeight = (data.attendance / maxValue) * 100;

              return (
                <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex justify-center gap-1.5 items-end" style={{ height: '240px' }}>
                    <div className="group relative flex-1">
                      <div
                        className="w-full rounded-t-lg transition-all cursor-pointer"
                        style={{ 
                          height: `${membersHeight}%`, 
                          minHeight: '4px',
                          backgroundColor: '#4667CF'
                        }}
                      >
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap transition-opacity z-10">
                          {data.members} members
                        </div>
                      </div>
                    </div>
                    <div className="group relative flex-1">
                      <div
                        className="w-full rounded-t-lg transition-all cursor-pointer"
                        style={{ 
                          height: `${eventsHeight}%`, 
                          minHeight: '4px',
                          backgroundColor: '#60a5fa'
                        }}
                      >
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap transition-opacity z-10">
                          {data.events} events
                        </div>
                      </div>
                    </div>
                    <div className="group relative flex-1">
                      <div
                        className="w-full rounded-t-lg transition-all cursor-pointer"
                        style={{ 
                          height: `${attendanceHeight}%`, 
                          minHeight: '4px',
                          backgroundColor: '#10b981'
                        }}
                      >
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap transition-opacity z-10">
                          {data.attendance} attendance
                        </div>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-600 font-medium mt-2">{data.month}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#4667CF' }}></div>
              <span className="text-sm font-medium text-gray-700">Members</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#60a5fa' }}></div>
              <span className="text-sm font-medium text-gray-700">Events</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }}></div>
              <span className="text-sm font-medium text-gray-700">Attendance</span>
            </div>
          </div>
        </div>

        {/* Available Reports */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Available Reports</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((report) => {
              const Icon = report.icon;
              return (
                <div key={report.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-2xl transition-all">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-3 rounded-xl shadow-lg" style={{ 
                      background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
                      boxShadow: '0 4px 12px rgba(65, 88, 208, 0.3)'
                    }}>
                      <Icon className="text-white" size={20} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-1">{report.title}</h4>
                      <p className="text-xs text-gray-600">{report.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-gray-500">Last: {report.lastGenerated}</span>
                    <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">
                      {report.status}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      className="flex-1 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-all text-sm font-medium flex items-center justify-center gap-2" 
                      style={{ backgroundColor: '#4667CF' }}
                    >
                      <Eye size={16} />
                      View
                    </button>
                    <button className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                      <Download size={16} />
                      Export
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
