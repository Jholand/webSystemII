import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Bell, Clock, MapPin, User, FileText, LogOut } from 'lucide-react';

const PriestDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('requests'); // 'requests', 'mass', 'schedule'
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);

  // Service Requests
  const serviceRequests = [
    { id: 1, type: 'Baptism', requestor: 'John & Mary Doe', childName: 'Baby Michael', date: '2025-12-01', time: '10:00 AM', status: 'pending', location: 'St. Mary\'s Church', notes: 'First child, parents are active members' },
    { id: 2, type: 'Wedding', requestor: 'Michael Smith & Sarah Johnson', date: '2025-12-15', time: '2:00 PM', status: 'pending', location: 'Main Cathedral', notes: 'Pre-Cana completed' },
    { id: 3, type: 'Funeral', requestor: 'Family of Robert Brown', deceased: 'Robert Brown (78)', date: '2025-11-26', time: '10:00 AM', status: 'approved', location: 'St. Joseph Chapel', notes: 'Long-time parishioner' },
    { id: 4, type: 'Blessing', requestor: 'Martinez Family', purpose: 'New Home Blessing', date: '2025-11-28', time: '3:00 PM', status: 'approved', location: '123 Oak Street', notes: 'New house blessing ceremony' },
  ];

  // Mass Intentions
  const massIntentions = [
    { id: 1, date: '2025-11-24', time: '6:00 AM', intention: 'For the soul of Maria Santos', requestedBy: 'Santos Family', type: 'Sunday Mass', completed: false },
    { id: 2, date: '2025-11-24', time: '10:00 AM', intention: 'Thanksgiving - Golden Wedding Anniversary', requestedBy: 'Rodriguez Family', type: 'Sunday Mass', completed: false },
    { id: 3, date: '2025-11-25', time: '6:00 PM', intention: 'For healing of Juan Dela Cruz', requestedBy: 'Dela Cruz Family', type: 'Evening Mass', completed: false },
  ];

  // Personal Schedule with daily/weekly/monthly tasks
  const mySchedule = [
    { id: 1, title: 'Morning Mass', date: '2025-11-23', time: '6:00 AM', type: 'Mass', status: 'scheduled', recurring: 'daily' },
    { id: 2, title: 'Baptism Ceremony - Baby Michael', date: '2025-11-24', time: '10:00 AM', type: 'Baptism', status: 'scheduled' },
    { id: 3, title: 'Sunday Mass', date: '2025-11-24', time: '8:00 AM', type: 'Mass', status: 'scheduled', recurring: 'weekly' },
    { id: 4, title: 'Wedding - Michael & Sarah', date: '2025-11-25', time: '2:00 PM', type: 'Wedding', status: 'scheduled' },
    { id: 5, title: 'Confession Hours', date: '2025-11-23', time: '4:00 PM', type: 'Confession', status: 'scheduled', recurring: 'weekly' },
    { id: 6, title: 'Parish Council Meeting', date: '2025-11-27', time: '7:00 PM', type: 'Meeting', status: 'scheduled', recurring: 'monthly' },
  ];

  // Notifications
  const notifications = [
    { id: 1, type: 'request', message: 'New baptism request from John & Mary Doe', time: '2 hours ago', read: false },
    { id: 2, type: 'reminder', message: 'Funeral service tomorrow at 10:00 AM', time: '5 hours ago', read: false },
    { id: 3, type: 'update', message: 'Wedding ceremony details updated', time: '1 day ago', read: true },
  ];

  const getRequestTypeColor = (type) => {
    switch(type) {
      case 'Baptism': return 'from-blue-500 to-cyan-500';
      case 'Wedding': return 'from-pink-500 to-rose-500';
      case 'Funeral': return 'from-gray-600 to-gray-700';
      case 'Blessing': return 'from-purple-500 to-indigo-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const stats = [
    { label: 'Pending Requests', value: serviceRequests.filter(r => r.status === 'pending').length, icon: Clock },
    { label: 'Upcoming Services', value: mySchedule.filter(s => s.status === 'scheduled').length, icon: Calendar },
    { label: 'Mass Intentions', value: massIntentions.filter(m => !m.completed).length, icon: FileText },
    { label: 'Unread Notifications', value: notifications.filter(n => !n.read).length, icon: Bell },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-gray-100 dark:from-gray-900 dark:via-blue-950 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in-down">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Priest Dashboard</h1>
            <p className="text-blue-900 dark:text-gray-400 text-sm mt-1">Welcome back, {user.name}</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button className="relative p-2.5 bg-gradient-to-r from-black via-[#0A1628] to-[#1E3A8A] rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105">
              <Bell size={20} className="text-white" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center font-semibold shadow-lg">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>

            {/* Administrator Profile with Logout */}
            <div className="relative z-50">
              <button
                onClick={() => setShowLogoutMenu(!showLogoutMenu)}
                className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-[#1E3A8A] via-blue-700 to-blue-600 shadow-lg">
                  <User size={16} className="text-white" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-gray-900 dark:text-white">Priest</p>
                </div>
              </button>

              {/* Logout Dropdown */}
              {showLogoutMenu && (
                <div className="absolute right-0 mt-2 z-50">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg transition-all duration-200 shadow-lg whitespace-nowrap"
                  >
                    <LogOut size={16} className="text-gray-700 dark:text-gray-300" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="relative bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden group hover:shadow-lg transition-all animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
              <div className="relative p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 bg-gradient-to-br from-black via-[#0A1628] to-[#1E3A8A] rounded-lg shadow-md">
                    <stat.icon className="text-white" size={20} />
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-1">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all text-sm ${
                activeTab === 'requests'
                  ? 'bg-gradient-to-r from-black via-[#0A1628] to-[#1E3A8A] text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              Service Requests
            </button>
            <button
              onClick={() => setActiveTab('mass')}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all text-sm ${
                activeTab === 'mass'
                  ? 'bg-gradient-to-r from-black via-[#0A1628] to-[#1E3A8A] text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              Mass Intentions
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all text-sm ${
                activeTab === 'schedule'
                  ? 'bg-gradient-to-r from-black via-[#0A1628] to-[#1E3A8A] text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              My Schedule
            </button>
          </div>
        </div>

        {/* Service Requests */}
        {activeTab === 'requests' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {serviceRequests.map((request) => (
              <div key={request.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-black via-[#0A1628] to-[#1E3A8A] shadow-sm">
                      {request.type}
                    </span>
                    <span className="px-3 py-1.5 rounded-lg text-xs font-semibold border bg-gray-100 text-gray-600 border-gray-200">
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">{request.requestor}</h3>
                
                {request.childName && <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Child:</span> {request.childName}
                </p>}
                {request.deceased && <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Deceased:</span> {request.deceased}
                </p>}
                {request.purpose && <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Purpose:</span> {request.purpose}
                </p>}
                
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="p-1.5 bg-gray-100 rounded-lg">
                      <Calendar size={16} className="text-gray-600" />
                    </div>
                    <span className="font-medium">{request.date}</span>
                    <span className="text-gray-400">•</span>
                    <span>{request.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="p-1.5 bg-gray-100 rounded-lg">
                      <MapPin size={16} className="text-gray-600" />
                    </div>
                    <span>{request.location}</span>
                  </div>
                </div>
                
                {request.notes && (
                  <div className="mt-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-700/30 dark:to-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Notes</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{request.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Mass Intentions */}
        {activeTab === 'mass' && (
          <div className="space-y-4">
            {massIntentions.map((intention) => (
              <div key={intention.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-all group">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-4 py-2 bg-gradient-to-r from-black via-[#0A1628] to-[#1E3A8A] text-white text-sm font-bold rounded-lg shadow-sm">
                        {intention.type}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 font-medium">
                        <Calendar size={16} className="text-gray-600" />
                        {intention.date} • {intention.time}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">{intention.intention}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="p-1.5 bg-gray-100 rounded-lg">
                        <User size={16} className="text-gray-600" />
                      </div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Requested by:</span> {intention.requestedBy}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Schedule */}
        {activeTab === 'schedule' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mySchedule.map((event) => (
              <div key={event.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 hover:shadow-md transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-sm bg-gradient-to-r from-black via-[#0A1628] to-[#1E3A8A]">
                    {event.type}
                  </span>
                  {event.recurring && (
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-600 border border-gray-200 text-xs font-semibold rounded-lg">
                      {event.recurring}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 mb-4 leading-snug">{event.title}</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2.5 text-gray-600 dark:text-gray-400">
                    <div className="p-1.5 bg-gray-100 rounded-lg">
                      <Calendar size={16} className="text-gray-600" />
                    </div>
                    <span className="font-medium">{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-gray-600 dark:text-gray-400">
                    <div className="p-1.5 bg-gray-100 rounded-lg">
                      <Clock size={16} className="text-gray-600" />
                    </div>
                    <span className="font-medium">{event.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Section - Notifications */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Notifications</h3>
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div key={notification.id} className={`p-3 rounded-lg border transition-all ${
                notification.read 
                  ? 'bg-gray-50 dark:bg-gray-700/30 border-gray-200 dark:border-gray-600' 
                  : 'bg-gray-100 border-gray-200 shadow-sm'
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300 flex-1">{notification.message}</p>
                  {!notification.read && (
                    <span className="w-2 h-2 bg-gray-600 rounded-full mt-1 flex-shrink-0 shadow-lg"></span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notification.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriestDashboard;
