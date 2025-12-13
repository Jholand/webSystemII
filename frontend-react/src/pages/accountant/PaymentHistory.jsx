import { useState, useEffect } from 'react';
import { Search, Edit, Eye, Download, DollarSign, TrendingUp, Calendar, Filter, Printer, FileText, Ban, BarChart3 } from 'lucide-react';
import ModalOverlay from '../../components/ModalOverlay';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { showErrorToast, showSuccessToast, showInputDialog } from '../../utils/sweetAlertHelper';
import Pagination from '../../components/Pagination';
import { paymentRecordAPI } from '../../services/dataSync';
import { formatDate } from '../../utils/dateFormatter';
import { logActivity, auditActions, auditModules } from '../../utils/auditLogger';

const PaymentHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(false);
  const [donations, setDonations] = useState([]);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Check if user is accountant or church admin
  const isAccountant = user?.role === 'accountant' || user?.role === 'church_admin';
  const rolePrefix = user?.role === 'church_admin' ? 'church-admin' : 'accountant';

  // Fetch payment records from API
  useEffect(() => {
    fetchPaymentRecords();
    
    // Listen for payment updates from ServicePaymentsEnhanced
    const handlePaymentUpdate = () => {
      console.log('💰 Payment updated event received in PaymentHistory, refreshing...');
      fetchPaymentRecords();
    };
    
    window.addEventListener('paymentUpdated', handlePaymentUpdate);
    
    return () => {
      window.removeEventListener('paymentUpdated', handlePaymentUpdate);
    };
  }, []);

  const fetchPaymentRecords = async () => {
    try {
      setLoading(true);
      const response = await paymentRecordAPI.getAll();
      const records = response.data || response || [];
      
      // Transform API data to match component format
      const transformedRecords = records.map(record => ({
        id: record.id,
        date: record.payment_date || record.created_at?.split('T')[0] || '',
        time: record.created_at ? new Date(record.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '',
        donor: record.user?.name || 'N/A',
        type: record.payment_type || 'Service Fee',
        amount: parseFloat(record.amount || 0),
        method: record.payment_method || 'Cash',
        purpose: record.service_name || record.description || 'N/A',
        notes: record.description || '',
        recordedBy: record.recorded_by || 'Accountant',
        serviceRequestId: record.service_request_id,
        referenceNumber: record.reference_number,
        isVoided: record.status === 'voided',
        voidReason: record.void_reason
      }));
      
      setDonations(transformedRecords);
    } catch (error) {
      console.error('Error fetching payment records:', error);
      showErrorToast('Error', 'Failed to load payment records');
    } finally {
      setLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    date: '',
    time: '',
    donor: '',
    type: 'Tithes',
    amount: '',
    method: 'Cash',
    purpose: '',
    notes: '',
  });

  // Calculate statistics based on filter
  const getFilteredDonations = () => {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    return donations.filter(donation => {
      const donationDate = new Date(donation.date);
      const matchesSearch = 
        donation.donor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donation.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donation.purpose.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === 'all' || donation.type === filterType;

      let matchesPeriod = true;
      if (filterPeriod === 'daily') {
        matchesPeriod = donationDate >= startOfToday;
      } else if (filterPeriod === 'weekly') {
        matchesPeriod = donationDate >= startOfWeek;
      } else if (filterPeriod === 'monthly') {
        matchesPeriod = donationDate >= startOfMonth;
      }

      return matchesSearch && matchesType && matchesPeriod;
    });
  };

  const filteredDonations = getFilteredDonations();
  
  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDonations = filteredDonations.slice(indexOfFirstItem, indexOfLastItem);
  
  // Calculate totals excluding voided donations
  const validDonations = filteredDonations.filter(d => !d.isVoided);
  const totalAmount = validDonations.reduce((sum, d) => sum + d.amount, 0);
  const averageAmount = validDonations.length > 0 ? totalAmount / validDonations.length : 0;

  const stats = [
    { 
      label: `Total (${filterPeriod === 'all' ? 'All Time' : filterPeriod.charAt(0).toUpperCase() + filterPeriod.slice(1)})`, 
      value: `₱${totalAmount.toLocaleString()}`, 
      icon: DollarSign,
      color: '#10B981' 
    },
    { 
      label: 'Total Donations', 
      value: validDonations.length.toString(), 
      icon: Calendar, 
      color: '#4158D0' 
    },
    { 
      label: 'Average Amount', 
      value: `₱${averageAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, 
      icon: TrendingUp, 
      color: '#8B5CF6' 
    },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditDonation = (donation) => {
    if (!isAccountant) {
      showErrorToast('Access Denied', 'Only accountants can edit donations');
      return;
    }
    setSelectedDonation(donation);
    setFormData({
      date: donation.date,
      time: donation.time,
      donor: donation.donor,
      type: donation.type,
      amount: donation.amount,
      method: donation.method,
      purpose: donation.purpose,
      notes: donation.notes,
    });
    setShowModal(true);
  };

  const handlePrint = (donation) => {
    try {
      // Create a simple receipt for printing
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Receipt - ${donation.referenceNumber || donation.id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; }
            h1 { color: #4158D0; text-align: center; }
            .receipt-header { text-align: center; margin-bottom: 30px; }
            .receipt-details { margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .detail-label { font-weight: bold; color: #666; }
            .detail-value { color: #333; }
            .amount { font-size: 24px; font-weight: bold; color: #10B981; text-align: center; margin: 30px 0; }
            .footer { text-align: center; margin-top: 50px; color: #666; font-size: 12px; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="receipt-header">
            <h1>Payment Receipt</h1>
            <p>Church Records Management System</p>
          </div>
          <div class="receipt-details">
            <div class="detail-row">
              <span class="detail-label">Receipt #:</span>
              <span class="detail-value">${donation.referenceNumber || donation.id}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date:</span>
              <span class="detail-value">${formatDate(donation.date)}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Donor/Payer:</span>
              <span class="detail-value">${donation.donor}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Type:</span>
              <span class="detail-value">${donation.type}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Purpose:</span>
              <span class="detail-value">${donation.purpose}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Payment Method:</span>
              <span class="detail-value">${donation.method}</span>
            </div>
          </div>
          <div class="amount">
            Amount Paid: ₱${donation.amount.toLocaleString()}
          </div>
          <div class="footer">
            <p>This is a computer-generated receipt.</p>
            <p>Recorded by: ${donation.recordedBy}</p>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    } catch (error) {
      console.error('Error printing receipt:', error);
      showErrorToast('Error', 'Failed to print receipt');
    }
  };

  const handleViewDonation = (donation) => {
    setSelectedDonation(donation);
    setShowModal(true);
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

  const handleVoid = async (id) => {
    if (!isAccountant) {
      showErrorToast('Access Denied', 'Only accountants can void payments');
      return;
    }
    
    const result = await showInputDialog({
      title: 'Void Payment Record',
      text: 'Please provide a reason for voiding this payment:',
      inputPlaceholder: 'e.g., Duplicate entry, Payment cancelled, Data error',
      inputType: 'textarea',
      confirmButtonText: 'Void Payment',
      cancelButtonText: 'Cancel',
      inputValidator: (value) => {
        if (!value || value.trim().length === 0) {
          return 'You must provide a reason for voiding this payment';
        }
        if (value.trim().length < 10) {
          return 'Please provide a more detailed reason (at least 10 characters)';
        }
      }
    });
    
    if (result.isConfirmed && result.value) {
      const voidedPayment = donations.find(d => d.id === id);
      setDonations(donations.map(d => 
        d.id === id 
          ? { ...d, isVoided: true, voidReason: result.value, voidedBy: user?.name || 'Accountant', voidedAt: new Date().toISOString() }
          : d
      ));
      
      // Log the activity
      await logActivity({
        action: auditActions.VOID,
        module: auditModules.PAYMENTS,
        details: `Voided payment #${id} - ₱${voidedPayment?.amount?.toLocaleString()} - Reason: ${result.value}`,
        userId: user?.id,
        userName: user?.name || 'Accountant',
        userRole: user?.role || 'accountant',
        recordId: id,
        oldValue: voidedPayment,
        metadata: { voidReason: result.value }
      });
      
      showSuccessToast('Payment Voided', 'Payment record has been voided successfully');
    }
  };

  // Calculate summaries by type
  const getSummaryByType = () => {
    const summary = { Tithes: 0, Offerings: 0, 'Building Fund': 0, 'Special Collection': 0 };
    // Exclude voided donations from category summaries
    const validDonations = filteredDonations.filter(d => !d.isVoided);
    validDonations.forEach(donation => {
      if (summary.hasOwnProperty(donation.type)) {
        summary[donation.type] += donation.amount;
      }
    });
    return summary;
  };

  const summaryByType = getSummaryByType();

  return (
    <div className="min-h-screen bg-white">
      <div className="space-y-6">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 bg-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold mb-1" style={{ color: '#4158D0' }}>Payment History</h1>
              <p className="text-gray-600 text-sm">{isAccountant ? 'View all recorded payments and transactions' : 'View payment summaries and reports'}</p>
            </div>
            {isAccountant && (
              <div className="flex gap-3">
                <button
                  onClick={() => navigate(`/${rolePrefix}/reports`)}
                  className="flex items-center gap-2 px-5 py-3 bg-white text-gray-700 border border-gray-200 rounded-lg hover:shadow-lg transition-all font-semibold"
                >
                  <BarChart3 size={20} />
                  Financial Reports
                </button>
            </div>
          )}
        </div>

        {/* Connection Info Banner for Accountants */}
        {isAccountant && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-l-4 border-purple-400 rounded-r-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <DollarSign className="text-purple-600 mt-0.5" size={20} />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-purple-900 mb-1">Connected Payment System</h3>
                <p className="text-sm text-purple-700">
                  This page displays all payment records including service fees recorded in Service Payments. All payments are automatically synced and updated in real-time.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info Banner for Non-Accountants */}
        {!isAccountant && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-purple-900 mb-1">View-Only Access</h3>
                <p className="text-sm text-purple-700">
                  You have read-only access to donation records. Only <strong>Accountants</strong> can add, edit, or delete donation entries. 
                  You can view summaries, reports, and download data.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        {/* Collection Summary by Type */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Collection Summary by Type ({filterPeriod === 'all' ? 'All Time' : filterPeriod.charAt(0).toUpperCase() + filterPeriod.slice(1)})</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-5 shadow hover:shadow-lg transition-all border border-gray-200 cursor-pointer group">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 rounded-lg group-hover:scale-110 transition-transform" style={{ backgroundColor: '#4158D020' }}>
                  <DollarSign size={24} style={{ color: '#4158D0' }} />
                </div>
                <p className="text-sm font-semibold text-gray-700">Tithes</p>
              </div>
              <p className="text-2xl font-bold" style={{ color: '#4158D0' }}>₱{summaryByType.Tithes.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-lg p-5 shadow hover:shadow-lg transition-all border border-gray-200 cursor-pointer group">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 rounded-lg group-hover:scale-110 transition-transform" style={{ backgroundColor: '#10b98120' }}>
                  <DollarSign size={24} style={{ color: '#10b981' }} />
                </div>
                <p className="text-sm font-semibold text-gray-700">Offerings</p>
              </div>
              <p className="text-2xl font-bold" style={{ color: '#10b981' }}>₱{summaryByType.Offerings.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-lg p-5 shadow hover:shadow-lg transition-all border border-gray-200 cursor-pointer group">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 rounded-lg group-hover:scale-110 transition-transform" style={{ backgroundColor: '#06b6d420' }}>
                  <DollarSign size={24} style={{ color: '#06b6d4' }} />
                </div>
                <p className="text-sm font-semibold text-gray-700">Building Fund</p>
              </div>
              <p className="text-2xl font-bold" style={{ color: '#06b6d4' }}>₱{summaryByType['Building Fund'].toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-lg p-5 shadow hover:shadow-lg transition-all border border-gray-200 cursor-pointer group">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 rounded-lg group-hover:scale-110 transition-transform" style={{ backgroundColor: '#f59e0b20' }}>
                  <DollarSign size={24} style={{ color: '#f59e0b' }} />
                </div>
                <p className="text-sm font-semibold text-gray-700">Special Collection</p>
              </div>
              <p className="text-2xl font-bold" style={{ color: '#f59e0b' }}>₱{summaryByType['Special Collection'].toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by donor, type, or purpose..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Time</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="Tithes">Tithes</option>
                <option value="Offerings">Offerings</option>
                <option value="Building Fund">Building Fund</option>
                <option value="Special Collection">Special Collection</option>
              </select>
            </div>
          </div>
        </div>

        {/* Donations Table */}
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading payment records...</p>
              </div>
            </div>
          ) : currentDonations.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <FileText size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">No payment records found</p>
              </div>
            </div>
          ) : (
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date/Time</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Donor</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Method</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Purpose</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Recorded By</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
              {currentDonations.map((donation) => (
                <tr key={donation.id} className={`hover:bg-gray-50 transition-colors ${donation.isVoided ? 'bg-red-50 opacity-60' : ''}`}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{formatDate(donation.date) || donation.date}</div>
                    <div className="text-xs text-gray-500">{donation.time}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{donation.donor}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      donation.type === 'Tithes' 
                        ? 'bg-blue-100 text-blue-800' 
                        : donation.type === 'Offerings'
                        ? 'bg-indigo-100 text-indigo-800'
                        : donation.type === 'Building Fund'
                        ? 'bg-cyan-100 text-cyan-800'
                        : donation.type === 'service_fee'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {donation.type === 'service_fee' ? 'Service Fee' : donation.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">₱{donation.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{donation.method}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{donation.purpose}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{donation.recordedBy}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handlePrint(donation)}
                        className="p-1.5 hover:bg-gray-100 rounded transition-colors text-blue-600"
                        title="Print Record"
                        disabled={donation.isVoided}
                      >
                        <Printer size={16} />
                      </button>
                      <button
                        onClick={() => handleViewDonation(donation)}
                        className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                        style={{ color: '#4158D0' }}
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      {isAccountant && (
                        <>
                          <button
                            onClick={() => handleEditDonation(donation)}
                            className="p-1.5 hover:bg-gray-100 rounded transition-colors text-emerald-600"
                            title="Edit"
                            disabled={donation.isVoided}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleVoid(donation.id)}
                            className="p-1.5 hover:bg-gray-100 rounded transition-colors text-red-600"
                            title="Void Payment"
                            disabled={donation.isVoided}
                          >
                            <Ban size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {currentDonations.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalItems={filteredDonations.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          )}
          </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <ModalOverlay isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedDonation ? 'Edit Payment Entry' : 'View Payment Entry'}
              </h2>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              if (selectedDonation && isAccountant) {
                setDonations(donations.map(d => 
                  d.id === selectedDonation.id 
                    ? { ...d, ...formData, amount: parseFloat(formData.amount) }
                    : d
                ));
                showSuccessToast('Updated', 'Payment record has been updated successfully');
              }
              setShowModal(false);
            }} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Donor Name</label>
                  <input
                    type="text"
                    name="donor"
                    value={formData.donor}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter donor name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Tithes">Tithes</option>
                    <option value="Offerings">Offerings</option>
                    <option value="Building Fund">Building Fund</option>
                    <option value="Special Collection">Special Collection</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₱)</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select
                    name="method"
                    value={formData.method}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Check">Check</option>
                    <option value="Online Payment">Online Payment</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                  <input
                    type="text"
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., General Fund, Church Renovation"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Additional notes (optional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition-all"
                  style={{ backgroundColor: '#4158D0' }}
                  disabled={!isAccountant}
                >
                  Save Changes
                </button>
              </div>
            </form>
        </div>
      </ModalOverlay>
      </div>
    </div>
  );
};

export default PaymentHistory;
