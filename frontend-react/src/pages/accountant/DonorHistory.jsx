import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, Download, Calendar, DollarSign } from 'lucide-react';

const DonorHistory = () => {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const [dateFrom, setDateFrom] = useState('2025-01-01');
  const [dateTo, setDateTo] = useState('2025-12-31');

  // Sample member data
  const member = {
    id: memberId || 1,
    name: 'John Doe',
    family: 'Doe Family',
    email: 'john.doe@email.com',
    phone: '+63 912 345 6789',
    memberSince: '2020-01-15',
    status: 'Active'
  };

  // Sample donation history
  const donations = [
    { id: 1, date: '2025-12-01', category: 'Tithes', amount: 5000, receiptNo: 'RCP-2025-001', notes: 'Monthly tithe' },
    { id: 2, date: '2025-11-15', category: 'Building Fund', amount: 10000, receiptNo: 'RCP-2025-045', notes: 'One-time donation' },
    { id: 3, date: '2025-11-01', category: 'Tithes', amount: 5000, receiptNo: 'RCP-2025-032', notes: 'Monthly tithe' },
    { id: 4, date: '2025-10-01', category: 'Tithes', amount: 5000, receiptNo: 'RCP-2025-018', notes: 'Monthly tithe' },
    { id: 5, date: '2025-09-15', category: 'Mass Intentions', amount: 500, receiptNo: 'RCP-2025-012', notes: 'For healing' },
    { id: 6, date: '2025-09-01', category: 'Tithes', amount: 5000, receiptNo: 'RCP-2025-005', notes: 'Monthly tithe' },
    { id: 7, date: '2025-08-01', category: 'Tithes', amount: 5000, receiptNo: 'RCP-2025-001', notes: 'Monthly tithe' },
  ];

  // Calculate statistics
  const currentYear = new Date().getFullYear();
  const yearToDateTotal = donations
    .filter(d => d.date.startsWith(currentYear.toString()))
    .reduce((sum, d) => sum + d.amount, 0);
  
  const totalAllTime = donations.reduce((sum, d) => sum + d.amount, 0);
  const avgDonation = Math.round(totalAllTime / donations.length);

  // Category breakdown
  const categoryTotals = donations.reduce((acc, d) => {
    acc[d.category] = (acc[d.category] || 0) + d.amount;
    return acc;
  }, {});

  const handleBack = () => {
    navigate('/accountant/donations');
  };

  const handleDownloadStatement = () => {
    showInfoToast('Downloading', `Downloading donation statement for ${member.name} (${dateFrom} to ${dateTo})`);
  };

  const handleViewReceipt = (receiptNo) => {
    const donationId = donations.find(d => d.receiptNo === receiptNo)?.id;
    if (donationId) {
      navigate(`/accountant/receipts/${donationId}`);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:shadow transition-all"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <button
            onClick={handleDownloadStatement}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-black via-[#0A1628] to-[#1E3A8A] rounded-lg hover:opacity-90 transition-all"
          >
            <Download size={16} className="inline mr-1.5" />
            Download Statement
          </button>
        </div>

        {/* Member Information */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Donor Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="text-lg font-semibold text-gray-900">{member.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Family</p>
              <p className="text-lg font-semibold text-gray-900">{member.family}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-lg font-semibold text-gray-900">{member.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="text-lg font-semibold text-gray-900">{member.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Member Since</p>
              <p className="text-lg font-semibold text-gray-900">{member.memberSince}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                {member.status}
              </span>
            </div>
          </div>
        </div>

        {/* Donation Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-5 shadow border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={20} className="text-blue-600" />
              <p className="text-sm text-gray-600">Year-to-Date</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">₱{yearToDateTotal.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-lg p-5 shadow border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={20} className="text-green-600" />
              <p className="text-sm text-gray-600">Total All Time</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">₱{totalAllTime.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-lg p-5 shadow border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={20} className="text-purple-600" />
              <p className="text-sm text-gray-600">Total Donations</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{donations.length}</p>
          </div>

          <div className="bg-white rounded-lg p-5 shadow border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={20} className="text-orange-600" />
              <p className="text-sm text-gray-600">Avg Donation</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">₱{avgDonation.toLocaleString()}</p>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Donation by Category</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(categoryTotals).map(([category, amount]) => (
              <div key={category} className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">{category}</p>
                <p className="text-xl font-bold text-gray-900">₱{amount.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Date Filter */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Statement Period</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Donation Timeline */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Donation Timeline</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Receipt #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Notes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {donations.map((donation) => (
                  <tr key={donation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{donation.date}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {donation.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">₱{donation.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">{donation.receiptNo}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{donation.notes}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewReceipt(donation.receiptNo)}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      >
                        View Receipt
                      </button>
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

export default DonorHistory;
