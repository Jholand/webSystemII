import { useState, useEffect } from 'react';
import { User, Calendar, Clock, MapPin, Plus, Edit, X, CheckCircle } from 'lucide-react';
import ModalOverlay from '../../components/ModalOverlay';

const StaffSchedules = () => {
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (showModal) {
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
  }, [showModal]);
  const [formData, setFormData] = useState({
    staff: '',
    role: '',
    day: '',
    startTime: '',
    endTime: '',
    location: '',
    task: ''
  });

  const staff = [
    { id: 1, name: 'Fr. Joseph Smith', role: 'Priest', color: 'bg-blue-500' },
    { id: 2, name: 'Fr. Michael Brown', role: 'Priest', color: 'bg-purple-500' },
    { id: 3, name: 'Maria Santos', role: 'Secretary', color: 'bg-emerald-500' },
    { id: 4, name: 'John Dela Cruz', role: 'Sacristan', color: 'bg-amber-500' },
    { id: 5, name: 'Ana Garcia', role: 'Volunteer Coordinator', color: 'bg-rose-500' },
  ];

  const schedules = [
    { id: 1, staff: 'Fr. Joseph Smith', day: 'Monday', startTime: '06:00', endTime: '07:00', location: 'Main Church', task: 'Morning Mass' },
    { id: 2, staff: 'Fr. Joseph Smith', day: 'Monday', startTime: '18:00', endTime: '19:00', location: 'Main Church', task: 'Evening Mass' },
    { id: 3, staff: 'Fr. Michael Brown', day: 'Monday', startTime: '14:00', endTime: '16:00', location: 'Confession Room', task: 'Confessions' },
    { id: 4, staff: 'Maria Santos', day: 'Monday', startTime: '08:00', endTime: '17:00', location: 'Office', task: 'Admin Duties' },
    { id: 5, staff: 'John Dela Cruz', day: 'Monday', startTime: '05:30', endTime: '08:00', location: 'Main Church', task: 'Mass Preparation' },
    
    { id: 6, staff: 'Fr. Joseph Smith', day: 'Tuesday', startTime: '06:00', endTime: '07:00', location: 'Main Church', task: 'Morning Mass' },
    { id: 7, staff: 'Fr. Michael Brown', day: 'Tuesday', startTime: '10:00', endTime: '12:00', location: 'Baptistry', task: 'Baptism Ceremony' },
    { id: 8, staff: 'Ana Garcia', day: 'Tuesday', startTime: '16:00', endTime: '18:00', location: 'Parish Hall', task: 'Volunteer Meeting' },
    
    { id: 9, staff: 'Fr. Joseph Smith', day: 'Wednesday', startTime: '06:00', endTime: '07:00', location: 'Main Church', task: 'Morning Mass' },
    { id: 10, staff: 'Fr. Michael Brown', day: 'Wednesday', startTime: '19:00', endTime: '21:00', location: 'Meeting Room', task: 'Bible Study' },
    { id: 11, staff: 'Maria Santos', day: 'Wednesday', startTime: '08:00', endTime: '17:00', location: 'Office', task: 'Admin Duties' },
    
    { id: 12, staff: 'Fr. Joseph Smith', day: 'Thursday', startTime: '06:00', endTime: '07:00', location: 'Main Church', task: 'Morning Mass' },
    { id: 13, staff: 'John Dela Cruz', day: 'Thursday', startTime: '15:00', endTime: '18:00', location: 'Main Church', task: 'Church Maintenance' },
    
    { id: 14, staff: 'Fr. Joseph Smith', day: 'Friday', startTime: '06:00', endTime: '07:00', location: 'Main Church', task: 'Morning Mass' },
    { id: 15, staff: 'Fr. Michael Brown', day: 'Friday', startTime: '14:00', endTime: '16:00', location: 'Main Church', task: 'Wedding Ceremony' },
    { id: 16, staff: 'Ana Garcia', day: 'Friday', startTime: '09:00', endTime: '12:00', location: 'Community Center', task: 'Outreach Program' },
    
    { id: 17, staff: 'Fr. Joseph Smith', day: 'Saturday', startTime: '18:00', endTime: '19:30', location: 'Main Church', task: 'Vigil Mass' },
    { id: 18, staff: 'Fr. Michael Brown', day: 'Saturday', startTime: '14:00', endTime: '17:00', location: 'Confession Room', task: 'Confessions' },
    { id: 19, staff: 'John Dela Cruz', day: 'Saturday', startTime: '17:00', endTime: '20:00', location: 'Main Church', task: 'Mass Preparation' },
    
    { id: 20, staff: 'Fr. Joseph Smith', day: 'Sunday', startTime: '08:00', endTime: '09:30', location: 'Main Church', task: 'Sunday Mass' },
    { id: 21, staff: 'Fr. Michael Brown', day: 'Sunday', startTime: '11:00', endTime: '12:30', location: 'Main Church', task: 'Sunday Mass' },
    { id: 22, staff: 'Maria Santos', day: 'Sunday', startTime: '07:30', endTime: '13:00', location: 'Office', task: 'Reception' },
  ];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const getSchedulesForDay = (day) => {
    return schedules.filter(s => s.day === day);
  };

  const getStaffColor = (staffName) => {
    const person = staff.find(s => s.name === staffName);
    return person?.color || 'bg-gray-500';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Schedule added:', formData);
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Staff Schedules</h1>
            <p className="text-blue-900 mt-1">Manage staff and volunteer schedules</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 text-white rounded-xl hover:opacity-90 transition-all shadow-lg"
            style={{ backgroundColor: '#4667CF' }}
          >
            <Plus size={20} />
            Add Schedule
          </button>
        </div>

        {/* Staff Legend */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-200/50">
          <h3 className="font-semibold text-gray-900 mb-4">Staff Members</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {staff.map((person) => (
              <div key={person.id} className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded ${person.color}`}></div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{person.name}</p>
                  <p className="text-xs text-gray-600">{person.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Schedule */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-200/50 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-7 divide-x divide-gray-200">
            {days.map((day) => {
              const daySchedules = getSchedulesForDay(day);
              return (
                <div key={day} className="min-h-[500px]">
                  <div className="p-4 bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">{day}</h3>
                    <p className="text-xs text-gray-600">{daySchedules.length} schedules</p>
                  </div>
                  <div className="p-2 space-y-2">
                    {daySchedules.map((schedule) => (
                      <div
                        key={schedule.id}
                        className={`p-3 rounded-lg ${getStaffColor(schedule.staff)} bg-opacity-10 border-l-4 ${getStaffColor(schedule.staff)} hover:bg-opacity-20 transition-all cursor-pointer`}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <p className="font-semibold text-gray-900 text-xs">{schedule.task}</p>
                          <Edit size={12} className="text-gray-600" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Clock size={10} />
                            <span>{schedule.startTime} - {schedule.endTime}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <MapPin size={10} />
                            <span>{schedule.location}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-700">
                            <User size={10} />
                            <span className="font-medium">{schedule.staff}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Schedule Modal */}
      <ModalOverlay isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Add Schedule</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Staff Member *</label>
                  <select
                    value={formData.staff}
                    onChange={(e) => setFormData({...formData, staff: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Staff</option>
                    {staff.map((person) => (
                      <option key={person.id} value={person.name}>{person.name} - {person.role}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Day *</label>
                  <select
                    value={formData.day}
                    onChange={(e) => setFormData({...formData, day: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Day</option>
                    {days.map((day) => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Time *</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Time *</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Task/Activity *</label>
                  <input
                    type="text"
                    value={formData.task}
                    onChange={(e) => setFormData({...formData, task: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition-all shadow-lg"
                  style={{ backgroundColor: '#4667CF' }}
                >
                  Add Schedule
                </button>
              </div>
            </form>
          </div>
      </ModalOverlay>
    </div>
  );
};

export default StaffSchedules;
