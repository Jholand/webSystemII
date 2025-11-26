import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Users, TrendingUp, FileText, Upload, Plus, CheckCircle, Clock, Megaphone, BarChart3, UserCog, ArrowUpRight, Bell, Activity } from 'lucide-react';

const ChurchAdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const stats = [
    { label: 'Total Members', value: '1,234', icon: Users, change: '+12%' },
    { label: 'Pending Requests', value: '12', icon: Clock, change: '+3' },
    { label: 'Upcoming Events', value: '8', icon: Calendar, change: 'This week' },
    { label: 'Active Announcements', value: '5', icon: Megaphone, change: '2 urgent' },
  ];

  const todayEvents = [
    { id: 1, title: 'Morning Mass', time: '6:00 AM', priest: 'Fr. Joseph Smith', status: 'Ongoing' },
    { id: 2, title: 'Baptism Ceremony', time: '10:00 AM', priest: 'Fr. Michael Brown', status: 'Scheduled' },
    { id: 3, title: 'Wedding Ceremony', time: '2:00 PM', priest: 'Fr. Joseph Smith', status: 'Scheduled' },
    { id: 4, title: 'Evening Mass', time: '6:00 PM', priest: 'Fr. Michael Brown', status: 'Scheduled' },
  ];

  const pendingRequests = [
    { id: 1, type: 'Baptism', requester: 'John Dela Cruz', requestDate: '2025-11-20', status: 'Pending' },
    { id: 2, type: 'Wedding', requester: 'Pedro Santos', requestDate: '2025-11-18', status: 'Pending' },
    { id: 3, type: 'First Communion', requester: 'Maria Garcia', requestDate: '2025-11-15', status: 'Pending' },
  ];

  const quickActions = [
    { title: 'Member Records', description: 'View and manage church members', icon: Users, path: '/church-admin/members' },
    { title: 'Service Requests', description: 'Approve service requests', icon: CheckCircle, path: '/church-admin/service-requests' },
    { title: 'Calendar', description: 'Manage schedules', icon: Calendar, path: '/church-admin/calendar' },
    { title: 'Event Planning', description: 'Plan church events', icon: Plus, path: '/church-admin/events' },
    { title: 'Staff Schedules', description: 'Manage staff schedules', icon: UserCog, path: '/church-admin/staff-schedules' },
    { title: 'Reports', description: 'View activity reports', icon: BarChart3, path: '/church-admin/reports' },
    { title: 'Documents', description: 'Upload certificates & forms', icon: FileText, path: '/church-admin/documents' },
    { title: 'Announcements', description: 'Post parish announcements', icon: Megaphone, path: '/church-admin/announcements' },
  ];

  // Sample data for operational analytics
  const monthlyActivities = [
    { month: 'Jan', events: 45, members: 120, sacraments: 15 },
    { month: 'Feb', events: 52, members: 135, sacraments: 18 },
    { month: 'Mar', events: 48, members: 128, sacraments: 16 },
    { month: 'Apr', events: 61, members: 145, sacraments: 22 },
    { month: 'May', events: 55, members: 138, sacraments: 19 },
    { month: 'Jun', events: 58, members: 142, sacraments: 21 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Header with Gradient Banner */}
        <div className="relative overflow-hidden bg-gradient-to-br from-black via-[#0A1628] to-[#1E3A8A] rounded-2xl shadow-2xl p-8 border border-white/10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Church Admin Dashboard</h1>
              <p className="text-blue-100 text-lg">Welcome back, {user?.name || 'Church Admin'} 👋</p>
              <p className="text-blue-200/80 text-sm mt-1">Managing Dalapian Church Operations</p>
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

        {/* Stats Cards with Modern Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-black via-[#0A1628] to-[#1E3A8A] rounded-xl group-hover:scale-110 transition-transform">
                    <stat.icon className="text-white" size={24} />
                  </div>
                  <span className="text-xs font-semibold text-gray-500 px-2 py-1 bg-gray-100 rounded-full">
                    {stat.change}
                  </span>
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-1">{stat.label}</p>
                  <p className="text-4xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-black via-[#0A1628] to-[#1E3A8A]"></div>
            </div>
          ))}
        </div>

        {/* Quick Actions with Enhanced Design */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Quick Access</h3>
            <span className="text-sm text-gray-500">8 modules available</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => navigate(action.path)}
                className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 text-left border border-gray-100 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-black via-[#0A1628] to-[#1E3A8A] rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <action.icon className="text-white" size={24} />
                    </div>
                    <ArrowUpRight className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" size={20} />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{action.title}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{action.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Two Column Layout with Enhanced Design */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Events */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Calendar className="text-blue-600" size={20} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Today's Events</h3>
              </div>
              <span className="text-xs font-semibold text-gray-600 px-3 py-1 bg-gray-100 rounded-full">
                {todayEvents.length} events
              </span>
            </div>
            <div className="space-y-3">
              {todayEvents.map((event, idx) => (
                <div key={event.id} className="group p-4 border border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1 h-10 bg-gradient-to-b from-black via-[#0A1628] to-[#1E3A8A] rounded-full"></div>
                        <div>
                          <h4 className="font-bold text-gray-900 transition-colors">{event.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">Priest:</span> {event.priest}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-3 ml-3">
                        <span className="flex items-center gap-1 text-sm text-gray-600">
                          <Clock size={14} />
                          {event.time}
                        </span>
                        <span className="px-3 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-600">
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
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Clock className="text-gray-600" size={20} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Pending Requests</h3>
              </div>
              <button 
                onClick={() => navigate('/church-admin/service-requests')}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-bold hover:gap-2 transition-all"
              >
                View All
                <ArrowUpRight size={16} />
              </button>
            </div>
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <div key={request.id} className="group p-4 bg-gray-50 border border-gray-200 rounded-xl hover:shadow-md hover:border-gray-300 transition-all duration-300 cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1 h-10 bg-gradient-to-b from-black via-[#0A1628] to-[#1E3A8A] rounded-full"></div>
                        <div>
                          <h4 className="font-bold text-gray-900 transition-colors">{request.type}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">Requester:</span> {request.requester}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-3 ml-3">
                        <span className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar size={14} />
                          {request.requestDate}
                        </span>
                        <span className="px-3 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-600">
                          {request.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChurchAdminDashboard;
