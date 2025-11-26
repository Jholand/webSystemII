import { useState, useEffect } from 'react';
import { Upload, File, FileText, Download, Trash2, Eye, Search, CheckCircle, Clock } from 'lucide-react';
import ModalOverlay from '../../components/ModalOverlay';

const UserUploadFiles = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Hide header and sidebar when modal is open
  useEffect(() => {
    if (showUploadModal) {
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
  }, [showUploadModal]);

  const [files, setFiles] = useState([
    {
      id: 1,
      fileName: 'Birth_Certificate_John_Doe.pdf',
      category: 'Birth Certificate',
      uploadDate: '2025-11-21',
      size: '245 KB',
      status: 'approved',
      description: 'Birth certificate for church records',
    },
    {
      id: 2,
      fileName: 'Marriage_Requirements.pdf',
      category: 'Marriage Requirements',
      uploadDate: '2025-11-20',
      size: '320 KB',
      status: 'pending',
      description: 'Requirements for upcoming wedding',
    },
    {
      id: 3,
      fileName: 'Baptism_Certificate.pdf',
      category: 'Baptism Certificate',
      uploadDate: '2025-11-18',
      size: '198 KB',
      status: 'approved',
      description: 'Certificate for baptism record',
    },
  ]);

  const [uploadForm, setUploadForm] = useState({
    category: 'Birth Certificate',
    description: '',
    file: null,
  });

  const categories = [
    'Birth Certificate',
    'Marriage Requirements',
    'Baptism Certificate',
    'Confirmation Certificate',
    'ID Document',
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!uploadForm.file) {
      alert('Please select a file to upload');
      return;
    }

    const newFile = {
      id: files.length + 1,
      fileName: uploadForm.file.name,
      category: uploadForm.category,
      uploadDate: new Date().toISOString().split('T')[0],
      size: `${Math.round(uploadForm.file.size / 1024)} KB`,
      status: 'pending',
      description: uploadForm.description,
    };

    setFiles([newFile, ...files]);
    setShowUploadModal(false);
    setUploadForm({
      category: 'Birth Certificate',
      description: '',
      file: null,
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      setFiles(files.filter(file => file.id !== id));
    }
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || file.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (status) => {
    if (status === 'approved') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3" />
          Approved
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
        <Clock className="h-3 w-3" />
        Pending Review
      </span>
    );
  };

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Documents</h1>
          <p className="text-gray-600 mt-1">Upload and manage your church documents</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-black via-[#0A1628] to-[#1E3A8A] text-white rounded-lg hover:from-[#1E3A8A] hover:to-blue-700 transition-all shadow-lg hover:shadow-blue-900/50"
        >
          <Upload className="h-4 w-4" />
          Upload Document
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Files Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Upload Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredFiles.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <File className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <p className="text-gray-500">No documents found</p>
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Upload your first document
                    </button>
                  </td>
                </tr>
              ) : (
                filteredFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.fileName}</p>
                          {file.description && (
                            <p className="text-xs text-gray-500">{file.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{file.category}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{file.uploadDate}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{file.size}</td>
                    <td className="px-6 py-4">{getStatusBadge(file.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          className="p-1 hover:bg-blue-100 rounded transition-colors"
                          title="View"
                        >
                          <Eye className="h-4 w-4 text-blue-600" />
                        </button>
                        <button
                          className="p-1 hover:bg-green-100 rounded transition-colors"
                          title="Download"
                        >
                          <Download className="h-4 w-4 text-green-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(file.id)}
                          className="p-1 hover:bg-red-100 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      <ModalOverlay isOpen={showUploadModal} onClose={() => setShowUploadModal(false)}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border-2 border-blue-500 ring-4 ring-blue-500/30 shadow-blue-500/50">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Upload Document</h2>
              <p className="text-gray-600 mt-1">Upload your church-related documents for review</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Category *
                </label>
                <select
                  name="category"
                  value={uploadForm.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={uploadForm.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Brief description of the document..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* File Upload Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload File *
                </label>
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-gray-600 mb-2">
                    Drag and drop your file here, or
                  </p>
                  <label className="inline-block cursor-pointer text-blue-600 hover:text-blue-700 font-medium">
                    browse files
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                  </p>
                  {uploadForm.file && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        Selected: <span className="font-medium">{uploadForm.file.name}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadForm({
                      category: 'Birth Certificate',
                      description: '',
                      file: null,
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-blue-500/50"
                >
                  Upload Document
                </button>
              </div>
            </form>
          </div>
      </ModalOverlay>
    </div>
  );
};

export default UserUploadFiles;
