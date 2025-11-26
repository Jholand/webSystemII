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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-blue-900 mt-1">Generate and view church activity reports</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-900 text-sm">Total Members</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalMembers}</p>
                <p className="text-xs text-emerald-600 mt-1">+{stats.newMembersThisMonth} this month</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-black via-[#0A1628] to-[#1E3A8A] rounded-xl">
                <Users className="text-white" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-900 text-sm">Total Events</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalEvents}</p>
                <p className="text-xs text-gray-600 mt-1">This year</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl">
                <Calendar className="text-white" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-900 text-sm">Avg Attendance</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.avgAttendance}</p>
                <p className="text-xs text-gray-600 mt-1">Per event</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl">
                <TrendingUp className="text-white" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-900 text-sm">Volunteers</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.volunteers}</p>
                <p className="text-xs text-gray-600 mt-1">Active volunteers</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-black via-[#0A1628] to-[#1E3A8A] rounded-xl">
                <Users className="text-white" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-200/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Activity Trends</h3>
            <div className="flex gap-2">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </select>
            </div>
          </div>

          <div className="h-80 flex items-end justify-between gap-2">
            {monthlyData.map((data, index) => {
              const maxValue = Math.max(...monthlyData.map(d => Math.max(d.members / 3, d.events * 20, d.attendance)));
              const membersHeight = ((data.members / 3) / maxValue) * 100;
              const eventsHeight = ((data.events * 20) / maxValue) * 100;
              const attendanceHeight = (data.attendance / maxValue) * 100;

              return (
                <div key={data.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex justify-center gap-1 items-end" style={{ height: '240px' }}>
                    <div className="group relative flex-1">
                      <div
                        className="w-full bg-blue-600 rounded-t hover:bg-blue-500 transition-colors cursor-pointer"
                        style={{ height: `${membersHeight}%` }}
                      >
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-blue-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap transition-opacity z-10">
                          {data.members} members
                        </div>
                      </div>
                    </div>
                    <div className="group relative flex-1">
                      <div
                        className="w-full bg-emerald-500 rounded-t hover:bg-emerald-400 transition-colors cursor-pointer"
                        style={{ height: `${eventsHeight}%` }}
                      >
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-emerald-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap transition-opacity z-10">
                          {data.events} events
                        </div>
                      </div>
                    </div>
                    <div className="group relative flex-1">
                      <div
                        className="w-full bg-amber-500 rounded-t hover:bg-amber-400 transition-colors cursor-pointer"
                        style={{ height: `${attendanceHeight}%` }}
                      >
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-amber-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap transition-opacity z-10">
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

          <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-600 rounded"></div>
              <span className="text-xs font-medium text-gray-600">Members</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-emerald-500 rounded"></div>
              <span className="text-xs font-medium text-gray-600">Events</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-amber-500 rounded"></div>
              <span className="text-xs font-medium text-gray-600">Attendance</span>
            </div>
          </div>
        </div>

        {/* Available Reports */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Reports</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((report) => {
              const Icon = report.icon;
              return (
                <div key={report.id} className="bg-white rounded-xl shadow-sm border border-blue-200/50 p-6 hover:shadow-lg transition-all">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-black via-[#0A1628] to-[#1E3A8A] rounded-xl">
                      <Icon className="text-white" size={24} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{report.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Last: {report.lastGenerated}</span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-900">
                          {report.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                    <button className="flex-1 px-4 py-2 bg-gradient-to-br from-black via-[#0A1628] to-[#1E3A8A] text-white rounded-lg hover:from-[#1E3A8A] hover:to-blue-700 transition-all text-sm font-medium flex items-center justify-center gap-2">
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
