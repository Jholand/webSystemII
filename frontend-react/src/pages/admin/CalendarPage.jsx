import { useState, useEffect } from 'react';
import { Plus, ChevronLeft, ChevronRight, X, Edit, Trash2 } from 'lucide-react';
import ModalOverlay from '../../components/ModalOverlay';
import { priestService, scheduleService } from '../../services/churchService';

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [priests, setPriests] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    type: 'Mass',
    priest_id: '',
    description: '',
  });

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Fetch priests and schedules on component mount
  useEffect(() => {
    fetchPriests();
    fetchSchedules();
  }, []);

  // Fetch schedules when month changes
  useEffect(() => {
    fetchSchedules();
  }, [currentDate]);

  const fetchPriests = async () => {
    try {
      const response = await priestService.getAll();
      setPriests(response.data || []);
    } catch (err) {
      console.error('Error fetching priests:', err);
    }
  };

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month + 1, 0).getDate();
      const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${lastDay}`;
      
      const response = await scheduleService.getAll({ 
        start_date: startDate, 
        end_date: endDate 
      });
      
      // Transform the data to match the format expected by the component
      const transformedEvents = (response.data || []).map(schedule => ({
        id: schedule.id,
        title: schedule.title,
        date: schedule.date,
        time: schedule.time,
        type: schedule.type,
        priest: schedule.priest ? schedule.priest.name : 'No Priest',
        priest_id: schedule.priest_id,
        description: schedule.description || ''
      }));
      
      setEvents(transformedEvents);
    } catch (err) {
      console.error('Error fetching schedules:', err);
    } finally {
      setLoading(false);
    }
  };

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
    setFormData({ title: '', date: dateStr, time: '', type: 'Mass', priest_id: '', description: '' });
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
      priest_id: event.priest_id || '',
      description: event.description,
    });
    setShowEventModal(true);
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await scheduleService.delete(eventId);
        fetchSchedules(); // Refresh the list
      } catch (err) {
        console.error('Error deleting schedule:', err);
        alert('Failed to delete event');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (modalMode === 'add') {
        await scheduleService.create(formData);
      } else {
        await scheduleService.update(selectedEvent.id, formData);
      }
      setShowEventModal(false);
      setFormData({ title: '', date: '', time: '', type: 'Mass', priest_id: '', description: '' });
      fetchSchedules(); // Refresh the list
    } catch (err) {
      console.error('Error saving schedule:', err);
      alert('Failed to save event: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const getEventsForDate = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => event.date === dateStr);
  };

  const eventTypeColors = {
    Mass: 'bg-blue-600',
    Wedding: 'bg-indigo-600',
    Baptism: 'bg-sky-600',
    Meeting: 'bg-blue-700',
    Other: 'bg-gray-600 text-white',
  };

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="h-28 bg-gray-50 dark:bg-gray-800/30"></div>);
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
            ? 'bg-blue-100 dark:bg-gray-700 shadow-inner border-2 border-blue-500 dark:border-blue-600' 
            : 'bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700/50'
        }`}
      >
        {/* Decorative corner accent */}
        <div className={`absolute top-0 right-0 w-12 h-12 ${isToday ? 'bg-blue-500/10 dark:bg-gray-600/10' : ''}`}></div>
        
        <div className="h-full flex flex-col relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-lg font-bold transition-all ${
              isToday 
                ? 'text-blue-700 dark:text-gray-100' 
                : 'text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-gray-100'
            }`}>
              {day}
            </span>
            {dayEvents.length > 0 && (
              <div className={`relative px-2 py-1 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-lg backdrop-blur-sm transition-transform group-hover:scale-110 ${
                dayEvents.length >= 5 ? 'bg-blue-600' : 
                dayEvents.length >= 3 ? 'bg-blue-500' : 
                'bg-blue-400'
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
              <div className="text-[10px] text-gray-600 dark:text-gray-400 font-semibold px-2 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-gray-600 dark:bg-gray-400"></span>
                {dayEvents.length - 2} more events
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-slate-50 dark:from-black dark:via-[#0A1628] dark:to-[#1E3A8A] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in-down">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Calendar & Scheduling</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Schedule church events</p>
        </div>
        <button
          onClick={() => {
            setFormData({ title: '', date: '', time: '', type: 'Mass', priest_id: '', description: '' });
            setModalMode('add');
            setShowEventModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all font-semibold shadow-lg hover:shadow-xl hover:scale-105"
        >
          <Plus size={20} />
          Add Event
        </button>
      </div>

      {/* Calendar */}
      <div className="bg-white dark:bg-gray-900/50 rounded-2xl shadow-2xl border border-blue-200 dark:border-gray-700 overflow-hidden">
        {/* Calendar Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 dark:bg-gray-900 px-6 py-5 flex items-center justify-between overflow-hidden border-b border-blue-700 dark:border-gray-700">
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
            <h2 className="text-2xl font-bold text-white tracking-wide">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <p className="text-xs text-white/90 mt-1">Church Event Calendar</p>
          </div>
          <button
            onClick={nextMonth}
            className="relative z-10 p-2.5 hover:bg-white/20 rounded-xl transition-all text-white hover:scale-110 active:scale-95"
          >
            <ChevronRight size={22} />
          </button>
        </div>

        {/* Day Labels */}
        <div className="grid grid-cols-7 bg-blue-50 dark:bg-gray-800 border-b-2 border-blue-200 dark:border-gray-700">
          {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, idx) => (
            <div key={day} className={`text-center py-3 font-bold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wider ${idx === 0 || idx === 6 ? 'bg-blue-100 dark:bg-gray-900/50' : ''}`}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-[1px] bg-blue-200 dark:bg-gray-700 p-[1px]">
          {days}
        </div>
      </div>

      {/* Upcoming Events List */}
      <div className="bg-white dark:bg-gray-900/50 rounded-2xl shadow-2xl border border-blue-200 dark:border-gray-700 overflow-hidden">
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 dark:bg-gray-900 px-6 py-4 overflow-hidden border-b border-blue-700 dark:border-gray-700">
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]"></div>
          <div className="absolute -right-12 -top-12 w-32 h-32 bg-white/10 dark:bg-gray-800/50 rounded-full blur-2xl"></div>
          <h2 className="relative text-xl font-bold text-white flex items-center gap-2">
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
              <div key={event.id} className="group relative bg-blue-50 dark:bg-gray-900/50 rounded-xl p-4 hover:shadow-xl transition-all duration-300 border-l-4 border border-blue-200 dark:border-gray-700 overflow-hidden" style={{ borderLeftColor: event.type === 'Mass' ? '#2563eb' : event.type === 'Wedding' ? '#4f46e5' : event.type === 'Baptism' ? '#0284c7' : event.type === 'Meeting' ? '#1d4ed8' : '#4b5563', animationDelay: `${idx * 50}ms` }}>
                {/* Decorative gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/5 dark:via-gray-800/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative flex items-start gap-4">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${eventTypeColors[event.type]} shadow-lg group-hover:scale-110 transition-transform`}>
                    <span className="text-white font-bold text-lg">
                      {event.type === 'Mass' ? '✝' : event.type === 'Wedding' ? '💒' : event.type === 'Baptism' ? '💧' : event.type === 'Meeting' ? '👥' : '📅'}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base group-hover:text-blue-600 dark:group-hover:text-gray-200 transition-colors">
                        {event.title}
                      </h3>
                      <span className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold text-white ${eventTypeColors[event.type]} shadow-md`}>
                        {event.type}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-400">
                        <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-gray-800 flex items-center justify-center">
                          <span className="text-blue-600 dark:text-gray-400">📅</span>
                        </div>
                        <span className="font-medium">{event.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-400">
                        <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-gray-800 flex items-center justify-center">
                          <span className="text-blue-600 dark:text-gray-400">🕐</span>
                        </div>
                        <span className="font-medium">{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-400">
                        <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-gray-800 flex items-center justify-center">
                          <span className="text-blue-600 dark:text-gray-400">👤</span>
                        </div>
                        <span className="font-medium truncate">{event.priest}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditEvent(event)}
                      className="p-2 text-blue-600 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-gray-700 rounded-lg transition-all hover:scale-110"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="p-2 text-red-600 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-gray-700 rounded-lg transition-all hover:scale-110"
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
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-blue-500 dark:border-gray-600">
            <div className="p-6 border-b border-blue-200 dark:border-gray-700 flex items-center justify-between">
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
                  className="w-full px-4 py-2 border border-blue-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-gray-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-blue-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-gray-500 focus:border-transparent"
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
                <select
                  value={formData.priest_id}
                  onChange={(e) => setFormData({...formData, priest_id: e.target.value})}
                  className="w-full px-4 py-2 border border-blue-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-gray-500 focus:border-transparent"
                >
                  <option value="">Select a priest (optional)</option>
                  {priests.filter(p => p.status === 'Active' || p.status === 'active').map((priest) => (
                    <option key={priest.id} value={priest.id}>
                      {priest.name}
                    </option>
                  ))}
                </select>
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
                    className="w-full px-4 py-2 border border-blue-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-gray-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-blue-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-gray-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-blue-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-gray-500 focus:border-transparent"
                  rows="3"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : (modalMode === 'add' ? 'Add Event' : 'Update Event')}
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
