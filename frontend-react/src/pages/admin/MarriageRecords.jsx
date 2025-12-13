import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Download, Heart } from 'lucide-react';
import ModalOverlay from '../../components/ModalOverlay';
import { priestService, marriageRecordService } from '../../services/churchService';
import Swal from 'sweetalert2';
import { showDeleteConfirm, showSuccessToast, showErrorToast } from '../../utils/sweetAlertHelper';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Pagination from '../../components/Pagination';
import { formatDate } from '../../utils/dateFormatter';

const MarriageRecords = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [priests, setPriests] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    groom_name: '',
    groom_contact: '',
    bride_name: '',
    bride_contact: '',
    marriage_date: '',
    marriage_time: '10:00',
    marriage_location: '',
    priest_id: '',
    witnesses: '',
  });

  // Fetch priests and records on component mount
  useEffect(() => {
    fetchPriests();
    fetchRecords();
  }, []);

  const fetchPriests = async () => {
    try {
      const response = await priestService.getAll();
      setPriests(response.data || []);
    } catch (err) {
      console.error('Error fetching priests:', err);
    }
  };

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await marriageRecordService.getAll();
      setRecords(response.data || []);
    } catch (err) {
      console.error('Error fetching marriage records:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setModalMode('add');
    setFormData({
      groom_name: '',
      groom_contact: '',
      bride_name: '',
      bride_contact: '',
      marriage_date: '',
      marriage_time: '10:00',
      marriage_location: '',
      priest_id: '',
      witnesses: '',
    });
    setShowModal(true);
  };

  const handleEdit = (record) => {
    setModalMode('edit');
    setFormData({
      id: record.id,
      groom_name: record.groom_name,
      groom_contact: record.groom_contact || '',
      bride_name: record.bride_name,
      bride_contact: record.bride_contact || '',
      marriage_date: record.marriage_date,
      marriage_time: record.marriage_time || '10:00',
      marriage_location: record.marriage_location,
      priest_id: record.priest_id,
      witnesses: record.witnesses || '',
    });
    setShowModal(true);
  };

  const handleView = (record) => {
    setModalMode('view');
    setFormData({
      id: record.id,
      groom_name: record.groom_name,
      groom_contact: record.groom_contact || '',
      bride_name: record.bride_name,
      bride_contact: record.bride_contact || '',
      marriage_date: record.marriage_date,
      marriage_time: record.marriage_time || '10:00',
      marriage_location: record.marriage_location,
      priest_id: record.priest_id,
      witnesses: record.witnesses || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const result = await showDeleteConfirm('Delete Record?', 'Are you sure you want to delete this record?');
    if (result.isConfirmed) {
      try {
        await marriageRecordService.delete(id);
        await fetchRecords();
        showSuccessToast('Deleted!', 'Record has been deleted successfully');
      } catch (err) {
        showErrorToast('Error!', 'Failed to delete record');
        console.error('Error deleting record:', err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (modalMode === 'add') {
        await marriageRecordService.create(formData);
      } else if (modalMode === 'edit') {
        await marriageRecordService.update(formData.id, formData);
      }
      await fetchRecords();
      setShowModal(false);
      showSuccessToast('Success!', `Marriage record ${modalMode === 'edit' ? 'updated' : 'created'} successfully`);
    } catch (err) {
      showErrorToast('Error', 'Failed to save record: ' + (err.response?.data?.message || err.message));
      console.error('Error saving record:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter(record =>
    record.groom_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.bride_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastRecord = currentPage * itemsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - itemsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.setTextColor(70, 103, 207);
    doc.text('Marriage Records', 105, 20, { align: 'center' });
    
    // Add subtitle with date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`, 105, 28, { align: 'center' });
    
    // Prepare table data
    const tableData = filteredRecords.map((record, index) => [
      `MR-${String(record.id).padStart(4, '0')}`,
      record.groom_name,
      record.groom_contact || 'N/A',
      record.bride_name,
      record.bride_contact || 'N/A',
      formatDate(record.marriage_date),
      record.marriage_location,
      priests.find(p => p.id === record.priest_id)?.name || 'N/A',
      record.status || 'pending'
    ]);
    
    // Add table using autoTable
    autoTable(doc, {
      startY: 35,
      head: [['Record #', 'Groom', 'Contact', 'Bride', 'Contact', 'Date', 'Location', 'Priest', 'Status']],
      body: tableData,
      theme: 'striped',
      styles: {
        overflow: 'linebreak',
        cellPadding: 2
      },
      headStyles: {
        fillColor: [70, 103, 207],
        textColor: 255,
        fontSize: 7,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 7,
        textColor: [50, 50, 50]
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250]
      },
      columnStyles: {
        0: { cellWidth: 18, halign: 'center' },
        1: { cellWidth: 22 },
        2: { cellWidth: 16 },
        3: { cellWidth: 22 },
        4: { cellWidth: 16 },
        5: { cellWidth: 18, halign: 'center' },
        6: { cellWidth: 24 },
        7: { cellWidth: 20 },
        8: { cellWidth: 16, halign: 'center' }
      },
      margin: { top: 35, left: 10, right: 10, bottom: 20 }
    });
    
    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
      doc.text(
        'QLPGVMA - Church Records Management System',
        14,
        doc.internal.pageSize.height - 10
      );
    }
    
    // Save the PDF
    doc.save(`Marriage_Records_${new Date().toISOString().split('T')[0]}.pdf`);
    showSuccessToast('Success!', 'Marriage records exported to PDF successfully');
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Search and Actions Bar */}
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by groom or bride name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-600 transition-all text-sm text-slate-900 dark:text-gray-100 placeholder:text-slate-400"
            />
          </div>
          <button 
            onClick={handleExportPDF}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl transition-all font-medium shadow-lg hover:shadow-xl hover:scale-105"
          >
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
              {currentRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-bold text-blue-600 dark:text-blue-400 text-sm">MR-{String(record.id).padStart(4, '0')}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">{record.groom_name}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{record.groom_contact || 'N/A'}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">{record.bride_name}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{record.bride_contact || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{record.marriage_date}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{record.priest?.name || 'N/A'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      record.status === 'completed' 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                        : record.status === 'pending'
                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
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
                    value={formData.groom_name}
                    onChange={(e) => setFormData({...formData, groom_name: e.target.value})}
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
                    value={formData.groom_contact}
                    onChange={(e) => setFormData({...formData, groom_contact: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0912-345-6789"
                    disabled={modalMode === 'view'}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bride's Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.bride_name}
                    onChange={(e) => setFormData({...formData, bride_name: e.target.value})}
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
                    value={formData.bride_contact}
                    onChange={(e) => setFormData({...formData, bride_contact: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0923-456-7890"
                    disabled={modalMode === 'view'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marriage Date
                  </label>
                  <input
                    type="date"
                    value={formData.marriage_date}
                    onChange={(e) => setFormData({...formData, marriage_date: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={modalMode === 'view'}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marriage Time
                  </label>
                  <input
                    type="time"
                    value={formData.marriage_time}
                    onChange={(e) => setFormData({...formData, marriage_time: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={modalMode === 'view'}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marriage Location
                  </label>
                  <input
                    type="text"
                    value={formData.marriage_location}
                    onChange={(e) => setFormData({...formData, marriage_location: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., St. Mary's Cathedral"
                    disabled={modalMode === 'view'}
                    required
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
                    required
                  >
                    <option value="">Select a priest...</option>
                    {priests.map((priest) => (
                      <option key={priest.id} value={priest.id}>
                        {priest.name}
                      </option>
                    ))}
                  </select>
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
  );
};

export default MarriageRecords;
