import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Download, Printer, Eye, Filter, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { showInfoToast, showErrorToast } from '../../utils/sweetAlertHelper';

const DonationsLedger = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDonor, setFilterDonor] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedReceipts, setSelectedReceipts] = useState([]);
  
  // Check if user is accountant
  const isAccountant = user?.role === 'accountant';

  // Sample donations data
  const donations = [
    { id: 1, date: '2025-12-01', donor: 'John Doe', category: 'Tithes', amount: 5000, receiptNo: 'RCP-2025-001', encodedBy: 'Maria Santos' },
    { id: 2, date: '2025-12-01', donor: 'Guest - Anna Cruz', category: 'Offerings', amount: 1500, receiptNo: 'RCP-2025-002', encodedBy: 'Maria Santos' },
    { id: 3, date: '2025-11-30', donor: 'Robert Johnson', category: 'Building Fund', amount: 10000, receiptNo: 'RCP-2025-003', encodedBy: 'Maria Santos' },
    { id: 4, date: '2025-11-30', donor: 'Maria Rodriguez', category: 'Mass Intentions', amount: 500, receiptNo: 'RCP-2025-004', encodedBy: 'Maria Santos' },
    { id: 5, date: '2025-11-29', donor: 'Guest - Pedro Lopez', category: 'Offerings', amount: 2000, receiptNo: 'RCP-2025-005', encodedBy: 'Maria Santos' },
    { id: 6, date: '2025-11-29', donor: 'Sarah Williams', category: 'Tithes', amount: 3500, receiptNo: 'RCP-2025-006', encodedBy: 'Maria Santos' },
    { id: 7, date: '2025-11-28', donor: 'Michael Brown', category: 'Building Fund', amount: 8000, receiptNo: 'RCP-2025-007', encodedBy: 'Maria Santos' },
    { id: 8, date: '2025-11-28', donor: 'Guest - Juan Santos', category: 'Candles', amount: 200, receiptNo: 'RCP-2025-008', encodedBy: 'Maria Santos' },
  ];

  const categories = ['all', 'Tithes', 'Offerings', 'Building Fund', 'Mass Intentions', 'Candles', 'Other'];

  const filteredDonations = donations.filter(donation => {
    const matchesSearch = donation.donor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         donation.receiptNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || donation.category === filterCategory;
    const matchesDonor = !filterDonor || donation.donor.toLowerCase().includes(filterDonor.toLowerCase());
    
    let matchesDate = true;
    if (dateFrom && dateTo) {
      matchesDate = donation.date >= dateFrom && donation.date <= dateTo;
    }

    return matchesSearch && matchesCategory && matchesDonor && matchesDate;
  });

  const handleViewReceipt = (id) => {
    navigate(`/accountant/receipts/${id}`);
  };

  const handlePrintReceipt = (id) => {
    showInfoToast('Printing', `Printing receipt for donation ${id}`);
  };

  const handleExport = (format) => {
    const count = selectedReceipts.length || filteredDonations.length;
    showInfoToast('Exporting', `Exporting ${count} records to ${format}`);
  };

  const handleReprintSelected = () => {
    if (selectedReceipts.length === 0) {
      showErrorToast('Error!', 'Please select receipts to reprint');
      return;
    }
    showInfoToast('Printing', `Reprinting ${selectedReceipts.length} receipts`);
  };

  const toggleSelectReceipt = (id) => {
    setSelectedReceipts(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedReceipts.length === filteredDonations.length) {
      setSelectedReceipts([]);
    } else {
      setSelectedReceipts(filteredDonations.map(d => d.id));
    }
  };

  const totalAmount = filteredDonations.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="min-h-screen bg-white">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold" style={{ color: '#4667CF' }}>Donations & Offerings</h1>
            <p className="text-gray-600 text-sm mt-1">{isAccountant ? 'View and manage all donation records' : 'View donation reports and summaries'}</p>
          </div>
          <div className="flex gap-2">
            {isAccountant && (
              <button
                onClick={() => navigate('/accountant/donations/new')}
                className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all flex items-center gap-2"
                style={{ backgroundColor: '#4667CF' }}
              >
                <Plus size={16} />
                Record New Donation
              </button>
            )}
            <button
              onClick={() => handleExport('CSV')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:shadow transition-all"
            >
              <Download size={16} className="inline mr-1.5" />
              Export CSV
            </button>
            <button
              onClick={() => handleExport('PDF')}
              className="px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-all"
              style={{ backgroundColor: '#4667CF' }}
            >
              <Download size={16} className="inline mr-1.5" />
              Export PDF
            </button>
          </div>
        </div>

        {/* Info Banner for Non-Accountants */}
        {!isAccountant && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-blue-900 mb-1">View-Only Access</h3>
                <p className="text-sm text-blue-700">
                  You have read-only access to donation records. Only <strong>Accountants</strong> can record new donations. 
                  You can view all records, print receipts, and export data.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-5 shadow hover:shadow-md transition-shadow border border-gray-200">
            <p className="text-gray-600 text-xs font-medium mb-1">Total Records</p>
            <p className="text-3xl font-bold text-gray-900 mb-2">{filteredDonations.length}</p>
          </div>
          <div className="bg-white rounded-lg p-5 shadow hover:shadow-md transition-shadow border border-gray-200">
            <p className="text-gray-600 text-xs font-medium mb-1">Total Amount</p>
            <p className="text-3xl font-bold text-gray-900 mb-2">₱{totalAmount.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg p-5 shadow hover:shadow-md transition-shadow border border-gray-200">
            <p className="text-gray-600 text-xs font-medium mb-1">Selected</p>
            <p className="text-3xl font-bold text-gray-900 mb-2">{selectedReceipts.length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} style={{ color: '#4667CF' }} />
            <h3 className="text-lg font-semibold" style={{ color: '#4667CF' }}>Filters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Donor or receipt #..."
                  className="w-full px-4 py-2.5 pl-10 border rounded-lg focus:ring-2 focus:outline-none text-sm"
                  style={{ borderColor: '#D9DBEF' }}
                />
                <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:outline-none"
                style={{ borderColor: '#D9DBEF' }}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:outline-none"
                style={{ borderColor: '#D9DBEF' }}
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border rounded-lg focus:ring-2 focus:outline-none"
                style={{ borderColor: '#D9DBEF' }}
              />
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedReceipts.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">
                {selectedReceipts.length} receipt(s) selected
              </span>
              <button
                onClick={handleReprintSelected}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all"
              >
                <Printer size={16} className="inline mr-1.5" />
                Reprint Selected
              </button>
            </div>
          </div>
        )}

        {/* Donations Table */}
        <div className="bg-white border border-gray-200 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200" style={{ backgroundColor: '#FAFAFB' }}>
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedReceipts.length === filteredDonations.length && filteredDonations.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Donor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Receipt #</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Encoded By</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDonations.map((donation) => (
                  <tr key={donation.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedReceipts.includes(donation.id)}
                        onChange={() => toggleSelectReceipt(donation.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{donation.date}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{donation.donor}</td>
                    <td className="px-4 py-3">
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {donation.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900">₱{donation.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-mono">{donation.receiptNo}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{donation.encodedBy}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewReceipt(donation.id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handlePrintReceipt(donation.id)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Print Receipt"
                        >
                          <Printer size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationsLedger;
