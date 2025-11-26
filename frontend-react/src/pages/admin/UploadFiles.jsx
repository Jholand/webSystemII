import { useState } from 'react';
import { Upload, File, FileText, Download, Trash2, Eye, Search, Filter } from 'lucide-react';
import ModalOverlay from '../../components/ModalOverlay';

const UploadFiles = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const [files, setFiles] = useState([
    {
      id: 1,
      fileName: 'Baptism_Certificate_John_Doe.pdf',
      category: 'Baptism Certificate',
      uploadedBy: 'Admin User',
      uploadDate: '2025-11-21',
      size: '245 KB',
      recordId: 'BR-001',
    },
    {
      id: 2,
      fileName: 'Marriage_Contract_Brown.pdf',
      category: 'Marriage Contract',
      uploadedBy: 'Fr. Joseph Smith',
      uploadDate: '2025-11-20',
      size: '320 KB',
      recordId: 'MR-002',
    },
    {
      id: 3,
      fileName: 'Church_Deed_of_Sale.pdf',
      category: 'Legal Document',
      uploadedBy: 'Admin User',
      uploadDate: '2025-11-18',
      size: '1.2 MB',
      recordId: 'DOC-003',
    },
    {
      id: 4,
      fileName: 'Baptism_Certificate_Emily_Brown.pdf',
      category: 'Baptism Certificate',
      uploadedBy: 'Church Admin',
      uploadDate: '2025-11-15',
      size: '198 KB',
      recordId: 'BR-004',
    },
    {
      id: 5,
      fileName: 'Wedding_Agreement_Wilson.pdf',
      category: 'Marriage Contract',
      uploadedBy: 'Admin User',
      uploadDate: '2025-11-10',
      size: '425 KB',
      recordId: 'MR-005',
    },
  ]);

  const [uploadForm, setUploadForm] = useState({
    category: 'Baptism Certificate',
    recordId: '',
    description: '',
    file: null,
  });

  const categories = [
    'Baptism Certificate',
    'Marriage Contract',
    'Legal Document',
    'Financial Document',
    'Other',
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUploadForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadForm(prev => ({ ...prev, file }));
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadForm(prev => ({ ...prev, file: e.dataTransfer.files[0] }));
    }
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    
    if (!uploadForm.file) {
      alert('Please select a file to upload');
      return;
    }

    const newFile = {
      id: files.length + 1,
      fileName: uploadForm.file.name,
      category: uploadForm.category,
      uploadedBy: 'Admin User',
      uploadDate: new Date().toISOString().split('T')[0],
      size: `${(uploadForm.file.size / 1024).toFixed(0)} KB`,
      recordId: uploadForm.recordId,
    };

    setFiles([newFile, ...files]);
    setShowUploadModal(false);
    setUploadForm({
      category: 'Baptism Certificate',
      recordId: '',
      description: '',
      file: null,
    });
  };

  const handleDeleteFile = (id) => {
    const file = files.find(f => f.id === id);
    if (window.confirm(`Are you sure you want to delete "${file.fileName}"?`)) {
      setFiles(files.filter(f => f.id !== id));
    }
  };

  const handleDownload = (file) => {
    // Simulate download
    alert(`Downloading: ${file.fileName}`);
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = 
      file.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.recordId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || file.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Baptism Certificate': return 'bg-blue-100 text-blue-800';
      case 'Marriage Contract': return 'bg-pink-100 text-pink-800';
      case 'Legal Document': return 'bg-purple-100 text-purple-800';
      case 'Financial Document': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = [
    { label: 'Total Files', value: files.length.toString(), icon: File },
    { label: 'Baptism Certificates', value: files.filter(f => f.category === 'Baptism Certificate').length.toString(), icon: FileText },
    { label: 'Marriage Contracts', value: files.filter(f => f.category === 'Marriage Contract').length.toString(), icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50 dark:from-gray-900 dark:via-blue-950 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 animate-fade-in-down">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Files</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Upload and manage documents</p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-black via-[#0A1628] to-[#1E3A8A] text-white rounded-lg hover:shadow-lg hover:shadow-blue-900/50 transition-all duration-300 hover:-translate-y-0.5 font-semibold"
          >
            <Upload size={20} />
            Upload File
          </button>
        </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm hover:shadow-xl hover:shadow-cyan-500/20 transition-all duration-300 border border-white/60 hover:border-cyan-200/60 ring-1 ring-gray-100/50 hover:ring-cyan-100 hover:-translate-y-1 animate-fade-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-cyan-900 bg-clip-text text-transparent mt-2">{stat.value}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <stat.icon className="text-blue-600" size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-slate-200">
        <div className="flex flex-col md:flex-row gap-5">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search by file name, record ID, or uploader..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-slate-600" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Files Table */}
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">File Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Category</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Record ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Uploaded By</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Upload Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Size</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredFiles.map((file) => (
              <tr key={file.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{file.fileName}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getCategoryColor(file.category)}`}>
                    {file.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{file.recordId}</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{file.uploadedBy}</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{file.uploadDate}</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{file.size}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDownload(file)}
                      className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                      title="Download"
                    >
                      <Download size={16} />
                    </button>
                    <button
                      className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded transition-colors"
                      title="View"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteFile(file.id)}
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
        {filteredFiles.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            No files found matching your criteria
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <ModalOverlay isOpen={showUploadModal} onClose={() => setShowUploadModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border-2 border-blue-500 ring-4 ring-blue-500/30 shadow-blue-500/50">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900">Upload File</h2>
            </div>
            
            <form onSubmit={handleUploadSubmit} className="p-6">
              {/* Drag and Drop Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center mb-6 transition ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-slate-300 bg-slate-50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload size={48} className={`mx-auto mb-4 ${dragActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <p className="text-lg font-medium text-slate-700 mb-2">
                  {uploadForm.file ? uploadForm.file.name : 'Drag and drop your file here'}
                </p>
                <p className="text-sm text-slate-500 mb-4">or</p>
                <label className="cursor-pointer">
                  <span className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-blue-500/50 inline-block">
                    Choose File
                  </span>
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                </label>
                <p className="text-xs text-slate-500 mt-2">
                  Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select
                    name="category"
                    value={uploadForm.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Record ID (Optional)</label>
                  <input
                    type="text"
                    name="recordId"
                    value={uploadForm.recordId}
                    onChange={handleInputChange}
                    placeholder="e.g., BR-001, MR-002"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
                  <textarea
                    name="description"
                    value={uploadForm.description}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Add any notes or description about this file"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadForm({
                      category: 'Baptism Certificate',
                      recordId: '',
                      description: '',
                      file: null,
                    });
                  }}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-blue-500/50"
                >
                  Upload File
                </button>
              </div>
            </form>
          </div>
        </ModalOverlay>
      )}
      </div>
    </div>
  );
};

export default UploadFiles;
