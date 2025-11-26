import { useState, useEffect } from 'react';
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, Heart, Baby, FileText, User, Calendar, MessageSquare, Download } from 'lucide-react';
import ModalOverlay from '../../components/ModalOverlay';

const ServiceRequests = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const serviceRequests = [
    {
      id: 1,
      type: 'Baptism',
      requester: 'John & Maria Dela Cruz',
      childName: 'Baby Sofia Dela Cruz',
      requestDate: '2025-11-20',
      preferredDate: '2025-12-15',
      status: 'Pending',
      phone: '+63 912 345 6789',
      email: 'john.dc@email.com',
      notes: 'First child, prefer morning ceremony',
      documents: ['Birth Certificate', 'Parents Marriage Certificate']
    },
    {
      id: 2,
      type: 'Wedding',
      requester: 'Pedro Santos & Ana Reyes',
      requestDate: '2025-11-18',
      preferredDate: '2026-02-14',
      status: 'Approved',
      phone: '+63 917 234 5678',
      email: 'pedro.s@email.com',
      notes: 'Valentine\'s Day wedding, outdoor ceremony preferred',
      documents: ['Birth Certificates', 'Baptismal Certificates', 'CENOMAR'],
      assignedPriest: 'Fr. Joseph Smith'
    },
    {
      id: 3,
      type: 'Funeral',
      requester: 'Garcia Family',
      deceasedName: 'Lola Rosa Garcia',
      requestDate: '2025-11-22',
      preferredDate: '2025-11-25',
      status: 'Approved',
      phone: '+63 918 345 6789',
      email: 'garcia.family@email.com',
      notes: 'Traditional mass, burial after',
      documents: ['Death Certificate'],
      assignedPriest: 'Fr. Michael Brown'
    },
    {
      id: 4,
      type: 'First Communion',
      requester: 'Carlos & Linda Mendoza',
      childName: 'Miguel Mendoza',
      requestDate: '2025-11-15',
      preferredDate: '2026-04-12',
      status: 'Pending',
      phone: '+63 919 456 7890',
      email: 'carlos.m@email.com',
      notes: 'Child completed catechism classes',
      documents: ['Baptismal Certificate', 'Birth Certificate']
    },
    {
      id: 5,
      type: 'Confirmation',
      requester: 'Teresa Aquino',
      requestDate: '2025-11-10',
      preferredDate: '2026-05-20',
      status: 'Rejected',
      phone: '+63 920 567 8901',
      email: 'teresa.a@email.com',
      notes: 'Need to complete confirmation classes first',
      documents: ['Baptismal Certificate'],
      rejectionReason: 'Incomplete catechism requirements'
    },
    {
      id: 6,
      type: 'House Blessing',
      requester: 'Flores Family',
      requestDate: '2025-11-23',
      preferredDate: '2025-12-01',
      status: 'Pending',
      phone: '+63 921 678 9012',
      email: 'flores.fam@email.com',
      notes: 'New house, prefer weekend morning',
      documents: []
    },
  ];

  const getServiceIcon = (type) => {
    switch(type) {
      case 'Baptism': return Baby;
      case 'Wedding': return Heart;
      case 'Funeral': return FileText;
      case 'First Communion': return User;
      case 'Confirmation': return User;
      case 'House Blessing': return FileText;
      default: return FileText;
    }
  };

  const filteredRequests = serviceRequests.filter(request => {
    const matchesSearch = request.requester.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || request.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = [
    { label: 'Total Requests', value: serviceRequests.length, color: 'from-black via-[#0A1628] to-[#1E3A8A]' },
    { label: 'Pending', value: serviceRequests.filter(r => r.status === 'Pending').length, color: 'from-amber-500 to-amber-600' },
    { label: 'Approved', value: serviceRequests.filter(r => r.status === 'Approved').length, color: 'from-emerald-500 to-emerald-600' },
    { label: 'Rejected', value: serviceRequests.filter(r => r.status === 'Rejected').length, color: 'from-rose-500 to-rose-600' },
  ];

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const handleApprove = (requestId) => {
    console.log('Approving request:', requestId);
    // Implementation here
  };

  const handleReject = (requestId) => {
    console.log('Rejecting request:', requestId);
    // Implementation here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Service Requests</h1>
          <p className="text-blue-900 mt-1">Manage and approve church service requests</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-blue-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-900 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl`}>
                  <FileText className="text-white" size={24} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-200/50">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by requester or service type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg transition-all ${filterStatus === 'all' ? 'bg-gradient-to-br from-black via-[#0A1628] to-[#1E3A8A] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('Pending')}
                className={`px-4 py-2 rounded-lg transition-all ${filterStatus === 'Pending' ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilterStatus('Approved')}
                className={`px-4 py-2 rounded-lg transition-all ${filterStatus === 'Approved' ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Approved
              </button>
              <button
                onClick={() => setFilterStatus('Rejected')}
                className={`px-4 py-2 rounded-lg transition-all ${filterStatus === 'Rejected' ? 'bg-gradient-to-br from-rose-500 to-rose-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Rejected
              </button>
            </div>
          </div>
        </div>

        {/* Requests Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredRequests.map((request) => {
            const ServiceIcon = getServiceIcon(request.type);
            return (
              <div key={request.id} className="bg-white rounded-xl shadow-sm border border-blue-200/50 p-6 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-black via-[#0A1628] to-[#1E3A8A] rounded-xl">
                      <ServiceIcon className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{request.type}</h3>
                      <p className="text-sm text-gray-600">{request.requester}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    request.status === 'Pending' ? 'bg-amber-100 text-amber-900' :
                    request.status === 'Approved' ? 'bg-emerald-100 text-emerald-900' :
                    'bg-rose-100 text-rose-900'
                  }`}>
                    {request.status}
                  </span>
                </div>

                {(request.childName || request.deceasedName) && (
                  <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-900">
                      <span className="font-medium">Name: </span>
                      {request.childName || request.deceasedName}
                    </p>
                  </div>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={16} />
                    <span>Request Date: {request.requestDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={16} />
                    <span>Preferred Date: {request.preferredDate}</span>
                  </div>
                  {request.assignedPriest && (
                    <div className="flex items-center gap-2 text-sm text-emerald-600">
                      <User size={16} />
                      <span>Assigned: {request.assignedPriest}</span>
                    </div>
                  )}
                </div>

                {request.notes && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{request.notes}</p>
                  </div>
                )}

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => handleViewDetails(request)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <Eye size={16} />
                    View Details
                  </button>
                  {request.status === 'Pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(request.id)}
                        className="px-4 py-2 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all text-sm font-medium flex items-center gap-2"
                      >
                        <CheckCircle size={16} />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(request.id)}
                        className="px-4 py-2 bg-gradient-to-br from-rose-500 to-rose-600 text-white rounded-lg hover:from-rose-600 hover:to-rose-700 transition-all text-sm font-medium flex items-center gap-2"
                      >
                        <XCircle size={16} />
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Details Modal */}
      {showModal && selectedRequest && (
        <ModalOverlay isOpen={showModal && selectedRequest} onClose={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">{selectedRequest.type} Request Details</h2>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700">Requester</label>
                  <p className="mt-1 text-gray-900">{selectedRequest.requester}</p>
                </div>
                {(selectedRequest.childName || selectedRequest.deceasedName) && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      {selectedRequest.childName ? 'Child Name' : 'Deceased Name'}
                    </label>
                    <p className="mt-1 text-gray-900">{selectedRequest.childName || selectedRequest.deceasedName}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-700">Phone</label>
                  <p className="mt-1 text-gray-900">{selectedRequest.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-gray-900">{selectedRequest.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Request Date</label>
                  <p className="mt-1 text-gray-900">{selectedRequest.requestDate}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Preferred Date</label>
                  <p className="mt-1 text-gray-900">{selectedRequest.preferredDate}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <p className="mt-1">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedRequest.status === 'Pending' ? 'bg-amber-100 text-amber-900' :
                      selectedRequest.status === 'Approved' ? 'bg-emerald-100 text-emerald-900' :
                      'bg-rose-100 text-rose-900'
                    }`}>
                      {selectedRequest.status}
                    </span>
                  </p>
                </div>
                {selectedRequest.assignedPriest && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Assigned Priest</label>
                    <p className="mt-1 text-gray-900">{selectedRequest.assignedPriest}</p>
                  </div>
                )}
              </div>

              {selectedRequest.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Notes</label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-900">{selectedRequest.notes}</p>
                  </div>
                </div>
              )}

              {selectedRequest.rejectionReason && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Rejection Reason</label>
                  <div className="mt-2 p-4 bg-rose-50 rounded-lg">
                    <p className="text-rose-900">{selectedRequest.rejectionReason}</p>
                  </div>
                </div>
              )}

              {selectedRequest.documents.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Required Documents</label>
                  <div className="space-y-2">
                    {selectedRequest.documents.map((doc, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                        <FileText size={16} className="text-blue-600" />
                        <span className="text-sm text-blue-900">{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedRequest.status === 'Pending' && (
                <div className="pt-4 border-t border-gray-200">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Assign Priest</label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4">
                    <option value="">Select Priest</option>
                    <option value="Fr. Joseph Smith">Fr. Joseph Smith</option>
                    <option value="Fr. Michael Brown">Fr. Michael Brown</option>
                    <option value="Fr. David Martinez">Fr. David Martinez</option>
                  </select>

                  <label className="text-sm font-medium text-gray-700 mb-2 block">Response Message (Optional)</label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                    rows="3"
                    placeholder="Add any additional notes or instructions..."
                  ></textarea>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
              {selectedRequest.status === 'Pending' && (
                <>
                  <button
                    onClick={() => {
                      handleReject(selectedRequest.id);
                      setShowModal(false);
                    }}
                    className="px-6 py-2 bg-gradient-to-br from-rose-500 to-rose-600 text-white rounded-lg hover:from-rose-600 hover:to-rose-700 transition-all"
                  >
                    Reject Request
                  </button>
                  <button
                    onClick={() => {
                      handleApprove(selectedRequest.id);
                      setShowModal(false);
                    }}
                    className="px-6 py-2 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all"
                  >
                    Approve Request
                  </button>
                </>
              )}
            </div>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
};

export default ServiceRequests;
