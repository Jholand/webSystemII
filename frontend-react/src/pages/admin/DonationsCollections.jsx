import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Download, DollarSign, TrendingUp, Calendar, Filter, Printer, FileText } from 'lucide-react';
import ModalOverlay from '../../components/ModalOverlay';
import { useAuth } from '../../contexts/AuthContext';
import { showErrorToast, showDeleteConfirm, showSuccessToast } from '../../utils/sweetAlertHelper';

const DonationsCollections = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  
  // Check if user is accountant
  const isAccountant = user?.role === 'accountant';

  const [donations, setDonations] = useState([
    {
      id: 1,
      date: '2025-11-21',
      time: '10:30 AM',
      donor: 'John Doe',
      type: 'Tithes',
      amount: 5000,
      method: 'Cash',
      purpose: 'General Fund',
      notes: 'Regular Sunday mass collection',
      recordedBy: 'Admin',
    },
    {
      id: 2,
      date: '2025-11-20',
      time: '02:15 PM',
      donor: 'Maria Santos',
      type: 'Building Fund',
      amount: 10000,
      method: 'Bank Transfer',
      purpose: 'Church Renovation',
      notes: 'For building repairs',
      recordedBy: 'Accountant',
    },
    {
      id: 3,
      date: '2025-11-19',
      time: '09:45 AM',
      donor: 'Anonymous',
      type: 'Offerings',
      amount: 3000,
      method: 'Cash',
      purpose: 'Charity',
      notes: 'For poor families',
      recordedBy: 'Admin',
    },
    {
      id: 4,
      date: '2025-11-21',
      time: '11:00 AM',
      donor: 'Pedro Cruz',
      type: 'Tithes',
      amount: 2500,
      method: 'Cash',
      purpose: 'Prayer Intentions',
      notes: '',
      recordedBy: 'Admin',
    },
    {
      id: 5,
      date: '2025-11-17',
      time: '03:30 PM',
      donor: 'Anna Garcia',
      type: 'Offerings',
      amount: 1000,
      method: 'Cash',
      purpose: 'Mass Intention',
      notes: 'For deceased family member',
      recordedBy: 'Admin',
    },
    {
      id: 6,
      date: '2025-11-14',
      time: '12:00 PM',
      donor: 'Community Group',
      type: 'Special Collection',
      amount: 8000,
      method: 'Cash',
      purpose: 'General Fund',
      notes: 'Weekly collection',
      recordedBy: 'Admin',
    },
    {
      id: 7,
      date: '2025-11-10',
      time: '04:00 PM',
      donor: 'Business Owner',
      type: 'Building Fund',
      amount: 15000,
      method: 'Check',
      purpose: 'Church Programs',
      notes: 'For youth ministry',
      recordedBy: 'Accountant',
    },
  ]);

  const [formData, setFormData] = useState({
    date: '',
    time: '',
    donor: '',
    type: 'Tithes',
    amount: '',
    method: 'Cash',
    purpose: '',
    notes: '',
  });

  // Calculate statistics based on filter
  const getFilteredDonations = () => {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    return donations.filter(donation => {
      const donationDate = new Date(donation.date);
      const matchesSearch = 
        donation.donor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donation.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donation.purpose.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === 'all' || donation.type === filterType;

      let matchesPeriod = true;
      if (filterPeriod === 'daily') {
        matchesPeriod = donationDate >= startOfToday;
      } else if (filterPeriod === 'weekly') {
        matchesPeriod = donationDate >= startOfWeek;
      } else if (filterPeriod === 'monthly') {
        matchesPeriod = donationDate >= startOfMonth;
      }

      return matchesSearch && matchesType && matchesPeriod;
    });
  };

  const filteredDonations = getFilteredDonations();
  
  const totalAmount = filteredDonations.reduce((sum, d) => sum + d.amount, 0);
  const averageAmount = filteredDonations.length > 0 ? totalAmount / filteredDonations.length : 0;

  const stats = [
    { 
      label: `Total (${filterPeriod === 'all' ? 'All Time' : filterPeriod.charAt(0).toUpperCase() + filterPeriod.slice(1)})`, 
      value: `₱${totalAmount.toLocaleString()}`, 
      icon: DollarSign,
      color: 'from-green-600 to-green-700' 
    },
    { 
      label: 'Total Donations', 
      value: validDonations.length.toString(), 
      icon: TrendingUp, 
      color: 'from-blue-600 to-blue-700' 
    },
    { 
      label: 'Average Amount', 
      value: `₱${averageAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, 
      icon: Calendar, 
      color: 'from-blue-600 to-blue-700' 
    },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddDonation = () => {
    if (!isAccountant) {
      showErrorToast('Access Denied', 'Only accountants can encode donations');
      return;
    }
    setModalMode('add');
    setFormData({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      donor: '',
      type: 'Tithes',
      amount: '',
      method: 'Cash',
      purpose: '',
      notes: '',
    });
    setShowModal(true);
  };

  const handleEditDonation = (donation) => {
    if (!isAccountant) {
      showErrorToast('Access Denied', 'Only accountants can edit donations');
      return;
    }
    setModalMode('edit');
    setSelectedDonation(donation);
    setFormData({
      date: donation.date,
      time: donation.time,
      donor: donation.donor,
      type: donation.type,
      amount: donation.amount,
      method: donation.method,
      purpose: donation.purpose,
      notes: donation.notes,
    });
    setShowModal(true);
  };

  const handlePrint = (donation) => {
    showInfoToast('Printing', `Generating record for donation #${donation.id}`);
  };

  const handleViewDonation = (donation) => {
    setModalMode('view');
    setSelectedDonation(donation);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!isAccountant) {
      showErrorToast('Access Denied', 'Only accountants can delete donations');
      return;
    }
    const result = await showDeleteConfirm('Delete Donation Record?', 'This action cannot be undone!');
    if (result.isConfirmed) {
      setDonations(donations.filter(d => d.id !== id));
      showSuccessToast('Deleted!', 'Donation record has been deleted successfully');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modalMode === 'add') {
      const newDonation = {
        id: donations.length + 1,
        ...formData,
        amount: parseFloat(formData.amount),
        recordedBy: 'Accountant',
      };
      setDonations([...donations, newDonation]);
    } else if (modalMode === 'edit') {
      setDonations(donations.map(d => 
        d.id === selectedDonation.id 
          ? { ...d, ...formData, amount: parseFloat(formData.amount) }
          : d
      ));
    }
    setShowModal(false);
  };

  // Calculate summaries by type
  const getSummaryByType = () => {
    const summary = { Tithes: 0, Offerings: 0, 'Building Fund': 0, 'Special Collection': 0 };
    // Exclude voided donations from category summaries
    const validDonations = filteredDonations.filter(d => !d.isVoided);
    validDonations.forEach(donation => {
      if (summary.hasOwnProperty(donation.type)) {
        summary[donation.type] += donation.amount;
      }
    });
    return summary;
  };

  const summaryByType = getSummaryByType();

  return (
    <div className="min-h-screen bg-white">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#4158D0' }}>Donations & Collections</h1>
              <p className="text-gray-600 mt-1">{isAccountant ? 'Manage donation entries and collection summaries' : 'View donation summaries and reports'}</p>
            </div>
            {isAccountant && (
              <button
                onClick={handleAddDonation}
                className="flex items-center gap-2 px-5 py-3 text-white rounded-lg shadow-lg transition-all font-semibold hover:shadow-xl"
                style={{ 
                  background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                }}
              >
                <Plus size={20} />
                Add Donation
              </button>
            )}
          </div>
        </div>

        {/* Info Banner for Non-Accountants */}
        {!isAccountant && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-blue-900 mb-1">View-Only Access</h3>
                <p className="text-sm text-blue-700">
                  You have read-only access to donation records. Only <strong>Accountants</strong> can add, edit, or delete donation entries. 
                  You can view summaries, reports, and download data.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border border-gray-200 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-transparent rounded-full transform translate-x-12 -translate-y-12 opacity-50"></div>
              <div className="relative flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl shadow-lg transform group-hover:scale-110 transition-transform" style={{ 
                  background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
                  boxShadow: '0 4px 12px rgba(65, 88, 208, 0.3)'
                }}>
                  <stat.icon className="text-white" size={24} />
                </div>
              </div>
              <div className="relative">
                <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">{stat.value}</h3>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Collection Summary by Type */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FileText size={20} style={{ color: '#4158D0' }} />
            Collection Summary by Type ({filterPeriod === 'all' ? 'All Time' : filterPeriod.charAt(0).toUpperCase() + filterPeriod.slice(1)})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 border-2 border-blue-100 hover:border-blue-200 transition-all shadow-sm hover:shadow-md group">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg" style={{ background: 'rgba(65, 88, 208, 0.1)' }}>
                  <DollarSign size={20} style={{ color: '#4158D0' }} />
                </div>
                <p className="text-sm font-semibold text-gray-700">Tithes</p>
              </div>
              <p className="text-2xl font-bold" style={{ color: '#4158D0' }}>₱{summaryByType.Tithes.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl p-6 border-2 border-green-100 hover:border-green-200 transition-all shadow-sm hover:shadow-md group">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                  <DollarSign size={20} style={{ color: '#10b981' }} />
                </div>
                <p className="text-sm font-semibold text-gray-700">Offerings</p>
              </div>
              <p className="text-2xl font-bold" style={{ color: '#10b981' }}>₱{summaryByType.Offerings.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl p-6 border-2 border-cyan-100 hover:border-cyan-200 transition-all shadow-sm hover:shadow-md group">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg" style={{ background: 'rgba(6, 182, 212, 0.1)' }}>
                  <DollarSign size={20} style={{ color: '#06b6d4' }} />
                </div>
                <p className="text-sm font-semibold text-gray-700">Building Fund</p>
              </div>
              <p className="text-2xl font-bold" style={{ color: '#06b6d4' }}>₱{summaryByType['Building Fund'].toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl p-6 border-2 border-orange-100 hover:border-orange-200 transition-all shadow-sm hover:shadow-md group">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                  <DollarSign size={20} style={{ color: '#f59e0b' }} />
                </div>
                <p className="text-sm font-semibold text-gray-700">Special Collection</p>
              </div>
              <p className="text-2xl font-bold" style={{ color: '#f59e0b' }}>₱{summaryByType['Special Collection'].toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by donor, type, or purpose..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 placeholder:text-gray-400 transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-600" />
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm font-medium text-gray-700 transition-all"
              >
                <option value="all">All Time</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm text-gray-700 transition-all"
              >
                <option value="all">All Types</option>
                <option value="Tithes">Tithes</option>
                <option value="Offerings">Offerings</option>
                <option value="Building Fund">Building Fund</option>
                <option value="Special Collection">Special Collection</option>
              </select>
            </div>
          </div>
        </div>

        {/* Donations Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date/Time</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Donor</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Method</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Purpose</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Recorded By</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDonations.map((donation) => (
                <tr key={donation.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{donation.date}</div>
                    <div className="text-xs text-gray-500">{donation.time}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{donation.donor}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                      donation.type === 'Tithes' 
                        ? 'bg-blue-100 text-blue-700 border-blue-200' 
                        : donation.type === 'Offerings'
                        ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
                        : donation.type === 'Building Fund'
                        ? 'bg-cyan-100 text-cyan-700 border-cyan-200'
                        : 'bg-purple-100 text-purple-700 border-purple-200'
                    }`}>
                      {donation.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900">₱{donation.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{donation.method}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{donation.purpose}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{donation.recordedBy}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePrint(donation)}
                        className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-all"
                        title="Print Record"
                      >
                        <Printer size={16} />
                      </button>
                      <button
                        onClick={() => handleViewDonation(donation)}
                        className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg transition-all"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      {isAccountant && (
                        <>
                          <button
                            onClick={() => handleEditDonation(donation)}
                            className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(donation.id)}
                            className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      {/* Modal */}
      <ModalOverlay isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {modalMode === 'add' ? 'Add Donation Entry' : 'Edit Donation Entry'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Donor Name</label>
                  <input
                    type="text"
                    name="donor"
                    value={formData.donor}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter donor name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Tithes">Tithes</option>
                    <option value="Offerings">Offerings</option>
                    <option value="Building Fund">Building Fund</option>
                    <option value="Special Collection">Special Collection</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₱)</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select
                    name="method"
                    value={formData.method}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Check">Check</option>
                    <option value="Online Payment">Online Payment</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                  <input
                    type="text"
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., General Fund, Church Renovation"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Additional notes (optional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-white rounded-lg shadow-lg hover:shadow-xl transition-all"
                  style={{ 
                    background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                  }}
                >
                  {modalMode === 'add' ? 'Add Donation' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
      </ModalOverlay>
      </div>
    </div>
  );
};

export default DonationsCollections;
