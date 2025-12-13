import { useState } from 'react';
import { Calendar as CalendarIcon, Calendar, Clock, MapPin, Users, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const PriestEvents = () => {
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'list'
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Sample events data
  const events = [
    {
      id: 1,
      title: 'Sunday Mass',
      date: '2025-12-01',
      time: '08:00 AM',
      type: 'Mass',
      location: 'Main Church',
      attendees: 234,
      notes: 'Regular Sunday morning mass. Expected high attendance.'
    },
    {
      id: 2,
      title: 'Baby Michael Doe - Baptism',
      date: '2025-12-01',
      time: '10:00 AM',
      type: 'Baptism',
      location: 'Baptistry',
      attendees: 25,
      notes: 'Baptism ceremony for Baby Michael Doe. Parents: John & Mary Doe.'
    },
    {
      id: 3,
      title: 'Parish Council Meeting',
      date: '2025-12-02',
      time: '06:00 PM',
      type: 'Meeting',
      location: 'Parish Hall',
      attendees: 15,
      notes: 'Monthly parish council meeting to discuss upcoming events.'
    },
    {
      id: 4,
      title: 'Confirmation Mass',
      date: '2025-12-03',
      time: '05:00 PM',
      type: 'Mass',
      location: 'Main Church',
      attendees: 87,
      notes: 'Confirmation ceremony for youth group.'
    },
    {
      id: 5,
      title: 'Evening Mass',
      date: '2025-12-03',
      time: '07:00 PM',
      type: 'Mass',
      location: 'Main Church',
      attendees: 56,
      notes: 'Regular evening mass.'
    },
    {
      id: 6,
      title: 'Wedding - Robert & Jennifer',
      date: '2025-12-05',
      time: '02:00 PM',
      type: 'Wedding',
      location: 'Main Church',
      attendees: 150,
      notes: 'Wedding ceremony for Robert Cruz and Jennifer Santos.'
    }
  ];

  const getEventColor = (type) => {
    const colors = {
      Mass: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      Baptism: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      Wedding: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      Meeting: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  const getEventsForDate = (day) => {
    if (!day) return [];
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${year}-${month}-${dayStr}`;
    return events.filter(event => event.date === dateStr);
  };

  const handlePrevMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-purple-50/20 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in-down">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 dark:from-gray-100 dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
              Events & Mass Schedule
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
              View upcoming masses, sacrament bookings, and parish events
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant={viewMode === 'calendar' ? 'primary' : 'outline'}
              onClick={() => setViewMode('calendar')}
            >
              <CalendarIcon size={18} className="mr-2" />
              Calendar
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'outline'}
              onClick={() => setViewMode('list')}
            >
              List View
            </Button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
          <div className="flex items-start">
            <Calendar className="text-blue-600 mr-3 mt-0.5" size={20} />
            <div>
              <p className="text-sm font-medium text-blue-800">View-Only Access</p>
              <p className="text-sm text-blue-700 mt-1">
                Event schedules and appointments are managed by the Church Admin. You have read-only access to view masses, bookings, and parish events.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card padding="lg">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Events</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{events.length}</p>
            </div>
          </Card>

          <Card padding="lg">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Masses</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {events.filter(e => e.type === 'Mass').length}
              </p>
            </div>
          </Card>

          <Card padding="lg">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Sacraments</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {events.filter(e => ['Baptism', 'Wedding'].includes(e.type)).length}
              </p>
            </div>
          </Card>

          <Card padding="lg">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Attendees</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {events.reduce((sum, e) => sum + e.attendees, 0)}
              </p>
            </div>
          </Card>
        </div>

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <Card padding="lg">
            <div className="space-y-4">
              {/* Month Navigation */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={handlePrevMonth}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Day headers */}
                {dayNames.map(day => (
                  <div key={day} className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400 py-2">
                    {day}
                  </div>
                ))}

                {/* Calendar days */}
                {getDaysInMonth(selectedDate).map((day, idx) => {
                  const dayEvents = getEventsForDate(day);
                  return (
                    <div
                      key={idx}
                      className={`min-h-24 p-2 border border-gray-200 dark:border-gray-700 rounded-lg ${
                        day ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'
                      }`}
                    >
                      {day && (
                        <>
                          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                            {day}
                          </div>
                          <div className="space-y-1">
                            {dayEvents.slice(0, 2).map(event => (
                              <div
                                key={event.id}
                                onClick={() => handleEventClick(event)}
                                className={`text-xs p-1 rounded cursor-pointer ${getEventColor(event.type)}`}
                              >
                                {event.time} - {event.title}
                              </div>
                            ))}
                            {dayEvents.length > 2 && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                +{dayEvents.length - 2} more
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <Card title="Upcoming Events" padding="none">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {events.map(event => (
                <div
                  key={event.id}
                  onClick={() => handleEventClick(event)}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{event.title}</h3>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getEventColor(event.type)}`}>
                          {event.type}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <CalendarIcon size={16} />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={16} />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin size={16} />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users size={16} />
                          <span>{event.attendees} attendees</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Event Detail Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Event Details</h3>
              <button
                onClick={() => setShowEventModal(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h4 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{selectedEvent.title}</h4>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getEventColor(selectedEvent.type)}`}>
                  {selectedEvent.type}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                    <CalendarIcon size={18} />
                    <span className="text-sm font-medium">Date</span>
                  </div>
                  <p className="text-gray-900 dark:text-gray-100 font-semibold">{selectedEvent.date}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                    <Clock size={18} />
                    <span className="text-sm font-medium">Time</span>
                  </div>
                  <p className="text-gray-900 dark:text-gray-100 font-semibold">{selectedEvent.time}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                    <MapPin size={18} />
                    <span className="text-sm font-medium">Location</span>
                  </div>
                  <p className="text-gray-900 dark:text-gray-100 font-semibold">{selectedEvent.location}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                    <Users size={18} />
                    <span className="text-sm font-medium">Attendees</span>
                  </div>
                  <p className="text-gray-900 dark:text-gray-100 font-semibold">{selectedEvent.attendees}</p>
                </div>
              </div>

              <div>
                <h5 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Notes</h5>
                <p className="text-gray-900 dark:text-gray-100">{selectedEvent.notes}</p>
              </div>
            </div>

            <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
              <Button variant="outline" onClick={() => setShowEventModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriestEvents;
