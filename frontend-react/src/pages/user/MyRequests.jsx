import { useState, useEffect } from 'react';
import { Search, Filter, Eye, Clock, CheckCircle, XCircle, Plus, Calendar, Baby, Heart, Church, MessageSquare, FileText } from 'lucide-react';
import ModalOverlay from '../../components/ModalOverlay';

const MyRequests = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    if (showRequestModal) {
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
  }, [showRequestModal]);

  const myRequests = [
    {
      id: 1,
      type: 'Baptism',
      childName: 'Baby Sofia Reyes',
      requestDate: '2025-11-20',
      preferredDate: '2025-12-15',
      status: 'Approved',
      priest: 'Fr. Joseph Smith',
      notes: 'All documents verified. Please arrive 30 minutes early.',
      documents: ['Birth Certificate', 'Marriage Certificate of Parents']
    },
    {
      id: 2,
      type: 'Wedding',
      coupleName: 'John & Maria Santos',
      requestDate: '2025-11-18',
      preferredDate: '2026-02-14',
      status: 'Pending',
      priest: 'Not yet assigned',
      notes: 'Awaiting completion of pre-cana seminar documents.',
      documents: ['Birth Certificates', 'Baptismal Certificates', 'Confirmation Certificates']
    },
    {
      id: 3,
      type: 'Counseling',
      requestDate: '2025-11-15',
      preferredDate: '2025-11-28',
      status: 'Approved',
      priest: 'Fr. Michael Brown',
      notes: 'Scheduled for November 28, 2025 at 10:00 AM',
      concern: 'Marriage counseling'
    },
    {
      id: 4,
      type: 'Funeral',
      deceasedName: 'Rosa Martinez',
      requestDate: '2025-11-10',
      preferredDate: '2025-11-12',
      status: 'Completed',
      priest: 'Fr. Joseph Smith',
      notes: 'Service completed successfully.',
      documents: ['Death Certificate', 'Baptismal Certificate']
    }
  ];

  const stats = [
    { label: 'Total Requests', value: myRequests.length, icon: FileText, color: 'from-blue-500 to-blue-600' },
    { label: 'Pending', value: myRequests.filter(r => r.status === 'Pending').length, icon: Clock, color: 'from-amber-500 to-amber-600' },
    { label: 'Approved', value: myRequests.filter(r => r.status === 'Approved').length, icon: CheckCircle, color: 'from-emerald-500 to-emerald-600' },
    { label: 'Completed', value: myRequests.filter(r => r.status === 'Completed').length, icon: CheckCircle, color: 'from-purple-500 to-purple-600' }
  ];

  const filteredRequests = myRequests.filter(request => {
    const matchesSearch = 
      (request.childName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (request.coupleName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (request.deceasedName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      request.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Approved': return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'Completed': return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'Rejected': return 'bg-rose-100 text-rose-900 border-rose-300';
      default: return 'bg-gray-100 text-gray-900 border-gray-300';
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'Baptism': return <Baby className="text-blue-600" size={20} />;
      case 'Wedding': return <Heart className="text-rose-600" size={20} />;
      case 'Funeral': return <Church className="text-gray-600" size={20} />;
      case 'Counseling': return <MessageSquare className="text-purple-600" size={20} />;
      default: return <FileText className="text-gray-600" size={20} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Requests</h1>
          <p className="text-gray-600 mt-1">Track and manage your service requests</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl`}>
                  <stat.icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('Pending')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterStatus === 'Pending' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilterStatus('Approved')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterStatus === 'Approved' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Approved
              </button>
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all cursor-pointer"
              onClick={() => {
                setSelectedRequest(request);
                setShowRequestModal(true);
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    {getTypeIcon(request.type)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{request.type}</h3>
                    <p className="text-sm text-gray-600">ID: #{request.id}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusColor(request.status)}`}>
                  {request.status}
                </span>
              </div>

              <div className="space-y-2">
                {request.childName && (
                  <p className="text-sm text-gray-700"><span className="font-medium">Child:</span> {request.childName}</p>
                )}
                {request.coupleName && (
                  <p className="text-sm text-gray-700"><span className="font-medium">Couple:</span> {request.coupleName}</p>
                )}
                {request.deceasedName && (
                  <p className="text-sm text-gray-700"><span className="font-medium">Deceased:</span> {request.deceasedName}</p>
                )}
                {request.concern && (
                  <p className="text-sm text-gray-700"><span className="font-medium">Concern:</span> {request.concern}</p>
                )}
                
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-3">
                  <Calendar size={14} />
                  <span>Requested: {request.requestDate}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={14} />
                  <span>Preferred: {request.preferredDate}</span>
                </div>
                
                {request.priest && (
                  <p className="text-sm text-gray-700 mt-2">
                    <span className="font-medium">Priest:</span> {request.priest}
                  </p>
                )}
              </div>

              <button className="mt-4 w-full py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium flex items-center justify-center gap-2">
                <Eye size={16} />
                View Details
              </button>
            </div>
          ))}
        </div>

        {filteredRequests.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <FileText className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No requests found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* View Request Modal */}
      {showRequestModal && selectedRequest && (
        <ModalOverlay isOpen={showRequestModal} onClose={() => setShowRequestModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-blue-500 ring-4 ring-blue-500/30">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getTypeIcon(selectedRequest.type)}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedRequest.type} Request</h2>
                    <p className="text-sm text-gray-600">Request ID: #{selectedRequest.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle className="text-gray-500" size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Request Date</label>
                  <p className="text-gray-900">{selectedRequest.requestDate}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
                  <p className="text-gray-900">{selectedRequest.preferredDate}</p>
                </div>
              </div>

              {selectedRequest.childName && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Child Name</label>
                  <p className="text-gray-900">{selectedRequest.childName}</p>
                </div>
              )}
              {selectedRequest.coupleName && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Couple Names</label>
                  <p className="text-gray-900">{selectedRequest.coupleName}</p>
                </div>
              )}
              {selectedRequest.deceasedName && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deceased Name</label>
                  <p className="text-gray-900">{selectedRequest.deceasedName}</p>
                </div>
              )}
              {selectedRequest.concern && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Concern</label>
                  <p className="text-gray-900">{selectedRequest.concern}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <span className={`inline-block px-3 py-1 text-sm font-bold rounded-full border ${getStatusColor(selectedRequest.status)}`}>
                  {selectedRequest.status}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Priest</label>
                <p className="text-gray-900">{selectedRequest.priest}</p>
              </div>

              {selectedRequest.documents && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Required Documents</label>
                  <div className="space-y-2">
                    {selectedRequest.documents.map((doc, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                        <FileText size={16} className="text-blue-600" />
                        {doc}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedRequest.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-gray-900">{selectedRequest.notes}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
};

export default MyRequests;
