import { useState, useEffect } from 'react';
import { Search, Download, Eye, DollarSign, TrendingUp, Calendar, Users, Filter, Plus, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../contexts/AuthContext';
import { donationAPI } from '../../services/dataSync';
import { showSuccessToast, showErrorToast, showInfoToast } from '../../utils/sweetAlertHelper';
import Pagination from '../../components/Pagination';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { logActivity, auditActions, auditModules } from '../../utils/auditLogger';

const DonationsCollections = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    donor: '',
    category: 'Tithes',
    amount: '',
    payment_method: 'Cash',
    receipt_number: '',
    notes: ''
  });

  // Determine user role and permissions
  const isAccountant = user?.role === 'accountant';
  const isChurchAdmin = user?.role === 'church_admin';
  const isPriest = user?.role === 'priest';
  const canManage = isAccountant || isChurchAdmin;

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      
      // Log the activity
      await logActivity({
        action: auditActions.CREATE,
        module: auditModules.DONATIONS,
        details: `Recorded ${isAnonymous ? 'anonymous' : ''} donation of ₱${parseFloat(formData.amount).toLocaleString()} - ${formData.category}`,
        userId: user?.id,
        userName: user?.name || 'Unknown',
        userRole: user?.role || 'accountant',
        newValue: donationData
      });
      
      showSuccessToast('Success!', 'Donation recorded successfully');
      setShowAddModal(false);
      resetForm();
      loadDonations();
      
      // Dispatch event to update payment history
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

  const getFilteredDonations = () => {
    return donations.filter(donation => {
      const matchesSearch = (donation.donor?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                           (donation.category?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                           (donation.receipt_number?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      
      const matchesCategory = filterCategory === 'all' || donation.donation_category_id === filterCategory || donation.category === filterCategory;
      
      let matchesPeriod = true;
      if (filterPeriod !== 'all') {
        const donationDate = new Date(donation.created_at || donation.date);
        const now = new Date();
        
        switch (filterPeriod) {
          case 'today':
            matchesPeriod = donationDate.toDateString() === now.toDateString();
            break;
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesPeriod = donationDate >= weekAgo;
            break;
          case 'month':
            matchesPeriod = donationDate.getMonth() === now.getMonth() && donationDate.getFullYear() === now.getFullYear();
            break;
        }
      }

      return matchesSearch && matchesCategory && matchesPeriod;
    });
  };

  const filteredDonations = getFilteredDonations();
  
  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDonations = filteredDonations.slice(indexOfFirstItem, indexOfLastItem);

  // Calculate totals
  const totalAmount = filteredDonations.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
  const totalCount = filteredDonations.length;
  const averageAmount = totalCount > 0 ? totalAmount / totalCount : 0;

  // Get unique categories
  const categories = ['all', ...new Set(donations.map(d => d.category).filter(Boolean))];

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
      value: new Set(donations.map(d => d.donor).filter(Boolean)).size.toString(),
      icon: Users,
      color: '#F59E0B'
    },
  ];

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.setTextColor(65, 88, 208);
    doc.text('Donations & Collections Report', 105, 20, { align: 'center' });
    
    // Add date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`, 105, 28, { align: 'center' });

    // Add summary
    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    doc.text('Summary', 14, 40);
    
    doc.setFontSize(9);
    doc.text(`Total Collections: ₱${totalAmount.toFixed(2)}`, 14, 47);
    doc.text(`Total Donations: ${totalCount}`, 14, 52);
    doc.text(`Average Donation: ₱${averageAmount.toFixed(2)}`, 14, 57);

    // Prepare table data
    const tableData = filteredDonations.map((donation) => [
      formatDate(donation.created_at || donation.date),
      donation.donor || 'Anonymous',
      donation.category || 'N/A',
      `₱${(parseFloat(donation.amount) || 0).toFixed(2)}`,
      donation.receipt_number || 'N/A'
    ]);
    
    // Add table
    autoTable(doc, {
      startY: 65,
      head: [['Date', 'Donor', 'Category', 'Amount', 'Receipt #']],
      body: tableData,
      theme: 'striped',
      styles: {
        fontSize: 8,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [65, 88, 208],
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 40 },
        2: { cellWidth: 35 },
        3: { cellWidth: 30, halign: 'right' },
        4: { cellWidth: 35, halign: 'center' }
      }
    });

    doc.save(`donations-collections-${new Date().toISOString().slice(0, 10)}.pdf`);
    showSuccessToast('Success', 'Report exported successfully');
  };

  const handleViewDetails = (donation) => {
    showInfoToast('Donation Details', 
      `Donor: ${donation.donor || 'Anonymous'}\n` +
      `Category: ${donation.category || 'N/A'}\n` +
      `Amount: ₱${(parseFloat(donation.amount) || 0).toLocaleString()}\n` +
      `Date: ${new Date(donation.created_at || donation.date).toLocaleDateString()}\n` +
      `Receipt: ${donation.receipt_number || 'N/A'}`
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="space-y-6">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 bg-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold mb-1" style={{ color: '#4158D0' }}>
                Donations & Collections
              </h1>
              <p className="text-gray-600 text-sm">
                {canManage ? 'Manage and view all donation records' : 'View donation summaries and reports'}
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
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.15)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'}
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
                  border: '1px solid rgba(65, 88, 208, 0.2)',
                  boxShadow: '0 4px 12px rgba(65, 88, 208, 0.15)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(65, 88, 208, 0.15)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(65, 88, 208, 0.1)'}
              >
                <Download size={18} />
                <span>Export Report</span>
              </button>
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

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by donor, category, receipt..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Donor</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Receipt #</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Recorded By</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                        <p className="text-gray-500">Loading donations...</p>
                      </div>
                    </td>
                  </tr>
                ) : currentDonations.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <DollarSign size={48} className="mx-auto mb-4 opacity-50 text-gray-400" />
                      <p className="text-gray-500">No donations found.</p>
                    </td>
                  </tr>
                ) : (
                  currentDonations.map((donation) => (
                    <tr key={donation.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(donation.created_at || donation.date)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {donation.donor === 'Anonymous' ? (
                          <span className="italic text-gray-500 flex items-center gap-2">
                            <Users size={14} className="opacity-50" />
                            Anonymous
                          </span>
                        ) : (
                          donation.donor || 'N/A'
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {donation.category || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                        ₱{(parseFloat(donation.amount) || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {donation.receipt_number || 'N/A'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {donation.recorded_by || donation.user?.name || 'N/A'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button
                          onClick={() => handleViewDetails(donation)}
                          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                          style={{ color: '#4158D0' }}
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {currentDonations.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalItems={filteredDonations.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(value) => {
                  setItemsPerPage(value);
                  setCurrentPage(1);
                }}
              />
            )}
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm" style={{ color: '#4158D0' }}>
            <strong>Note:</strong> {canManage 
              ? 'You have full access to manage donation records. All transactions are tracked in the audit log.' 
              : 'You have read-only access to donation records. Contact the Accountant or Church Admin for any changes.'}
          </p>
        </div>
      </div>

      {/* Add Donation Modal */}
      {showAddModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="px-6 py-5 flex justify-between items-center border-b border-gray-200" style={{ backgroundColor: 'rgba(65, 88, 208, 0.05)' }}>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: '#4158D0' }}>Record New Donation</h2>
                <p className="text-sm text-gray-600 mt-1">Record a new donation or collection</p>
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

            {/* Modal Body */}
            <form onSubmit={handleSubmitDonation} className="p-6 space-y-5">
              {/* Anonymous Checkbox */}
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

              {/* Donor Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Donor Name {!isAnonymous && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  name="donor"
                  value={isAnonymous ? 'Anonymous' : formData.donor}
                  onChange={handleInputChange}
                  disabled={isAnonymous}
                  placeholder={isAnonymous ? "Anonymous" : "Enter donor's full name"}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                  style={{ '--tw-ring-color': 'rgba(65, 88, 208, 0.3)' }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': 'rgba(65, 88, 208, 0.3)' }}
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

                {/* Amount */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₱</span>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                      style={{ '--tw-ring-color': 'rgba(65, 88, 208, 0.3)' }}
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Payment Method <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="payment_method"
                    value={formData.payment_method}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': 'rgba(65, 88, 208, 0.3)' }}
                  >
                    <option value="Cash">Cash</option>
                    <option value="Check">Check</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="GCash">GCash</option>
                    <option value="PayMaya">PayMaya</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Receipt Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Receipt Number
                  </label>
                  <input
                    type="text"
                    name="receipt_number"
                    value={formData.receipt_number}
                    onChange={handleInputChange}
                    placeholder="Auto-generated if empty"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': 'rgba(65, 88, 208, 0.3)' }}
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes / Purpose
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Enter purpose or additional notes (optional)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent resize-none"
                  style={{ '--tw-ring-color': 'rgba(65, 88, 208, 0.3)' }}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-xl font-semibold text-white transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
                    boxShadow: '0 4px 12px rgba(65, 88, 208, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(65, 88, 208, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(65, 88, 208, 0.3)';
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
                    border: '1px solid #d1d5db'
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
    </div>
  );
};

export default DonationsCollections;
