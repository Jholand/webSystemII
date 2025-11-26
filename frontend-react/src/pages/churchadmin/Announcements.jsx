import { useState, useEffect } from 'react';
import { Megaphone, Plus, Edit, Trash2, Eye, X, AlertCircle, Info, CheckCircle } from 'lucide-react';
import ModalOverlay from '../../components/ModalOverlay';

const Announcements = () => {
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
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    content: '',
    priority: 'Normal',
    validUntil: '',
    targetAudience: 'All Members'
  });

  const announcements = [
    {
      id: 1,
      title: 'Christmas Mass Schedule 2025',
      type: 'Event',
      content: 'Join us for our Christmas celebrations! Masses will be held on Dec 24 at 6:00 PM, 9:00 PM, and 12:00 AM. Dec 25 masses at 6:00 AM, 8:00 AM, 10:00 AM, and 6:00 PM.',
      priority: 'High',
      postedDate: '2025-11-20',
      postedBy: 'Fr. Joseph Smith',
      validUntil: '2025-12-25',
      status: 'Active',
      targetAudience: 'All Members'
    },
    {
      id: 2,
      title: 'Youth Ministry Retreat Registration Open',
      type: 'Ministry',
      content: 'Registration for the Youth Ministry Winter Retreat (Dec 10-12) is now open. Limited slots available. Fee: ₱2,500. Contact the parish office to register.',
      priority: 'Normal',
      postedDate: '2025-11-18',
      postedBy: 'Ana Garcia',
      validUntil: '2025-12-05',
      status: 'Active',
      targetAudience: 'Youth Ministry'
    },
    {
      id: 3,
      title: 'Church Renovation Update',
      type: 'General',
      content: 'The church renovation project is 75% complete. Side chapel will be temporarily closed Nov 25-30. We apologize for any inconvenience.',
      priority: 'High',
      postedDate: '2025-11-15',
      postedBy: 'John Dela Cruz',
      validUntil: '2025-11-30',
      status: 'Active',
      targetAudience: 'All Members'
    },
    {
      id: 4,
      title: 'Volunteer Appreciation Day',
      type: 'Event',
      content: 'Thank you to all our volunteers! Join us for Volunteer Appreciation Day on Nov 28 at 2:00 PM in the Parish Hall. Light refreshments will be served.',
      priority: 'Normal',
      postedDate: '2025-11-12',
      postedBy: 'Maria Santos',
      validUntil: '2025-11-28',
      status: 'Active',
      targetAudience: 'Volunteers'
    },
    {
      id: 5,
      title: 'Updated Parish Office Hours',
      type: 'Administrative',
      content: 'Starting Dec 1, parish office hours will be Mon-Sat 8:00 AM - 5:00 PM, closed Sundays. For emergencies, call the rectory hotline.',
      priority: 'Normal',
      postedDate: '2025-11-10',
      postedBy: 'Maria Santos',
      validUntil: '2025-12-01',
      status: 'Active',
      targetAudience: 'All Members'
    },
    {
      id: 6,
      title: 'Charity Drive Success',
      type: 'General',
      content: 'Thank you for your generous donations! Our recent charity drive collected over ₱150,000 worth of goods and donations for typhoon victims.',
      priority: 'Low',
      postedDate: '2025-11-05',
      postedBy: 'Ana Garcia',
      validUntil: '2025-11-25',
      status: 'Expired',
      targetAudience: 'All Members'
    },
  ];

  const announcementTypes = ['General', 'Event', 'Ministry', 'Administrative', 'Emergency'];
  const priorities = ['Low', 'Normal', 'High', 'Urgent'];
  const audiences = ['All Members', 'Youth Ministry', 'Choir', 'Volunteers', 'Staff'];

  const handleOpenModal = (mode, announcement = null) => {
    setModalMode(mode);
    if (announcement) {
      setSelectedAnnouncement(announcement);
      setFormData(announcement);
    } else {
      setSelectedAnnouncement(null);
      setFormData({
        title: '',
        type: '',
        content: '',
        priority: 'Normal',
        validUntil: '',
        targetAudience: 'All Members'
      });
    }
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Announcement submitted:', formData);
    setShowModal(false);
  };

  const getPriorityIcon = (priority) => {
    switch(priority) {
      case 'Urgent': return <AlertCircle className="text-rose-600" size={20} />;
      case 'High': return <AlertCircle className="text-amber-600" size={20} />;
      case 'Normal': return <Info className="text-blue-600" size={20} />;
      case 'Low': return <CheckCircle className="text-gray-600" size={20} />;
      default: return <Info className="text-blue-600" size={20} />;
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      Urgent: 'bg-rose-100 text-rose-900 border-rose-300',
      High: 'bg-amber-100 text-amber-900 border-amber-300',
      Normal: 'bg-blue-100 text-blue-900 border-blue-300',
      Low: 'bg-gray-100 text-gray-900 border-gray-300'
    };
    return colors[priority] || colors.Normal;
  };

  const getTypeColor = (type) => {
    const colors = {
      General: 'bg-gray-100 text-gray-900',
      Event: 'bg-blue-100 text-blue-900',
      Ministry: 'bg-purple-100 text-purple-900',
      Administrative: 'bg-emerald-100 text-emerald-900',
      Emergency: 'bg-rose-100 text-rose-900'
    };
    return colors[type] || colors.General;
  };

  const activeAnnouncements = announcements.filter(a => a.status === 'Active');
  const expiredAnnouncements = announcements.filter(a => a.status === 'Expired');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
            <p className="text-blue-900 mt-1">Internal parish announcements and updates</p>
          </div>
          <button 
            onClick={() => handleOpenModal('add')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-black via-[#0A1628] to-[#1E3A8A] text-white rounded-xl hover:from-[#1E3A8A] hover:to-blue-700 transition-all shadow-lg hover:shadow-blue-900/50"
          >
            <Plus size={20} />
            New Announcement
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-900 text-sm">Total</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{announcements.length}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-black via-[#0A1628] to-[#1E3A8A] rounded-xl">
                <Megaphone className="text-white" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-900 text-sm">Active</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{activeAnnouncements.length}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl">
                <CheckCircle className="text-white" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-900 text-sm">High Priority</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{announcements.filter(a => a.priority === 'High' || a.priority === 'Urgent').length}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl">
                <AlertCircle className="text-white" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-900 text-sm">This Week</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">4</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-black via-[#0A1628] to-[#1E3A8A] rounded-xl">
                <Megaphone className="text-white" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Active Announcements */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Announcements</h3>
          <div className="space-y-4">
            {activeAnnouncements.map(announcement => (
              <div key={announcement.id} className={`bg-white rounded-xl shadow-sm border-2 p-6 ${getPriorityColor(announcement.priority)}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 bg-gradient-to-br from-black via-[#0A1628] to-[#1E3A8A] rounded-xl">
                      <Megaphone className="text-white" size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{announcement.title}</h3>
                        {getPriorityIcon(announcement.priority)}
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(announcement.type)}`}>
                          {announcement.type}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-900">
                          {announcement.targetAudience}
                        </span>
                        <span className="text-xs text-gray-600">Posted: {announcement.postedDate}</span>
                        <span className="text-xs text-gray-600">Valid until: {announcement.validUntil}</span>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{announcement.content}</p>
                      <p className="text-sm text-gray-500 mt-3">Posted by {announcement.postedBy}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleOpenModal('view', announcement)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Eye size={18} />
                    </button>
                    <button 
                      onClick={() => handleOpenModal('edit', announcement)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    <button className="p-2 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expired Announcements */}
        {expiredAnnouncements.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Expired Announcements</h3>
            <div className="space-y-3">
              {expiredAnnouncements.map(announcement => (
                <div key={announcement.id} className="bg-gray-50 rounded-xl shadow-sm border border-gray-200 p-4 opacity-60">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{announcement.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">Expired on {announcement.validUntil}</p>
                    </div>
                    <button className="p-2 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <ModalOverlay isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {modalMode === 'add' ? 'Create Announcement' : modalMode === 'edit' ? 'Edit Announcement' : 'Announcement Details'}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {modalMode === 'view' ? (
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedAnnouncement?.title}</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(selectedAnnouncement?.type)}`}>
                      {selectedAnnouncement?.type}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedAnnouncement?.priority)}`}>
                      {selectedAnnouncement?.priority} Priority
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Content</label>
                  <p className="mt-2 text-gray-900 leading-relaxed">{selectedAnnouncement?.content}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Posted By</label>
                    <p className="mt-1 text-gray-900">{selectedAnnouncement?.postedBy}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Posted Date</label>
                    <p className="mt-1 text-gray-900">{selectedAnnouncement?.postedDate}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Valid Until</label>
                    <p className="mt-1 text-gray-900">{selectedAnnouncement?.validUntil}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Target Audience</label>
                    <p className="mt-1 text-gray-900">{selectedAnnouncement?.targetAudience}</p>
                  </div>
                </div>
                <div className="flex justify-end pt-4">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Type</option>
                      {announcementTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority *</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {priorities.map(priority => (
                        <option key={priority} value={priority}>{priority}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Valid Until *</label>
                    <input
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience *</label>
                    <select
                      value={formData.targetAudience}
                      onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {audiences.map(audience => (
                        <option key={audience} value={audience}>{audience}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    rows="6"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  ></textarea>
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
                    {modalMode === 'add' ? 'Create Announcement' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>
      </ModalOverlay>
    </div>
  );
};

export default Announcements;
