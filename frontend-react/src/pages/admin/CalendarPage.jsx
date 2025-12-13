import { useState, useEffect } from 'react';
import { Plus, ChevronLeft, ChevronRight, X, Edit, Trash2 } from 'lucide-react';
import ModalOverlay from '../../components/ModalOverlay';
import { priestService, scheduleService, marriageRecordService, baptismRecordService } from '../../services/churchService';
import { eventService } from '../../services/extendedChurchService';
import { serviceRequestAPI } from '../../services/serviceRequestAPI';
import { showDeleteConfirm, showSuccessToast, showErrorToast, showError } from '../../utils/sweetAlertHelper';

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
    // Wedding fields
    groom_name: '',
    bride_name: '',
    groom_contact: '',
    bride_contact: '',
    marriage_location: '',
    witnesses: '',
    // Baptism fields
    child_name: '',
    child_birthdate: '',
    child_gender: '',
    father_name: '',
    mother_name: '',
    parents_address: '',
    godfather_name: '',
    godmother_name: '',
    baptism_location: '',
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
      
      // Fetch schedules/appointments
      const scheduleResponse = await scheduleService.getAll({ 
        start_date: startDate, 
        end_date: endDate 
      });
      
      // Fetch church events from event planning
      let churchEvents = [];
      try {
        const eventsData = await eventService.getAll();
        churchEvents = (Array.isArray(eventsData) ? eventsData : [])
          .filter(event => {
            const eventDate = event.date;
            return eventDate >= startDate && eventDate <= endDate;
          })
          .map(event => ({
            id: `event-${event.id}`,
            title: event.title,
            date: event.date,
            time: event.time || '00:00',
            type: 'Church Event',
            priest: event.coordinator || 'No Coordinator',
            priest_id: null,
            description: event.description || '',
            source: 'event_planning'
          }));
      } catch (err) {
        console.error('Error fetching church events:', err);
      }
      
      // Fetch service requests/appointments
      let appointments = [];
      try {
        const requestsData = await serviceRequestAPI.getAll({ status: 'approved' });
        appointments = (requestsData.data || [])
          .filter(req => {
            const reqDate = req.preferred_date?.split('T')[0];
            return reqDate && reqDate >= startDate && reqDate <= endDate;
          })
          .map(req => ({
            id: `request-${req.id}`,
            title: req.service_request_type?.type_name || 'Service Request',
            date: req.preferred_date.split('T')[0],
            time: req.preferred_time || '00:00',
            type: 'Appointment',
            priest: req.user?.name || 'Member',
            priest_id: null,
            description: req.details || '',
            source: 'service_request'
          }));
      } catch (err) {
        console.error('Error fetching appointments:', err);
      }
      
      // Transform schedules
      const transformedSchedules = (scheduleResponse.data || []).map(schedule => ({
        id: `schedule-${schedule.id}`,
        title: schedule.title,
        date: schedule.date.split('T')[0],
        time: schedule.time,
        type: schedule.type,
        priest: schedule.priest ? schedule.priest.name : 'No Priest',
        priest_id: schedule.priest_id,
        description: schedule.description || '',
        source: 'schedule'
      }));
      
      // Combine all events
      const allEvents = [...transformedSchedules, ...churchEvents, ...appointments];
      console.log('All calendar events:', allEvents);
      setEvents(allEvents);
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
    setFormData({ 
      title: '', 
      date: dateStr, 
      time: '', 
      type: 'Mass', 
      priest_id: '', 
      description: '',
      groom_name: '',
      bride_name: '',
      groom_contact: '',
      bride_contact: '',
      marriage_location: '',
      witnesses: '',
      child_name: '',
      child_birthdate: '',
      child_gender: '',
      father_name: '',
      mother_name: '',
      parents_address: '',
      godfather_name: '',
      godmother_name: '',
      baptism_location: '',
    });
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
      description: event.description || '',
      groom_name: event.groom_name || '',
      bride_name: event.bride_name || '',
      groom_contact: event.groom_contact || '',
      bride_contact: event.bride_contact || '',
      marriage_location: event.marriage_location || '',
      witnesses: event.witnesses || '',
      child_name: event.child_name || '',
      child_birthdate: event.child_birthdate || '',
      child_gender: event.child_gender || '',
      father_name: event.father_name || '',
      mother_name: event.mother_name || '',
      parents_address: event.parents_address || '',
      godfather_name: event.godfather_name || '',
      godmother_name: event.godmother_name || '',
      baptism_location: event.baptism_location || '',
    });
    setShowEventModal(true);
  };

  const handleDeleteEvent = async (eventId) => {
    const result = await showDeleteConfirm('Delete Event?', 'This action cannot be undone!');
    if (result.isConfirmed) {
      try {
        await scheduleService.delete(eventId);
        fetchSchedules();
        showSuccessToast('Deleted!', 'Event has been deleted successfully');
      } catch (err) {
        console.error('Error deleting schedule:', err);
        showErrorToast('Error!', 'Failed to delete event');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      if (modalMode === 'add') {
        // Route to appropriate service based on event type
        if (formData.type === 'Wedding') {
          // Create marriage record (which auto-creates schedule)
          await marriageRecordService.create({
            groom_name: formData.groom_name,
            bride_name: formData.bride_name,
            groom_contact: formData.groom_contact,
            bride_contact: formData.bride_contact,
            marriage_date: formData.date,
            marriage_time: formData.time,
            marriage_location: formData.marriage_location,
            witnesses: formData.witnesses,
            priest_id: formData.priest_id || null,
          });
        } else if (formData.type === 'Baptism') {
          // Create baptism record (which auto-creates schedule)
          await baptismRecordService.create({
            child_name: formData.child_name,
            child_birthdate: formData.child_birthdate,
            child_gender: formData.child_gender,
            father_name: formData.father_name,
            mother_name: formData.mother_name,
            parents_address: formData.parents_address,
            godfather_name: formData.godfather_name,
            godmother_name: formData.godmother_name,
            baptism_date: formData.date,
            baptism_time: formData.time,
            baptism_location: formData.baptism_location,
            priest_id: formData.priest_id || null,
          });
        } else {
          // Create regular schedule for other event types
          await scheduleService.create(formData);
        }
      } else {
        // For edit mode, update schedule (marriage/baptism updates handled separately)
        await scheduleService.update(selectedEvent.id, formData);
      }
      
      setShowEventModal(false);
      setFormData({ 
        title: '', 
        date: '', 
        time: '', 
        type: 'Mass', 
        priest_id: '', 
        description: '',
        groom_name: '',
        bride_name: '',
        groom_contact: '',
        bride_contact: '',
        marriage_location: '',
        witnesses: '',
        child_name: '',
        child_birthdate: '',
        child_gender: '',
        father_name: '',
        mother_name: '',
        parents_address: '',
        godfather_name: '',
        godmother_name: '',
        baptism_location: '',
      });
      fetchSchedules(); // Refresh the list
      showSuccessToast('Success!', `Event has been ${modalMode === 'edit' ? 'updated' : 'created'} successfully`);
    } catch (err) {
      console.error('Error saving schedule:', err);
      console.error('Error response:', err.response?.data);
      
      // Display validation errors if available
      if (err.response?.data?.errors) {
        const errors = Object.values(err.response.data.errors).flat().join('\n');
        showError('Validation Errors', errors);
      } else {
        showError('Error', 'Failed to save event: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const getEventsForDate = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayEvents = events.filter(event => event.date === dateStr);
    if (dayEvents.length > 0) {
      console.log(`Events for ${dateStr}:`, dayEvents);
    }
    return dayEvents;
  };

  const eventTypeColors = {
    Mass: 'bg-blue-500',
    Wedding: 'bg-blue-600',
    Baptism: 'bg-sky-600',
    Meeting: 'bg-blue-700',
    'Church Event': 'bg-purple-600',
    Appointment: 'bg-green-600',
    Other: 'bg-gray-600 text-white',
  };

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="h-28 bg-gray-50"></div>);
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
        className={`h-28 p-3 cursor-pointer transition-all duration-200 ${
          isToday 
            ? 'bg-blue-50 border-2 border-blue-500' 
            : 'bg-white hover:bg-gray-50'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-base font-semibold ${
              isToday 
                ? 'text-blue-600' 
                : 'text-gray-700'
            }`}>
              {day}
            </span>
            {dayEvents.length > 0 && (
              <div className="px-2 py-0.5 rounded-full flex items-center justify-center text-xs font-semibold text-white" style={{ backgroundColor: '#4158D0' }}>
                {dayEvents.length}
              </div>
            )}
          </div>
          <div className="flex-1 space-y-1 overflow-hidden">
            {dayEvents.slice(0, 3).map((event) => (
              <div
                key={event.id}
                className={`text-[10px] px-2 py-1 rounded font-medium truncate ${eventTypeColors[event.type]} text-white`}
                title={event.title}
              >
                {event.title}
              </div>
            ))}
            {dayEvents.length > 3 && (
              <div className="text-[10px] text-gray-600 font-medium px-2">
                +{dayEvents.length - 3} more
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-6 bg-white">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Calendar & Scheduling</h1>
            <p className="text-gray-600 text-sm mt-1">Schedule church events</p>
          </div>
          <button
            onClick={() => {
              setFormData({ title: '', date: '', time: '', type: 'Mass', priest_id: '', description: '' });
              setModalMode('add');
              setShowEventModal(true);
            }}
            className="flex items-center gap-2 text-white px-4 py-2 text-sm font-medium rounded-lg transition-all hover:opacity-90"
            style={{ backgroundColor: '#4158D0' }}
          >
            <Plus size={18} />
            Add Event
          </button>
        </div>

      {/* Calendar */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        {/* Calendar Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all text-gray-700"
            style={{ color: '#4158D0' }}
          >
            <ChevronLeft size={20} />
          </button>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <p className="text-xs text-gray-600 mt-0.5">Church Event Calendar</p>
          </div>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all text-gray-700"
            style={{ color: '#4158D0' }}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Day Labels */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
            <div key={day} className="text-center py-3 font-semibold text-gray-700 text-xs uppercase tracking-wide">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {days}
        </div>
      </div>

      {/* Upcoming Events List */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Upcoming Events & Priest Schedules
          </h2>
        </div>
        <div className="p-5 space-y-3">
          {events
            .filter(event => new Date(event.date) >= new Date())
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 5)
            .map((event) => (
              <div key={event.id} className="group bg-gray-50 rounded-lg p-4 hover:shadow-md transition-all border-l-4 border-gray-200" style={{ borderLeftColor: event.type === 'Mass' ? '#2563eb' : event.type === 'Wedding' ? '#4f46e5' : event.type === 'Baptism' ? '#0284c7' : event.type === 'Meeting' ? '#1d4ed8' : '#4b5563' }}>
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${eventTypeColors[event.type]} shadow`}>
                    <span className="text-white font-bold text-lg">
                      {event.type === 'Mass' ? '✝' : event.type === 'Wedding' ? '💒' : event.type === 'Baptism' ? '💧' : event.type === 'Meeting' ? '👥' : event.type === 'Church Event' ? '🎉' : event.type === 'Appointment' ? '📋' : '📅'}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 text-base">
                        {event.title}
                      </h3>
                      <span className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold text-white ${eventTypeColors[event.type]}`}>
                        {event.type}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div className="flex items-center gap-2 text-gray-700">
                        <div className="w-6 h-6 rounded-lg bg-gray-200 flex items-center justify-center">
                          <span>📅</span>
                        </div>
                        <span className="font-medium">{event.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <div className="w-6 h-6 rounded-lg bg-gray-200 flex items-center justify-center">
                          <span>🕐</span>
                        </div>
                        <span className="font-medium">{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <div className="w-6 h-6 rounded-lg bg-gray-200 flex items-center justify-center">
                          <span>👤</span>
                        </div>
                        <span className="font-medium truncate">{event.priest}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditEvent(event)}
                      className="p-2 hover:bg-white rounded-lg transition-all"
                      style={{ color: '#4158D0' }}
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="p-2 text-red-600 hover:bg-white rounded-lg transition-all"
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
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {modalMode === 'add' ? 'Add Event' : 'Edit Event'}
              </h2>
              <button
                onClick={() => setShowEventModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned Priest
                </label>
                <select
                  value={formData.priest_id}
                  onChange={(e) => setFormData({...formData, priest_id: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                ></textarea>
              </div>

              {/* Wedding Fields */}
              {formData.type === 'Wedding' && (
                <div className="space-y-4 border-t border-gray-200 pt-4 mt-4">
                  <h3 className="text-lg font-semibold text-gray-900">Wedding Details</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Groom Name *
                      </label>
                      <input
                        type="text"
                        value={formData.groom_name}
                        onChange={(e) => setFormData({...formData, groom_name: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Groom Contact
                      </label>
                      <input
                        type="text"
                        value={formData.groom_contact}
                        onChange={(e) => setFormData({...formData, groom_contact: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bride Name *
                      </label>
                      <input
                        type="text"
                        value={formData.bride_name}
                        onChange={(e) => setFormData({...formData, bride_name: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bride Contact
                      </label>
                      <input
                        type="text"
                        value={formData.bride_contact}
                        onChange={(e) => setFormData({...formData, bride_contact: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Wedding Location *
                    </label>
                    <input
                      type="text"
                      value={formData.marriage_location}
                      onChange={(e) => setFormData({...formData, marriage_location: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Witnesses
                    </label>
                    <textarea
                      value={formData.witnesses}
                      onChange={(e) => setFormData({...formData, witnesses: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="2"
                      placeholder="Enter witness names, separated by commas"
                    ></textarea>
                  </div>
                </div>
              )}

              {/* Baptism Fields */}
              {formData.type === 'Baptism' && (
                <div className="space-y-4 border-t border-gray-200 pt-4 mt-4">
                  <h3 className="text-lg font-semibold text-gray-900">Baptism Details</h3>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Child Name *
                      </label>
                      <input
                        type="text"
                        value={formData.child_name}
                        onChange={(e) => setFormData({...formData, child_name: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Birthdate *
                      </label>
                      <input
                        type="date"
                        value={formData.child_birthdate}
                        onChange={(e) => setFormData({...formData, child_birthdate: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender *
                    </label>
                    <select
                      value={formData.child_gender}
                      onChange={(e) => setFormData({...formData, child_gender: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Father Name *
                      </label>
                      <input
                        type="text"
                        value={formData.father_name}
                        onChange={(e) => setFormData({...formData, father_name: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mother Name *
                      </label>
                      <input
                        type="text"
                        value={formData.mother_name}
                        onChange={(e) => setFormData({...formData, mother_name: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Parents Address
                    </label>
                    <input
                      type="text"
                      value={formData.parents_address}
                      onChange={(e) => setFormData({...formData, parents_address: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Godfather Name
                      </label>
                      <input
                        type="text"
                        value={formData.godfather_name}
                        onChange={(e) => setFormData({...formData, godfather_name: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Godmother Name
                      </label>
                      <input
                        type="text"
                        value={formData.godmother_name}
                        onChange={(e) => setFormData({...formData, godmother_name: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Baptism Location *
                    </label>
                    <input
                      type="text"
                      value={formData.baptism_location}
                      onChange={(e) => setFormData({...formData, baptism_location: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white text-sm font-medium rounded-lg transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#4158D0' }}
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
