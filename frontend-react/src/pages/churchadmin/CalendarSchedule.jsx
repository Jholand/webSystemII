import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, MapPin, Users, Edit, Trash2, User, X } from 'lucide-react';
import ModalOverlay from '../../components/ModalOverlay';
import { priestService, scheduleService } from '../../services/churchService';
import { serviceRequestAPI } from '../../services/serviceRequestAPI';
import { appointmentAPI } from '../../services/dataSync';
import { showDeleteConfirm, showSuccessToast, showErrorToast } from '../../utils/sweetAlertHelper';

const CalendarSchedule = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [priestsList, setPriestsList] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    fetchPriests();
    fetchSchedules();
    fetchConfirmedEvents();
  }, []);

  useEffect(() => {
    fetchSchedules();
    fetchConfirmedEvents();
  }, [currentDate]);

  const fetchPriests = async () => {
    try {
      const response = await priestService.getAll();
      setPriestsList(response.data || []);
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
      
      console.log('Fetching schedules from:', startDate, 'to:', endDate);
      
      const response = await scheduleService.getAll({ 
        start_date: startDate, 
        end_date: endDate 
      });
      
      console.log('Schedules response:', response);
      
      const transformedEvents = (response.data || []).map(schedule => ({
        id: schedule.id,
        title: schedule.title,
        date: schedule.date,
        time: schedule.time,
        endTime: schedule.end_time,
        type: schedule.type,
        location: schedule.location || '',
        priest: schedule.priest ? schedule.priest.name : '',
        priest_id: schedule.priest_id,
        attendees: schedule.attendees || 0,
        description: schedule.description || '',
        source: 'schedule'
      }));
      
      console.log('Transformed events:', transformedEvents);
      setEvents(prevEvents => {
        // Keep confirmed service request events and add schedule events
        const serviceRequestEvents = prevEvents.filter(e => e.source === 'service_request');
        return [...serviceRequestEvents, ...transformedEvents];
      });
    } catch (err) {
      console.error('Error fetching schedules:', err);
      console.error('Error details:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const fetchConfirmedEvents = async () => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month + 1, 0).getDate();
      const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${lastDay}`;

      // Fetch confirmed appointments
      const appointmentsResponse = await appointmentAPI.getAll();
      const confirmedAppointments = (appointmentsResponse.data || [])
        .filter(apt => {
          const aptDate = apt.appointment_date || apt.date;
          return apt.status === 'confirmed' && aptDate >= startDate && aptDate <= endDate;
        })
        .map(apt => ({
          id: `apt-${apt.id}`,
          title: apt.service_type || apt.event_type || 'Appointment',
          date: apt.appointment_date || apt.date,
          time: apt.appointment_time || apt.time || '10:00',
          endTime: apt.end_time || '',
          type: apt.service_type || apt.event_type || 'Appointment',
          location: apt.location || 'Main Church',
          priest: apt.priest_name || '',
          priest_id: apt.priest_id || null,
          attendees: 0,
          description: apt.notes || '',
          source: 'appointment'
        }));

      // Fetch confirmed service requests
      const serviceRequestsResponse = await serviceRequestAPI.getAll();
      const confirmedRequests = (serviceRequestsResponse.data || [])
        .filter(req => {
          const reqDate = req.scheduled_date || req.date;
          return req.status === 'confirmed' && reqDate >= startDate && reqDate <= endDate;
        })
        .map(req => ({
          id: `req-${req.id}`,
          title: req.service_request_type?.type_name || req.service_type || 'Service Request',
          date: req.scheduled_date || req.date,
          time: req.scheduled_time || req.time || '10:00',
          endTime: req.end_time || '',
          type: req.service_request_type?.type_name || req.service_type || 'Service',
          location: req.location || 'Main Church',
          priest: req.priest?.name || '',
          priest_id: req.priest_id || null,
          attendees: 0,
          description: req.notes || '',
          source: 'service_request'
        }));

      // Merge with existing schedule events
      setEvents(prevEvents => {
        const scheduleEvents = prevEvents.filter(e => e.source === 'schedule');
        return [...scheduleEvents, ...confirmedAppointments, ...confirmedRequests];
      });
    } catch (err) {
      console.error('Error fetching confirmed events:', err);
    }
  };

  const [modalMode, setModalMode] = useState('add');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    date: '',
    time: '',
    end_time: '',
    location: '',
    priest_id: '',
    description: '',
    max_participants: '',
    registration_fee: '',
    requirements: ''
  });



  const eventTypes = [
    'Mass', 
    'Wedding', 
    'Baptism', 
    'Funeral', 
    'Ministry', 
    'Conference', 
    'Retreat',
    'Baptism Seminar',
    'Wedding Seminar',
    'Confirmation Seminar',
    'Pre-Cana Seminar',
    'Marriage Enrichment Seminar',
    'Other'
  ];
  const locations = ['Main Church', 'Chapel', 'Parish Hall', 'Baptistry', 'Meeting Room', 'Music Room', 'Outdoor Garden'];

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
      setSelectedEvent(event);
      setFormData({
        title: event.title,
        type: event.type,
        date: event.date,
        time: event.time,
        end_time: event.endTime,
        location: event.location || '',
        priest_id: event.priest_id || '',
        description: event.description || '',
        max_participants: event.max_participants || '',
        registration_fee: event.registration_fee || '',
        requirements: event.requirements || ''
      });
    } else {
      setSelectedEvent(null);
      setFormData({
        title: '',
        type: '',
        date: selectedDate || '',
        time: '',
        end_time: '',
        location: '',
        priest_id: '',
        description: '',
        max_participants: '',
        registration_fee: '',
        requirements: ''
      });
    }
    setShowEventModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      console.log('Submitting form data:', formData);
      
      if (modalMode === 'add') {
        const response = await scheduleService.create(formData);
        console.log('Create response:', response);
        showSuccessToast('Success!', 'Event added successfully');
      } else {
        const response = await scheduleService.update(selectedEvent.id, formData);
        console.log('Update response:', response);
        showSuccessToast('Success!', 'Event updated successfully');
      }
      setShowEventModal(false);
      await fetchSchedules(); // Wait for refresh
    } catch (err) {
      console.error('Error saving schedule:', err);
      console.error('Error response:', err.response?.data);
      showErrorToast('Error!', 'Failed to save event: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    const result = await showDeleteConfirm('Delete Event?', 'Are you sure you want to delete this event?');
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
    <div className="min-h-screen p-8" style={{ background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)' }}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#4158D0' }}>Calendar & Schedule</h1>
              <p className="text-gray-600 text-sm mt-1">Manage church events and schedules</p>
            </div>
            <button 
              onClick={() => handleOpenModal('add')}
              className="flex items-center gap-2 px-6 py-3 text-white rounded-lg font-semibold hover:opacity-90 transition-all shadow-lg"
              style={{ 
                background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
                boxShadow: '0 4px 12px rgba(65, 88, 208, 0.3)'
              }}
            >
              <Plus size={20} />
              Add Event
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="rounded-3xl p-8" style={{
              background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF5FF 100%)',
              border: '1px solid rgba(139, 92, 246, 0.15)',
              boxShadow: '0 8px 32px rgba(139, 92, 246, 0.12)'
            }}>
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <div className="flex gap-3">
                  <button
                    onClick={previousMonth}
                    className="p-3 rounded-2xl transition-all"
                    style={{ 
                      background: 'rgba(139, 92, 246, 0.1)',
                      border: '1px solid rgba(139, 92, 246, 0.2)',
                      color: '#8B5CF6'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(139, 92, 246, 0.15)';
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={nextMonth}
                    className="p-3 rounded-2xl transition-all"
                    style={{ 
                      background: 'rgba(139, 92, 246, 0.1)',
                      border: '1px solid rgba(139, 92, 246, 0.2)',
                      color: '#8B5CF6'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(139, 92, 246, 0.15)';
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-3">
                {/* Day headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-semibold pb-3" style={{ color: '#8B5CF6' }}>
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
                      className="aspect-square p-3 rounded-2xl cursor-pointer transition-all"
                      style={{
                        background: isSelected 
                          ? 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)'
                          : isToday
                          ? 'rgba(139, 92, 246, 0.1)'
                          : 'transparent',
                        border: isSelected
                          ? '1px solid rgba(139, 92, 246, 0.3)'
                          : isToday
                          ? '1px solid rgba(139, 92, 246, 0.3)'
                          : '1px solid rgba(139, 92, 246, 0.1)',
                        boxShadow: isSelected
                          ? '0 4px 12px rgba(139, 92, 246, 0.3)'
                          : 'none'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = 'rgba(139, 92, 246, 0.08)';
                          e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = isToday ? 'rgba(139, 92, 246, 0.1)' : 'transparent';
                          e.currentTarget.style.borderColor = isToday ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.1)';
                        }
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-semibold" style={{ color: isSelected ? '#FFFFFF' : '#1F293D' }}>
                          {day}
                        </div>
                        {dayEvents.length > 0 && (
                          <div 
                            className="flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold"
                            style={{
                              background: isSelected ? 'rgba(255, 255, 255, 0.3)' : 'rgba(139, 92, 246, 0.2)',
                              color: isSelected ? '#FFFFFF' : '#8B5CF6',
                              border: `1.5px solid ${isSelected ? 'rgba(255, 255, 255, 0.5)' : '#8B5CF6'}`
                            }}
                          >
                            {dayEvents.length}
                          </div>
                        )}
                      </div>
                      {dayEvents.length > 0 && (
                        <div className="space-y-1">
                          {dayEvents.slice(0, 1).map((event, idx) => (
                            <div
                              key={idx}
                              className="text-[10px] px-2 py-1 rounded-lg truncate font-medium"
                              style={{
                                background: isSelected ? 'rgba(255, 255, 255, 0.25)' : 'rgba(139, 92, 246, 0.15)',
                                color: isSelected ? '#FFFFFF' : '#8B5CF6'
                              }}
                            >
                              {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 1 && (
                            <div className="text-[10px] px-2 font-medium" style={{ color: isSelected ? '#FFFFFF' : '#64748B' }}>
                              +{dayEvents.length - 1} more
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
          <div className="space-y-6">
            <div className="rounded-3xl p-6" style={{
              background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF5FF 100%)',
              border: '1px solid rgba(139, 92, 246, 0.15)',
              boxShadow: '0 8px 32px rgba(139, 92, 246, 0.12)'
            }}>
              <h3 className="font-bold text-lg mb-6" style={{ color: '#4158D0' }}>
                {selectedDate ? `Events on ${selectedDate}` : 'Select a date'}
              </h3>

              {selectedDateEvents.length > 0 ? (
                <div className="space-y-4">
                  {selectedDateEvents.map(event => (
                    <div key={event.id} className="p-5 rounded-2xl space-y-3" style={{
                      background: 'rgba(65, 88, 208, 0.05)',
                      border: '1px solid rgba(65, 88, 208, 0.15)'
                    }}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <span className="inline-block px-3 py-1 rounded-xl text-xs font-semibold mb-2" style={{
                            background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
                            color: '#FFFFFF'
                          }}>
                            {event.type}
                          </span>
                          <h4 className="font-bold text-gray-900 text-base">{event.title}</h4>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleOpenModal('edit', event)}
                            className="p-2 rounded-xl transition-all"
                            style={{ 
                              background: 'rgba(65, 88, 208, 0.1)',
                              color: '#4158D0'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(65, 88, 208, 0.2)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(65, 88, 208, 0.1)';
                            }}
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteEvent(event.id)}
                            className="p-2 rounded-xl transition-all"
                            style={{ 
                              background: 'rgba(239, 68, 68, 0.1)',
                              color: '#EF4444'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-3">
                          <Clock size={16} style={{ color: '#4158D0' }} />
                          <span>{event.time} - {event.endTime}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPin size={16} style={{ color: '#4158D0' }} />
                          <span>{event.location}</span>
                        </div>
                        {event.priest && (
                          <div className="flex items-center gap-3">
                            <User size={16} style={{ color: '#4158D0' }} />
                            <span>{event.priest}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-12">No events scheduled for this date</p>
              )}
            </div>

            {/* Upcoming Events */}
            <div className="rounded-3xl p-6" style={{
              background: 'linear-gradient(135deg, #FFFFFF 0%, #EFF6FF 100%)',
              border: '1px solid rgba(65, 88, 208, 0.15)',
              boxShadow: '0 8px 32px rgba(65, 88, 208, 0.12)'
            }}>
              <h3 className="font-bold text-lg mb-6" style={{ color: '#4158D0' }}>Upcoming Events</h3>
              <div className="space-y-3">
                {events.slice(0, 5).map(event => (
                  <div key={event.id} className="flex items-center gap-3 p-4 rounded-2xl transition-all" style={{
                    background: 'rgba(65, 88, 208, 0.05)',
                    border: '1px solid rgba(65, 88, 208, 0.1)'
                  }}>
                    <div className="p-2.5 rounded-xl" style={{ 
                      background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
                      boxShadow: '0 4px 12px rgba(65, 88, 208, 0.25)'
                    }}>
                      <CalendarIcon className="text-white" size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{event.title}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{event.date} • {event.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Events Management Table */}
        <div className="bg-white border border-gray-200 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">All Events</h2>
            <p className="text-sm text-gray-600 mt-1">Manage and track all scheduled events</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Event</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date & Time</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Priest</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      Loading events...
                    </td>
                  </tr>
                ) : events.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      No events found
                    </td>
                  </tr>
                ) : (
                  events.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{event.title}</p>
                          {event.description && (
                            <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">{event.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 text-xs font-medium rounded bg-purple-100 text-purple-800">
                          {event.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center gap-2">
                            <CalendarIcon size={14} />
                            {event.date}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-gray-600">
                            <Clock size={14} />
                            {event.time} {event.endTime && `- ${event.endTime}`}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <MapPin size={14} />
                          {event.location || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <User size={14} />
                          {event.priest || 'Unassigned'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          new Date(event.date) < new Date() 
                            ? 'bg-gray-100 text-gray-800' 
                            : new Date(event.date).toDateString() === new Date().toDateString()
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {new Date(event.date) < new Date() 
                            ? 'Completed' 
                            : new Date(event.date).toDateString() === new Date().toDateString()
                            ? 'In Progress'
                            : 'Planned'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenModal('edit', event)}
                            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                            style={{ color: '#4158D0' }}
                            title="Edit Event"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="p-1.5 hover:bg-red-50 rounded transition-colors"
                            style={{ color: '#ef4444' }}
                            title="Delete Event"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Event Modal */}
      <ModalOverlay isOpen={showEventModal} onClose={() => setShowEventModal(false)}>
        <div className="rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, #EFF6FF 100%)'
        }}>
            <div className="p-6 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(65, 88, 208, 0.15)' }}>
              <h2 className="text-2xl font-bold" style={{ 
                background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                {modalMode === 'add' ? 'Add New Event' : 'Edit Event'}
              </h2>
              <button 
                onClick={() => setShowEventModal(false)}
                className="p-2 rounded-xl transition-all"
                style={{ 
                  background: 'rgba(65, 88, 208, 0.1)',
                  color: '#4158D0'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(65, 88, 208, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(65, 88, 208, 0.1)';
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Event Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none transition-all"
                    style={{ 
                      border: '1px solid rgba(65, 88, 208, 0.2)',
                      background: 'rgba(65, 88, 208, 0.03)'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.border = '1px solid rgba(65, 88, 208, 0.4)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(65, 88, 208, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.border = '1px solid rgba(65, 88, 208, 0.2)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Event Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none transition-all"
                    style={{ 
                      border: '1px solid rgba(65, 88, 208, 0.2)',
                      background: 'rgba(65, 88, 208, 0.03)'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.border = '1px solid rgba(65, 88, 208, 0.4)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(65, 88, 208, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.border = '1px solid rgba(65, 88, 208, 0.2)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    required
                  >
                    <option value="">Select Type</option>
                    {eventTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Location *</label>
                  <select
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none transition-all"
                    style={{ 
                      border: '1px solid rgba(65, 88, 208, 0.2)',
                      background: 'rgba(65, 88, 208, 0.03)'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.border = '1px solid rgba(65, 88, 208, 0.4)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(65, 88, 208, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.border = '1px solid rgba(65, 88, 208, 0.2)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    required
                  >
                    <option value="">Select Location</option>
                    {locations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none transition-all"
                    style={{ 
                      border: '1px solid rgba(65, 88, 208, 0.2)',
                      background: 'rgba(65, 88, 208, 0.03)'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.border = '1px solid rgba(65, 88, 208, 0.4)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(65, 88, 208, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.border = '1px solid rgba(65, 88, 208, 0.2)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Start Time *</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none transition-all"
                    style={{ 
                      border: '1px solid rgba(65, 88, 208, 0.2)',
                      background: 'rgba(65, 88, 208, 0.03)'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.border = '1px solid rgba(65, 88, 208, 0.4)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(65, 88, 208, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.border = '1px solid rgba(65, 88, 208, 0.2)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">End Time *</label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none transition-all"
                    style={{ 
                      border: '1px solid rgba(65, 88, 208, 0.2)',
                      background: 'rgba(65, 88, 208, 0.03)'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.border = '1px solid rgba(65, 88, 208, 0.4)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(65, 88, 208, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.border = '1px solid rgba(65, 88, 208, 0.2)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Assign Priest (Optional)</label>
                  <select
                    value={formData.priest_id}
                    onChange={(e) => setFormData({...formData, priest_id: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none transition-all"
                    style={{ 
                      border: '1px solid rgba(65, 88, 208, 0.2)',
                      background: 'rgba(65, 88, 208, 0.03)'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.border = '1px solid rgba(65, 88, 208, 0.4)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(65, 88, 208, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.border = '1px solid rgba(65, 88, 208, 0.2)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <option value="">No priest assigned</option>
                    {priestsList.filter(p => p.status === 'Active' || p.status === 'active').map(priest => (
                      <option key={priest.id} value={priest.id}>{priest.name}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows="4"
                    className="w-full px-4 py-3 rounded-xl focus:outline-none transition-all"
                    style={{ 
                      border: '1px solid rgba(65, 88, 208, 0.2)',
                      background: 'rgba(65, 88, 208, 0.03)'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.border = '1px solid rgba(65, 88, 208, 0.4)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(65, 88, 208, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.border = '1px solid rgba(65, 88, 208, 0.2)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  ></textarea>
                </div>

                {/* Seminar-specific fields */}
                {formData.type && (formData.type.toLowerCase().includes('seminar') || formData.type.toLowerCase().includes('cana')) && (
                  <>
                    <div className="md:col-span-2">
                      <div className="p-4 rounded-xl mb-4" style={{ 
                        background: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.2)'
                      }}>
                        <h3 className="text-sm font-bold text-blue-900 mb-1">📋 Seminar Settings</h3>
                        <p className="text-xs text-blue-700">Configure seminar capacity, fees, and requirements</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Max Participants <span className="text-xs text-gray-500">(Optional)</span>
                      </label>
                      <input
                        type="number"
                        value={formData.max_participants}
                        onChange={(e) => setFormData({...formData, max_participants: e.target.value})}
                        placeholder="e.g., 50"
                        min="1"
                        className="w-full px-4 py-3 rounded-xl focus:outline-none transition-all"
                        style={{ 
                          border: '1px solid rgba(65, 88, 208, 0.2)',
                          background: 'rgba(65, 88, 208, 0.03)'
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.border = '1px solid rgba(65, 88, 208, 0.4)';
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(65, 88, 208, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.border = '1px solid rgba(65, 88, 208, 0.2)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Registration Fee <span className="text-xs text-gray-500">(Optional)</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₱</span>
                        <input
                          type="number"
                          value={formData.registration_fee}
                          onChange={(e) => setFormData({...formData, registration_fee: e.target.value})}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          className="w-full pl-9 pr-4 py-3 rounded-xl focus:outline-none transition-all"
                          style={{ 
                            border: '1px solid rgba(65, 88, 208, 0.2)',
                            background: 'rgba(65, 88, 208, 0.03)'
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.border = '1px solid rgba(65, 88, 208, 0.4)';
                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(65, 88, 208, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.border = '1px solid rgba(65, 88, 208, 0.2)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Requirements <span className="text-xs text-gray-500">(One per line)</span>
                      </label>
                      <textarea
                        value={formData.requirements}
                        onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                        rows="3"
                        placeholder="e.g.,&#10;Birth Certificate&#10;Valid ID&#10;2x2 Photo"
                        className="w-full px-4 py-3 rounded-xl focus:outline-none transition-all"
                        style={{ 
                          border: '1px solid rgba(65, 88, 208, 0.2)',
                          background: 'rgba(65, 88, 208, 0.03)'
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.border = '1px solid rgba(65, 88, 208, 0.4)';
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(65, 88, 208, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.border = '1px solid rgba(65, 88, 208, 0.2)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      ></textarea>
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-5" style={{ borderTop: '1px solid rgba(65, 88, 208, 0.15)' }}>
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="px-6 py-3 rounded-2xl transition-all"
                  style={{
                    background: 'rgba(65, 88, 208, 0.1)',
                    color: '#64748B',
                    border: '1px solid rgba(65, 88, 208, 0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(65, 88, 208, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(65, 88, 208, 0.1)';
                  }}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 text-white rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
                    boxShadow: '0 6px 20px rgba(65, 88, 208, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(65, 88, 208, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(65, 88, 208, 0.3)';
                    }
                  }}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : (modalMode === 'add' ? 'Create Event' : 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
      </ModalOverlay>
    </div>
  );
};

export default CalendarSchedule;
