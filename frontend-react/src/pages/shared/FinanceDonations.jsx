import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Calendar, Download, Plus, Eye, FileText, Wallet, BarChart3, X, Search, XCircle, AlertTriangle } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../contexts/AuthContext';
import { donationAPI, paymentRecordAPI } from '../../services/dataSync';
import { showSuccessToast, showErrorToast, showInfoToast } from '../../utils/sweetAlertHelper';
import Pagination from '../../components/Pagination';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { logActivity, auditActions, auditModules } from '../../utils/auditLogger';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const FinanceDonations = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('donations');
  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState([]);
  const [eventPayments, setEventPayments] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showVoidModal, setShowVoidModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [voidReason, setVoidReason] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'voided'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Form state for recording payments
  const [formData, setFormData] = useState({
    donor: '',
    category: 'Tithes',
    amount: '',
    payment_method: 'Cash',
    receipt_number: '',
    notes: ''
  });

  // User role permissions
  const isAdmin = user?.role === 'admin';
  const isAccountant = user?.role === 'accountant';
  const isChurchAdmin = user?.role === 'church_admin';
  const isPriest = user?.role === 'priest';
  const canManage = isAccountant; // Only accountant can record payments
  const canView = isAdmin || isAccountant || isChurchAdmin || isPriest;

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [donationsRes, paymentsRes] = await Promise.all([
        donationAPI.getAll().catch(() => ({ data: [] })),
        paymentRecordAPI.getAll().catch(() => ({ data: [] }))
      ]);

      const donationsData = Array.isArray(donationsRes?.data) ? donationsRes.data : (Array.isArray(donationsRes) ? donationsRes : []);
      const paymentsData = Array.isArray(paymentsRes?.data) ? paymentsRes.data : (Array.isArray(paymentsRes) ? paymentsRes : []);

      setDonations(donationsData);
      setEventPayments(paymentsData);
      
      // Combine for ledger view
      const combined = [
        ...donationsData.map(d => ({ ...d, type: 'donation', transaction_date: d.created_at || d.date })),
        ...paymentsData.map(p => ({ ...p, type: 'event_payment', transaction_date: p.created_at || p.payment_date }))
      ].sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));
      
      setAllTransactions(combined);
    } catch (error) {
      console.error('Error loading data:', error);
      showErrorToast('Error', 'Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDonation = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      showErrorToast('Error', 'Please enter a valid amount');
      return;
    }

    try {
      const donationData = {
        donor: isAnonymous ? 'Anonymous' : formData.donor || 'Anonymous',
        category: formData.category,
        amount: parseFloat(formData.amount),
        payment_method: formData.payment_method,
        receipt_number: formData.receipt_number || `DN-${Date.now()}`,
        notes: formData.notes,
        recorded_by: user?.name || 'Accountant',
        date: new Date().toISOString().split('T')[0]
      };

      await donationAPI.create(donationData);
      
      await logActivity({
        action: auditActions.CREATE,
        module: auditModules.DONATIONS,
        details: `Recorded donation of ₱${parseFloat(formData.amount).toLocaleString()} - ${formData.category}`,
        userId: user?.id,
        userName: user?.name || 'Unknown',
        userRole: user?.role || 'accountant',
        newValue: donationData
      });
      
      showSuccessToast('Success!', 'Donation recorded successfully');
      setShowAddModal(false);
      resetForm();
      loadAllData();
      
      window.dispatchEvent(new CustomEvent('paymentUpdated'));
    } catch (error) {
      console.error('Error recording donation:', error);
      showErrorToast('Error', 'Failed to record donation');
    }
  };

  const resetForm = () => {
    setFormData({
      donor: '',
      category: 'Tithes',
      amount: '',
      payment_method: 'Cash',
      receipt_number: '',
      notes: ''
    });
    setIsAnonymous(false);
  };

  const handleVoidTransaction = async () => {
    if (!voidReason.trim()) {
      showErrorToast('Error', 'Please provide a reason for voiding this transaction');
      return;
    }

    try {
      const apiToUse = selectedTransaction.type === 'donation' ? donationAPI : paymentRecordAPI;
      
      await apiToUse.update(selectedTransaction.id, {
        ...selectedTransaction,
        is_voided: true,
        void_reason: voidReason,
        voided_by: user?.name || 'Accountant',
        voided_at: new Date().toISOString()
      });

      await logActivity({
        action: auditActions.DELETE,
        module: selectedTransaction.type === 'donation' ? auditModules.DONATIONS : auditModules.PAYMENTS,
        details: `Voided ${selectedTransaction.type} of ₱${parseFloat(selectedTransaction.amount).toLocaleString()} - Reason: ${voidReason}`,
        userId: user?.id,
        userName: user?.name || 'Unknown',
        userRole: user?.role || 'accountant',
        oldValue: selectedTransaction,
        newValue: { ...selectedTransaction, is_voided: true, void_reason: voidReason }
      });

      showSuccessToast('Success!', 'Transaction voided successfully');
      setShowVoidModal(false);
      setSelectedTransaction(null);
      setVoidReason('');
      loadAllData();
    } catch (error) {
      console.error('Error voiding transaction:', error);
      showErrorToast('Error', 'Failed to void transaction');
    }
  };

  const openVoidModal = (transaction) => {
    if (transaction.is_voided) {
      showInfoToast('Already Voided', `This transaction was voided on ${new Date(transaction.voided_at).toLocaleString()}`);
      return;
    }
    setSelectedTransaction(transaction);
    setShowVoidModal(true);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Finance & Donations Report', 14, 20);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
    doc.text(`Report Type: ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`, 14, 34);
    
    const tableData = activeTab === 'donations' 
      ? donations.map(d => [
          new Date(d.created_at || d.date).toLocaleDateString(),
          d.donor || 'Anonymous',
          d.category || 'N/A',
          `₱${(parseFloat(d.amount) || 0).toLocaleString()}`,
          d.payment_method || 'Cash'
        ])
      : eventPayments.map(p => [
          new Date(p.created_at || p.payment_date).toLocaleDateString(),
          p.payer_name || 'N/A',
          p.event_type || p.service_type || 'N/A',
          `₱${(parseFloat(p.amount) || 0).toLocaleString()}`,
          p.payment_status || 'N/A'
        ]);

    autoTable(doc, {
      startY: 40,
      head: activeTab === 'donations'
        ? [['Date', 'Donor', 'Category', 'Amount', 'Method']]
        : [['Date', 'Payer', 'Event/Service', 'Amount', 'Status']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [65, 88, 208],
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center'
      }
    });

    doc.save(`finance-report-${activeTab}-${new Date().toISOString().slice(0, 10)}.pdf`);
    showSuccessToast('Success', 'Report exported successfully');
  };

  // Calculate statistics
  const stats = {
    donations: {
      total: donations.filter(d => !d.is_voided).reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0),
      count: donations.filter(d => !d.is_voided).length,
      voided: donations.filter(d => d.is_voided).length,
      today: donations.filter(d => {
        const date = new Date(d.created_at || d.date);
        return !d.is_voided && date.toDateString() === new Date().toDateString();
      }).reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0)
    },
    eventPayments: {
      total: eventPayments.filter(p => !p.is_voided).reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0),
      count: eventPayments.filter(p => !p.is_voided).length,
      voided: eventPayments.filter(p => p.is_voided).length,
      pending: eventPayments.filter(p => !p.is_voided && (p.payment_status === 'unpaid' || p.payment_status === 'pending')).length
    },
    combined: {
      total: allTransactions.filter(t => !t.is_voided).reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0),
      count: allTransactions.filter(t => !t.is_voided).length,
      voided: allTransactions.filter(t => t.is_voided).length
    }
  };

  // Filter data based on search and period
  const getFilteredData = (data) => {
    return data.filter(item => {
      const matchesSearch = (item.donor?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                           (item.payer_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                           (item.category?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                           (item.event_type?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      
      let matchesPeriod = true;
      if (filterPeriod !== 'all') {
        const itemDate = new Date(item.transaction_date || item.created_at || item.date);
        const now = new Date();
        
        switch (filterPeriod) {
          case 'today':
            matchesPeriod = itemDate.toDateString() === now.toDateString();
            break;
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesPeriod = itemDate >= weekAgo;
            break;
          case 'month':
            matchesPeriod = itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
            break;
          case 'year':
            matchesPeriod = itemDate.getFullYear() === now.getFullYear();
            break;
        }
      }

      // Filter by voided status
      let matchesStatus = true;
      if (filterStatus === 'active') {
        matchesStatus = !item.is_voided;
      } else if (filterStatus === 'voided') {
        matchesStatus = item.is_voided;
      }

      return matchesSearch && matchesPeriod && matchesStatus;
    });
  };

  const filteredDonations = getFilteredData(donations);
  const filteredEventPayments = getFilteredData(eventPayments);
  const filteredLedger = getFilteredData(allTransactions);

  // Pagination
  const getCurrentPageData = (data) => {
    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    return data.slice(indexOfFirst, indexOfLast);
  };

  const tabs = [
    { id: 'donations', label: 'Donations', icon: DollarSign },
    { id: 'event-fees', label: 'Event Fees', icon: Calendar },
    { id: 'ledger', label: 'Payment Ledger', icon: Wallet },
    { id: 'reports', label: 'Reports', icon: BarChart3 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: '#4158D0' }}>
                Finance & Donations
              </h1>
              <p className="text-gray-600">
                {canManage ? 'Manage donations, event payments, and financial reports' : 'View financial summaries and reports'}
              </p>
            </div>
            <div className="flex gap-3">
              {canManage && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all"
                  style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    color: '#10B981',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: 'rgba(16, 185, 129, 0.2)',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)'
                  }}
                >
                  <Plus size={18} />
                  <span>Record Donation</span>
                </button>
              )}
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all"
                style={{
                  background: 'rgba(65, 88, 208, 0.1)',
                  color: '#4158D0',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: 'rgba(65, 88, 208, 0.2)',
                  boxShadow: '0 4px 12px rgba(65, 88, 208, 0.15)'
                }}
              >
                <Download size={18} />
                <span>Export Report</span>
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 shadow hover:shadow-lg transition-all border border-gray-200">
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#10B98120' }}>
                <DollarSign style={{ color: '#10B981' }} size={24} />
              </div>
              <TrendingUp size={16} className="text-gray-400" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900">₱{stats.donations.total.toLocaleString()}</h3>
            <p className="text-sm font-semibold text-gray-700">Total Donations</p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.donations.count} active
              {stats.donations.voided > 0 && <span className="text-red-500"> • {stats.donations.voided} voided</span>}
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 shadow hover:shadow-lg transition-all border border-gray-200">
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#4158D020' }}>
                <Calendar style={{ color: '#4158D0' }} size={24} />
              </div>
              <TrendingUp size={16} className="text-gray-400" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900">₱{stats.eventPayments.total.toLocaleString()}</h3>
            <p className="text-sm font-semibold text-gray-700">Event Payments</p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.eventPayments.pending} pending
              {stats.eventPayments.voided > 0 && <span className="text-red-500"> • {stats.eventPayments.voided} voided</span>}
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 shadow hover:shadow-lg transition-all border border-gray-200">
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#F5931820' }}>
                <Wallet style={{ color: '#F59318' }} size={24} />
              </div>
              <TrendingUp size={16} className="text-gray-400" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900">₱{stats.combined.total.toLocaleString()}</h3>
            <p className="text-sm font-semibold text-gray-700">Total Revenue</p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.combined.count} active
              {stats.combined.voided > 0 && <span className="text-red-500"> • {stats.combined.voided} voided</span>}
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 shadow hover:shadow-lg transition-all border border-gray-200">
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#8B5CF620' }}>
                <TrendingUp style={{ color: '#8B5CF6' }} size={24} />
              </div>
              <Calendar size={16} className="text-gray-400" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900">₱{stats.donations.today.toLocaleString()}</h3>
            <p className="text-sm font-semibold text-gray-700">Today's Donations</p>
            <p className="text-xs text-gray-500 mt-1">Updated live</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
          <div className="flex flex-wrap gap-2 mb-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setCurrentPage(1);
                  }}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                    activeTab === tab.id ? 'shadow-lg' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  style={{
                    background: activeTab === tab.id ? 'rgba(65, 88, 208, 0.1)' : 'transparent',
                    backdropFilter: activeTab === tab.id ? 'blur(10px)' : 'none',
                    WebkitBackdropFilter: activeTab === tab.id ? 'blur(10px)' : 'none',
                    color: activeTab === tab.id ? '#4158D0' : undefined,
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: activeTab === tab.id ? 'rgba(65, 88, 208, 0.2)' : 'transparent',
                    boxShadow: activeTab === tab.id ? '0 4px 12px rgba(65, 88, 208, 0.15)' : 'none'
                  }}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
            {activeTab === 'ledger' && (
              <div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Transactions</option>
                  <option value="active">Active Only</option>
                  <option value="voided">Voided Only</option>
                </select>
              </div>
            )}
          </div>

          {/* Tab Content */}
          {activeTab === 'donations' && (
            <DonationsTab 
              donations={getCurrentPageData(filteredDonations)} 
              loading={loading}
              canManage={canManage}
            />
          )}

          {activeTab === 'event-fees' && (
            <EventFeesTab 
              payments={getCurrentPageData(filteredEventPayments)} 
              loading={loading}
              canManage={canManage}
            />
          )}

          {activeTab === 'ledger' && (
            <LedgerTab 
              transactions={getCurrentPageData(filteredLedger)} 
              loading={loading}
              canManage={canManage}
              onVoid={openVoidModal}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsTab 
              donations={donations}
              eventPayments={eventPayments}
              loading={loading}
            />
          )}

          {/* Pagination */}
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalItems={
                activeTab === 'donations' ? filteredDonations.length :
                activeTab === 'event-fees' ? filteredEventPayments.length :
                activeTab === 'ledger' ? filteredLedger.length : 0
              }
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>

      {/* Add Donation Modal */}
      {showAddModal && createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 flex justify-between items-center border-b border-gray-200" style={{ backgroundColor: 'rgba(65, 88, 208, 0.05)' }}>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: '#4158D0' }}>Record New Donation</h2>
                <p className="text-sm text-gray-600 mt-1">Record a walk-in donation or collection</p>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                style={{ color: '#4158D0' }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmitDonation} className="p-6 space-y-5">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                  />
                  <div>
                    <span className="font-semibold text-yellow-900">Anonymous Donation</span>
                    <p className="text-xs text-yellow-700 mt-0.5">Check this if the donor wishes to remain anonymous</p>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Donor Name {!isAnonymous && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  value={isAnonymous ? 'Anonymous' : formData.donor}
                  onChange={(e) => setFormData({ ...formData, donor: e.target.value })}
                  disabled={isAnonymous}
                  placeholder={isAnonymous ? "Anonymous" : "Enter donor's full name"}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  >
                    <option value="Tithes">Tithes</option>
                    <option value="Offerings">Offerings</option>
                    <option value="Building Fund">Building Fund</option>
                    <option value="Special Collection">Special Collection</option>
                    <option value="Mission Fund">Mission Fund</option>
                    <option value="Charity">Charity</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₱</span>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Payment Method <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Check">Check</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="GCash">GCash</option>
                    <option value="PayMaya">PayMaya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Receipt Number</label>
                  <input
                    type="text"
                    value={formData.receipt_number}
                    onChange={(e) => setFormData({ ...formData, receipt_number: e.target.value })}
                    placeholder="Auto-generated if empty"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notes / Purpose</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                  placeholder="Enter purpose or additional notes (optional)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-xl font-semibold text-white transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
                    boxShadow: '0 4px 12px rgba(65, 88, 208, 0.3)'
                  }}
                >
                  Record Donation
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="px-6 py-3 rounded-xl font-semibold transition-all hover:bg-gray-100"
                  style={{
                    background: 'white',
                    color: '#6b7280',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: '#d1d5db'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Void Transaction Modal */}
      {showVoidModal && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="flex items-start justify-between px-6 py-5 border-b border-gray-200" style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(220, 38, 38, 0.08) 100%)' }}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-100">
                  <AlertTriangle size={24} className="text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Void Transaction</h2>
                  <p className="text-sm text-gray-600 mt-1">This action cannot be undone</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowVoidModal(false);
                  setSelectedTransaction(null);
                  setVoidReason('');
                }}
                className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                style={{ color: '#ef4444' }}
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                <p className="text-sm text-red-800 font-semibold mb-1">Transaction Details</p>
                <div className="space-y-1 text-sm text-red-700">
                  <p><span className="font-medium">Type:</span> {selectedTransaction?.type === 'donation' ? 'Donation' : 'Event Payment'}</p>
                  <p><span className="font-medium">From:</span> {selectedTransaction?.donor || selectedTransaction?.payer_name || 'N/A'}</p>
                  <p><span className="font-medium">Amount:</span> ₱{(parseFloat(selectedTransaction?.amount) || 0).toLocaleString()}</p>
                  <p><span className="font-medium">Date:</span> {selectedTransaction?.transaction_date ? new Date(selectedTransaction.transaction_date).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reason for Voiding <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  rows="4"
                  placeholder="Enter the reason for voiding this transaction (required for audit trail)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">This reason will be recorded in the audit log and visible in reports.</p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleVoidTransaction}
                  className="flex-1 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                  }}
                >
                  Confirm Void
                </button>
                <button
                  onClick={() => {
                    setShowVoidModal(false);
                    setSelectedTransaction(null);
                    setVoidReason('');
                  }}
                  className="px-6 py-3 rounded-xl font-semibold transition-all hover:bg-gray-100"
                  style={{
                    background: 'white',
                    color: '#6b7280',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: '#d1d5db'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

// Donations Tab Component
const DonationsTab = ({ donations, loading, canManage }) => {
  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Donor</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Method</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Receipt</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {donations.length === 0 ? (
            <tr>
              <td colSpan="6" className="px-6 py-12 text-center">
                <DollarSign size={48} className="mx-auto mb-4 opacity-50 text-gray-400" />
                <p className="text-gray-500">No donations found.</p>
              </td>
            </tr>
          ) : (
            donations.map((donation) => (
              <tr key={donation.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {new Date(donation.created_at || donation.date).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{donation.donor || 'Anonymous'}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{donation.category || 'N/A'}</td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                  ₱{(parseFloat(donation.amount) || 0).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{donation.payment_method || 'Cash'}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{donation.receipt_number || 'N/A'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

// Event Fees Tab Component
const EventFeesTab = ({ payments, loading, canManage }) => {
  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Payer</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Event/Service</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {payments.length === 0 ? (
            <tr>
              <td colSpan="5" className="px-6 py-12 text-center">
                <Calendar size={48} className="mx-auto mb-4 opacity-50 text-gray-400" />
                <p className="text-gray-500">No event payments found.</p>
              </td>
            </tr>
          ) : (
            payments.map((payment) => (
              <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {new Date(payment.created_at || payment.payment_date).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{payment.payer_name || 'N/A'}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{payment.event_type || payment.service_type || 'N/A'}</td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                  ₱{(parseFloat(payment.amount) || 0).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    payment.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                    payment.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {payment.payment_status || 'Unpaid'}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

// Ledger Tab Component
const LedgerTab = ({ transactions, loading, canManage, onVoid }) => {
  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">From</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Description</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
            {canManage && <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {transactions.length === 0 ? (
            <tr>
              <td colSpan={canManage ? "7" : "6"} className="px-6 py-12 text-center">
                <Wallet size={48} className="mx-auto mb-4 opacity-50 text-gray-400" />
                <p className="text-gray-500">No transactions found.</p>
              </td>
            </tr>
          ) : (
            transactions.map((transaction, index) => (
              <tr 
                key={`${transaction.type}-${transaction.id}-${index}`} 
                className={`hover:bg-gray-50 transition-colors ${transaction.is_voided ? 'bg-red-50' : ''}`}
              >
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {new Date(transaction.transaction_date).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    transaction.type === 'donation' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {transaction.type === 'donation' ? 'Donation' : 'Event Payment'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {transaction.donor || transaction.payer_name || 'N/A'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {transaction.category || transaction.event_type || transaction.service_type || 'N/A'}
                </td>
                <td className="px-4 py-3 text-sm font-semibold">
                  <span className={transaction.is_voided ? 'line-through text-red-600' : 'text-gray-900'}>
                    ₱{(parseFloat(transaction.amount) || 0).toLocaleString()}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {transaction.is_voided ? (
                    <div className="flex flex-col gap-1">
                      <span className="px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-800 inline-block">
                        VOIDED
                      </span>
                      <span className="text-xs text-gray-500" title={transaction.void_reason}>
                        {transaction.voided_at ? new Date(transaction.voided_at).toLocaleDateString() : ''}
                      </span>
                      {transaction.void_reason && (
                        <span className="text-xs text-red-600 italic truncate" title={transaction.void_reason}>
                          {transaction.void_reason}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      transaction.payment_status === 'paid' || transaction.type === 'donation' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {transaction.payment_status || 'Completed'}
                    </span>
                  )}
                </td>
                {canManage && (
                  <td className="px-4 py-3">
                    {!transaction.is_voided && (
                      <button
                        onClick={() => onVoid(transaction)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Void this transaction"
                      >
                        <XCircle size={14} />
                        Void
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
        </tbody>
      </table>
    </div>
  );
};

// Reports Tab Component
const ReportsTab = ({ donations, eventPayments, loading }) => {
  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  // Process data for charts
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const chartData = last7Days.map(date => {
    const dayDonations = donations.filter(d => {
      const donationDate = new Date(d.created_at || d.date).toISOString().split('T')[0];
      return donationDate === date;
    }).reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);

    const dayPayments = eventPayments.filter(p => {
      const paymentDate = new Date(p.created_at || p.payment_date).toISOString().split('T')[0];
      return paymentDate === date;
    }).reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

    return {
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      donations: dayDonations,
      events: dayPayments,
      total: dayDonations + dayPayments
    };
  });

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">7-Day Revenue Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value) => `₱${value.toLocaleString()}`} />
            <Legend />
            <Line type="monotone" dataKey="donations" stroke="#10B981" strokeWidth={2} name="Donations" />
            <Line type="monotone" dataKey="events" stroke="#4158D0" strokeWidth={2} name="Event Payments" />
            <Line type="monotone" dataKey="total" stroke="#F59318" strokeWidth={2} name="Total" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value) => `₱${value.toLocaleString()}`} />
            <Legend />
            <Bar dataKey="donations" fill="#10B981" name="Donations" />
            <Bar dataKey="events" fill="#4158D0" name="Event Payments" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FinanceDonations;
