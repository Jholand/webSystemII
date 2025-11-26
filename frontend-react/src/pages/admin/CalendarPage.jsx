import { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight, X, Edit, Trash2 } from 'lucide-react';
import ModalOverlay from '../../components/ModalOverlay';

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  const [events, setEvents] = useState([
    { id: 1, title: 'Sunday Mass', date: '2025-11-23', time: '10:00 AM', type: 'Mass', priest: 'Fr. Joseph Smith', description: 'Weekly Sunday mass' },
    { id: 2, title: 'Wedding Ceremony', date: '2025-11-25', time: '2:00 PM', type: 'Wedding', priest: 'Fr. Joseph Smith', description: 'John & Mary wedding' },
    { id: 3, title: 'Baptism', date: '2025-11-26', time: '11:00 AM', type: 'Baptism', priest: 'Fr. Michael Brown', description: 'Baby John baptism' },
    { id: 4, title: 'Prayer Meeting', date: '2025-11-27', time: '6:00 PM', type: 'Meeting', priest: 'Fr. Joseph Smith', description: 'Weekly prayer meeting' },
    { id: 5, title: 'Sunday Mass', date: '2025-11-30', time: '10:00 AM', type: 'Mass', priest: 'Fr. Joseph Smith', description: 'Weekly Sunday mass' },
  ]);

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    type: 'Mass',
    priest: '',
    description: '',
  });

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

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

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDateClick = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    setModalMode('add');
    setFormData({ title: '', date: dateStr, time: '', type: 'Mass', priest: '', description: '' });
    setShowEventModal(true);
  };

  const handleEditEvent = (event) => {
    setModalMode('edit');
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      date: event.date,
      time: event.time,
      type: event.type,
      priest: event.priest,
      description: event.description,
    });
    setShowEventModal(true);
  };

  const handleDeleteEvent = (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      setEvents(events.filter(e => e.id !== eventId));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modalMode === 'add') {
      setEvents([...events, { ...formData, id: events.length + 1 }]);
    } else {
      setEvents(events.map(e => e.id === selectedEvent.id ? { ...e, ...formData } : e));
    }
    setShowEventModal(false);
    setFormData({ title: '', date: '', time: '', type: 'Mass', priest: '', description: '' });
  };

  const getEventsForDate = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => event.date === dateStr);
  };

  const eventTypeColors = {
    Mass: 'bg-primary-600',
    Wedding: 'bg-red-500',
    Baptism: 'bg-blue-600',
    Meeting: 'bg-purple-600',
    Other: 'bg-gray-500 text-white',
  };

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="h-28 bg-gradient-to-br from-gray-50/50 to-slate-50/50 dark:from-gray-900/30 dark:to-gray-800/30"></div>);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dayEvents = getEventsForDate(day);
    const isToday = day === new Date().getDate() && 
                    currentDate.getMonth() === new Date().getMonth() && 
                    currentDate.getFullYear() === new Date().getFullYear();
    
    days.push(
      <div
        key={day}
        onClick={() => handleDateClick(day)}
        className={`h-28 p-3 cursor-pointer transition-all duration-300 group relative overflow-hidden ${
          isToday 
            ? 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/30 dark:via-indigo-900/30 dark:to-purple-900/30 shadow-inner' 
            : 'bg-white dark:bg-gray-800 hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50/30 dark:hover:from-gray-700/50 dark:hover:to-blue-900/20'
        }`}
      >
        {/* Decorative corner accent */}
        <div className={`absolute top-0 right-0 w-12 h-12 ${isToday ? 'bg-gradient-to-br from-blue-400/10 to-transparent' : ''}`}></div>
        
        <div className="h-full flex flex-col relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-lg font-bold transition-all ${
              isToday 
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400' 
                : 'text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400'
            }`}>
              {day}
            </span>
            {dayEvents.length > 0 && (
              <div className={`relative px-2 py-1 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-lg backdrop-blur-sm transition-transform group-hover:scale-110 ${
                dayEvents.length >= 5 ? 'bg-gradient-to-r from-rose-500 to-pink-500' : 
                dayEvents.length >= 3 ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 
                'bg-gradient-to-r from-emerald-500 to-teal-500'
              }`}>
                <span className="mr-1">{dayEvents.length}</span>
                <span className="text-[9px] opacity-90">events</span>
              </div>
            )}
          </div>
          <div className="flex-1 space-y-1 overflow-hidden">
            {dayEvents.slice(0, 2).map((event, idx) => (
              <div
                key={event.id}
                className={`text-[10px] px-2 py-1 rounded-md font-semibold truncate shadow-sm backdrop-blur-sm transition-all group-hover:translate-x-0.5 ${eventTypeColors[event.type]} text-white border border-white/20`}
                title={event.title}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <span className="mr-1">●</span>
                {event.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold px-2 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                {dayEvents.length - 2} more events
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50 dark:from-gray-900 dark:via-blue-950 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in-down">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Calendar & Scheduling</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Schedule church events</p>
        </div>
        <button
          onClick={() => {
            setFormData({ title: '', date: '', time: '', type: 'Mass', priest: '', description: '' });
            setModalMode('add');
            setShowEventModal(true);
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl transition-all font-semibold shadow-lg hover:shadow-xl hover:scale-105"
        >
          <Plus size={20} />
          Add Event
        </button>
      </div>

      {/* Calendar */}
      <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden backdrop-blur-sm">
        {/* Calendar Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-700 dark:via-indigo-700 dark:to-purple-700 px-6 py-5 flex items-center justify-between overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]"></div>
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl"></div>
          
          <button
            onClick={prevMonth}
            className="relative z-10 p-2.5 hover:bg-white/20 rounded-xl transition-all text-white hover:scale-110 active:scale-95"
          >
            <ChevronLeft size={22} />
          </button>
          <div className="relative z-10 text-center">
            <h2 className="text-2xl font-bold text-white tracking-wide drop-shadow-lg">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <p className="text-xs text-white/80 mt-1">Church Event Calendar</p>
          </div>
          <button
            onClick={nextMonth}
            className="relative z-10 p-2.5 hover:bg-white/20 rounded-xl transition-all text-white hover:scale-110 active:scale-95"
          >
            <ChevronRight size={22} />
          </button>
        </div>

        {/* Day Labels */}
        <div className="grid grid-cols-7 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 border-b-2 border-blue-200 dark:border-blue-900">
          {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, idx) => (
            <div key={day} className={`text-center py-3 font-bold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider ${idx === 0 || idx === 6 ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-[1px] bg-gradient-to-br from-gray-200 to-blue-200 dark:from-gray-700 dark:to-blue-900/30 p-[1px]">
          {days}
        </div>
      </div>

      {/* Upcoming Events List */}
      <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden backdrop-blur-sm">
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-700 dark:via-indigo-700 dark:to-purple-700 px-6 py-4 overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]"></div>
          <div className="absolute -right-12 -top-12 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
          <h2 className="relative text-xl font-bold text-white drop-shadow-lg flex items-center gap-2">
            <span className="w-1.5 h-8 bg-white rounded-full"></span>
            Upcoming Events & Priest Schedules
          </h2>
        </div>
        <div className="p-5 space-y-3">
          {events
            .filter(event => new Date(event.date) >= new Date())
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 5)
            .map((event, idx) => (
              <div key={event.id} className="group relative bg-white dark:bg-gray-900/50 rounded-xl p-4 hover:shadow-xl transition-all duration-300 border-l-4 border border-gray-200 dark:border-gray-700 overflow-hidden" style={{ borderLeftColor: event.type === 'Mass' ? '#2563eb' : event.type === 'Wedding' ? '#ef4444' : event.type === 'Baptism' ? '#3b82f6' : event.type === 'Meeting' ? '#9333ea' : '#6b7280', animationDelay: `${idx * 50}ms` }}>
                {/* Decorative gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative flex items-start gap-4">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${eventTypeColors[event.type]} shadow-lg group-hover:scale-110 transition-transform`}>
                    <span className="text-white font-bold text-lg">
                      {event.type === 'Mass' ? '✝' : event.type === 'Wedding' ? '💒' : event.type === 'Baptism' ? '💧' : event.type === 'Meeting' ? '👥' : '📅'}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {event.title}
                      </h3>
                      <span className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold text-white ${eventTypeColors[event.type]} shadow-md`}>
                        {event.type}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <span className="text-blue-600 dark:text-blue-400">📅</span>
                        </div>
                        <span className="font-medium">{event.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <div className="w-6 h-6 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <span className="text-green-600 dark:text-green-400">🕐</span>
                        </div>
                        <span className="font-medium">{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <div className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                          <span className="text-purple-600 dark:text-purple-400">👤</span>
                        </div>
                        <span className="font-medium truncate">{event.priest}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditEvent(event)}
                      className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all hover:scale-110"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all hover:scale-110"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <ModalOverlay isOpen={showEventModal} onClose={() => setShowEventModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-blue-500 ring-4 ring-blue-500/30 shadow-blue-500/50">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {modalMode === 'add' ? 'Add Event' : 'Edit Event'}
              </h2>
              <button
                onClick={() => setShowEventModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Event Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Event Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="Mass">Mass</option>
                  <option value="Wedding">Wedding</option>
                  <option value="Baptism">Baptism</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Assigned Priest
                </label>
                <input
                  type="text"
                  value={formData.priest}
                  onChange={(e) => setFormData({...formData, priest: e.target.value})}
                  placeholder="e.g., Fr. Joseph Smith"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-lg transition-all shadow-lg"
                >
                  {modalMode === 'add' ? 'Add Event' : 'Update Event'}
                </button>
              </div>
            </form>
          </div>
        </ModalOverlay>
      )}
      </div>
    </div>
  );
};

export default CalendarPage;
