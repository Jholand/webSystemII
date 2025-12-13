import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, Users, DollarSign, CheckCircle, Clock, MapPin, User, MessageSquare, X } from 'lucide-react';
import ModalOverlay from '../../components/ModalOverlay';
import Pagination from '../../components/Pagination';
import { eventService } from '../../services/extendedChurchService';
import { showSuccessToast, showErrorToast, showDeleteConfirm } from '../../utils/sweetAlertHelper';

const EventPlanning = () => {
  const [showModal, setShowModal] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchEvents();
  }, []);

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

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await eventService.getAll();
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching events:', error);
      showErrorToast('Error', 'Failed to load events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };
  const [modalMode, setModalMode] = useState('add');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState({
    eventId: '',
    title: '',
    type: '',
    date: '',
    time: '',
    location: '',
    budget: '',
    coordinator: '',
    volunteers: '',
    description: '',
    tasks: [],
    status: 'Planning'
  });



  const eventTypes = ['Festival', 'Retreat', 'Celebration', 'Conference', 'Outreach', 'Fundraiser', 'Seminar'];
  const statuses = ['Planning', 'In Progress', 'Completed', 'Cancelled'];

  const handleOpenModal = (mode, event = null) => {
    setModalMode(mode);
    if (event) {
      setSelectedEvent(event);
      setFormData(event);
    } else {
      setSelectedEvent(null);
      setFormData({
        eventId: '',
        title: '',
        type: '',
        date: '',
        time: '',
        location: '',
        budget: '',
        coordinator: '',
        volunteers: '',
        description: '',
        tasks: [],
        status: 'Planning'
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (modalMode === 'add') {
        await eventService.create(formData);
        showSuccessToast('Success!', 'Event created successfully');
      } else if (modalMode === 'edit') {
        await eventService.update(selectedEvent.id, formData);
        showSuccessToast('Success!', 'Event updated successfully');
      }
      setShowModal(false);
      await fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      showErrorToast('Error', 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await showDeleteConfirm('Delete Event?', 'This action cannot be undone!');
    if (result.isConfirmed) {
      try {
        await eventService.delete(id);
        showSuccessToast('Deleted!', 'Event has been deleted successfully');
        await fetchEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
        showErrorToast('Error', 'Failed to delete event');
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Planning: 'bg-blue-100 text-blue-900',
      'In Progress': 'bg-amber-100 text-amber-900',
      Completed: 'bg-emerald-100 text-emerald-900',
      Cancelled: 'bg-rose-100 text-rose-900'
    };
    return colors[status] || colors.Planning;
  };

  const stats = [
    { label: 'Total Events', value: events.length, icon: Calendar, color: '#4158D0' },
    { label: 'Planning', value: events.filter(e => e.status === 'Planning').length, icon: Clock, color: '#f59e0b' },
    { label: 'In Progress', value: events.filter(e => e.status === 'In Progress').length, icon: Users, color: '#10b981' },
    { label: 'Completed', value: events.filter(e => e.status === 'Completed').length, icon: CheckCircle, color: '#8b5cf6' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="space-y-6">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1" style={{ color: '#4158D0' }}>Event Planning</h1>
              <p className="text-gray-600 text-sm">Plan and manage church events</p>
            </div>
            <button 
              onClick={() => handleOpenModal('add')}
              className="flex items-center gap-2 px-6 py-3 text-white rounded-lg font-semibold hover:opacity-90 transition-all shadow-lg"
              style={{ 
                background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
                boxShadow: '0 4px 12px rgba(65, 88, 208, 0.3)'
              }}
            >
              <Plus size={18} />
              Create Event
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg p-5 shadow hover:shadow-lg transition-all border border-gray-200 cursor-pointer group">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 rounded-lg group-hover:scale-110 transition-transform" style={{ backgroundColor: stat.color + '20' }}>
                    <IconComponent style={{ color: stat.color }} size={24} />
                  </div>
                  <IconComponent size={16} className="text-gray-400" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-sm font-semibold text-gray-700">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Events List */}
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-gray-200 p-6">

              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-mono font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1.5 rounded-lg shadow-sm">
                      🆔 {event.eventId}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900">{event.title}</h3>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(70, 103, 207, 0.1)', color: '#4667CF' }}>
                      {event.type}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>{event.date} at {event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User size={16} />
                      <span>{event.coordinator}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={16} />
                      <span>{event.volunteers} volunteers</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleOpenModal('view', event)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <MessageSquare size={18} />
                  </button>
                  <button 
                    onClick={() => handleOpenModal('edit', event)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit size={18} />
                  </button>
                  <button className="p-2 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm font-medium text-gray-900">{event.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all"
                    style={{ width: `${event.progress}%`, backgroundColor: '#4667CF' }}
                  ></div>
                </div>
              </div>

              {/* Budget */}
              <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Budget</p>
                  <p className="text-lg font-bold text-gray-900">{event.budget}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Spent</p>
                  <p className="text-lg font-bold text-gray-900">{event.spent}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Remaining</p>
                  <p className="text-lg font-bold text-emerald-600">
                    ₱{(parseInt(event.budget.replace(/[₱,]/g, '')) - parseInt(event.spent.replace(/[₱,]/g, ''))).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Tasks */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Tasks ({event.tasks.filter(t => t.completed).length}/{event.tasks.length})</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {event.tasks.map((task) => (
                    <div key={task.id} className={`flex items-center gap-2 p-2 rounded-lg ${task.completed ? 'bg-emerald-50' : 'bg-gray-50'}`}>
                      <CheckCircle className={task.completed ? 'text-emerald-600' : 'text-gray-300'} size={16} />
                      <span className={`text-sm ${task.completed ? 'text-emerald-900 line-through' : 'text-gray-700'}`}>
                        {task.task}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      <ModalOverlay isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {modalMode === 'add' ? 'Create New Event' : modalMode === 'edit' ? 'Edit Event' : 'Event Details'}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {modalMode === 'view' ? (
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Event ID</label>
                    <p className="mt-1 text-lg font-mono font-bold text-blue-600 bg-blue-50 px-3 py-2 rounded-lg inline-block">
                      🆔 {selectedEvent?.eventId}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Event Title</label>
                    <p className="mt-1 text-gray-900">{selectedEvent?.title}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Type</label>
                    <p className="mt-1">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-900">
                        {selectedEvent?.type}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Date & Time</label>
                    <p className="mt-1 text-gray-900">{selectedEvent?.date} at {selectedEvent?.time}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Location</label>
                    <p className="mt-1 text-gray-900">{selectedEvent?.location}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Coordinator</label>
                    <p className="mt-1 text-gray-900">{selectedEvent?.coordinator}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Volunteers</label>
                    <p className="mt-1 text-gray-900">{selectedEvent?.volunteers}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <p className="mt-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedEvent?.status)}`}>
                        {selectedEvent?.status}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Progress</label>
                    <p className="mt-1 text-gray-900">{selectedEvent?.progress}%</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Budget</label>
                    <p className="mt-1 font-bold text-gray-900">{selectedEvent?.budget}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Spent</label>
                    <p className="mt-1 font-bold text-gray-900">{selectedEvent?.spent}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Remaining</label>
                    <p className="mt-1 font-bold text-emerald-600">
                      ₱{(parseInt(selectedEvent?.budget.replace(/[₱,]/g, '')) - parseInt(selectedEvent?.spent.replace(/[₱,]/g, ''))).toLocaleString()}
                    </p>
                  </div>
                </div>

                {selectedEvent?.tasks && selectedEvent.tasks.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Tasks</label>
                    <div className="space-y-2">
                      {selectedEvent.tasks.map((task) => (
                        <div key={task.id} className={`flex items-center gap-2 p-3 rounded-lg ${task.completed ? 'bg-emerald-50' : 'bg-gray-50'}`}>
                          <CheckCircle className={task.completed ? 'text-emerald-600' : 'text-gray-300'} size={18} />
                          <span className={`${task.completed ? 'text-emerald-900 line-through' : 'text-gray-700'}`}>
                            {task.task}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event ID * <span className="text-blue-600 font-normal">(Required for Payment Tracking)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.eventId}
                      onChange={(e) => setFormData({...formData, eventId: e.target.value})}
                      className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                      placeholder="e.g., EVT-2025-001"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">💡 Use format: EVT-YYYY-###</p>
                  </div>

                  <div>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>{status}</option>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time *</label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Budget *</label>
                    <input
                      type="text"
                      value={formData.budget}
                      onChange={(e) => setFormData({...formData, budget: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="₱50,000"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Coordinator *</label>
                    <input
                      type="text"
                      value={formData.coordinator}
                      onChange={(e) => setFormData({...formData, coordinator: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
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
                    {modalMode === 'add' ? 'Create Event' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>
      </ModalOverlay>
    </div>
  );
};

export default EventPlanning;
