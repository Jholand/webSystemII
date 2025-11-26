import { useState } from 'react';
import { Upload, FileText, Download, Search, Filter, Eye, Trash2, File, Folder } from 'lucide-react';
import ModalOverlay from '../../components/ModalOverlay';

const FinancialDocuments = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedFile, setSelectedFile] = useState(null);

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

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = 
      doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || doc.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

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
    handleCloseUploadModal();
  };

  const handleDownload = (document) => {
    alert(`Downloading ${document.fileName}...`);
  };

  const handleView = (document) => {
    alert(`Opening ${document.fileName}...`);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      setDocuments(documents.filter(doc => doc.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              Financial Documents
            </h1>
            <p className="text-blue-900">Store and manage receipts, summaries, budgets, and statements</p>
          </div>
          <button
            onClick={handleOpenUploadModal}
            className="px-5 py-2.5 bg-gradient-to-r from-black via-[#0A1628] to-[#1E3A8A] text-white rounded-lg hover:from-[#1E3A8A] hover:to-blue-700 transition-all shadow-md hover:shadow-lg font-semibold flex items-center gap-2"
          >
            <Upload size={18} />
            Upload Document
          </button>
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Receipts</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{getCategoryCount('Receipts')}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                <FileText className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Financial Summaries</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{getCategoryCount('Financial Summaries')}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-black via-[#0A1628] to-[#1E3A8A]">
                <File className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Approved Budgets</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{getCategoryCount('Approved Budgets')}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
                <Folder className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Statements</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{getCategoryCount('Statements')}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500">
                <FileText className="text-white" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search documents by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
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
        <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">File Name</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Upload Date</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Size</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Uploaded By</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDocuments.map((document) => (
                  <tr key={document.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText size={18} className="text-blue-600" />
                        <span className="text-sm font-semibold text-gray-900">{document.fileName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                        document.category === 'Receipts' 
                          ? 'bg-blue-100 text-blue-700 border-blue-200' 
                          : document.category === 'Financial Summaries'
                          ? 'bg-purple-100 text-purple-700 border-purple-200'
                          : document.category === 'Approved Budgets'
                          ? 'bg-green-100 text-green-700 border-green-200'
                          : 'bg-orange-100 text-orange-700 border-orange-200'
                      }`}>
                        {document.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{document.description}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{document.uploadDate}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{document.size}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{document.uploadedBy}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(document)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="View"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleDownload(document)}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                          title="Download"
                        >
                          <Download size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(document.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
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
      </div>

      {/* Upload Modal */}
      <ModalOverlay isOpen={showUploadModal} onClose={handleCloseUploadModal}>
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Upload Financial Document</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select File</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="e.g., Receipt_INV-001_Wedding.pdf"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  required
                  placeholder="Brief description of the document"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-black via-[#0A1628] to-[#1E3A8A] text-white rounded-lg hover:shadow-xl transition-all font-semibold"
                >
                  Upload Document
                </button>
                <button
                  type="button"
                  onClick={handleCloseUploadModal}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-semibold"
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
