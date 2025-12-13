import { useNavigate } from 'react-router-dom';
import { FileCheck, Calendar, UserPlus, Upload, Users, BookOpen, FileText, ClipboardCheck } from 'lucide-react';

const SecretaryDashboard = () => {
  const navigate = useNavigate();

  // Sample data
  const pendingSacraments = 5;
  const upcomingEvents = 8;
  const newMemberRequests = 3;
  const recentUploads = 12;

  const stats = [
    { label: 'Pending Sacraments', value: pendingSacraments, icon: FileCheck, color: 'orange', path: '/church-admin/secretary/certificates' },
    { label: 'Upcoming Events', value: upcomingEvents, icon: Calendar, color: 'blue', path: '/church-admin/secretary/events' },
    { label: 'New Member Requests', value: newMemberRequests, icon: UserPlus, color: 'green', path: '/church-admin/secretary/members' },
    { label: 'Recent Uploads', value: recentUploads, icon: Upload, color: 'purple', path: '/church-admin/secretary/documents' },
  ];

  const quickActions = [
    { label: 'Add New Member', icon: Users, color: 'blue', path: '/church-admin/secretary/members/new' },
    { label: 'Encode Sacrament', icon: BookOpen, color: 'green', path: '/church-admin/secretary/sacraments/new' },
    { label: 'Record Attendance', icon: ClipboardCheck, color: 'purple', path: '/church-admin/secretary/attendance' },
    { label: 'Schedule Event', icon: Calendar, color: 'orange', path: '/church-admin/secretary/events/new' },
  ];

  const pendingSacramentsList = [
    { id: 1, type: 'Baptism', participant: 'Baby Maria Santos', date: '2025-12-15', status: 'Draft' },
    { id: 2, type: 'Wedding', participant: 'John & Mary', date: '2025-12-20', status: 'Submitted' },
    { id: 3, type: 'Confirmation', participant: 'Pedro Garcia', date: '2025-12-18', status: 'Draft' },
    { id: 4, type: 'Baptism', participant: 'Baby Jose Cruz', date: '2025-12-22', status: 'Submitted' },
    { id: 5, type: 'First Communion', participant: 'Anna Rodriguez', date: '2025-12-25', status: 'Draft' },
  ];

  const upcomingEventsList = [
    { id: 1, title: 'Sunday Mass', date: '2025-12-08', time: '08:00 AM', venue: 'Main Church' },
    { id: 2, title: 'Youth Ministry Meeting', date: '2025-12-10', time: '03:00 PM', venue: 'Parish Hall' },
    { id: 3, title: 'Wedding Ceremony', date: '2025-12-15', time: '02:00 PM', venue: 'Main Church' },
    { id: 4, title: 'Baptism Ceremony', date: '2025-12-15', time: '10:00 AM', venue: 'Chapel' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: '#4667CF' }}>Secretary Dashboard</h1>
          <p className="text-gray-600 text-sm mt-1">Member and sacrament management</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={index}
                onClick={() => navigate(stat.path)}
                className="bg-white rounded-lg p-5 shadow hover:shadow-md transition-all border border-gray-200 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2.5 rounded-lg" style={{ backgroundColor: '#4667CF' }}>
                    <Icon size={20} className="text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-gray-600 text-xs font-medium mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={() => navigate(action.path)}
                  className="p-4 rounded-lg border-2 hover:opacity-90 transition-all text-left"
                  style={{ backgroundColor: '#E8E9F5', borderColor: '#D9DBEF' }}
                >
                  <Icon size={24} className="mb-2" style={{ color: '#4667CF' }} />
                  <p className="font-semibold text-gray-900 text-sm">{action.label}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Weekly Activity Chart */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Member Registration</h3>
          <div className="h-48">
            <svg className="w-full h-full" viewBox="0 0 400 180" preserveAspectRatio="none">
              {/* Grid lines */}
              <line x1="0" y1="45" x2="400" y2="45" stroke="#E8E9F5" strokeWidth="1" />
              <line x1="0" y1="90" x2="400" y2="90" stroke="#E8E9F5" strokeWidth="1" />
              <line x1="0" y1="135" x2="400" y2="135" stroke="#E8E9F5" strokeWidth="1" />
              
              {/* Bars */}
              {[12, 18, 15, 22, 25, 20, 28].map((value, i) => {
                const height = (value / 30) * 150;
                const x = 20 + i * 55;
                return (
                  <g key={i}>
                    <rect
                      x={x}
                      y={180 - height}
                      width="35"
                      height={height}
                      fill="#4667CF"
                      rx="4"
                      opacity="0.8"
                      className="hover:opacity-100 transition-opacity"
                    />
                    <text
                      x={x + 17.5}
                      y={180 - height - 5}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#4667CF"
                      fontWeight="600"
                    >
                      {value}
                    </text>
                  </g>
                );
              })}
            </svg>
            <div className="flex justify-between mt-2 px-5">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                <span key={i} className="text-xs font-medium text-gray-600">{day}</span>
              ))}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
            <span className="text-sm text-gray-600">Total This Week</span>
            <span className="text-xl font-bold" style={{ color: '#4667CF' }}>140 members</span>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Sacraments */}
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Pending Sacraments</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {pendingSacramentsList.map((sacrament) => (
                <div key={sacrament.id} className="p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{sacrament.participant}</p>
                      <p className="text-sm text-gray-600">{sacrament.type}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      sacrament.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {sacrament.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{sacrament.date}</p>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-200">
              <button 
                onClick={() => navigate('/church-admin/secretary/sacraments')}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View All Sacraments →
              </button>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Events</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {upcomingEventsList.map((event) => (
                <div key={event.id} className="p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                  <p className="font-semibold text-gray-900 mb-1">{event.title}</p>
                  <p className="text-sm text-gray-600 mb-1">{event.venue}</p>
                  <p className="text-xs text-gray-500">{event.date} at {event.time}</p>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-200">
              <button 
                onClick={() => navigate('/church-admin/secretary/events')}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View All Events →
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <FileText size={20} className="text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">New baptism certificate uploaded</p>
                <p className="text-xs text-gray-500">Maria Santos • 2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Users size={20} className="text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">New member registered</p>
                <p className="text-xs text-gray-500">Pedro Garcia • 5 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Calendar size={20} className="text-purple-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Wedding booking approved</p>
                <p className="text-xs text-gray-500">John & Mary • 1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecretaryDashboard;
