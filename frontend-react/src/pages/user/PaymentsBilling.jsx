import { useState } from 'react';
import { DollarSign, CreditCard, Download, Eye, Clock, CheckCircle, Calendar, Receipt, TrendingUp } from 'lucide-react';

const PaymentsBilling = () => {
  const [selectedTab, setSelectedTab] = useState('billing');

  const billingRecords = [
    {
      id: 1,
      service: 'Baptism - Baby Sofia Reyes',
      amount: '₱2,500',
      dueDate: '2025-12-10',
      status: 'Pending',
      invoiceDate: '2025-11-20'
    },
    {
      id: 2,
      service: 'Wedding - John & Maria Santos',
      amount: '₱15,000',
      dueDate: '2026-01-15',
      status: 'Pending',
      invoiceDate: '2025-11-18'
    },
    {
      id: 3,
      service: 'Funeral - Rosa Martinez',
      amount: '₱5,000',
      dueDate: '2025-11-10',
      status: 'Paid',
      invoiceDate: '2025-11-08',
      paidDate: '2025-11-09'
    }
  ];

  const paymentHistory = [
    {
      id: 1,
      description: 'Funeral Service - Rosa Martinez',
      amount: '₱5,000',
      date: '2025-11-09',
      method: 'GCash',
      reference: 'GC-2025110912345',
      status: 'Completed'
    },
    {
      id: 2,
      description: 'Mass Offering',
      amount: '₱500',
      date: '2025-10-25',
      method: 'Cash',
      reference: 'CS-2025102500123',
      status: 'Completed'
    },
    {
      id: 3,
      description: 'Baptism Reservation Fee',
      amount: '₱500',
      date: '2025-10-15',
      method: 'Bank Transfer',
      reference: 'BT-2025101512456',
      status: 'Completed'
    }
  ];

  const donationHistory = [
    {
      id: 1,
      campaign: 'Church Building Fund',
      amount: '₱1,000',
      date: '2025-11-15',
      method: 'GCash',
      reference: 'GC-2025111512345',
      receipt: 'DN-2025-001234'
    },
    {
      id: 2,
      campaign: 'Charity Outreach Program',
      amount: '₱500',
      date: '2025-10-20',
      method: 'PayMaya',
      reference: 'PM-2025102054321',
      receipt: 'DN-2025-001122'
    },
    {
      id: 3,
      campaign: 'Sunday Mass Collection',
      amount: '₱200',
      date: '2025-10-05',
      method: 'Cash',
      reference: 'CS-2025100500789',
      receipt: 'DN-2025-001045'
    }
  ];

  const stats = [
    { label: 'Pending Bills', value: `₱${(17500).toLocaleString()}`, icon: Clock },
    { label: 'Paid This Year', value: `₱${(5500).toLocaleString()}`, icon: CheckCircle },
    { label: 'Total Donations', value: `₱${(1700).toLocaleString()}`, icon: DollarSign },
    { label: 'Transactions', value: '6', icon: Receipt }
  ];

  const getStatusColor = (status) => {
    return status === 'Pending' 
      ? 'bg-blue-50 text-blue-700 border-blue-200' 
      : 'bg-gray-100 text-gray-700 border-gray-300';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Payments & Billing</h1>
            <p className="text-gray-600 text-sm mt-1">Manage your payments, billing, and donation records</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg p-4 shadow hover:shadow-md transition-shadow border border-gray-200">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-gradient-to-br from-black via-[#0A1628] to-[#1E3A8A] rounded-lg">
                  <stat.icon className="text-white" size={18} />
                </div>
              </div>
              <div>
                <p className="text-gray-600 text-xs mb-2">{stat.label}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white border border-gray-200 rounded-lg shadow">
          <div className="border-b border-gray-200">
            <div className="flex gap-2 p-2">
              <button
                onClick={() => setSelectedTab('billing')}
                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                  selectedTab === 'billing'
                    ? 'bg-gradient-to-r from-black via-[#0A1628] to-[#1E3A8A] text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <CreditCard size={20} />
                  <span>Billing & Invoices</span>
                </div>
              </button>
              <button
                onClick={() => setSelectedTab('payments')}
                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                  selectedTab === 'payments'
                    ? 'bg-gradient-to-r from-black via-[#0A1628] to-[#1E3A8A] text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Receipt size={20} />
                  <span>Payment History</span>
                </div>
              </button>
              <button
                onClick={() => setSelectedTab('donations')}
                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                  selectedTab === 'donations'
                    ? 'bg-gradient-to-r from-black via-[#0A1628] to-[#1E3A8A] text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <DollarSign size={20} />
                  <span>Donations</span>
                </div>
              </button>
            </div>
          </div>

          {/* Billing Tab */}
          {selectedTab === 'billing' && (
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Billing & Invoices</h3>
                <span className="text-sm text-gray-600">{billingRecords.length} records</span>
              </div>
              <div className="space-y-3">
                {billingRecords.map((bill) => (
                  <div key={bill.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow bg-white">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">{bill.service}</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-600">Invoice Date:</span>
                            <span className="ml-2 font-medium text-gray-900">{bill.invoiceDate}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Due Date:</span>
                            <span className="ml-2 font-medium text-gray-900">{bill.dueDate}</span>
                          </div>
                          {bill.paidDate && (
                            <div>
                              <span className="text-gray-600">Paid Date:</span>
                              <span className="ml-2 font-medium text-gray-900">{bill.paidDate}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <p className="text-2xl font-semibold text-gray-900">{bill.amount}</p>
                        <span className={`inline-block px-3 py-1 text-xs font-medium rounded border ${getStatusColor(bill.status)}`}>{bill.status}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button className="flex-1 px-4 py-2 bg-gradient-to-r from-black via-[#0A1628] to-[#1E3A8A] text-white rounded-lg hover:opacity-90 transition-all font-medium flex items-center justify-center gap-2">
                        <Eye size={16} />
                        View Invoice
                      </button>
                      {bill.status === 'Pending' && (
                        <button className="flex-1 px-4 py-2 bg-gradient-to-r from-black via-[#0A1628] to-[#1E3A8A] text-white rounded-lg hover:opacity-90 transition-all font-medium flex items-center justify-center gap-2">
                          <CreditCard size={16} />
                          Pay Now
                        </button>
                      )}
                      {bill.status === 'Paid' && (
                        <button className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center justify-center gap-2">
                          <Download size={16} />
                          Download Receipt
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment History Tab */}
          {selectedTab === 'payments' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
                <span className="text-sm text-gray-600">{paymentHistory.length} transactions</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Description</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Method</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Reference</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentHistory.map((payment) => (
                      <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4 text-sm text-gray-900">{payment.date}</td>
                        <td className="py-4 px-4 text-sm font-medium text-gray-900">{payment.description}</td>
                        <td className="py-4 px-4 text-sm text-gray-700">{payment.method}</td>
                        <td className="py-4 px-4 text-sm text-gray-600 font-mono">{payment.reference}</td>
                        <td className="py-4 px-4 text-sm font-semibold text-gray-900 text-right">{payment.amount}</td>
                        <td className="py-4 px-4 text-center">
                          <span className="px-3 py-1 text-xs font-medium rounded border bg-gray-100 text-gray-700 border-gray-300">
                            {payment.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <button className="p-2 bg-gradient-to-r from-black via-[#0A1628] to-[#1E3A8A] text-white rounded-lg hover:opacity-90 transition-all">
                            <Download size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Donations Tab */}
          {selectedTab === 'donations' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Donation History</h3>
                <button className="px-4 py-2 bg-gradient-to-r from-black via-[#0A1628] to-[#1E3A8A] text-white rounded-lg hover:opacity-90 transition-all font-medium flex items-center gap-2">
                  <DollarSign size={16} />
                  Make a Donation
                </button>
              </div>
              <div className="space-y-3">
                {donationHistory.map((donation) => (
                  <div key={donation.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow bg-white">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">{donation.campaign}</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-600">Date:</span>
                            <span className="ml-2 font-medium text-gray-900">{donation.date}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Method:</span>
                            <span className="ml-2 font-medium text-gray-900">{donation.method}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Reference:</span>
                            <span className="ml-2 font-medium text-gray-900 font-mono text-xs">{donation.reference}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Receipt:</span>
                            <span className="ml-2 font-medium text-gray-900 font-mono text-xs">{donation.receipt}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <p className="text-2xl font-semibold text-gray-900">{donation.amount}</p>
                        <button className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-black via-[#0A1628] to-[#1E3A8A] text-white hover:opacity-90 rounded-lg transition-all flex items-center gap-1">
                          <Download size={14} />
                          Receipt
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Payment Methods</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-black via-[#0A1628] to-[#1E3A8A] rounded-lg">
                  <CreditCard className="text-white" size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">GCash</h4>
                  <p className="text-sm text-gray-600">Mobile wallet</p>
                </div>
              </div>
            </div>
            <div className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-black via-[#0A1628] to-[#1E3A8A] rounded-lg">
                  <CreditCard className="text-white" size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">PayMaya</h4>
                  <p className="text-sm text-gray-600">Mobile wallet</p>
                </div>
              </div>
            </div>
            <div className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-black via-[#0A1628] to-[#1E3A8A] rounded-lg">
                  <DollarSign className="text-white" size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Bank Transfer</h4>
                  <p className="text-sm text-gray-600">Direct deposit</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentsBilling;
