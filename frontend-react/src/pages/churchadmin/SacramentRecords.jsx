import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Calendar, User, BookOpen, Filter, Download, FileText } from 'lucide-react';
import { createPortal } from 'react-dom';
import Pagination from '../../components/Pagination';

const SacramentRecords = () => {
  const [sacraments, setSacraments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedSacrament, setSelectedSacrament] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    type: '',
    participant_name: '',
    birth_date: '',
    birth_place: '',
    father_name: '',
    mother_name: '',
    godparents: '',
    sacrament_date: '',
    sacrament_place: '',
    officiating_minister: '',
    book_number: '',
    page_number: '',
    registry_number: '',
    notes: ''
  });

  const sacramentTypes = [
    'Baptism',
    'First Communion',
    'Confirmation',
    'Marriage',
    'Holy Orders',
    'Anointing of the Sick'
  ];

  // Mock data - replace with API call
  useEffect(() => {
    fetchSacraments();
  }, []);

  const fetchSacraments = () => {
    const mockData = [
      {
        id: 1,
        type: 'Baptism',
        participant_name: 'John Michael Santos',
        birth_date: '2024-03-15',
        father_name: 'Roberto Santos',
        mother_name: 'Maria Santos',
        sacrament_date: '2024-06-20',
        officiating_minister: 'Fr. Joseph Cruz',
        registry_number: 'BAP-2024-001'
      },
      {
        id: 2,
        type: 'Confirmation',
        participant_name: 'Sarah Jane Reyes',
        birth_date: '2010-08-22',
        sacrament_date: '2024-05-15',
        officiating_minister: 'Bishop Antonio Luna',
        registry_number: 'CON-2024-015'
      },
      {
        id: 3,
        type: 'Marriage',
        participant_name: 'Mark Garcia & Lisa Torres',
        sacrament_date: '2024-07-10',
        sacrament_place: 'St. Mary Cathedral',
        officiating_minister: 'Fr. Pedro Gomez',
        registry_number: 'MAR-2024-008'
      }
    ];
    setSacraments(mockData);
  };

  const handleOpenModal = (mode, sacrament = null) => {
    setModalMode(mode);
    if (sacrament) {
      setSelectedSacrament(sacrament);
      setFormData(sacrament);
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      type: '',
      participant_name: '',
      birth_date: '',
      birth_place: '',
      father_name: '',
      mother_name: '',
      godparents: '',
      sacrament_date: '',
      sacrament_place: '',
      officiating_minister: '',
      book_number: '',
      page_number: '',
      registry_number: '',
      notes: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      if (modalMode === 'add') {
        const newSacrament = { ...formData, id: sacraments.length + 1 };
        setSacraments([...sacraments, newSacrament]);
      } else {
        setSacraments(sacraments.map(s => s.id === selectedSacrament.id ? { ...formData, id: s.id } : s));
      }
      setShowModal(false);
      setLoading(false);
      resetForm();
    }, 500);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this sacrament record?')) {
      setSacraments(sacraments.filter(s => s.id !== id));
    }
  };

  const filteredSacraments = sacraments.filter(sacrament => {
    const matchesSearch = sacrament.participant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sacrament.registry_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || sacrament.type === filterType;
    const matchesYear = filterYear === 'all' || sacrament.sacrament_date?.startsWith(filterYear);
    
    return matchesSearch && matchesType && matchesYear;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSacraments = filteredSacraments.slice(indexOfFirstItem, indexOfLastItem);

  const stats = [
    { label: 'Total Records', value: sacraments.length, icon: BookOpen, color: '#4158D0' },
    { label: 'Baptisms', value: sacraments.filter(s => s.type === 'Baptism').length, icon: User, color: '#10b981' },
    { label: 'Confirmations', value: sacraments.filter(s => s.type === 'Confirmation').length, icon: Calendar, color: '#f59e0b' },
    { label: 'Marriages', value: sacraments.filter(s => s.type === 'Marriage').length, icon: FileText, color: '#ef4444' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#4158D0' }}>Sacrament Records</h1>
              <p className="text-gray-600 mt-2">Manage all sacrament records and certificates</p>
            </div>
            <button
              onClick={() => handleOpenModal('add')}
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
              Add Sacrament Record
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                    <p className="text-3xl font-bold mt-2" style={{ color: stat.color }}>{stat.value}</p>
                  </div>
                  <div className="p-3 rounded-xl" style={{ backgroundColor: `${stat.color}20` }}>
                    <Icon size={24} style={{ color: stat.color }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by name or registry number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ focusRing: 'rgba(65, 88, 208, 0.3)' }}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Sacrament Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
              >
                <option value="all">All Types</option>
                {sacramentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Year</label>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
              >
                <option value="all">All Years</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Registry #</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Participant</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Minister</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentSacraments.map((sacrament) => (
                  <tr key={sacrament.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-semibold" style={{ color: '#4158D0' }}>
                      {sacrament.registry_number}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold"
                        style={{ 
                          background: 'rgba(65, 88, 208, 0.1)',
                          color: '#4158D0'
                        }}
                      >
                        {sacrament.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{sacrament.participant_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{sacrament.sacrament_date}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{sacrament.officiating_minister}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleOpenModal('edit', sacrament)}
                          className="p-2 rounded-lg transition-all"
                          style={{ 
                            background: 'rgba(65, 88, 208, 0.1)',
                            color: '#4158D0'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(65, 88, 208, 0.2)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(65, 88, 208, 0.1)';
                          }}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(sacrament.id)}
                          className="p-2 rounded-lg transition-all"
                          style={{ 
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: '#EF4444'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                          }}
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
          <Pagination
            currentPage={currentPage}
            totalItems={filteredSacraments.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(value) => {
              setItemsPerPage(value);
              setCurrentPage(1);
            }}
          />
        </div>

        {filteredSacraments.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
            <p>No sacrament records found.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-200" style={{ background: 'rgba(65, 88, 208, 0.05)' }}>
              <h2 className="text-2xl font-bold" style={{ color: '#4158D0' }}>
                {modalMode === 'add' ? 'Add New Sacrament Record' : 'Edit Sacrament Record'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">Enter complete sacrament details</p>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Sacrament Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Sacrament Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
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
                    <option value="">Select Type</option>
                    {sacramentTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Participant Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Participant Name *</label>
                    <input
                      type="text"
                      value={formData.participant_name}
                      onChange={(e) => setFormData({...formData, participant_name: e.target.value})}
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
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Birth Date</label>
                    <input
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
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
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Birth Place</label>
                    <input
                      type="text"
                      value={formData.birth_place}
                      onChange={(e) => setFormData({...formData, birth_place: e.target.value})}
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
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Father's Name</label>
                    <input
                      type="text"
                      value={formData.father_name}
                      onChange={(e) => setFormData({...formData, father_name: e.target.value})}
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
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Mother's Name</label>
                    <input
                      type="text"
                      value={formData.mother_name}
                      onChange={(e) => setFormData({...formData, mother_name: e.target.value})}
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
                    />
                  </div>
                </div>

                {/* Sacrament Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Sacrament Date *</label>
                    <input
                      type="date"
                      value={formData.sacrament_date}
                      onChange={(e) => setFormData({...formData, sacrament_date: e.target.value})}
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
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Place</label>
                    <input
                      type="text"
                      value={formData.sacrament_place}
                      onChange={(e) => setFormData({...formData, sacrament_place: e.target.value})}
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
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Officiating Minister *</label>
                    <input
                      type="text"
                      value={formData.officiating_minister}
                      onChange={(e) => setFormData({...formData, officiating_minister: e.target.value})}
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
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Godparents / Sponsors</label>
                    <input
                      type="text"
                      value={formData.godparents}
                      onChange={(e) => setFormData({...formData, godparents: e.target.value})}
                      placeholder="Separate multiple names with commas"
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
                    />
                  </div>
                </div>

                {/* Registry Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Book Number</label>
                    <input
                      type="text"
                      value={formData.book_number}
                      onChange={(e) => setFormData({...formData, book_number: e.target.value})}
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
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Page Number</label>
                    <input
                      type="text"
                      value={formData.page_number}
                      onChange={(e) => setFormData({...formData, page_number: e.target.value})}
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
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Registry Number *</label>
                    <input
                      type="text"
                      value={formData.registry_number}
                      onChange={(e) => setFormData({...formData, registry_number: e.target.value})}
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
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows="3"
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

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-5" style={{ borderTop: '1px solid rgba(65, 88, 208, 0.15)' }}>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
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
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 text-white rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ 
                      background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
                      boxShadow: '0 6px 20px rgba(65, 88, 208, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(65, 88, 208, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(65, 88, 208, 0.3)';
                      }
                    }}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : (modalMode === 'add' ? 'Add Record' : 'Save Changes')}
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

export default SacramentRecords;
