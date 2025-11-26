import { useState } from 'react';
import { FileText, Download, Calendar, TrendingUp, DollarSign, PieChart, BarChart3, Filter, Eye, Printer } from 'lucide-react';

const FinancialReports = () => {
  const [reportType, setReportType] = useState('monthly');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showPreview, setShowPreview] = useState(false);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const reportData = {
    monthly: {
      donations: 125000,
      collections: 98000,
      billing: 87000,
      expenses: 45000,
      netIncome: 265000,
    },
    quarterly: {
      donations: 375000,
      collections: 294000,
      billing: 261000,
      expenses: 135000,
      netIncome: 795000,
    },
    annual: {
      donations: 1500000,
      collections: 1176000,
      billing: 1044000,
      expenses: 540000,
      netIncome: 3180000,
    },
  };

  const currentData = reportData[reportType];

  // Donation Breakdown
  const donationBreakdown = [
    { category: 'Tithes', amount: 450000, percentage: 35 },
    { category: 'Sunday Offerings', amount: 320000, percentage: 25 },
    { category: 'Building Fund', amount: 280000, percentage: 22 },
    { category: 'Special Collections', amount: 150000, percentage: 12 },
    { category: 'Others', amount: 80000, percentage: 6 },
  ];

  // Collections Report
  const collectionsData = [
    { event: 'Sunday Mass Collections', amount: 520000, count: 48 },
    { event: 'Special Events', amount: 180000, count: 12 },
    { event: 'Candle Offerings', amount: 65000, count: 365 },
    { event: 'Prayer Intentions', amount: 45000, count: 90 },
  ];

  // Expense Report
  const expenseData = [
    { category: 'Utilities', amount: 120000, percentage: 22 },
    { category: 'Maintenance', amount: 95000, percentage: 18 },
    { category: 'Salaries', amount: 200000, percentage: 37 },
    { category: 'Supplies', amount: 65000, percentage: 12 },
    { category: 'Others', amount: 60000, percentage: 11 },
  ];

  const handleGenerateReport = () => {
    alert(`Generating ${reportType} report for ${months[selectedMonth]} ${selectedYear}...`);
  };

  const handleDownloadPDF = () => {
    alert('Downloading report as PDF...');
  };

  const handleDownloadExcel = () => {
    alert('Downloading report as Excel...');
  };

  const handlePrintReport = () => {
    alert('Printing financial report...');
  };

  const handlePreview = () => {
    setShowPreview(!showPreview);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Financial Reports</h1>
            <p className="text-blue-900">Generate comprehensive financial reports and analytics</p>
          </div>
        </div>

        {/* Report Generator */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Filter size={20} className="text-blue-600" />
            Report Configuration
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="monthly">Monthly Report</option>
                <option value="quarterly">Quarterly Report</option>
                <option value="annual">Annual Report</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                disabled={reportType === 'annual'}
              >
                {months.map((month, index) => (
                  <option key={index} value={index}>{month}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {[2023, 2024, 2025, 2026].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleGenerateReport}
                className="w-full px-6 py-2.5 bg-gradient-to-r from-black via-[#0A1628] to-[#1E3A8A] text-white rounded-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 font-semibold"
              >
                <FileText size={18} />
                Generate Report
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-blue-100">
                <DollarSign className="text-blue-600" size={20} />
              </div>
              <p className="text-xs text-gray-600 font-semibold uppercase">Donations</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">₱{currentData.donations.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-purple-100">
                <PieChart className="text-purple-600" size={20} />
              </div>
              <p className="text-xs text-gray-600 font-semibold uppercase">Collections</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">₱{currentData.collections.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-green-100">
                <FileText className="text-green-600" size={20} />
              </div>
              <p className="text-xs text-gray-600 font-semibold uppercase">Billing</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">₱{currentData.billing.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-red-100">
                <TrendingUp className="text-red-600" size={20} />
              </div>
              <p className="text-xs text-gray-600 font-semibold uppercase">Expenses</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">₱{currentData.expenses.toLocaleString()}</p>
          </div>

          <div className="bg-gradient-to-br from-black via-[#0A1628] to-[#1E3A8A] rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-white/20">
                <BarChart3 className="text-white" size={20} />
              </div>
              <p className="text-xs text-white font-semibold uppercase">Net Income</p>
            </div>
            <p className="text-2xl font-bold text-white">₱{currentData.netIncome.toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Donation Breakdown */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <PieChart size={20} className="text-indigo-600" />
              Donation Breakdown
            </h2>
            
            <div className="space-y-4">
              {donationBreakdown.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">{item.category}</span>
                    <span className="text-sm font-bold text-gray-900">₱{item.amount.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-black via-[#0A1628] to-[#1E3A8A] rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{item.percentage}% of total donations</div>
                </div>
              ))}
            </div>
          </div>

          {/* Collections Report */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 size={20} className="text-cyan-600" />
              Collections Report
            </h2>
            
            <div className="space-y-4">
              {collectionsData.map((item, index) => (
                <div key={index} className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-gray-700">{item.event}</span>
                    <span className="text-lg font-bold text-blue-600">₱{item.amount.toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-gray-600">{item.count} collections</div>
                </div>
              ))}
            </div>
          </div>

          {/* Expense Report */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100 lg:col-span-2">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-red-600" />
              Expense Report
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {expenseData.map((item, index) => (
                <div key={index} className="p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border border-red-200">
                  <div className="text-sm font-bold text-gray-700 mb-2">{item.category}</div>
                  <div className="text-2xl font-bold text-red-600 mb-1">₱{item.amount.toLocaleString()}</div>
                  <div className="text-xs text-gray-600">{item.percentage}% of expenses</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Report Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Report Actions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={handlePreview}
              className="px-6 py-3 bg-white border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-all flex items-center justify-center gap-2 font-semibold"
            >
              <Eye size={18} />
              Preview Report
            </button>

            <button
              onClick={handleDownloadPDF}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 font-semibold"
            >
              <Download size={18} />
              Download PDF
            </button>

            <button
              onClick={handleDownloadExcel}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 font-semibold"
            >
              <Download size={18} />
              Download Excel
            </button>

            <button
              onClick={handlePrintReport}
              className="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 font-semibold"
            >
              <Printer size={18} />
              Print Report
            </button>
          </div>
        </div>

        {/* Report Preview */}
        {showPreview && (
          <div className="bg-white rounded-xl shadow-lg p-8 border border-blue-100">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Church Financial Report</h2>
              <p className="text-gray-600 mt-1 capitalize">{reportType} Report - {months[selectedMonth]} {selectedYear}</p>
            </div>

            <div className="space-y-6">
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Income Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-700">Total Donations:</span>
                    <span className="font-bold">₱{currentData.donations.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-700">Total Collections:</span>
                    <span className="font-bold">₱{currentData.collections.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-700">Billing Revenue:</span>
                    <span className="font-bold">₱{currentData.billing.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-700">Total Expenses:</span>
                    <span className="font-bold text-red-600">₱{currentData.expenses.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex justify-between mt-4 pt-4 border-t-2 border-gray-300">
                  <span className="text-lg font-bold text-gray-900">Net Income:</span>
                  <span className="text-lg font-bold text-green-600">₱{currentData.netIncome.toLocaleString()}</span>
                </div>
              </div>

              <div className="text-center text-sm text-gray-500 mt-8 pt-6 border-t">
                <p>Generated on {new Date().toLocaleDateString()}</p>
                <p className="mt-1">This is a preview. Download or print for the complete report.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialReports;
