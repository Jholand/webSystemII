import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Download, DollarSign, TrendingUp, Calendar, Filter, Printer, FileText } from 'lucide-react';
import ModalOverlay from '../../components/ModalOverlay';

const DonationsCollections = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

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
      value: filteredDonations.length.toString(), 
      icon: TrendingUp, 
      color: 'from-blue-600 to-blue-700' 
    },
    { 
      label: 'Average Amount', 
      value: `₱${averageAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, 
      icon: Calendar, 
      color: 'from-purple-600 to-purple-700' 
    },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddDonation = () => {
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

  const handlePrintRecord = (donation) => {
    alert(`Printing record for donation #${donation.id}`);
  };

  const handleViewDonation = (donation) => {
    setModalMode('view');
    setSelectedDonation(donation);
    setShowModal(true);
  };

  const handleDeleteDonation = (id) => {
    if (window.confirm('Are you sure you want to delete this donation record?')) {
      setDonations(donations.filter(d => d.id !== id));
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
    filteredDonations.forEach(donation => {
      if (summary.hasOwnProperty(donation.type)) {
        summary[donation.type] += donation.amount;
      }
    });
    return summary;
  };

  const summaryByType = getSummaryByType();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent">Donations & Collections</h1>
            <p className="text-gray-600 text-sm mt-1">Manage donation entries and collection summaries</p>
          </div>
          <button
            onClick={handleAddDonation}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-black via-[#0A1628] to-[#1E3A8A] text-white rounded-xl hover:shadow-xl transition-all font-semibold"
          >
            <Plus size={20} />
            Add Donation
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mt-2">{stat.value}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-black via-[#0A1628] to-[#1E3A8A]">
                  <stat.icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Collection Summary by Type */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-blue-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Collection Summary by Type ({filterPeriod === 'all' ? 'All Time' : filterPeriod.charAt(0).toUpperCase() + filterPeriod.slice(1)})</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
              <p className="text-sm text-blue-600 font-medium mb-2">Tithes</p>
              <p className="text-2xl font-bold text-blue-900">₱{summaryByType.Tithes.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-200">
              <p className="text-sm text-indigo-600 font-medium mb-2">Offerings</p>
              <p className="text-2xl font-bold text-indigo-900">₱{summaryByType.Offerings.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-5 border border-cyan-200">
              <p className="text-sm text-cyan-600 font-medium mb-2">Building Fund</p>
              <p className="text-2xl font-bold text-cyan-900">₱{summaryByType['Building Fund'].toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200">
              <p className="text-sm text-purple-600 font-medium mb-2">Special Collection</p>
              <p className="text-2xl font-bold text-purple-900">₱{summaryByType['Special Collection'].toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-blue-100">
          <div className="flex flex-col md:flex-row gap-5">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by donor, type, or purpose..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-600" />
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="all">All Time</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
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
        <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Date/Time</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Donor</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Method</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Purpose</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Recorded By</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Actions</th>
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
                        onClick={() => handlePrintRecord(donation)}
                        className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-all"
                        title="Print Record"
                      >
                        <Printer size={16} />
                      </button>
                      <button
                        onClick={() => handleEditDonation(donation)}
                        className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-all"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteDonation(donation.id)}
                        className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all"
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
                  className="px-6 py-2 bg-gradient-to-r from-black via-[#0A1628] to-[#1E3A8A] text-white rounded-lg hover:shadow-xl transition-all"
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
