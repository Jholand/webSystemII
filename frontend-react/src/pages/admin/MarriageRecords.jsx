import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Download, Heart } from 'lucide-react';
import ModalOverlay from '../../components/ModalOverlay';

const MarriageRecords = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  
  const [records, setRecords] = useState([
    {
      id: 1,
      groomName: 'Michael James Anderson',
      groomContact: '0912-345-6789',
      brideName: 'Sarah Elizabeth Johnson',
      brideContact: '0923-456-7890',
      marriageDate: '2025-06-15',
      venue: 'St. Mary\'s Cathedral',
      priest: 'Fr. Joseph Smith',
      witnesses: 'John Doe, Jane Smith',
      status: 'Complete',
    },
    {
      id: 2,
      groomName: 'Robert David Wilson',
      groomContact: '0934-567-8901',
      brideName: 'Emily Grace Brown',
      brideContact: '0945-678-9012',
      marriageDate: '2025-08-22',
      venue: 'Holy Cross Church',
      priest: 'Fr. Michael Thompson',
      witnesses: 'Tom Wilson, Lisa Brown',
      status: 'Complete',
    },
    {
      id: 3,
      groomName: 'William Thomas Martinez',
      groomContact: '0956-789-0123',
      brideName: 'Jessica Anne Taylor',
      brideContact: '0967-890-1234',
      marriageDate: '2025-12-10',
      venue: 'St. Paul\'s Church',
      priest: 'Fr. Joseph Smith',
      witnesses: 'Pending',
      status: 'Pending',
    },
  ]);

  const [formData, setFormData] = useState({
    groomName: '',
    groomContact: '',
    brideName: '',
    brideContact: '',
    marriageDate: '',
    venue: '',
    priest: '',
    witnesses: '',
  });

  const handleAddNew = () => {
    setModalMode('add');
    setFormData({
      groomName: '',
      groomContact: '',
      brideName: '',
      brideContact: '',
      marriageDate: '',
      venue: '',
      priest: '',
      witnesses: '',
    });
    setShowModal(true);
  };

  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData(record);
    setShowModal(true);
  };

  const handleView = (record) => {
    setModalMode('view');
    setFormData(record);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this record?')) {
      setRecords(records.filter(r => r.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modalMode === 'add') {
      setRecords([...records, { ...formData, id: records.length + 1, status: 'Complete' }]);
    } else if (modalMode === 'edit') {
      setRecords(records.map(r => r.id === formData.id ? formData : r));
    }
    setShowModal(false);
  };

  const filteredRecords = records.filter(record =>
    record.groomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.brideName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.venue.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-gray-100 dark:from-gray-900 dark:via-blue-950 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in-down">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Marriage Records</h1>
            <p className="text-blue-900 dark:text-gray-400 text-sm mt-1">Manage marriage ceremonies</p>
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-gradient-to-r from-black via-[#0A1628] to-[#1E3A8A] hover:from-[#1E3A8A] hover:to-blue-700 text-white px-4 py-2 rounded-lg hover:shadow-xl hover:shadow-blue-900/50 transition-all font-medium text-sm hover:scale-105"
          >
            <Plus size={20} />
            Add New Record
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by groom, bride, or venue..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all text-sm text-slate-900 placeholder:text-slate-400"
            />
          </div>
          <button className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl transition-all font-semibold shadow-lg hover:shadow-xl hover:scale-105">
            <Download size={20} />
            Export
          </button>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Record #
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Groom
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Bride
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Marriage Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Venue
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Priest
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-bold text-blue-600 dark:text-blue-400 text-sm">MR-{String(record.id).padStart(4, '0')}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">{record.groomName}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{record.groomContact}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">{record.brideName}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{record.brideContact}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{record.marriageDate}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{record.venue}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{record.priest}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      record.status === 'Complete' 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                        : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleView(record)}
                        className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                        title="View"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEdit(record)}
                        className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <ModalOverlay isOpen={showModal} onClose={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border-2 border-blue-500 ring-4 ring-blue-500/30 shadow-blue-500/50">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                {modalMode === 'add' ? 'Add New Marriage Record' : modalMode === 'edit' ? 'Edit Marriage Record' : 'View Marriage Record'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Groom's Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.groomName}
                    onChange={(e) => setFormData({...formData, groomName: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={modalMode === 'view'}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Groom's Contact Number
                  </label>
                  <input
                    type="tel"
                    value={formData.groomContact}
                    onChange={(e) => setFormData({...formData, groomContact: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0912-345-6789"
                    disabled={modalMode === 'view'}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bride's Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.brideName}
                    onChange={(e) => setFormData({...formData, brideName: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={modalMode === 'view'}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bride's Contact Number
                  </label>
                  <input
                    type="tel"
                    value={formData.brideContact}
                    onChange={(e) => setFormData({...formData, brideContact: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0923-456-7890"
                    disabled={modalMode === 'view'}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marriage Date
                  </label>
                  <input
                    type="date"
                    value={formData.marriageDate}
                    onChange={(e) => setFormData({...formData, marriageDate: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={modalMode === 'view'}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Venue
                  </label>
                  <input
                    type="text"
                    value={formData.venue}
                    onChange={(e) => setFormData({...formData, venue: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={modalMode === 'view'}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Officiating Priest
                  </label>
                  <input
                    type="text"
                    value={formData.priest}
                    onChange={(e) => setFormData({...formData, priest: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={modalMode === 'view'}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Witnesses
                  </label>
                  <input
                    type="text"
                    value={formData.witnesses}
                    onChange={(e) => setFormData({...formData, witnesses: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Comma-separated names"
                    disabled={modalMode === 'view'}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {modalMode === 'view' ? 'Close' : 'Cancel'}
                </button>
                {modalMode !== 'view' && (
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-blue-500/50"
                  >
                    {modalMode === 'add' ? 'Add Record' : 'Save Changes'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </ModalOverlay>
      )}
      </div>
    </div>
  );
};

export default MarriageRecords;
