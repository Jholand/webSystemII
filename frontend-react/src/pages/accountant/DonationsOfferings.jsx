import { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Printer, Calendar, DollarSign, Users, TrendingUp, HandHeart } from 'lucide-react';
import ModalOverlay from '../../components/ModalOverlay';

const DonationsOfferings = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [selectedDonation, setSelectedDonation] = useState(null);

  const [formData, setFormData] = useState({
    date: '',
    time: '',
    donor: '',
    type: '',
    amount: '',
    method: '',
    purpose: '',
    notes: ''
  });

  const [donations, setDonations] = useState([
    { id: 1, date: '2025-11-23', time: '10:30', donor: 'John Doe', type: 'Tithes', amount: 5000, method: 'Cash', purpose: 'Regular tithe', notes: 'Monthly contribution', recordedBy: 'Admin' },
    { id: 2, date: '2025-11-23', time: '11:00', donor: 'Congregation', type: 'Sunday Offerings', amount: 12000, method: 'Cash', purpose: 'Sunday Mass collection', notes: 'Morning service', recordedBy: 'Admin' },
    { id: 3, date: '2025-11-22', time: '14:30', donor: 'Maria Santos', type: 'Building Fund', amount: 10000, method: 'Bank Transfer', purpose: 'Church renovation', notes: 'For new roof', recordedBy: 'Accountant' },
    { id: 4, date: '2025-11-22', time: '09:15', donor: 'Anonymous', type: 'Special Collection', amount: 7500, method: 'Check', purpose: 'Charity program', notes: 'Help poor families', recordedBy: 'Admin' },
    { id: 5, date: '2025-11-21', time: '16:00', donor: 'Garcia Family', type: 'Tithes', amount: 3000, method: 'Online', purpose: 'Regular tithe', notes: 'Online transfer', recordedBy: 'Admin' },
    { id: 6, date: '2025-11-21', time: '12:00', donor: 'Congregation', type: 'Sunday Offerings', amount: 15000, method: 'Cash', purpose: 'Sunday Mass collection', notes: 'Evening service', recordedBy: 'Admin' },
    { id: 7, date: '2025-11-20', time: '10:00', donor: 'Pedro Cruz', type: 'Building Fund', amount: 8000, method: 'Cash', purpose: 'Church renovation', notes: 'Support building project', recordedBy: 'Admin' },
    { id: 8, date: '2025-11-20', time: '15:30', donor: 'Anna Lopez', type: 'Special Collection', amount: 5000, method: 'Bank Transfer', purpose: 'Mission work', notes: 'For outreach program', recordedBy: 'Accountant' },
  ]);

  const filteredDonations = donations.filter(donation => {
    const matchesSearch = 
      donation.donor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.purpose.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || donation.type === filterType;
    
    let matchesPeriod = true;
    if (filterPeriod !== 'all') {
      const today = new Date();
      const donationDate = new Date(donation.date);
      
      if (filterPeriod === 'today') {
        matchesPeriod = donationDate.toDateString() === today.toDateString();
      } else if (filterPeriod === 'week') {
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesPeriod = donationDate >= weekAgo;
      } else if (filterPeriod === 'month') {
        matchesPeriod = donationDate.getMonth() === today.getMonth();
      }
    }
    
    return matchesSearch && matchesType && matchesPeriod;
  });

  // Calculate summaries
  const getSummaryByType = (type) => {
    return donations
      .filter(d => d.type === type)
      .reduce((sum, d) => sum + d.amount, 0);
  };

  const getTotalDonations = () => donations.reduce((sum, d) => sum + d.amount, 0);

  const handleOpenModal = (mode, donation = null) => {
    setModalMode(mode);
    if (donation) {
      setSelectedDonation(donation);
      setFormData({
        date: donation.date,
        time: donation.time,
        donor: donation.donor,
        type: donation.type,
        amount: donation.amount,
        method: donation.method,
        purpose: donation.purpose,
        notes: donation.notes
      });
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        donor: '',
        type: '',
        amount: '',
        method: '',
        purpose: '',
        notes: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDonation(null);
    setFormData({
      date: '',
      time: '',
      donor: '',
      type: '',
      amount: '',
      method: '',
      purpose: '',
      notes: ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modalMode === 'add') {
      const newDonation = {
        id: donations.length + 1,
        ...formData,
        amount: parseFloat(formData.amount),
        recordedBy: 'Accountant'
      };
      setDonations([newDonation, ...donations]);
    } else if (modalMode === 'edit') {
      setDonations(donations.map(d => 
        d.id === selectedDonation.id 
          ? { ...d, ...formData, amount: parseFloat(formData.amount) }
          : d
      ));
    }
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this donation record?')) {
      setDonations(donations.filter(d => d.id !== id));
    }
  };

  const handlePrintRecord = (donation) => {
    alert(`Printing donation record for ${donation.donor}...`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              Donations & Offerings
            </h1>
            <p className="text-blue-900">Track tithes, offerings, and special donations</p>
          </div>
          <button
            onClick={() => handleOpenModal('add')}
            className="px-5 py-2.5 bg-gradient-to-r from-black via-[#0A1628] to-[#1E3A8A] text-white rounded-lg hover:from-[#1E3A8A] hover:to-blue-700 transition-all shadow-md hover:shadow-lg font-semibold flex items-center gap-2"
          >
            <Plus size={18} />
            Record Donation
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-lg transition-all border border-blue-200/50 hover:border-blue-600/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-900 mb-1.5 font-medium">Tithes</p>
                <p className="text-2xl font-bold text-gray-900">₱{getSummaryByType('Tithes').toLocaleString()}</p>
              </div>
              <div className="p-2.5 bg-gradient-to-br from-black via-[#0A1628] to-[#1E3A8A] rounded-lg shadow-md">
                <DollarSign className="text-white" size={22} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-lg transition-all border border-blue-200/50 hover:border-blue-600/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-900 mb-1.5 font-medium">Sunday Offerings</p>
                <p className="text-2xl font-bold text-gray-900">₱{getSummaryByType('Sunday Offerings').toLocaleString()}</p>
              </div>
              <div className="p-2.5 bg-gradient-to-br from-black via-[#0A1628] to-[#1E3A8A] rounded-lg shadow-md">
                <HandHeart className="text-white" size={22} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-lg transition-all border border-blue-200/50 hover:border-blue-600/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-900 mb-1.5 font-medium">Building Fund</p>
                <p className="text-2xl font-bold text-gray-900">₱{getSummaryByType('Building Fund').toLocaleString()}</p>
              </div>
              <div className="p-2.5 bg-gradient-to-br from-black via-[#0A1628] to-[#1E3A8A] rounded-lg shadow-md">
                <TrendingUp className="text-white" size={22} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-lg transition-all border border-blue-200/50 hover:border-blue-600/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-900 mb-1.5 font-medium">Special Collection</p>
                <p className="text-2xl font-bold text-gray-900">₱{getSummaryByType('Special Collection').toLocaleString()}</p>
              </div>
              <div className="p-2.5 bg-gradient-to-br from-black via-[#0A1628] to-[#1E3A8A] rounded-lg shadow-md">
                <Calendar className="text-white" size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* Total Summary */}
        <div className="bg-gradient-to-r from-black via-[#0A1628] to-[#1E3A8A] rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm mb-1 font-medium">Total Donations & Offerings</p>
              <p className="text-4xl font-bold text-white">₱{getTotalDonations().toLocaleString()}</p>
            </div>
            <DollarSign size={48} className="text-white/30" />
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
          <div className="flex flex-col md:flex-row gap-4">
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
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">All Types</option>
              <option value="Tithes">Tithes</option>
              <option value="Sunday Offerings">Sunday Offerings</option>
              <option value="Building Fund">Building Fund</option>
              <option value="Special Collection">Special Collection</option>
            </select>

            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>

        {/* Donations Table */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Date & Time</th>
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
                      <div className="text-sm font-semibold text-gray-900">{donation.date}</div>
                      <div className="text-xs text-gray-500">{donation.time}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{donation.donor}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                        donation.type === 'Tithes' 
                          ? 'bg-blue-100 text-blue-700 border-blue-200' 
                          : donation.type === 'Sunday Offerings'
                          ? 'bg-purple-100 text-purple-700 border-purple-200'
                          : donation.type === 'Building Fund'
                          ? 'bg-green-100 text-green-700 border-green-200'
                          : 'bg-orange-100 text-orange-700 border-orange-200'
                      }`}>
                        {donation.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900">₱{donation.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{donation.method}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{donation.purpose}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{donation.recordedBy}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePrintRecord(donation)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Print"
                        >
                          <Printer size={18} />
                        </button>
                        <button
                          onClick={() => handleOpenModal('edit', donation)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(donation.id)}
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

          {filteredDonations.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <DollarSign size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No donations found</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <ModalOverlay isOpen={showModal} onClose={handleCloseModal}>
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {modalMode === 'add' ? 'Record New Donation' : 'Edit Donation'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Time</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Donor Name</label>
                  <input
                    type="text"
                    value={formData.donor}
                    onChange={(e) => setFormData({...formData, donor: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                    placeholder="Name or 'Anonymous' or 'Congregation'"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Donation Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="Tithes">Tithes</option>
                    <option value="Sunday Offerings">Sunday Offerings</option>
                    <option value="Building Fund">Building Fund</option>
                    <option value="Special Collection">Special Collection</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (₱)</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Method</label>
                  <select
                    value={formData.method}
                    onChange={(e) => setFormData({...formData, method: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Method</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Check">Check</option>
                    <option value="Online">Online Payment</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Purpose</label>
                <input
                  type="text"
                  value={formData.purpose}
                  onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="e.g., Regular tithe, Sunday Mass collection"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Additional notes or details"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-black via-[#0A1628] to-[#1E3A8A] text-white rounded-lg hover:shadow-xl transition-all font-semibold"
                >
                  {modalMode === 'add' ? 'Record Donation' : 'Update Donation'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
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

export default DonationsOfferings;
