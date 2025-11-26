import { useState, useEffect } from 'react';
import { Upload, FileText, Download, Eye, Trash2, Filter, Search, X } from 'lucide-react';
import ModalOverlay from '../../components/ModalOverlay';

const Documents = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);

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
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    description: '',
    file: null
  });

  const documents = [
    { id: 1, title: 'Baptism Certificate Template', type: 'Certificate', uploadDate: '2025-11-20', size: '2.5 MB', uploadedBy: 'Maria Santos' },
    { id: 2, title: 'Wedding Certificate Template', type: 'Certificate', uploadDate: '2025-11-18', size: '2.8 MB', uploadedBy: 'Maria Santos' },
    { id: 3, title: 'Confirmation Certificate Template', type: 'Certificate', uploadDate: '2025-11-15', size: '2.6 MB', uploadedBy: 'Maria Santos' },
    { id: 4, title: 'Service Request Form', type: 'Form', uploadDate: '2025-11-10', size: '1.2 MB', uploadedBy: 'John Dela Cruz' },
    { id: 5, title: 'Membership Application Form', type: 'Form', uploadDate: '2025-11-05', size: '1.5 MB', uploadedBy: 'John Dela Cruz' },
    { id: 6, title: 'Volunteer Registration Form', type: 'Form', uploadDate: '2025-11-01', size: '1.3 MB', uploadedBy: 'Ana Garcia' },
    { id: 7, title: 'Parish Guidelines 2025', type: 'Guidelines', uploadDate: '2025-10-25', size: '5.4 MB', uploadedBy: 'Fr. Joseph Smith' },
    { id: 8, title: 'Event Planning Checklist', type: 'Template', uploadDate: '2025-10-20', size: '800 KB', uploadedBy: 'Ana Garcia' },
    { id: 9, title: 'Monthly Report Template', type: 'Template', uploadDate: '2025-10-15', size: '1.1 MB', uploadedBy: 'Maria Santos' },
    { id: 10, title: 'Church History Document', type: 'Record', uploadDate: '2025-10-10', size: '12.3 MB', uploadedBy: 'Fr. Joseph Smith' },
  ];

  const documentTypes = ['Certificate', 'Form', 'Guidelines', 'Template', 'Record', 'Policy'];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || doc.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Upload submitted:', formData);
    setShowUploadModal(false);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
            <p className="text-blue-900 mt-1">Manage church documents and certificates</p>
          </div>
          <button 
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-black via-[#0A1628] to-[#1E3A8A] text-white rounded-xl hover:from-[#1E3A8A] hover:to-blue-700 transition-all shadow-lg hover:shadow-blue-900/50"
          >
            <Upload size={20} />
            Upload Document
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-900 text-sm">Total Documents</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{documents.length}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-black via-[#0A1628] to-[#1E3A8A] rounded-xl">
                <FileText className="text-white" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-900 text-sm">Certificates</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{documents.filter(d => d.type === 'Certificate').length}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <FileText className="text-white" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-900 text-sm">Forms</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{documents.filter(d => d.type === 'Form').length}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl">
                <FileText className="text-white" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-900 text-sm">Templates</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{documents.filter(d => d.type === 'Template').length}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl">
                <FileText className="text-white" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-200/50">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-lg transition-all ${filterType === 'all' ? 'bg-gradient-to-br from-black via-[#0A1628] to-[#1E3A8A] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                All
              </button>
              {documentTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-2 rounded-lg transition-all ${filterType === type ? 'bg-gradient-to-br from-black via-[#0A1628] to-[#1E3A8A] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
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
            <div key={doc.id} className="bg-white rounded-xl shadow-sm border border-blue-200/50 p-6 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-black via-[#0A1628] to-[#1E3A8A] rounded-xl">
                  <FileText className="text-white" size={24} />
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
                <button className="flex-1 px-3 py-2 bg-gradient-to-br from-black via-[#0A1628] to-[#1E3A8A] text-white rounded-lg hover:from-[#1E3A8A] hover:to-blue-700 transition-all text-sm font-medium flex items-center justify-center gap-2">
                  <Eye size={16} />
                  View
                </button>
                <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  <Download size={16} />
                </button>
                <button className="px-3 py-2 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition-colors">
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
                  className="px-6 py-2 bg-gradient-to-br from-black via-[#0A1628] to-[#1E3A8A] text-white rounded-lg hover:from-[#1E3A8A] hover:to-blue-700 transition-all shadow-lg hover:shadow-blue-900/50"
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
