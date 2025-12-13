import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Download } from 'lucide-react';
import ModalOverlay from '../../components/ModalOverlay';
import Swal from 'sweetalert2';
import { showDeleteConfirm, showSuccessToast, showErrorToast } from '../../utils/sweetAlertHelper';
import { priestService, baptismRecordService } from '../../services/churchService';
import Pagination from '../../components/Pagination';
import { formatDate } from '../../utils/dateFormatter';

const BirthRecords = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'edit', 'view'
  const [priests, setPriests] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    child_name: '',
    date_of_birth: '',
    place_of_birth: '',
    gender: '',
    father_name: '',
    mother_name: '',
    baptism_date: '',
    priest_id: '',
    godfather_name: '',
    godmother_name: '',
    remarks: '',
  });

  // Fetch priests and records on component mount
  useEffect(() => {
    fetchPriests();
    fetchRecords();
  }, []);

  const fetchPriests = async () => {
    try {
      const data = await priestService.getAll();
      setPriests(data);
    } catch (err) {
      console.error('Error fetching priests:', err);
      showErrorToast('Error', 'Failed to load priests');
    }
  };

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const data = await baptismRecordService.getAll();
      setRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching baptism records:', err);
      showErrorToast('Error', 'Failed to load baptism records');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setModalMode('add');
    setFormData({
      child_name: '',
      date_of_birth: '',
      place_of_birth: '',
      gender: '',
      father_name: '',
      mother_name: '',
      baptism_date: '',
      priest_id: '',
      godfather_name: '',
      godmother_name: '',
      remarks: '',
    });
    setShowModal(true);
  };

  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({
      id: record.id,
      child_name: record.child_name,
      date_of_birth: record.date_of_birth,
      place_of_birth: record.place_of_birth || '',
      gender: record.gender,
      father_name: record.father_name,
      mother_name: record.mother_name,
      baptism_date: record.baptism_date,
      priest_id: record.priest_id,
      godfather_name: record.godfather_name || '',
      godmother_name: record.godmother_name || '',
      remarks: record.remarks || '',
    });
    setShowModal(true);
  };

  const handleView = (record) => {
    setModalMode('view');
    setFormData({
      id: record.id,
      child_name: record.child_name,
      date_of_birth: record.date_of_birth,
      place_of_birth: record.place_of_birth || '',
      gender: record.gender,
      father_name: record.father_name,
      mother_name: record.mother_name,
      baptism_date: record.baptism_date,
      priest_id: record.priest_id,
      godfather_name: record.godfather_name || '',
      godmother_name: record.godmother_name || '',
      remarks: record.remarks || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const result = await showDeleteConfirm('Delete Baptism Record?', 'This action cannot be undone!');
    if (result.isConfirmed) {
      try {
        await baptismRecordService.delete(id);
        await fetchRecords();
        showSuccessToast('Deleted!', 'Baptism record has been deleted successfully');
      } catch (err) {
        console.error('Error deleting record:', err);
        showErrorToast('Error', 'Failed to delete baptism record');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (modalMode === 'add') {
        await baptismRecordService.create(formData);
      } else if (modalMode === 'edit') {
        await baptismRecordService.update(formData.id, formData);
      }
      setShowModal(false);
      await fetchRecords();
      showSuccessToast('Success!', `Baptism record has been ${modalMode === 'edit' ? 'updated' : 'created'} successfully`);
    } catch (err) {
      console.error('Error saving record:', err);
      showErrorToast('Error', 'Failed to save baptism record');
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = Array.isArray(records) ? records.filter(record =>
    record.child_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.father_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.mother_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  // Pagination logic
  const indexOfLastRecord = currentPage * itemsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - itemsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Search and Actions Bar */}
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 relative w-full">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by child name, father, or mother..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
            />
          </div>
          <button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl transition-all font-medium shadow-lg hover:shadow-xl hover:scale-105">
            <Download size={20} />
            Export
          </button>
        </div>
      </div>

      {/* Records Table */}
      <div className="flex-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto h-full">
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
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    Loading records...
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    No records found
                  </td>
                </tr>
              ) : (
                currentRecords.map((record) => {
                  const priest = priests.find(p => p.id === record.priest_id);
                  const status = record.baptism_date && record.baptism_date !== 'Pending' ? 'Complete' : 'Pending';
                  
                  return (
                    <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">{record.child_name}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-blue-900 dark:text-gray-400">
                        {formatDate(record.date_of_birth)}
                      </td>
                      <td className="px-4 py-3 text-sm text-blue-900 dark:text-gray-400">{record.gender}</td>
                      <td className="px-4 py-3">
                        <div className="text-gray-900 dark:text-gray-100 font-medium text-sm">{record.father_name}</div>
                        <div className="text-blue-900 dark:text-gray-400 text-xs">{record.mother_name}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-blue-900 dark:text-gray-400">
                        {record.baptism_date ? formatDate(record.baptism_date) : 'Pending'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          status === 'Complete' 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                            : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                        }`}>
                          {status}
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
                  );
                })
              )}
            </tbody>
          </table>
          <Pagination
            currentPage={currentPage}
            totalItems={filteredRecords.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(value) => {
              setItemsPerPage(value);
              setCurrentPage(1);
            }}
          />
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
                    Child Name *
                  </label>
                  <input
                    type="text"
                    value={formData.child_name}
                    onChange={(e) => setFormData({...formData, child_name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={modalMode === 'view'}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={modalMode === 'view'}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Place of Birth
                  </label>
                  <input
                    type="text"
                    value={formData.place_of_birth}
                    onChange={(e) => setFormData({...formData, place_of_birth: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={modalMode === 'view'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender *
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
                    Father's Name *
                  </label>
                  <input
                    type="text"
                    value={formData.father_name}
                    onChange={(e) => setFormData({...formData, father_name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={modalMode === 'view'}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mother's Name *
                  </label>
                  <input
                    type="text"
                    value={formData.mother_name}
                    onChange={(e) => setFormData({...formData, mother_name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={modalMode === 'view'}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Godfather's Name
                  </label>
                  <input
                    type="text"
                    value={formData.godfather_name}
                    onChange={(e) => setFormData({...formData, godfather_name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={modalMode === 'view'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Godmother's Name
                  </label>
                  <input
                    type="text"
                    value={formData.godmother_name}
                    onChange={(e) => setFormData({...formData, godmother_name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={modalMode === 'view'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Baptism Date
                  </label>
                  <input
                    type="date"
                    value={formData.baptism_date}
                    onChange={(e) => setFormData({...formData, baptism_date: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={modalMode === 'view'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Officiating Priest
                  </label>
                  <select
                    value={formData.priest_id}
                    onChange={(e) => setFormData({...formData, priest_id: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={modalMode === 'view'}
                  >
                    <option value="">Select Priest</option>
                    {priests.map(priest => (
                      <option key={priest.id} value={priest.id}>
                        {priest.first_name} {priest.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remarks
                  </label>
                  <textarea
                    value={formData.remarks}
                    onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={modalMode === 'view'}
                    rows="3"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  {modalMode === 'view' ? 'Close' : 'Cancel'}
                </button>
                {modalMode !== 'view' && (
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 text-white rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#4158D0' }}
                  >
                    {loading ? 'Saving...' : modalMode === 'add' ? 'Add Record' : 'Save Changes'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
};

export default BirthRecords;
