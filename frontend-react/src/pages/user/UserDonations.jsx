import { useState } from 'react';
import { Download, Filter, DollarSign } from 'lucide-react';

const UserDonations = () => {
  const [yearFilter, setYearFilter] = useState('2025');

  // Sample donations data
  const donations = [
    { 
      id: 1, 
      date: '2025-12-01', 
      category: 'Tithes', 
      amount: 5000, 
      receiptNo: 'RCP-2025-001',
      encodedBy: 'Accountant Maria',
      receiptAvailable: true 
    },
    { 
      id: 2, 
      date: '2025-11-15', 
      category: 'Building Fund', 
      amount: 10000, 
      receiptNo: 'RCP-2025-045',
      encodedBy: 'Accountant Maria',
      receiptAvailable: true 
    },
    { 
      id: 3, 
      date: '2025-11-01', 
      category: 'Tithes', 
      amount: 5000, 
      receiptNo: 'RCP-2025-032',
      encodedBy: 'Accountant Maria',
      receiptAvailable: true 
    },
    { 
      id: 4, 
      date: '2025-10-01', 
      category: 'Tithes', 
      amount: 5000, 
      receiptNo: 'RCP-2025-018',
      encodedBy: 'Accountant Pedro',
      receiptAvailable: true 
    },
    { 
      id: 5, 
      date: '2025-09-15', 
      category: 'Mass Intentions', 
      amount: 500, 
      receiptNo: 'RCP-2025-012',
      encodedBy: 'Accountant Maria',
      receiptAvailable: false 
    },
    { 
      id: 6, 
      date: '2025-09-01', 
      category: 'Tithes', 
      amount: 5000, 
      receiptNo: 'RCP-2025-005',
      encodedBy: 'Accountant Maria',
      receiptAvailable: true 
    },
    { 
      id: 7, 
      date: '2024-12-01', 
      category: 'Offerings', 
      amount: 2000, 
      receiptNo: 'RCP-2024-156',
      encodedBy: 'Accountant Juan',
      receiptAvailable: true 
    },
    { 
      id: 8, 
      date: '2024-11-01', 
      category: 'Tithes', 
      amount: 5000, 
      receiptNo: 'RCP-2024-142',
      encodedBy: 'Accountant Juan',
      receiptAvailable: true 
    },
  ];

  const years = ['2025', '2024', '2023', '2022'];

  const filteredDonations = donations.filter(d => d.date.startsWith(yearFilter));

  const totalDonations = filteredDonations.reduce((sum, d) => sum + d.amount, 0);
  const donationCount = filteredDonations.length;
  const avgDonation = donationCount > 0 ? Math.round(totalDonations / donationCount) : 0;

  // Category breakdown
  const categoryTotals = filteredDonations.reduce((acc, d) => {
    acc[d.category] = (acc[d.category] || 0) + d.amount;
    return acc;
  }, {});

  const handleDownloadReceipt = (donation) => {
    showInfoToast('Downloading', `Downloading receipt ${donation.receiptNo}`);
  };

  const handleDownloadStatement = () => {
    showInfoToast('Downloading', `Downloading annual donation statement for ${yearFilter}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">My Donations</h1>
            <p className="text-gray-600 text-sm mt-1">View your donation history and download receipts</p>
          </div>
          <button
            onClick={handleDownloadStatement}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-black via-[#0A1628] to-[#1E3A8A] rounded-lg hover:opacity-90 transition-all"
          >
            <Download size={16} className="inline mr-1.5" />
            Download Statement
          </button>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <Filter size={20} className="text-gray-400" />
            <label className="text-sm font-medium text-gray-700">Filter by Year:</label>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-5 shadow border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={20} className="text-green-600" />
              <p className="text-sm text-gray-600">Total Donations ({yearFilter})</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">₱{totalDonations.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-lg p-5 shadow border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={20} className="text-blue-600" />
              <p className="text-sm text-gray-600">Number of Donations</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{donationCount}</p>
          </div>

          <div className="bg-white rounded-lg p-5 shadow border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={20} className="text-purple-600" />
              <p className="text-sm text-gray-600">Average Donation</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">₱{avgDonation.toLocaleString()}</p>
          </div>
        </div>

        {/* Category Breakdown */}
        {Object.keys(categoryTotals).length > 0 && (
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Donations by Category</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(categoryTotals).map(([category, amount]) => (
                <div key={category} className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">{category}</p>
                  <p className="text-xl font-bold text-gray-900">₱{amount.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Donations Table */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Donation History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Receipt #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Encoded By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDonations.map((donation) => (
                  <tr key={donation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{donation.date}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {donation.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">₱{donation.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">{donation.receiptNo}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{donation.encodedBy}</td>
                    <td className="px-6 py-4">
                      {donation.receiptAvailable ? (
                        <button
                          onClick={() => handleDownloadReceipt(donation)}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium flex items-center gap-1"
                        >
                          <Download size={16} />
                          Download
                        </button>
                      ) : (
                        <span className="text-gray-400 text-sm">Processing</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">About Your Donations</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• All donations are recorded by the church accountant</li>
            <li>• Official receipts are available for download once processed</li>
            <li>• You can download your annual statement for tax purposes</li>
            <li>• For questions about donations, please contact the church office</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UserDonations;
