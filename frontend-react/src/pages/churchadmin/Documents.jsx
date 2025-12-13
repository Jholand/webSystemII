import { useState, useEffect } from 'react';
import { Upload, FileText, Download, Eye, Trash2, Filter, Search, X } from 'lucide-react';
import ModalOverlay from '../../components/ModalOverlay';
import { documentService } from '../../services/extendedChurchService';
import { showSuccessToast, showErrorToast, showDeleteConfirm } from '../../utils/sweetAlertHelper';

const Documents = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

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

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await documentService.getAll();
      setDocuments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      showErrorToast('Error', 'Failed to load documents');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    description: '',
    file: null
  });



  const documentTypes = ['Certificate', 'Form', 'Guidelines', 'Template', 'Record', 'Policy'];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || doc.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await documentService.create(formData);
      showSuccessToast('Success!', 'Document uploaded successfully');
      setShowUploadModal(false);
      await fetchDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
      showErrorToast('Error', 'Failed to upload document');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await showDeleteConfirm('Delete Document?', 'This action cannot be undone!');
    if (result.isConfirmed) {
      try {
        await documentService.delete(id);
        showSuccessToast('Deleted!', 'Document has been deleted successfully');
        await fetchDocuments();
      } catch (error) {
        console.error('Error deleting document:', error);
        showErrorToast('Error', 'Failed to delete document');
      }
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      Certificate: 'bg-blue-100 text-blue-900',
      Form: 'bg-emerald-100 text-emerald-900',
      Guidelines: 'bg-purple-100 text-purple-900',
      Template: 'bg-amber-100 text-amber-900',
      Record: 'bg-rose-100 text-rose-900',
      Policy: 'bg-gray-100 text-gray-900'
    };
    return colors[type] || colors.Form;
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="space-y-6">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1" style={{ color: '#4158D0' }}>Documents</h1>
              <p className="text-gray-600 text-sm">Manage church documents and certificates</p>
            </div>
            <button 
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-6 py-3 text-white rounded-lg font-semibold hover:opacity-90 transition-all shadow-lg"
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Documents', value: documents.length, icon: FileText, color: '#4158D0' },
            { label: 'Certificates', value: documents.filter(d => d.type === 'Certificate').length, icon: FileText, color: '#10b981' },
            { label: 'Forms', value: documents.filter(d => d.type === 'Form').length, icon: FileText, color: '#f59e0b' },
            { label: 'Templates', value: documents.filter(d => d.type === 'Template').length, icon: FileText, color: '#8b5cf6' }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg p-5 shadow hover:shadow-lg transition-all border border-gray-200 cursor-pointer group">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 rounded-lg group-hover:scale-110 transition-transform" style={{ backgroundColor: stat.color + '20' }}>
                    <Icon style={{ color: stat.color }} size={24} />
                  </div>
                  <Icon size={16} className="text-gray-400" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-sm font-semibold text-gray-700">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg p-5 shadow border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilterType('all')}
                className="px-4 py-2 rounded-lg transition-all font-medium"
                style={filterType === 'all' ? {
                  background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(65, 88, 208, 0.3)'
                } : {
                  background: '#f3f4f6',
                  color: '#374151'
                }}
              >
                All
              </button>
              {documentTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className="px-4 py-2 rounded-lg transition-all font-medium"
                  style={filterType === type ? {
                    background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(65, 88, 208, 0.3)'
                  } : {
                    background: '#f3f4f6',
                    color: '#374151'
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map(doc => (
            <div key={doc.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl shadow-lg" style={{ 
                  background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
                  boxShadow: '0 4px 12px rgba(65, 88, 208, 0.3)'
                }}>
                  <FileText className="text-white" size={20} />
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(doc.type)}`}>
                  {doc.type}
                </span>
              </div>

              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{doc.title}</h3>
              
              <div className="space-y-2 mb-4 text-sm text-gray-600">
                <div className="flex items-center justify-between">
                  <span>Uploaded:</span>
                  <span className="font-medium">{doc.uploadDate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Size:</span>
                  <span className="font-medium">{doc.size}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>By:</span>
                  <span className="font-medium">{doc.uploadedBy}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-all text-sm font-semibold flex items-center justify-center gap-2 shadow-lg" style={{ 
                  background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
                  boxShadow: '0 4px 12px rgba(65, 88, 208, 0.3)'
                }}>
                  <Eye size={16} />
                  View
                </button>
                <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  <Download size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(doc.id)}
                  className="px-3 py-2 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Modal */}
      <ModalOverlay isOpen={showUploadModal} onClose={() => setShowUploadModal(false)}>
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Upload Document</h2>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Document Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Document Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Type</option>
                  {documentTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">File *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
                  <Upload className="mx-auto text-gray-400 mb-2" size={40} />
                  <p className="text-sm text-gray-600 mb-1">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500">PDF, DOC, DOCX (max. 50MB)</p>
                  <input
                    type="file"
                    onChange={(e) => setFormData({...formData, file: e.target.files[0]})}
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition-all shadow-lg"
                  style={{ backgroundColor: '#4667CF' }}
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

export default Documents;
