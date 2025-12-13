import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Calendar, Users, Eye, Download } from 'lucide-react';
import { donationAPI } from '../../services/dataSync';
import { showSuccessToast, showErrorToast } from '../../utils/sweetAlertHelper';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const PriestDonationsSummary = () => {
  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    loadDonations();
  }, []);

  const loadDonations = async () => {
    try {
      setLoading(true);
      const response = await donationAPI.getAll();
      const donationsData = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);
      setDonations(donationsData);
    } catch (error) {
      console.error('Error loading donations:', error);
      showErrorToast('Error', 'Failed to load donations');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredDonations = () => {
    const now = new Date();
    return donations.filter(donation => {
      const donationDate = new Date(donation.created_at || donation.date);
      
      switch (selectedPeriod) {
        case 'today':
          return donationDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return donationDate >= weekAgo;
        case 'month':
          return donationDate.getMonth() === now.getMonth() && donationDate.getFullYear() === now.getFullYear();
        case 'year':
          return donationDate.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    });
  };

  const filteredDonations = getFilteredDonations();
  
  // Calculate totals
  const totalAmount = filteredDonations.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
  const totalCount = filteredDonations.length;
  const averageAmount = totalCount > 0 ? totalAmount / totalCount : 0;
  const uniqueDonors = new Set(filteredDonations.map(d => d.donor).filter(Boolean)).size;

  // Group by category
  const categoryTotals = filteredDonations.reduce((acc, donation) => {
    const category = donation.category || 'Other';
    acc[category] = (acc[category] || 0) + (parseFloat(donation.amount) || 0);
    return acc;
  }, {});

  const stats = [
    {
      label: 'Total Collections',
      value: `₱${totalAmount.toLocaleString()}`,
      icon: DollarSign,
      color: '#10B981'
    },
    {
      label: 'Total Donations',
      value: totalCount.toString(),
      icon: Calendar,
      color: '#4158D0'
    },
    {
      label: 'Average Donation',
      value: `₱${Math.round(averageAmount).toLocaleString()}`,
      icon: TrendingUp,
      color: '#8B5CF6'
    },
    {
      label: 'Unique Donors',
      value: uniqueDonors.toString(),
      icon: Users,
      color: '#F59E0B'
    },
  ];

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.setTextColor(65, 88, 208);
    doc.text('Donations Summary Report', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const periodText = selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1);
    doc.text(`Period: ${periodText}`, 105, 28, { align: 'center' });
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`, 105, 34, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    doc.text('Summary', 14, 45);
    
    doc.setFontSize(9);
    doc.text(`Total Collections: ₱${totalAmount.toFixed(2)}`, 14, 52);
    doc.text(`Total Donations: ${totalCount}`, 14, 57);
    doc.text(`Average Donation: ₱${averageAmount.toFixed(2)}`, 14, 62);
    doc.text(`Unique Donors: ${uniqueDonors}`, 14, 67);

    // Category breakdown
    doc.text('Category Breakdown:', 14, 77);
    const categoryData = Object.entries(categoryTotals).map(([category, amount]) => [
      category,
      `₱${amount.toFixed(2)}`
    ]);
    
    autoTable(doc, {
      startY: 82,
      head: [['Category', 'Amount']],
      body: categoryData,
      theme: 'striped',
      styles: {
        fontSize: 8,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [65, 88, 208],
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold'
      }
    });

    doc.save(`donations-summary-${selectedPeriod}-${new Date().toISOString().slice(0, 10)}.pdf`);
    showSuccessToast('Success', 'Summary exported successfully');
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="space-y-6">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 bg-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold mb-1" style={{ color: '#4158D0' }}>
                Donations & Collections Summary
              </h1>
              <p className="text-gray-600 text-sm">
                <Eye className="inline-block mr-1" size={14} />
                View-only access to donation summaries
              </p>
            </div>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-6 py-3 rounded-lg text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              style={{
                background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
              }}
            >
              <Download size={18} />
              <span>Export Summary</span>
            </button>
          </div>
        </div>

        {/* Period Selector */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="font-medium text-gray-700">View Period:</span>
            <div className="flex gap-2">
              {['today', 'week', 'month', 'year', 'all'].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${
                    selectedPeriod === period
                      ? 'shadow-lg'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  style={selectedPeriod === period ? {
                    background: 'rgba(65, 88, 208, 0.1)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    color: '#4158D0',
                    border: '1px solid rgba(65, 88, 208, 0.2)',
                    boxShadow: '0 4px 12px rgba(65, 88, 208, 0.15)'
                  } : {
                    border: '1px solid transparent'
                  }}
                >
                  {period === 'all' ? 'All Time' : period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg p-5 shadow hover:shadow-lg transition-all border border-gray-200 cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <div className="p-3 rounded-lg group-hover:scale-110 transition-transform" style={{ backgroundColor: stat.color + '20' }}>
                  <stat.icon style={{ color: stat.color }} size={24} />
                </div>
                <TrendingUp size={16} className="text-gray-400" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-sm font-semibold text-gray-700">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Collection by Category</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(categoryTotals).map(([category, amount]) => (
              <div key={category} className="bg-white rounded-lg p-5 shadow hover:shadow-lg transition-all border border-gray-200 cursor-pointer group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 rounded-lg group-hover:scale-110 transition-transform" style={{ backgroundColor: '#4158D020' }}>
                    <DollarSign size={24} style={{ color: '#4158D0' }} />
                  </div>
                  <p className="text-sm font-semibold text-gray-700">{category}</p>
                </div>
                <p className="text-2xl font-bold" style={{ color: '#4158D0' }}>₱{amount.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Donations */}
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Recent Donations</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                        <p className="text-gray-500">Loading donations...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredDonations.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center">
                      <DollarSign size={48} className="mx-auto mb-4 opacity-50 text-gray-400" />
                      <p className="text-gray-500">No donations found for this period.</p>
                    </td>
                  </tr>
                ) : (
                  filteredDonations.slice(0, 10).map((donation) => (
                    <tr key={donation.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {new Date(donation.created_at || donation.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{donation.category || 'N/A'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">
                        ₱{(parseFloat(donation.amount) || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm" style={{ color: '#4158D0' }}>
            <Eye className="inline-block mr-1" size={14} />
            <strong>Note:</strong> This is a summary view of donations and collections. For detailed records and management, contact the Accountant or Church Admin.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PriestDonationsSummary;
