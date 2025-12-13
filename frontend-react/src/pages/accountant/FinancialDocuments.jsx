import { useState, useEffect } from 'react';
import { Upload, FileText, Download, Search, Filter, Eye, Trash2, File, Folder } from 'lucide-react';
import ModalOverlay from '../../components/ModalOverlay';
import Pagination from '../../components/Pagination';
import { showInfoToast, showSuccessToast } from '../../utils/sweetAlertHelper';

const FinancialDocuments = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    fileName: '',
    category: '',
    description: '',
    file: null
  });

  const [documents, setDocuments] = useState([
    { id: 1, fileName: 'Receipt_INV-001_Wedding.pdf', category: 'Receipts', uploadDate: '2025-11-23', size: '245 KB', uploadedBy: 'Accountant', description: 'Wedding ceremony payment receipt' },
    { id: 2, fileName: 'November_2025_Summary.xlsx', category: 'Financial Summaries', uploadDate: '2025-11-22', size: '1.2 MB', uploadedBy: 'Accountant', description: 'Monthly financial summary' },
    { id: 3, fileName: '2026_Annual_Budget.pdf', category: 'Approved Budgets', uploadDate: '2025-11-20', size: '850 KB', uploadedBy: 'Admin', description: '2026 church annual budget' },
    { id: 4, fileName: 'Bank_Statement_Oct_2025.pdf', category: 'Statements', uploadDate: '2025-11-15', size: '680 KB', uploadedBy: 'Accountant', description: 'October bank statement' },
    { id: 5, fileName: 'Receipt_INV-002_Baptism.pdf', category: 'Receipts', uploadDate: '2025-11-21', size: '198 KB', uploadedBy: 'Accountant', description: 'Baptism service receipt' },
    { id: 6, fileName: 'Q3_2025_Financial_Report.pdf', category: 'Financial Summaries', uploadDate: '2025-10-05', size: '1.5 MB', uploadedBy: 'Accountant', description: 'Third quarter report' },
    { id: 7, fileName: 'Building_Fund_Budget_2025.xlsx', category: 'Approved Budgets', uploadDate: '2025-09-12', size: '420 KB', uploadedBy: 'Admin', description: 'Building renovation budget' },
    { id: 8, fileName: 'Bank_Statement_Nov_2025.pdf', category: 'Statements', uploadDate: '2025-11-23', size: '720 KB', uploadedBy: 'Accountant', description: 'November bank statement' },
  ]);

  // Load receipts from localStorage on mount
  useEffect(() => {
    loadReceiptsFromStorage();
  }, []);

  const loadReceiptsFromStorage = () => {
    try {
      const savedReceipts = JSON.parse(localStorage.getItem('financialDocuments') || '[]');
      if (savedReceipts.length > 0) {
        setDocuments(prevDocs => {
          const existingFileNames = prevDocs.map(d => d.fileName);
          const newReceipts = savedReceipts
            .filter(r => !existingFileNames.includes(r.fileName))
            .map((r, index) => ({
              id: prevDocs.length + index + 1,
              fileName: r.fileName,
              category: r.category,
              uploadDate: r.uploadDate,
              size: '150 KB',
              uploadedBy: r.uploadedBy,
              description: r.description
            }));
          return [...newReceipts, ...prevDocs];
        });
      }
    } catch (error) {
      console.error('Error loading receipts:', error);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = 
      doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || doc.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDocuments = filteredDocuments.slice(indexOfFirstItem, indexOfLastItem);

  const getCategoryCount = (category) => {
    return documents.filter(doc => doc.category === category).length;
  };

  const handleOpenUploadModal = () => {
    setFormData({
      fileName: '',
      category: '',
      description: '',
      file: null
    });
    setShowUploadModal(true);
  };

  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
    setFormData({
      fileName: '',
      category: '',
      description: '',
      file: null
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        file: file,
        fileName: file.name
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newDocument = {
      id: documents.length + 1,
      fileName: formData.fileName,
      category: formData.category,
      uploadDate: new Date().toISOString().split('T')[0],
      size: '0 KB',
      uploadedBy: 'Accountant',
      description: formData.description
    };
    setDocuments([newDocument, ...documents]);
    showSuccessToast('Success', 'Document uploaded successfully');
    handleCloseUploadModal();
  };

  const handleDownload = (document) => {
    showInfoToast('Downloading', `Downloading ${document.fileName}`);
  };

  const handleView = (document) => {
    showInfoToast('Opening', `Opening ${document.fileName}`);
  };

  const handleDelete = async (id) => {
    const result = await showDeleteConfirm('Delete Document?', 'This action cannot be undone!');
    if (result.isConfirmed) {
      setDocuments(documents.filter(doc => doc.id !== id));
      showSuccessToast('Deleted!', 'Document has been deleted successfully');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#4158D0' }}>
                Financial Documents
              </h1>
              <p className="text-gray-600 text-sm mt-1">Store and manage receipts, summaries, budgets, and statements</p>
            </div>
            <button
              onClick={handleOpenUploadModal}
              className="flex items-center gap-2 px-5 py-3 text-white rounded-lg shadow-lg hover:opacity-90 transition-all font-semibold"
              style={{ 
                background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
                boxShadow: '0 4px 12px rgba(65, 88, 208, 0.3)'
              }}
            >
              <Upload size={18} />
              Upload Document
            </button>
          </div>
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border border-gray-200 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-50 to-transparent rounded-full transform translate-x-8 -translate-y-8 opacity-50"></div>
            <div className="relative flex items-start justify-between mb-3">
              <div className="p-3 rounded-xl shadow-lg transform group-hover:scale-110 transition-transform" style={{ 
                background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
                boxShadow: '0 4px 12px rgba(65, 88, 208, 0.3)'
              }}>
                <FileText size={22} className="text-white" />
              </div>
            </div>
            <div className="relative">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">{getCategoryCount('Receipts')}</h3>
              <p className="text-sm font-medium text-gray-600">Receipts</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border border-gray-200 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-50 to-transparent rounded-full transform translate-x-8 -translate-y-8 opacity-50"></div>
            <div className="relative flex items-start justify-between mb-3">
              <div className="p-3 rounded-xl shadow-lg transform group-hover:scale-110 transition-transform" style={{ 
                background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
                boxShadow: '0 4px 12px rgba(65, 88, 208, 0.3)'
              }}>
                <File size={22} className="text-white" />
              </div>
            </div>
            <div className="relative">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">{getCategoryCount('Financial Summaries')}</h3>
              <p className="text-sm font-medium text-gray-600">Financial Summaries</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border border-purple-100 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-50 to-transparent rounded-full transform translate-x-8 -translate-y-8 opacity-50"></div>
            <div className="relative flex items-start justify-between mb-3">
              <div className="p-3 rounded-xl shadow-lg transform group-hover:scale-110 transition-transform" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}>
                <Folder size={22} className="text-white" />
              </div>
            </div>
            <div className="relative">
              <p className="text-gray-600 text-xs font-medium mb-1">Approved Budgets</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">{getCategoryCount('Approved Budgets')}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border border-purple-100 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-50 to-transparent rounded-full transform translate-x-8 -translate-y-8 opacity-50"></div>
            <div className="relative flex items-start justify-between mb-3">
              <div className="p-3 rounded-xl shadow-lg transform group-hover:scale-110 transition-transform" style={{ background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)' }}>
                <FileText size={22} className="text-white" />
              </div>
            </div>
            <div className="relative">
              <p className="text-gray-600 text-xs font-medium mb-1">Statements</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">{getCategoryCount('Statements')}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border-2 border-purple-100 rounded-2xl p-5 shadow-lg">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search documents by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2.5 text-sm border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="Receipts">Receipts</option>
              <option value="Financial Summaries">Financial Summaries</option>
              <option value="Approved Budgets">Approved Budgets</option>
              <option value="Statements">Statements</option>
            </select>
          </div>
        </div>

        {/* Documents Table */}
        <div className="bg-white border-2 border-purple-100 rounded-2xl shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-50 to-blue-50 border-b-2 border-purple-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-purple-700 uppercase">File Name</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-purple-700 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-purple-700 uppercase">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-purple-700 uppercase">Upload Date</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-purple-700 uppercase">Size</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-purple-700 uppercase">Uploaded By</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-purple-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-100">
                {currentDocuments.map((document) => (
                  <tr key={document.id} className="hover:bg-purple-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-purple-600" />
                        <span className="text-sm font-medium text-gray-900">{document.fileName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs font-medium rounded bg-purple-100 text-purple-800">
                        {document.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{document.description}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{document.uploadDate}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{document.size}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{document.uploadedBy}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleView(document)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDownload(document)}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                          title="Download"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(document.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
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

          {filteredDocuments.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <FileText size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No documents found</p>
            </div>
          )}
        </div>
        
        {/* Pagination */}
        {currentDocuments.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={filteredDocuments.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        )}
      </div>

      {/* Upload Modal */}
      <ModalOverlay isOpen={showUploadModal} onClose={handleCloseUploadModal}>
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold" style={{ color: '#4667CF' }}>Upload Financial Document</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select File</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 text-sm border rounded-lg focus:ring-2 focus:outline-none"
                  style={{ borderColor: '#D9DBEF' }}
                  required
                  accept=".pdf,.xlsx,.xls,.doc,.docx"
                />
                <p className="text-xs text-gray-500 mt-1">Supported formats: PDF, Excel, Word</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">File Name</label>
                <input
                  type="text"
                  value={formData.fileName}
                  onChange={(e) => setFormData({...formData, fileName: e.target.value})}
                  className="w-full px-4 py-2 text-sm border rounded-lg focus:ring-2 focus:outline-none"
                  style={{ borderColor: '#D9DBEF' }}
                  required
                  placeholder="e.g., Receipt_INV-001_Wedding.pdf"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-2 text-sm border rounded-lg focus:ring-2 focus:outline-none"
                  style={{ borderColor: '#D9DBEF' }}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Receipts">Receipts</option>
                  <option value="Financial Summaries">Financial Summaries</option>
                  <option value="Approved Budgets">Approved Budgets</option>
                  <option value="Statements">Statements</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 text-sm border rounded-lg focus:ring-2 focus:outline-none"
                  style={{ borderColor: '#D9DBEF' }}
                  rows="3"
                  required
                  placeholder="Brief description of the document"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 text-white rounded-lg hover:opacity-90 transition-all font-semibold text-sm"
                  style={{ backgroundColor: '#4158D0' }}
                >
                  Upload Document
                </button>
                <button
                  type="button"
                  onClick={handleCloseUploadModal}
                  className="px-6 py-3 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all font-semibold text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
      </ModalOverlay>
    </div>
  );
};

export default FinancialDocuments;
