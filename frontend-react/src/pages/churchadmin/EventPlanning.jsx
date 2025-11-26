import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, Users, DollarSign, CheckCircle, Clock, MapPin, User, MessageSquare, X } from 'lucide-react';
import ModalOverlay from '../../components/ModalOverlay';

const EventPlanning = () => {
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
  const [modalMode, setModalMode] = useState('add');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState({
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

  const events = [
    {
      id: 1,
      title: 'Christmas Celebration 2025',
      type: 'Festival',
      date: '2025-12-25',
      time: '8:00 PM',
      location: 'Main Church & Grounds',
      budget: '₱150,000',
      spent: '₱45,000',
      coordinator: 'Maria Santos',
      volunteers: 50,
      status: 'Planning',
      progress: 30,
      tasks: [
        { id: 1, task: 'Book decorations vendor', completed: true },
        { id: 2, task: 'Arrange choir performance', completed: true },
        { id: 3, task: 'Setup sound system', completed: false },
        { id: 4, task: 'Coordinate volunteer schedule', completed: false },
      ]
    },
    {
      id: 2,
      title: 'Youth Ministry Retreat',
      type: 'Retreat',
      date: '2025-12-10',
      time: '9:00 AM',
      location: 'Mountain View Retreat Center',
      budget: '₱80,000',
      spent: '₱65,000',
      coordinator: 'John Dela Cruz',
      volunteers: 15,
      status: 'In Progress',
      progress: 75,
      tasks: [
        { id: 1, task: 'Book retreat venue', completed: true },
        { id: 2, task: 'Arrange transportation', completed: true },
        { id: 3, task: 'Prepare activities', completed: true },
        { id: 4, task: 'Finalize meal arrangements', completed: false },
      ]
    },
    {
      id: 3,
      title: 'Parish Anniversary Celebration',
      type: 'Celebration',
      date: '2026-01-15',
      time: '10:00 AM',
      location: 'Parish Grounds',
      budget: '₱200,000',
      spent: '₱15,000',
      coordinator: 'Fr. Joseph Smith',
      volunteers: 75,
      status: 'Planning',
      progress: 15,
      tasks: [
        { id: 1, task: 'Form planning committee', completed: true },
        { id: 2, task: 'Create event timeline', completed: false },
        { id: 3, task: 'Source event suppliers', completed: false },
        { id: 4, task: 'Design invitations', completed: false },
      ]
    },
    {
      id: 4,
      title: 'Charity Outreach Program',
      type: 'Outreach',
      date: '2025-11-30',
      time: '1:00 PM',
      location: 'Community Center',
      budget: '₱50,000',
      spent: '₱48,000',
      coordinator: 'Ana Garcia',
      volunteers: 30,
      status: 'Completed',
      progress: 100,
      tasks: [
        { id: 1, task: 'Collect donations', completed: true },
        { id: 2, task: 'Pack relief goods', completed: true },
        { id: 3, task: 'Coordinate distribution', completed: true },
        { id: 4, task: 'Document event', completed: true },
      ]
    },
  ];

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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setShowModal(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Event Planning</h1>
            <p className="text-blue-900 mt-1">Plan and manage church events</p>
          </div>
          <button 
            onClick={() => handleOpenModal('add')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-black via-[#0A1628] to-[#1E3A8A] text-white rounded-xl hover:from-[#1E3A8A] hover:to-blue-700 transition-all shadow-lg hover:shadow-blue-900/50"
          >
            <Plus size={20} />
            Create Event
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-900 text-sm">Total Events</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{events.length}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-black via-[#0A1628] to-[#1E3A8A] rounded-xl">
                <Calendar className="text-white" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-900 text-sm">In Progress</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{events.filter(e => e.status === 'In Progress').length}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl">
                <Clock className="text-white" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-900 text-sm">Total Budget</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">₱480K</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl">
                <DollarSign className="text-white" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-900 text-sm">Volunteers</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">170</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-black via-[#0A1628] to-[#1E3A8A] rounded-xl">
                <Users className="text-white" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Events List */}
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-xl shadow-sm border border-blue-200/50 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-900">
                      {event.type}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
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
                    className="bg-gradient-to-r from-black via-[#0A1628] to-[#1E3A8A] h-2 rounded-full transition-all"
                    style={{ width: `${event.progress}%` }}
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
                    className="px-6 py-2 bg-gradient-to-br from-black via-[#0A1628] to-[#1E3A8A] text-white rounded-lg hover:from-[#1E3A8A] hover:to-blue-700 transition-all shadow-lg hover:shadow-blue-900/50"
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
