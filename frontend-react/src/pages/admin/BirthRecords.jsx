import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Download } from 'lucide-react';
import ModalOverlay from '../../components/ModalOverlay';

const BirthRecords = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'edit', 'view'
  
  const [records, setRecords] = useState([
    {
      id: 1,
      childName: 'John Michael Doe',
      dateOfBirth: '2025-01-15',
      gender: 'Male',
      father: 'Michael Doe',
      mother: 'Jane Doe',
      baptismDate: '2025-02-20',
      priest: 'Fr. Joseph Smith',
      status: 'Complete',
    },
    {
      id: 2,
      childName: 'Emily Grace Brown',
      dateOfBirth: '2025-03-22',
      gender: 'Female',
      father: 'Robert Brown',
      mother: 'Sarah Brown',
      baptismDate: '2025-04-10',
      priest: 'Fr. Joseph Smith',
      status: 'Complete',
    },
    {
      id: 3,
      childName: 'James William Wilson',
      dateOfBirth: '2025-05-08',
      gender: 'Male',
      father: 'William Wilson',
      mother: 'Lisa Wilson',
      baptismDate: 'Pending',
      priest: '-',
      status: 'Pending',
    },
  ]);

  const [formData, setFormData] = useState({
    childName: '',
    dateOfBirth: '',
    gender: '',
    father: '',
    mother: '',
    baptismDate: '',
    priest: '',
  });

  const handleAddNew = () => {
    setModalMode('add');
    setFormData({
      childName: '',
      dateOfBirth: '',
      gender: '',
      father: '',
      mother: '',
      baptismDate: '',
      priest: '',
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
    record.childName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.father.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.mother.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-gray-100 dark:from-gray-900 dark:via-blue-950 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in-down">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Birth Records</h1>
            <p className="text-blue-900 dark:text-gray-400 text-sm mt-1">Manage birth and baptism records</p>
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
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by child name, father, or mother..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
              />
            </div>
            <button className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl transition-all font-semibold shadow-lg hover:shadow-xl hover:scale-105">
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
                  <th className="px-4 py-3 text-left text-xs font-semibold text-blue-900 dark:text-gray-400 uppercase">
                    Child Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-blue-900 dark:text-gray-400 uppercase">
                  Date of Birth
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-blue-900 dark:text-gray-400 uppercase">
                    Gender
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-blue-900 dark:text-gray-400 uppercase">
                    Parents
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-blue-900 dark:text-gray-400 uppercase">
                    Baptism Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-blue-900 dark:text-gray-400 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-blue-900 dark:text-gray-400 uppercase">
                    Actions
                  </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">{record.childName}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-blue-900 dark:text-gray-400">{record.dateOfBirth}</td>
                  <td className="px-4 py-3 text-sm text-blue-900 dark:text-gray-400">{record.gender}</td>
                  <td className="px-4 py-3">
                    <div className="text-gray-900 dark:text-gray-100 font-medium text-sm">{record.father}</div>
                    <div className="text-blue-900 dark:text-gray-400 text-xs">{record.mother}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-blue-900 dark:text-gray-400">{record.baptismDate}</td>
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
                {modalMode === 'add' ? 'Add New Birth Record' : modalMode === 'edit' ? 'Edit Birth Record' : 'View Birth Record'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Child Name
                  </label>
                  <input
                    type="text"
                    value={formData.childName}
                    onChange={(e) => setFormData({...formData, childName: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={modalMode === 'view'}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={modalMode === 'view'}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={modalMode === 'view'}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Father's Name
                  </label>
                  <input
                    type="text"
                    value={formData.father}
                    onChange={(e) => setFormData({...formData, father: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={modalMode === 'view'}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mother's Name
                  </label>
                  <input
                    type="text"
                    value={formData.mother}
                    onChange={(e) => setFormData({...formData, mother: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={modalMode === 'view'}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Baptism Date
                  </label>
                  <input
                    type="date"
                    value={formData.baptismDate}
                    onChange={(e) => setFormData({...formData, baptismDate: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={modalMode === 'view'}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Officiating Priest
                  </label>
                  <input
                    type="text"
                    value={formData.priest}
                    onChange={(e) => setFormData({...formData, priest: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-black via-[#0A1628] to-[#1E3A8A] text-white rounded-lg font-medium hover:from-[#1E3A8A] hover:to-blue-700 transition-all shadow-lg hover:shadow-blue-900/50"
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

export default BirthRecords;
