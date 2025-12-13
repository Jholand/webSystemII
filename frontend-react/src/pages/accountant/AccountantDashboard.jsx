import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, FileText, TrendingUp, Tag, Plus, Download, BarChart3, Users, Calendar } from 'lucide-react';
import { showInfoToast } from '../../utils/sweetAlertHelper';
import { donationAPI, paymentRecordAPI, donationCategoryAPI } from '../../services/dataSync';

const AccountantDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todaysCollections: 0,
    pendingReceipts: 0,
    monthlyTotal: 0,
    categoriesCount: 0,
    weeklyCollection: 0,
    avgDonation: 0,
    totalDonors: 0,
    totalDonationCount: 0
  });
  const [topCategories, setTopCategories] = useState([]);
  const [dailyTrend, setDailyTrend] = useState([0, 0, 0, 0, 0, 0, 0]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [donationsRes, paymentsRes, categoriesRes] = await Promise.all([
        donationAPI.getAll().catch(() => ({ data: [] })),
        paymentRecordAPI.getAll().catch(() => ({ data: [] })),
        donationCategoryAPI.getAll().catch(() => [])
      ]);

      // Extract data arrays from responses
      const donations = donationsRes?.data || (Array.isArray(donationsRes) ? donationsRes : []);
      const payments = paymentsRes?.data || (Array.isArray(paymentsRes) ? paymentsRes : []);
      const categories = Array.isArray(categoriesRes?.data) ? categoriesRes.data : (Array.isArray(categoriesRes) ? categoriesRes : []);

      console.log('Loaded data:', { donations: donations.length, payments: payments.length, categories: categories.length });

      // Calculate stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];
      
      // Today's collections (donations + payments)
      const todayDonations = donations.filter(d => {
        const donationDate = d.donation_date || d.created_at;
        return donationDate?.startsWith(todayStr);
      });
      const todayPayments = payments.filter(p => {
        const paymentDate = p.payment_date || p.created_at;
        return paymentDate?.startsWith(todayStr);
      });
      const todaysTotal = todayDonations.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0) +
                         todayPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

      // Weekly collections (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weeklyDonations = donations.filter(d => {
        const donationDate = new Date(d.donation_date || d.created_at);
        return donationDate >= weekAgo;
      });
      const weeklyPayments = payments.filter(p => {
        const paymentDate = new Date(p.payment_date || p.created_at);
        return paymentDate >= weekAgo;
      });
      const weeklyTotal = weeklyDonations.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0) +
                         weeklyPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

      // Monthly totals
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      const monthlyDonations = donations.filter(d => {
        const donationDate = new Date(d.donation_date || d.created_at);
        return donationDate.getMonth() === currentMonth && donationDate.getFullYear() === currentYear;
      });
      const monthlyPayments = payments.filter(p => {
        const paymentDate = new Date(p.payment_date || p.created_at);
        return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
      });
      const monthlyTotal = monthlyDonations.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0) +
                          monthlyPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

      // Pending receipts
      const pendingPayments = payments.filter(p => p.status === 'pending' || p.status === 'Pending').length;

      // Average donation
      const totalDonationCount = monthlyDonations.length;
      const avgDonation = totalDonationCount > 0 ? monthlyDonations.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0) / totalDonationCount : 0;

      // Total unique donors this month
      const uniqueDonors = new Set(monthlyDonations.map(d => d.donor_name || d.donor_id || d.user_id).filter(Boolean));

      setStats({
        todaysCollections: todaysTotal,
        pendingReceipts: pendingPayments,
        monthlyTotal: monthlyTotal,
        categoriesCount: categories.length,
        weeklyCollection: weeklyTotal,
        avgDonation: avgDonation,
        totalDonors: uniqueDonors.size,
        totalDonationCount: totalDonationCount
      });

      // Calculate top categories
      const categoryStats = categories.map(cat => {
        const catDonations = donations.filter(d => 
          d.donation_category_id === cat.id || 
          d.category_id === cat.id || 
          d.category === cat.name
        );
        const total = catDonations.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
        return {
          name: cat.name,
          amount: total,
          percentage: monthlyTotal > 0 ? Math.round((total / monthlyTotal) * 100) : 0
        };
      }).sort((a, b) => b.amount - a.amount).slice(0, 4);

      setTopCategories(categoryStats);

      // Calculate daily trend (last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      });

      const trend = last7Days.map(date => {
        const dayDonations = donations.filter(d => (d.donation_date || d.created_at)?.startsWith(date));
        const dayPayments = payments.filter(p => (p.payment_date || p.created_at)?.startsWith(date));
        return dayDonations.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0) +
               dayPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
      });

      setDailyTrend(trend);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportDaily = () => {
    showInfoToast('Exporting', 'Exporting daily report...');
  };

  const handleRecordDonation = () => {
    navigate('/accountant/donations/new');
  };

  const statsDisplay = [
    { label: "Total Collections", value: `₱${stats.monthlyTotal.toLocaleString()}`, icon: DollarSign, color: 'green' },
    { label: 'Total Donations', value: stats.totalDonationCount, icon: FileText, color: 'blue' },
    { label: 'Average Donation', value: `₱${Math.round(stats.avgDonation).toLocaleString()}`, icon: TrendingUp, color: 'purple' },
    { label: 'Uncategorized', value: 0, icon: Tag, color: 'orange' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#4158D0' }}>Accountant Dashboard</h1>
              <p className="text-gray-600 text-sm mt-1">Financial management and donation tracking</p>
            </div>
            <button 
              onClick={handleExportDaily}
              className="flex items-center gap-2 px-5 py-3 text-white rounded-lg shadow-lg hover:shadow-xl transition-all font-semibold"
              style={{ 
                background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
                boxShadow: '0 4px 12px rgba(65, 88, 208, 0.3)'
              }}
            >
              <Download size={18} />
              Daily Report
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {statsDisplay.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border border-gray-200 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-transparent rounded-full transform translate-x-12 -translate-y-12 opacity-50"></div>
                <div className="relative flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl shadow-lg transform group-hover:scale-110 transition-transform" style={{ 
                    background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
                    boxShadow: '0 4px 12px rgba(65, 88, 208, 0.3)'
                  }}>
                    <Icon className="text-white" size={24} />
                  </div>
                </div>
                <div className="relative">
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">{stat.value}</h3>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleRecordDonation}
            className="rounded-lg p-6 hover:shadow-md transition-all group text-left border"
            style={{ backgroundColor: '#E8E9F5', borderColor: '#D9DBEF' }}
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg transition-opacity group-hover:opacity-90" style={{ backgroundColor: '#4667CF' }}>
                <Plus size={24} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-lg">Record Walk-In Donation</p>
                <p className="text-sm text-gray-600">Create new donation entry</p>
              </div>
            </div>
          </button>

          <button
            onClick={handleExportDaily}
            className="rounded-lg p-6 hover:shadow-md transition-all group text-left border"
            style={{ backgroundColor: '#E8E9F5', borderColor: '#D9DBEF' }}
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg transition-opacity group-hover:opacity-90" style={{ backgroundColor: '#4667CF' }}>
                <Download size={24} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-lg">Export Daily Report</p>
                <p className="text-sm text-gray-600">Download today's collections</p>
              </div>
            </div>
          </button>
        </div>

        {/* Analytics Section */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-transparent rounded-full transform translate-x-32 -translate-y-32 opacity-40"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg shadow-lg" style={{ 
                  background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
                  boxShadow: '0 4px 12px rgba(65, 88, 208, 0.3)'
                }}>
                  <BarChart3 size={20} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Financial Analytics
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-5 rounded-xl bg-white border-2 border-blue-100 hover:border-blue-200 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(65, 88, 208, 0.1)' }}>
                    <TrendingUp size={18} style={{ color: '#4158D0' }} />
                  </div>
                  <p className="text-sm font-semibold text-gray-700">Weekly Collection</p>
                </div>
                <p className="text-3xl font-bold" style={{ color: '#4158D0' }}>₱{stats.weeklyCollection.toLocaleString()}</p>
                <p className="text-xs mt-2 text-gray-600 font-medium">Last 7 days</p>
              </div>
              
              <div className="p-5 rounded-xl bg-white border-2 border-green-100 hover:border-green-200 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                    <DollarSign size={18} style={{ color: '#10b981' }} />
                  </div>
                  <p className="text-sm font-semibold text-gray-700">Avg. Donation</p>
                </div>
                <p className="text-3xl font-bold" style={{ color: '#10b981' }}>₱{Math.round(stats.avgDonation).toLocaleString()}</p>
                <p className="text-xs mt-2 text-gray-600 font-medium">Per donation</p>
              </div>
              
              <div className="p-5 rounded-xl bg-white border-2 border-cyan-100 hover:border-cyan-200 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(6, 182, 212, 0.1)' }}>
                    <Users size={18} style={{ color: '#06b6d4' }} />
                  </div>
                  <p className="text-sm font-semibold text-gray-700">Total Donors</p>
                </div>
                <p className="text-3xl font-bold" style={{ color: '#06b6d4' }}>{stats.totalDonors}</p>
                <p className="text-xs mt-2 text-gray-600 font-medium">Active this month</p>
              </div>
            </div>

            {/* Donation Trend Chart */}
            <div className="p-6 border rounded-xl bg-gradient-to-br from-blue-50/30 to-gray-50/30 shadow-inner" style={{ borderColor: '#E0E7FF' }}>
              <p className="text-base font-bold mb-4 text-gray-900">Daily Collection Trend (Last 7 Days)</p>
              <div className="h-40 flex items-end justify-between gap-3">
                {dailyTrend.map((amount, i) => {
                  const maxAmount = Math.max(...dailyTrend, 1);
                  const height = (amount / maxAmount) * 100;
                  const gradients = [
                    'from-purple-500 to-purple-600',
                    'from-blue-500 to-blue-600',
                    'from-indigo-500 to-indigo-600',
                    'from-violet-500 to-violet-600',
                    'from-purple-500 to-blue-600',
                    'from-blue-500 to-indigo-600',
                    'from-indigo-500 to-purple-600'
                  ];
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div 
                        className={`w-full rounded-t-xl transition-all hover:scale-105 relative group shadow-lg bg-gradient-to-b ${gradients[i]}`}
                        style={{ 
                          height: `${height}%`,
                          minHeight: '8px'
                        }}
                      >
                        <span className="absolute -top-7 left-1/2 transform -translate-x-1/2 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-white px-2 py-1 rounded shadow-md text-purple-600">
                          ₱{(amount/1000).toFixed(1)}k
                        </span>
                      </div>
                      <span className="text-xs font-medium text-purple-600">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Top Donation Categories with Pie Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Donation Distribution</h3>
            <div className="flex items-center justify-center">
              <div className="relative w-48 h-48">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  <defs>
                    <linearGradient id="pie-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#4667CF" />
                      <stop offset="100%" stopColor="#5777DF" />
                    </linearGradient>
                    <linearGradient id="pie-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#879BDA" />
                      <stop offset="100%" stopColor="#98ACE5" />
                    </linearGradient>
                    <linearGradient id="pie-grad-3" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#BEC4E0" />
                      <stop offset="100%" stopColor="#CFD5EB" />
                    </linearGradient>
                    <linearGradient id="pie-grad-4" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#D9DBEF" />
                      <stop offset="100%" stopColor="#E8E9F5" />
                    </linearGradient>
                  </defs>
                  
                  {/* Tithes - 35% */}
                  <circle
                    cx="50" cy="50" r="40"
                    fill="none"
                    stroke="url(#pie-grad-1)"
                    strokeWidth="20"
                    strokeDasharray="87.96 251.33"
                    strokeDashoffset="0"
                  />
                  {/* Mass Offerings - 30% */}
                  <circle
                    cx="50" cy="50" r="40"
                    fill="none"
                    stroke="url(#pie-grad-2)"
                    strokeWidth="20"
                    strokeDasharray="75.4 251.33"
                    strokeDashoffset="-87.96"
                  />
                  {/* Special Collections - 20% */}
                  <circle
                    cx="50" cy="50" r="40"
                    fill="none"
                    stroke="url(#pie-grad-3)"
                    strokeWidth="20"
                    strokeDasharray="50.27 251.33"
                    strokeDashoffset="-163.36"
                  />
                  {/* Others - 15% */}
                  <circle
                    cx="50" cy="50" r="40"
                    fill="none"
                    stroke="url(#pie-grad-4)"
                    strokeWidth="20"
                    strokeDasharray="37.7 251.33"
                    strokeDashoffset="-213.63"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-2xl font-bold" style={{ color: '#4667CF' }}>₱186K</p>
                  <p className="text-xs" style={{ color: '#879BDA' }}>Total</p>
                </div>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                { name: 'Tithes', percent: '35%', color: '#4667CF' },
                { name: 'Mass Offerings', percent: '30%', color: '#879BDA' },
                { name: 'Special Collections', percent: '20%', color: '#BEC4E0' },
                { name: 'Others', percent: '15%', color: '#D9DBEF' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <div>
                    <p className="text-xs font-medium text-gray-700">{item.name}</p>
                    <p className="text-xs font-bold" style={{ color: item.color }}>{item.percent}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Bars */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Categories (This Month)</h3>
            <div className="space-y-4">
              {topCategories.map((category, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-900">{category.name}</span>
                    <span className="text-sm font-bold text-gray-900">₱{category.amount.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${category.percentage}%`,
                        backgroundColor: '#4667CF'
                      }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{category.percentage}% of total</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Collections</span>
                <span className="text-lg font-bold text-gray-900">₱8,250</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Transactions</span>
                <span className="text-lg font-bold text-gray-900">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Donation</span>
                <span className="text-lg font-bold text-gray-900">₱688</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">This Month</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Revenue</span>
                <span className="text-lg font-bold text-gray-900">₱185,750</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Donors</span>
                <span className="text-lg font-bold text-gray-900">234</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Growth</span>
                <span className="text-lg font-bold text-green-600">+12%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountantDashboard;

