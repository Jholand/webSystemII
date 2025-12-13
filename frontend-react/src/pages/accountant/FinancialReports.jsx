import { useState, useEffect } from 'react';
import { Download, FileText, TrendingUp, Calendar, Users, Eye } from 'lucide-react';
import { donationAPI, donationCategoryAPI } from '../../services/dataSync';
import { showInfoToast } from '../../utils/sweetAlertHelper';

const FinancialReports = () => {
  const [selectedReport, setSelectedReport] = useState('daily');
  const [dateFrom, setDateFrom] = useState('2025-12-01');
  const [dateTo, setDateTo] = useState('2025-12-01');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({});

  useEffect(() => {
    loadReportData();
  }, [selectedReport, dateFrom, dateTo, filterCategory]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      const [donationsRes, categoriesRes] = await Promise.all([
        donationAPI.getAll().catch(() => ({ data: [] })),
        donationCategoryAPI.getAll().catch(() => ({ data: [] }))
      ]);

      const donations = Array.isArray(donationsRes?.data) ? donationsRes.data : (Array.isArray(donationsRes) ? donationsRes : []);
      const categories = Array.isArray(categoriesRes?.data) ? categoriesRes.data : (Array.isArray(categoriesRes) ? categoriesRes : []);

      // Calculate report data based on donations
      const processedData = calculateReportData(donations, categories, selectedReport);
      setReportData(processedData);
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateReportData = (donations, categories, reportType) => {
    const today = new Date();
    const totalAmount = donations.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
    const transactions = donations.length;

    // Group donations by category
    const categoryStats = categories.map(cat => {
      const catDonations = donations.filter(d => d.category_id === cat.id);
      const amount = catDonations.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
      return {
        name: cat.name,
        amount: amount,
        count: catDonations.length,
        percentage: totalAmount > 0 ? Math.round((amount / totalAmount) * 100) : 0
      };
    });

    return {
      [reportType]: {
        title: reportType === 'daily' ? 'Daily Collection Report' : reportType === 'monthly' ? 'Monthly Donation Report' : 'Annual Summary Report',
        date: today.toISOString().split('T')[0],
        period: reportType === 'monthly' ? `${today.toLocaleString('default', { month: 'long' })} ${today.getFullYear()}` : undefined,
        year: reportType === 'annual' ? today.getFullYear().toString() : undefined,
        summary: {
          totalAmount: totalAmount,
          transactions: transactions,
          avgDonation: transactions > 0 ? Math.round(totalAmount / transactions) : 0,
          categories: categoryStats
        }
      }
    };
  };

  const reportTypes = [
    { id: 'daily', name: 'Daily Collection Report', icon: Calendar },
    { id: 'monthly', name: 'Monthly Donation Report', icon: TrendingUp },
    { id: 'annual', name: 'Annual Summary', icon: FileText },
    { id: 'donor', name: 'Donor History', icon: Users },
  ];

  const categories = ['all', 'Tithes', 'Offerings', 'Building Fund', 'Mass Intentions', 'Candles', 'Other'];

  // currentReportData is now loaded from API
  const currentReportData = reportData[selectedReport] || { 
    title: 'No Data',
    date: new Date().toISOString().split('T')[0],
    summary: { 
      totalAmount: 0,
      transactions: 0,
      avgDonation: 0,
      avgMonthly: 0,
      growth: 0,
      categories: [],
      monthlyBreakdown: []
    } 
  };

  const handleRunReport = () => {
    setShowPreview(true);
  };

  const handleExport = (format) => {
    showInfoToast('Exporting', `Exporting ${selectedReport} report as ${format}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#4158D0' }}>Financial Reports</h1>
            <p className="text-gray-600 text-sm mt-1">Generate and export financial reports</p>
          </div>
        </div>

        {/* Report Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportTypes.map((report) => {
            const Icon = report.icon;
            return (
              <button
                key={report.id}
                onClick={() => {
                  setSelectedReport(report.id);
                  setShowPreview(true);
                }}
                className={`p-6 rounded-2xl border-2 transition-all text-left shadow-lg hover:shadow-2xl group relative overflow-hidden ${
                  selectedReport === report.id
                    ? 'border-blue-200 bg-white'
                    : 'border-gray-200 bg-white hover:border-blue-100'
                }`}
              >
                <div className="p-3 rounded-xl inline-flex shadow-lg transition-transform group-hover:scale-110" style={{ 
                  background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
                  boxShadow: '0 4px 12px rgba(65, 88, 208, 0.3)'
                }}>
                  <Icon size={24} className="text-white" />
                </div>
                <p className={`mt-3 font-bold ${
                  selectedReport === report.id 
                    ? 'text-gray-900' 
                    : 'text-gray-700'
                }`}>
                  {report.name}
                </p>
              </button>
            );
          })}
        </div>

        {/* Report Configuration */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Report Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category Filter</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Report Preview */}
        {showPreview && currentReportData && (
          <div className="bg-white border-2 border-purple-100 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">{currentReportData.title}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleExport('CSV')}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border-2 border-purple-200 rounded-xl hover:shadow-lg transition-all"
                >
                  <Download size={16} />
                  CSV
                </button>
                <button
                  onClick={() => handleExport('PDF')}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-xl hover:opacity-90 transition-all shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #667eea 100%)' }}
                >
                  <Download size={16} />
                  PDF
                </button>
              </div>
            </div>

            {/* Report Content */}
            {selectedReport === 'daily' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-white rounded-xl border-2 border-purple-100">
                    <p className="text-sm text-purple-600 font-medium">Total Amount</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">₱{(currentReportData.summary?.totalAmount || 0).toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-white rounded-xl border-2 border-blue-100">
                    <p className="text-sm text-blue-600 font-medium">Transactions</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{currentReportData.summary.transactions}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-green-50 to-white rounded-xl border-2 border-green-100">
                    <p className="text-sm text-green-600 font-medium">Date</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{currentReportData.date || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-3">Category Breakdown</h4>
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-purple-50 to-blue-50 border-b-2 border-purple-200">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-bold text-purple-700 uppercase">Category</th>
                        <th className="px-4 py-2 text-left text-xs font-bold text-purple-700 uppercase">Count</th>
                        <th className="px-4 py-2 text-left text-xs font-bold text-purple-700 uppercase">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-100">
                      {(currentReportData.summary?.categories || []).map((cat, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm text-gray-900">{cat.name}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">{cat.count || 0}</td>
                          <td className="px-4 py-2 text-sm font-bold text-gray-900">₱{(cat.amount || 0).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedReport === 'monthly' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">₱{currentReportData.summary.totalAmount.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Transactions</p>
                    <p className="text-2xl font-bold text-gray-900">{currentReportData.summary?.transactions || 0}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Avg Donation</p>
                    <p className="text-2xl font-bold text-gray-900">₱{currentReportData.summary?.avgDonation || 0}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Period</p>
                    <p className="text-lg font-bold text-gray-900">{currentReportData.period || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Category Distribution</h4>
                  <div className="space-y-4">
                    {(currentReportData.summary?.categories || []).map((cat, index) => (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-900">{cat.name}</span>
                          <span className="text-sm font-bold text-gray-900">₱{(cat.amount || 0).toLocaleString()} ({cat.percentage || 0}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${cat.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedReport === 'annual' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">₱{(currentReportData.summary?.totalAmount || 0).toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Transactions</p>
                    <p className="text-2xl font-bold text-gray-900">{currentReportData.summary?.transactions || 0}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Avg Monthly</p>
                    <p className="text-2xl font-bold text-gray-900">₱{(currentReportData.summary?.avgMonthly || 0).toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Growth</p>
                    <p className="text-2xl font-bold text-green-600">+{currentReportData.summary?.growth || 0}%</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Monthly Breakdown</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="h-64 flex items-end justify-between gap-2">
                      {(currentReportData.summary?.monthlyBreakdown || []).map((month, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <div
                            className="w-full bg-blue-600 rounded-t"
                            style={{ height: `${(month.amount / 200000) * 100}%` }}
                          ></div>
                          <p className="text-xs text-gray-600 mt-2">{month.month}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialReports;
