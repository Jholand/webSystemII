import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  Clock,
  Calendar,
  PieChart,
  Users,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const AccountantDashboard = () => {
  const { user } = useAuth();
  const [filterPeriod, setFilterPeriod] = useState('monthly');

  // Financial Overview Stats
  const financialStats = [
    { label: 'Total Revenue', value: '₱310,000', icon: DollarSign, change: '+12%', trend: 'up' },
    { label: 'Collections Today', value: '₱8,200', icon: TrendingUp, change: '+5%', trend: 'up' },
    { label: 'Pending Payments', value: '₱23,300', icon: AlertCircle, change: '-8%', trend: 'down' },
    { label: 'Monthly Income', value: '₱285,000', icon: Calendar, change: '+18%', trend: 'up' },
  ];

  // Monthly Income Summary (6 months)
  const monthlyIncomeSummary = [
    { month: 'Jun', donations: 85000, collections: 62000, billing: 48000, total: 195000 },
    { month: 'Jul', donations: 92000, collections: 68000, billing: 52000, total: 212000 },
    { month: 'Aug', donations: 88000, collections: 71000, billing: 49000, total: 208000 },
    { month: 'Sep', donations: 95000, collections: 75000, billing: 55000, total: 225000 },
    { month: 'Oct', donations: 102000, collections: 80000, billing: 58000, total: 240000 },
    { month: 'Nov', donations: 110000, collections: 118000, billing: 62000, total: 290000 },
  ];

  // Donation Summary by Category
  const donationBreakdown = {
    daily: { 
      tithes: 2500, 
      offerings: 1200, 
      buildingFund: 3000, 
      specialCollection: 1500,
      total: 8200 
    },
    weekly: { 
      tithes: 18500, 
      offerings: 8400, 
      buildingFund: 12000, 
      specialCollection: 10500,
      total: 49400 
    },
    monthly: { 
      tithes: 75000, 
      offerings: 32000, 
      buildingFund: 45000, 
      specialCollection: 38000,
      total: 190000 
    },
  };

  const currentPeriodData = donationBreakdown[filterPeriod];

  // Recent Pending Payments
  const pendingPayments = [
    { id: 1, invoice: 'INV-003', client: 'Jose Garcia', service: 'Funeral Mass', amount: 8000, dueDate: '2025-11-25', daysOverdue: 0 },
    { id: 2, invoice: 'INV-004', client: 'Anna Cruz', service: 'House Blessing', amount: 3000, dueDate: '2025-11-24', daysOverdue: 0 },
    { id: 3, invoice: 'INV-005', client: 'Pedro Lopez', service: 'Wedding', amount: 12000, dueDate: '2025-11-23', daysOverdue: 0 },
    { id: 4, invoice: 'INV-006', client: 'Rita Santos', service: 'Baptism', amount: 300, dueDate: '2025-11-22', daysOverdue: 1 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Financial Overview
          </h1>
          <p className="text-blue-900">Real-time monitoring and analytics of church financial operations</p>
        </div>

        {/* Financial Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {financialStats.map((stat, index) => (
            <div 
              key={index} 
              className="group bg-white rounded-xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 border border-blue-200/50 hover:border-blue-600/50"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 bg-gradient-to-br from-black via-[#0A1628] to-[#1E3A8A] rounded-lg shadow-md group-hover:shadow-lg transition-shadow">
                  <stat.icon size={22} className="text-white" />
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                  {stat.trend === 'up' ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                  {stat.change}
                </div>
              </div>
              <div>
                <p className="text-sm text-blue-900 mb-1.5 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Monthly Income Summary Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-200/50">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="text-blue-900" size={20} />
                Monthly Income Summary
              </h2>
              <p className="text-sm text-blue-900 mt-0.5">6-month revenue breakdown</p>
            </div>
            <div className="flex gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-black"></div>
                <span className="text-blue-900">Donations</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#1E3A8A]"></div>
                <span className="text-blue-900">Collections</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-gray-900"></div>
                <span className="text-blue-900">Billing</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {monthlyIncomeSummary.map((month, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-blue-900 w-12">{month.month}</span>
                  <span className="text-sm font-bold text-gray-900">₱{month.total.toLocaleString()}</span>
                </div>
                <div className="flex gap-1 h-7 rounded-lg overflow-hidden bg-slate-100">
                  <div 
                    className="bg-black flex items-center justify-center text-xs font-semibold text-white hover:bg-[#0A1628] transition-colors"
                    style={{ width: `${(month.donations / month.total) * 100}%` }}
                    title={`Donations: ₱${month.donations.toLocaleString()}`}
                  >
                    {((month.donations / month.total) * 100).toFixed(0)}%
                  </div>
                  <div 
                    className="bg-[#1E3A8A] flex items-center justify-center text-xs font-semibold text-white hover:bg-blue-800 transition-colors"
                    style={{ width: `${(month.collections / month.total) * 100}%` }}
                    title={`Collections: ₱${month.collections.toLocaleString()}`}
                  >
                    {((month.collections / month.total) * 100).toFixed(0)}%
                  </div>
                  <div 
                    className="bg-gray-600 flex items-center justify-center text-xs font-semibold text-white hover:bg-gray-700 transition-colors"
                    style={{ width: `${(month.billing / month.total) * 100}%` }}
                    title={`Billing: ₱${month.billing.toLocaleString()}`}
                  >
                    {((month.billing / month.total) * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Donation Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <PieChart className="text-slate-700" size={20} />
                  Donation Summary
                </h2>
                <p className="text-sm text-slate-600 mt-1">Breakdown by category</p>
              </div>
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 bg-white text-sm font-medium"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-slate-700">Tithes</span>
                  <span className="text-lg font-bold text-slate-900">₱{currentPeriodData.tithes.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${(currentPeriodData.tithes / currentPeriodData.total) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-slate-600 mt-1">{((currentPeriodData.tithes / currentPeriodData.total) * 100).toFixed(1)}% of total</p>
              </div>

              <div className="p-4 bg-gray-100 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-slate-700">Offerings</span>
                  <span className="text-lg font-bold text-slate-900">₱{currentPeriodData.offerings.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="h-full bg-gray-600 rounded-full"
                    style={{ width: `${(currentPeriodData.offerings / currentPeriodData.total) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-slate-600 mt-1">{((currentPeriodData.offerings / currentPeriodData.total) * 100).toFixed(1)}% of total</p>
              </div>

              <div className="p-4 bg-gray-100 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-slate-700">Building Fund</span>
                  <span className="text-lg font-bold text-slate-900">₱{currentPeriodData.buildingFund.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="h-full bg-gray-600 rounded-full"
                    style={{ width: `${(currentPeriodData.buildingFund / currentPeriodData.total) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-slate-600 mt-1">{((currentPeriodData.buildingFund / currentPeriodData.total) * 100).toFixed(1)}% of total</p>
              </div>

              <div className="p-4 bg-gray-100 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-slate-700">Special Collection</span>
                  <span className="text-lg font-bold text-slate-900">₱{currentPeriodData.specialCollection.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="h-full bg-gray-600 rounded-full"
                    style={{ width: `${(currentPeriodData.specialCollection / currentPeriodData.total) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-slate-600 mt-1">{((currentPeriodData.specialCollection / currentPeriodData.total) * 100).toFixed(1)}% of total</p>
              </div>

              <div className="pt-4 border-t-2 border-slate-300">
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-slate-900">Total</span>
                  <span className="text-2xl font-bold text-slate-900">
                    ₱{currentPeriodData.total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Payments */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle className="text-amber-600" size={20} />
                Pending Payments
              </h2>
              <p className="text-sm text-slate-600 mt-1">Outstanding invoices requiring attention</p>
            </div>

            <div className="space-y-3">
              {pendingPayments.map((payment) => (
                <div 
                  key={payment.id}
                  className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 hover:shadow-sm transition-all"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-slate-900">{payment.client}</p>
                      <p className="text-xs text-slate-600">{payment.invoice} • {payment.service}</p>
                    </div>
                    <span className="text-lg font-bold text-gray-900">₱{payment.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600">Due: {payment.dueDate}</span>
                    {payment.daysOverdue > 0 ? (
                      <span className="bg-gray-200 text-gray-700 font-semibold px-2 py-1 rounded border border-gray-300">
                        {payment.daysOverdue} day(s) overdue
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-600 font-semibold px-2 py-1 rounded border border-gray-200">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-700">Total Outstanding:</span>
                <span className="text-xl font-bold text-gray-900">
                  ₱{pendingPayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountantDashboard;
