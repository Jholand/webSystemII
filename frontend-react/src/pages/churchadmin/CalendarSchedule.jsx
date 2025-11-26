import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, MapPin, Users, Edit, Trash2, User, X } from 'lucide-react';
import ModalOverlay from '../../components/ModalOverlay';

const CalendarSchedule = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);

  useEffect(() => {
    if (showEventModal) {
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
  }, [showEventModal]);
  const [modalMode, setModalMode] = useState('add');
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    date: '',
    time: '',
    endTime: '',
    location: '',
    priest: '',
    description: ''
  });

  const events = [
    { id: 1, title: 'Morning Mass', type: 'Mass', date: '2025-11-23', time: '6:00 AM', endTime: '7:00 AM', location: 'Main Church', priest: 'Fr. Joseph Smith', attendees: 150 },
    { id: 2, title: 'Wedding Ceremony', type: 'Wedding', date: '2025-11-23', time: '2:00 PM', endTime: '4:00 PM', location: 'Main Church', priest: 'Fr. Michael Brown', attendees: 200 },
    { id: 3, title: 'Evening Mass', type: 'Mass', date: '2025-11-23', time: '6:00 PM', endTime: '7:00 PM', location: 'Main Church', priest: 'Fr. Joseph Smith', attendees: 180 },
    { id: 4, title: 'Youth Ministry Meeting', type: 'Ministry', date: '2025-11-24', time: '4:00 PM', endTime: '6:00 PM', location: 'Parish Hall', priest: '', attendees: 45 },
    { id: 5, title: 'Baptism Ceremony', type: 'Baptism', date: '2025-11-24', time: '10:00 AM', endTime: '11:30 AM', location: 'Baptistry', priest: 'Fr. David Martinez', attendees: 30 },
    { id: 6, title: 'Choir Practice', type: 'Ministry', date: '2025-11-25', time: '5:00 PM', endTime: '7:00 PM', location: 'Music Room', priest: '', attendees: 25 },
    { id: 7, title: 'Bible Study', type: 'Ministry', date: '2025-11-26', time: '7:00 PM', endTime: '9:00 PM', location: 'Meeting Room', priest: '', attendees: 35 },
    { id: 8, title: 'Sunday Mass', type: 'Mass', date: '2025-11-30', time: '8:00 AM', endTime: '9:30 AM', location: 'Main Church', priest: 'Fr. Joseph Smith', attendees: 500 },
  ];

  const eventTypes = ['Mass', 'Wedding', 'Baptism', 'Funeral', 'Ministry', 'Conference', 'Retreat', 'Other'];
  const locations = ['Main Church', 'Chapel', 'Parish Hall', 'Baptistry', 'Meeting Room', 'Music Room', 'Outdoor Garden'];
  const priests = ['Fr. Joseph Smith', 'Fr. Michael Brown', 'Fr. David Martinez'];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getEventsForDate = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => event.date === dateStr);
  };

  const handleDateClick = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
  };

  const handleOpenModal = (mode, event = null) => {
    setModalMode(mode);
    if (event) {
      setFormData(event);
    } else {
      setFormData({
        title: '',
        type: '',
        date: selectedDate || '',
        time: '',
        endTime: '',
        location: '',
        priest: '',
        description: ''
      });
    }
    setShowEventModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setShowEventModal(false);
  };

  const getEventTypeColor = (type) => {
    const colors = {
      Mass: 'bg-blue-100 text-blue-900',
      Wedding: 'bg-pink-100 text-pink-900',
      Baptism: 'bg-cyan-100 text-cyan-900',
      Funeral: 'bg-gray-100 text-gray-900',
      Ministry: 'bg-purple-100 text-purple-900',
      Conference: 'bg-green-100 text-green-900',
      Retreat: 'bg-orange-100 text-orange-900',
      Other: 'bg-slate-100 text-slate-900'
    };
    return colors[type] || colors.Other;
  };

  const selectedDateEvents = selectedDate ? events.filter(e => e.date === selectedDate) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Calendar & Schedule</h1>
            <p className="text-blue-900 mt-1">Manage church events and schedules</p>
          </div>
          <button 
            onClick={() => handleOpenModal('add')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-black via-[#0A1628] to-[#1E3A8A] text-white rounded-xl hover:from-[#1E3A8A] hover:to-blue-700 transition-all shadow-lg hover:shadow-blue-900/50"
          >
            <Plus size={20} />
            Add Event
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-blue-200/50 p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={previousMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={nextMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Day headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-xs font-semibold text-gray-600 pb-2">
                    {day}
                  </div>
                ))}

                {/* Empty cells for days before month starts */}
                {[...Array(startingDayOfWeek)].map((_, index) => (
                  <div key={`empty-${index}`} className="aspect-square"></div>
                ))}

                {/* Calendar days */}
                {[...Array(daysInMonth)].map((_, index) => {
                  const day = index + 1;
                  const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const dayEvents = getEventsForDate(day);
                  const isSelected = selectedDate === dateStr;
                  const isToday = dateStr === new Date().toISOString().split('T')[0];

                  return (
                    <div
                      key={day}
                      onClick={() => handleDateClick(day)}
                      className={`aspect-square p-2 border rounded-lg cursor-pointer transition-all ${
                        isSelected ? 'bg-blue-500 text-white border-blue-600' :
                        isToday ? 'bg-blue-50 border-blue-300' :
                        'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`text-sm font-medium mb-1 ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                        {day}
                      </div>
                      {dayEvents.length > 0 && (
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map((event, idx) => (
                            <div
                              key={idx}
                              className={`text-[10px] px-1 py-0.5 rounded truncate ${
                                isSelected ? 'bg-white/20 text-white' : getEventTypeColor(event.type)
                              }`}
                            >
                              {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className={`text-[10px] px-1 ${isSelected ? 'text-white' : 'text-gray-600'}`}>
                              +{dayEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Events Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-blue-200/50 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                {selectedDate ? `Events on ${selectedDate}` : 'Select a date'}
              </h3>

              {selectedDateEvents.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateEvents.map(event => (
                    <div key={event.id} className="p-4 bg-gray-50 rounded-lg space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium mb-2 ${getEventTypeColor(event.type)}`}>
                            {event.type}
                          </span>
                          <h4 className="font-semibold text-gray-900">{event.title}</h4>
                        </div>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => handleOpenModal('edit', event)}
                            className="p-1.5 text-gray-600 hover:bg-gray-200 rounded"
                          >
                            <Edit size={14} />
                          </button>
                          <button className="p-1.5 text-rose-600 hover:bg-rose-100 rounded">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock size={14} />
                          <span>{event.time} - {event.endTime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={14} />
                          <span>{event.location}</span>
                        </div>
                        {event.priest && (
                          <div className="flex items-center gap-2">
                            <User size={14} />
                            <span>{event.priest}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Users size={14} />
                          <span>{event.attendees} attendees</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-8">No events scheduled</p>
              )}
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-xl shadow-sm border border-blue-200/50 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Upcoming Events</h3>
              <div className="space-y-3">
                {events.slice(0, 5).map(event => (
                  <div key={event.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-gradient-to-br from-black via-[#0A1628] to-[#1E3A8A] rounded-lg">
                      <CalendarIcon className="text-white" size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{event.title}</p>
                      <p className="text-xs text-gray-600">{event.date} • {event.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Event Modal */}
      <ModalOverlay isOpen={showEventModal} onClose={() => setShowEventModal(false)}>
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {modalMode === 'add' ? 'Add New Event' : 'Edit Event'}
              </h2>
              <button 
                onClick={() => setShowEventModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Type</option>
                    {eventTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                  <select
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Location</option>
                    {locations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Time *</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assign Priest (Optional)</label>
                  <select
                    value={formData.priest}
                    onChange={(e) => setFormData({...formData, priest: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">No priest assigned</option>
                    {priests.map(priest => (
                      <option key={priest} value={priest}>{priest}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-br from-black via-[#0A1628] to-[#1E3A8A] text-white rounded-lg hover:from-[#1E3A8A] hover:to-blue-700 transition-all shadow-lg hover:shadow-blue-900/50"
                >
                  {modalMode === 'add' ? 'Create Event' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
      </ModalOverlay>
    </div>
  );
};

export default CalendarSchedule;
