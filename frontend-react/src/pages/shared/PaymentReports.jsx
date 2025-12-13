import { useState, useEffect } from 'react';
import { Calendar, DollarSign, TrendingUp, Users, Filter, Download, Eye } from 'lucide-react';
import Card from '../../components/ui/Card';
import { paymentRecordAPI, donationAPI } from '../../services/dataSync';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const PaymentReports = ({ userRole }) => {
  const [period, setPeriod] = useState('monthly');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [loading, setLoading] = useState(true);
  const [currentData, setCurrentData] = useState([]);

  useEffect(() => {
    loadReportData();
  }, [period, selectedMonth, selectedYear]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      const [paymentsRes, donationsRes] = await Promise.all([
        paymentRecordAPI.getAll().catch(() => ({ data: [] })),
        donationAPI.getAll().catch(() => ({ data: [] }))
      ]);

      const payments = Array.isArray(paymentsRes?.data) ? paymentsRes.data : (Array.isArray(paymentsRes) ? paymentsRes : []);
      const donations = Array.isArray(donationsRes?.data) ? donationsRes.data : (Array.isArray(donationsRes) ? donationsRes : []);

      // Process data based on period
      const processedData = processDataByPeriod(payments, donations, period);
      setCurrentData(processedData);
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processDataByPeriod = (payments, donations, period) => {
    const allTransactions = [...payments, ...donations];
    const grouped = {};
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    allTransactions.forEach(transaction => {
      const date = new Date(transaction.created_at || transaction.date || transaction.payment_date);
      if (isNaN(date)) return;

      let key;
      if (period === 'today') {
        // Only today's transactions
        const transactionDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        if (transactionDate.getTime() !== today.getTime()) return;
        key = date.toISOString().split('T')[0];
      } else if (period === 'daily') {
        // Group by day - last 30 days
        key = date.toISOString().split('T')[0];
      } else if (period === 'weekly') {
        // Group by week - last 12 weeks
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else if (period === 'monthly') {
        // Group by month - last 12 months
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else if (period === 'yearly') {
        // Group by year - last 5 years
        key = date.getFullYear().toString();
      }

      if (!grouped[key]) {
        grouped[key] = {
          period: key,
          donations: 0,
          eventFees: 0,
          total: 0,
          count: 0
        };
      }

      const amount = parseFloat(transaction.amount) || 0;
      
      // Check if it's a donation or payment
      if (transaction.donation_category_id || transaction.category) {
        grouped[key].donations += amount;
      } else {
        grouped[key].eventFees += amount;
      }
      grouped[key].total += amount;
      grouped[key].count += 1;
    });

    // Convert to array and sort
    let result = Object.keys(grouped)
      .sort()
      .map(key => grouped[key]);

    // Format display based on period
    result = result.map(item => ({
      ...item,
      displayPeriod: formatPeriodDisplay(item.period, period)
    }));

    return result;
  };

  const formatPeriodDisplay = (period, type) => {
    if (type === 'today') {
      return 'Today';
    } else if (type === 'daily') {
      const date = new Date(period);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else if (type === 'weekly') {
      const date = new Date(period);
      return `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    } else if (type === 'monthly') {
      const [year, month] = period.split('-');
      const date = new Date(year, parseInt(month) - 1);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    } else {
      return period;
    }
  };

  // currentData is now loaded from API via loadReportData()

  // Calculate totals
  const totals = currentData.reduce(
    (acc, item) => ({
      donations: acc.donations + item.donations,
      eventFees: acc.eventFees + item.eventFees,
      total: acc.total + item.total,
      count: acc.count + item.count,
    }),
    { donations: 0, eventFees: 0, total: 0, count: 0 }
  );

  const stats = [
    {
      label: 'Total Revenue',
      value: `₱${totals.total.toLocaleString()}`,
      icon: DollarSign,
      color: 'from-green-600 to-green-700',
    },
    {
      label: 'Donations',
      value: `₱${totals.donations.toLocaleString()}`,
      icon: TrendingUp,
      color: 'from-blue-600 to-blue-700',
    },
    {
      label: 'Event Fees',
      value: `₱${totals.eventFees.toLocaleString()}`,
      icon: Calendar,
      color: 'from-purple-600 to-purple-700',
    },
    {
      label: 'Total Transactions',
      value: totals.count.toString(),
      icon: Users,
      color: 'from-orange-600 to-orange-700',
    },
  ];

  const handleExport = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.setTextColor(70, 103, 207);
    doc.text('Payment Reports', 105, 20, { align: 'center' });
    
    // Add subtitle with period and date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const periodText = period.charAt(0).toUpperCase() + period.slice(1);
    doc.text(`Report Period: ${periodText}`, 105, 28, { align: 'center' });
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`, 105, 34, { align: 'center' });

    // Add summary statistics
    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    doc.text('Summary Statistics', 14, 45);
    
    const totals = currentData.reduce((acc, item) => ({
      donations: acc.donations + item.donations,
      eventFees: acc.eventFees + item.eventFees,
      total: acc.total + item.total,
      count: acc.count + item.count
    }), { donations: 0, eventFees: 0, total: 0, count: 0 });

    doc.setFontSize(9);
    doc.text(`Total Donations: ₱${totals.donations.toFixed(2)}`, 14, 52);
    doc.text(`Total Event Fees: ₱${totals.eventFees.toFixed(2)}`, 14, 57);
    doc.text(`Total Amount: ₱${totals.total.toFixed(2)}`, 14, 62);
    doc.text(`Total Transactions: ${totals.count}`, 14, 67);

    // Prepare table data
    const tableData = currentData.map((item) => [
      item.displayPeriod || item.period,
      `₱${item.donations.toFixed(2)}`,
      `₱${item.eventFees.toFixed(2)}`,
      `₱${item.total.toFixed(2)}`,
      item.count.toString()
    ]);
    
    // Add table
    autoTable(doc, {
      startY: 75,
      head: [['Period', 'Donations', 'Event Fees', 'Total', 'Transactions']],
      body: tableData,
      theme: 'striped',
      styles: {
        fontSize: 8,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [70, 103, 207],
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        textColor: [50, 50, 50]
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250]
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 35, halign: 'right' },
        2: { cellWidth: 35, halign: 'right' },
        3: { cellWidth: 35, halign: 'right' },
        4: { cellWidth: 30, halign: 'center' }
      },
      margin: { top: 75, left: 14, right: 14 }
    });

    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
    
    // Save the PDF
    const fileName = `payment-report-${period}-${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);
  };

  return (
    <div className="min-h-screen p-6 bg-white">
      <div className="space-y-6">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 bg-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold mb-1" style={{ color: '#4158D0' }}>
                Payment Reports
              </h1>
              <p className="text-gray-600 text-sm">
                <Eye className="inline-block mr-1" size={14} />
                View-only access to payment summaries
              </p>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-6 py-3 rounded-lg text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              style={{
                background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
              }}
            >
              <Download size={18} />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Period Selector */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-600" />
              <span className="font-medium text-gray-700">Report Period:</span>
            </div>
            <div className="flex gap-2">
              {['today', 'daily', 'weekly', 'monthly', 'yearly'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${
                    period === p
                      ? 'shadow-lg'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  style={period === p ? {
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
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-all p-6 border border-gray-200 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 rounded-lg group-hover:scale-110 transition-transform" style={{ 
                    background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
                  }}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <TrendingUp size={16} className="text-gray-400" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-sm font-semibold text-gray-700">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Line Chart */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-xl font-bold mb-6" style={{ color: '#4158D0' }}>
            {period.charAt(0).toUpperCase() + period.slice(1)} Revenue Trend
          </h2>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={currentData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="displayPeriod" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value) => `₱${value.toLocaleString()}`}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    padding: '10px'
                  }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="line"
                />
                <Line 
                  type="monotone" 
                  dataKey="donations" 
                  stroke="#4158D0" 
                  strokeWidth={3}
                  dot={{ fill: '#4158D0', r: 5, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 7 }}
                  name="Donations"
                />
                <Line 
                  type="monotone" 
                  dataKey="eventFees" 
                  stroke="#2563eb" 
                  strokeWidth={3}
                  dot={{ fill: '#2563eb', r: 5, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 7 }}
                  name="Event Fees"
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', r: 5, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 7 }}
                  name="Total Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold" style={{ color: '#4158D0' }}>
              {period.charAt(0).toUpperCase() + period.slice(1)} Report
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    {period === 'daily' && 'Date'}
                    {period === 'weekly' && 'Week'}
                    {period === 'monthly' && 'Month'}
                    {period === 'yearly' && 'Year'}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                    Donations
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                    Event Fees
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                    Total
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                    Transactions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      Loading data...
                    </td>
                  </tr>
                ) : currentData.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      No data available for this period
                    </td>
                  </tr>
                ) : (
                  currentData.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {row.displayPeriod}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-700">
                        ₱{row.donations.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-700">
                        ₱{row.eventFees.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                        ₱{row.total.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-700">
                        {row.count}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                <tr>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900">TOTALS</td>
                  <td className="px-4 py-3 text-sm text-right font-bold text-gray-900">
                    ₱{totals.donations.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-bold text-gray-900">
                    ₱{totals.eventFees.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-bold" style={{ color: '#4158D0' }}>
                    ₱{totals.total.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-bold text-gray-900">
                    {totals.count}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm" style={{ color: '#4158D0' }}>
            <Eye className="inline-block mr-1" size={14} />
            <strong>Note:</strong> This is a read-only view of payment reports. For payment
            management and detailed transactions, contact the Accountant or Church Admin.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentReports;
