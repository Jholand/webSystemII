import { useState, useEffect } from 'react';
import { File, FileText, Eye, Search, Download, TrendingUp, Plus, Upload, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import Pagination from '../../components/Pagination';
import { documentAPI } from '../../services/documentAPI';
import { formatDate, formatDateTimeShort } from '../../utils/dateFormatter';

const UserUploadFiles = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Upload form data
  const [uploadFormData, setUploadFormData] = useState({
    category: '',
    description: '',
    file: null
  });

  // Fetch documents from API
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await documentAPI.getMyDocuments();
      
      // Transform API response to match component format
      const transformedFiles = response.data.map(doc => ({
        id: doc.id,
        fileName: doc.file_name,
        category: doc.category,
        uploadDate: new Date(doc.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        size: formatFileSize(doc.file_size),
        description: doc.description,
        filePath: doc.file_path
      }));
      
      setFiles(transformedFiles);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleDownload = async (id, fileName) => {
    try {
      setLoading(true);
      const response = await documentAPI.downloadDocument(id);
      
      // Create blob URL and open in new tab
      const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      // Clean up the URL after a delay
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error('Error opening file:', error);
      alert('Failed to open file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setUploadFormData({ ...uploadFormData, file });
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    
    if (!uploadFormData.file || !uploadFormData.category) {
      alert('Please select a file and category');
      return;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', uploadFormData.file);
      formData.append('category', uploadFormData.category);
      formData.append('description', uploadFormData.description);

      await documentAPI.upload(formData);
      
      // Reset form and close modal
      setUploadFormData({ category: '', description: '', file: null });
      setShowUploadModal(false);
      
      // Refresh documents list
      fetchDocuments();
      
      alert('Document uploaded successfully!');
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const categories = [
    'Certificate Requests',
    'Service Requests',
    'Birth Certificate',
    'Marriage Requirements',
    'Baptism Certificate',
    'Confirmation Certificate',
    'ID Document',
    'Other',
  ];

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || file.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination logic
  const indexOfLastFile = currentPage * itemsPerPage;
  const indexOfFirstFile = indexOfLastFile - itemsPerPage;
  const currentFiles = filteredFiles.slice(indexOfFirstFile, indexOfLastFile);

  return (
    <div className="h-screen bg-white overflow-hidden flex flex-col p-6">
      <div className="flex-1 flex flex-col space-y-6 overflow-hidden">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Document Records</h1>
              <p className="text-sm text-gray-600 mt-1">Track and manage all your uploaded documents</p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-6 py-3 text-white rounded-xl font-semibold transition-all flex items-center gap-2"
              style={{ 
                background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
                boxShadow: '0 4px 12px rgba(65, 88, 208, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(65, 88, 208, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(65, 88, 208, 0.3)';
              }}
            >
              <Plus size={20} />
              Upload Document
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4 flex-shrink-0">
          {/* Category Filter */}
          <div>
            <label className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-2 block">Category</label>
            <div className="flex flex-wrap gap-2">
              {['all', ...categories].map((category) => (
                <button
                  key={category}
                  onClick={() => setFilterCategory(category)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filterCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category === 'all' ? 'All' : category}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div>
            <label className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-2 block">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by file name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Documents Table */}
        {filteredFiles.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center flex-shrink-0">
            <File className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Documents Found</h3>
            <p className="text-sm text-gray-600">
              {searchTerm || filterCategory !== 'all' 
                ? 'Try adjusting your filters' 
                : "You haven't uploaded any documents yet"}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden flex-1 flex flex-col min-h-0">
            <div className="overflow-auto flex-1">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">File Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Size</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                          <p className="text-gray-500">Loading documents...</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentFiles.map((file) => (
                      <tr key={file.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {file.uploadDate}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5" style={{ color: '#4158D0' }} />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{file.fileName}</p>
                              {file.description && (
                                <p className="text-xs text-gray-500">{file.description}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="text-gray-700 capitalize">{file.category}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {file.size}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDownload(file.id, file.fileName)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                          >
                            <Eye size={14} />
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {filteredFiles.length > 0 && (
              <div className="border-t border-gray-200">
                <Pagination
                  currentPage={currentPage}
                  totalItems={filteredFiles.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={setItemsPerPage}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-200" style={{ background: 'rgba(65, 88, 208, 0.05)' }}>
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: '#4158D0' }}>Upload Document</h2>
                  <p className="text-sm text-gray-600 mt-1">Upload your church-related documents</p>
                </div>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                  style={{ color: '#4158D0' }}
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <form onSubmit={handleUploadSubmit} className="space-y-5">
                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Document Category *</label>
                  <select
                    value={uploadFormData.category}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none transition-all"
                    style={{ 
                      border: '1px solid rgba(65, 88, 208, 0.2)',
                      background: 'rgba(65, 88, 208, 0.03)'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.border = '1px solid rgba(65, 88, 208, 0.4)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(65, 88, 208, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.border = '1px solid rgba(65, 88, 208, 0.2)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description (Optional)</label>
                  <textarea
                    value={uploadFormData.description}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, description: e.target.value })}
                    rows="3"
                    placeholder="Brief description of the document..."
                    className="w-full px-4 py-3 rounded-xl focus:outline-none transition-all"
                    style={{ 
                      border: '1px solid rgba(65, 88, 208, 0.2)',
                      background: 'rgba(65, 88, 208, 0.03)'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.border = '1px solid rgba(65, 88, 208, 0.4)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(65, 88, 208, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.border = '1px solid rgba(65, 88, 208, 0.2)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  ></textarea>
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Select File *</label>
                  <div className="relative">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      className="w-full px-4 py-3 rounded-xl focus:outline-none transition-all cursor-pointer"
                      style={{ 
                        border: '1px solid rgba(65, 88, 208, 0.2)',
                        background: 'rgba(65, 88, 208, 0.03)'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.border = '1px solid rgba(65, 88, 208, 0.4)';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(65, 88, 208, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.border = '1px solid rgba(65, 88, 208, 0.2)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      required
                    />
                  </div>
                  {uploadFormData.file && (
                    <p className="mt-2 text-sm text-gray-600">
                      Selected: <span className="font-semibold">{uploadFormData.file.name}</span> ({(uploadFormData.file.size / 1024).toFixed(2)} KB)
                    </p>
                  )}
                  <p className="mt-2 text-xs text-gray-500">Accepted formats: PDF, DOC, DOCX, JPG, PNG (Max: 10MB)</p>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-5" style={{ borderTop: '1px solid rgba(65, 88, 208, 0.15)' }}>
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-6 py-3 rounded-2xl transition-all"
                    style={{
                      background: 'rgba(65, 88, 208, 0.1)',
                      color: '#64748B',
                      border: '1px solid rgba(65, 88, 208, 0.2)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(65, 88, 208, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(65, 88, 208, 0.1)';
                    }}
                    disabled={uploading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 text-white rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    style={{ 
                      background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
                      boxShadow: '0 6px 20px rgba(65, 88, 208, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      if (!uploading) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(65, 88, 208, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!uploading) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(65, 88, 208, 0.3)';
                      }
                    }}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload size={18} />
                        Upload Document
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default UserUploadFiles;
