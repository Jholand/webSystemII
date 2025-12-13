import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Search, Filter, Eye, Calendar, User, FileText, Plus, CheckCircle, Receipt, X, Clock, AlertCircle, Download, TrendingUp, Activity, CreditCard, RotateCcw, History, ChevronDown, ChevronRight } from 'lucide-react';
import { serviceRequestAPI } from '../../services/serviceRequestAPI';
import { paymentRecordAPI } from '../../services/dataSync';
import { showSuccessToast, showErrorToast, showDeleteConfirm } from '../../utils/sweetAlertHelper';
import { formatDate } from '../../utils/dateFormatter';
import api from '../../services/api';
import Pagination from '../../components/Pagination';
import { jsPDF } from 'jspdf';
import { logActivity, auditActions, auditModules } from '../../utils/auditLogger';
import { useAuth } from '../../contexts/AuthContext';

const ServicePaymentsEnhanced = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterServiceType, setFilterServiceType] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [paymentRecords, setPaymentRecords] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details'); // details, payments, audit
  const [showAddPayment, setShowAddPayment] = useState(false);
  
  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    payment_method: 'Cash',
    receipt_number: '',
    payment_date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchPayableRequests();
    
    // Listen for payment updates
    const handlePaymentUpdate = () => {
      console.log('💰 Payment updated event received, refreshing service requests...');
      fetchPayableRequests();
      if (selectedRequest) {
        loadRequestPayments(selectedRequest.id);
      }
    };
    
    window.addEventListener('paymentUpdated', handlePaymentUpdate);
    
    return () => {
      window.removeEventListener('paymentUpdated', handlePaymentUpdate);
    };
  }, [filterPaymentStatus, filterCategory, filterServiceType, searchTerm, dateFrom, dateTo]);

  const fetchPayableRequests = async () => {
    try {
      setLoading(true);
      const response = await serviceRequestAPI.getAll();
      
      // Get all requests from response
      const allRequests = response.data || response || [];
      
      // Filter to only show requests that have a service fee
      let filtered = allRequests.filter(r => {
        const fee = parseFloat(r.service_fee || 0);
        return fee > 0;
      });
      
      // Apply payment status filter
      if (filterPaymentStatus !== 'all') {
        filtered = filtered.filter(r => r.payment_status === filterPaymentStatus);
      }
      
      // Apply category filter  
      if (filterCategory !== 'all') {
        filtered = filtered.filter(r => r.category === filterCategory);
      }
      
      // Apply service type filter
      if (filterServiceType !== 'all') {
        filtered = filtered.filter(r => r.service_request_type?.type_name === filterServiceType);
      }
      
      // Apply date range filter
      if (dateFrom) {
        filtered = filtered.filter(r => new Date(r.created_at) >= new Date(dateFrom));
      }
      if (dateTo) {
        filtered = filtered.filter(r => new Date(r.created_at) <= new Date(dateTo + 'T23:59:59'));
      }
      
      // Apply search filter
      if (searchTerm) {
        filtered = filtered.filter(r => {
          const serviceName = r.service_request_type?.type_name || '';
          const category = r.category || '';
          const userName = r.user?.name || '';
          const detailsName = r.details_json?.full_name || r.details_json?.baby_name || '';
          
          return serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 detailsName.toLowerCase().includes(searchTerm.toLowerCase());
        });
      }
      
      setServiceRequests(filtered);
    } catch (error) {
      console.error('Error fetching requests:', error);
      showErrorToast('Error', 'Failed to load payment requests');
    } finally {
      setLoading(false);
    }
  };

  const loadRequestPayments = async (requestId) => {
    try {
      const response = await paymentRecordAPI.getAll();
      const allPayments = response.data || response || [];
      // Filter payments for this specific request
      const requestPayments = allPayments.filter(p => 
        p.service_request_id === requestId || 
        p.description?.includes(`Request ID: ${requestId}`)
      );
      setPaymentRecords(requestPayments);
    } catch (error) {
      console.error('Error loading payments:', error);
      setPaymentRecords([]);
    }
  };

  const loadAuditLogs = async (requestId) => {
    // Mock audit logs - replace with actual API call
    const mockLogs = [
      {
        id: 1,
        action: 'created',
        description: 'Service request created',
        user: selectedRequest?.user?.name || 'System',
        timestamp: selectedRequest?.created_at,
        type: 'info'
      },
      {
        id: 2,
        action: 'status_change',
        description: `Status changed to ${selectedRequest?.status}`,
        user: 'Church Admin',
        timestamp: selectedRequest?.updated_at,
        type: 'warning'
      }
    ];
    
    if (selectedRequest?.payment_status === 'paid') {
      mockLogs.push({
        id: 3,
        action: 'payment_received',
        description: 'Payment marked as PAID',
        user: 'Accountant',
        timestamp: selectedRequest?.updated_at,
        type: 'success'
      });
    }
    
    setAuditLogs(mockLogs);
  };

  const handleViewDetails = async (request) => {
    setSelectedRequest(request);
    setShowModal(true);
    setActiveTab('details');
    setShowAddPayment(false);
    
    // Load related data
    await loadRequestPayments(request.id);
    await loadAuditLogs(request.id);
    
    // Mark as viewed
    const viewedRequests = JSON.parse(localStorage.getItem('viewedServiceRequests') || '[]');
    if (!viewedRequests.includes(request.id)) {
      viewedRequests.push(request.id);
      localStorage.setItem('viewedServiceRequests', JSON.stringify(viewedRequests));
    }
    window.dispatchEvent(new CustomEvent('paymentViewed'));
  };

  const handleAddPayment = () => {
    setShowAddPayment(true);
    setActiveTab('payments');
    setPaymentForm({
      amount: selectedRequest?.service_fee || '',
      payment_method: 'Cash',
      receipt_number: `RCP-${Date.now()}`,
      payment_date: new Date().toISOString().split('T')[0],
      notes: `Payment for ${selectedRequest?.service_request_type?.type_name || 'service'}`
    });
  };

  const handleSubmitPayment = async () => {
    try {
      // Create payment record
      const paymentData = {
        user_id: selectedRequest.user_id,
        payment_type: 'service_fee',
        service_name: selectedRequest.service_request_type?.type_name || 'Service Request',
        amount: parseFloat(paymentForm.amount),
        payment_method: paymentForm.payment_method,
        reference_number: paymentForm.receipt_number,
        description: paymentForm.notes,
        recorded_by: 'Accountant',
        payment_date: paymentForm.payment_date,
        visible_to_user: true,
        service_request_id: selectedRequest.id
      };

      const savedPayment = await paymentRecordAPI.create(paymentData);
      
      // Update service request status to paid
      await api.put(`/service-requests/${selectedRequest.id}/payment-status`, {
        payment_status: 'paid',
        donation_id: savedPayment.id
      });

      // Log the activity
      await logActivity({
        action: auditActions.PAYMENT,
        module: auditModules.SERVICE_REQUESTS,
        details: `Recorded payment of ₱${parseFloat(paymentForm.amount).toLocaleString()} for ${selectedRequest.service_request_type?.type_name || 'service'} - ${selectedRequest.user?.name || 'N/A'}`,
        userId: user?.id,
        userName: user?.name || 'Accountant',
        userRole: user?.role || 'accountant',
        recordId: selectedRequest.id,
        newValue: { paymentData, status: 'paid' }
      });

      // Generate PDF receipt
      generateReceiptPDF(savedPayment, selectedRequest);

      showSuccessToast('Success!', 'Payment recorded and receipt generated successfully');
      
      // Refresh data
      await loadRequestPayments(selectedRequest.id);
      await fetchPayableRequests();
      setShowAddPayment(false);
      window.dispatchEvent(new CustomEvent('paymentUpdated'));
      
      // Update selected request status
      setSelectedRequest({ ...selectedRequest, payment_status: 'paid' });
    } catch (error) {
      console.error('Error submitting payment:', error);
      showErrorToast('Error', 'Failed to process payment');
    }
  };

  const handleMarkAsUnpaid = async () => {
    const confirmed = await showDeleteConfirm(
      'Mark as Unpaid?',
      'This will revert the payment status. This action will be logged in the audit trail.'
    );

    if (confirmed.isConfirmed) {
      try {
        await api.put(`/service-requests/${selectedRequest.id}/payment-status`, {
          payment_status: 'unpaid',
          donation_id: null
        });

        // Log the activity
        await logActivity({
          action: auditActions.UPDATE,
          module: auditModules.SERVICE_REQUESTS,
          details: `Marked service request #${selectedRequest.id} as UNPAID - ${selectedRequest.service_request_type?.type_name || 'service'}`,
          userId: user?.id,
          userName: user?.name || 'Accountant',
          userRole: user?.role || 'accountant',
          recordId: selectedRequest.id,
          oldValue: { payment_status: 'paid' },
          newValue: { payment_status: 'unpaid' }
        });

        showSuccessToast('Success!', 'Payment status reverted to UNPAID');
        
        await fetchPayableRequests();
        setSelectedRequest({ ...selectedRequest, payment_status: 'unpaid' });
        window.dispatchEvent(new CustomEvent('paymentUpdated'));
      } catch (error) {
        console.error('Error marking as unpaid:', error);
        showErrorToast('Error', 'Failed to update payment status');
      }
    }
  };

  const generateReceiptPDF = (payment, request) => {
    // 58mm thermal printer width (approximately 2.28 inches = 58mm)
    // Using portrait orientation with custom dimensions
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [58, 200] // 58mm width, 200mm height (auto-adjusts)
    });
    
    let yPos = 8;
    const centerX = 29; // Center of 58mm
    const leftMargin = 3;
    
    // Header - Church Name
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('CHURCH RECORDS', centerX, yPos, { align: 'center' });
    yPos += 4;
    doc.text('MANAGEMENT SYSTEM', centerX, yPos, { align: 'center' });
    yPos += 6;
    
    // Receipt Title
    doc.setFontSize(12);
    doc.text('PAYMENT RECEIPT', centerX, yPos, { align: 'center' });
    yPos += 6;
    
    // Divider
    doc.setLineWidth(0.1);
    doc.line(leftMargin, yPos, 55, yPos);
    yPos += 5;
    
    // Receipt Details
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    
    doc.text(`Receipt #: ${payment.reference_number}`, leftMargin, yPos);
    yPos += 4;
    doc.text(`Date: ${formatDate(payment.payment_date)}`, leftMargin, yPos);
    yPos += 6;
    
    // Service Information
    doc.setFont(undefined, 'bold');
    doc.text('SERVICE:', leftMargin, yPos);
    yPos += 4;
    doc.setFont(undefined, 'normal');
    const serviceName = request.service_request_type?.type_name || 'N/A';
    const serviceLines = doc.splitTextToSize(serviceName, 52);
    doc.text(serviceLines, leftMargin, yPos);
    yPos += serviceLines.length * 4;
    yPos += 2;
    
    // Member Name
    doc.setFont(undefined, 'bold');
    doc.text('MEMBER:', leftMargin, yPos);
    yPos += 4;
    doc.setFont(undefined, 'normal');
    const memberName = request.user?.name || 'N/A';
    const nameLines = doc.splitTextToSize(memberName, 52);
    doc.text(nameLines, leftMargin, yPos);
    yPos += nameLines.length * 4;
    yPos += 2;
    
    // Payment Method
    doc.setFont(undefined, 'bold');
    doc.text('PAYMENT METHOD:', leftMargin, yPos);
    yPos += 4;
    doc.setFont(undefined, 'normal');
    doc.text(payment.payment_method, leftMargin, yPos);
    yPos += 6;
    
    // Divider
    doc.line(leftMargin, yPos, 55, yPos);
    yPos += 5;
    
    // Amount - Larger and centered
    doc.setFont(undefined, 'bold');
    doc.setFontSize(10);
    doc.text('AMOUNT PAID:', centerX, yPos, { align: 'center' });
    yPos += 5;
    doc.setFontSize(14);
    doc.text(`${parseFloat(payment.amount).toFixed(2)}`, centerX, yPos, { align: 'center' });
    yPos += 7;
    
    // Divider
    doc.setFontSize(8);
    doc.line(leftMargin, yPos, 55, yPos);
    yPos += 5;
    
    // Recorded By
    doc.setFont(undefined, 'normal');
    doc.text(`Recorded by: ${payment.recorded_by}`, leftMargin, yPos);
    yPos += 6;
    
    // Footer
    doc.setFontSize(7);
    doc.text('This is a computer-generated receipt.', centerX, yPos, { align: 'center' });
    yPos += 3;
    doc.text('Thank you!', centerX, yPos, { align: 'center' });
    
    // Generate PDF blob for storage
    const pdfBlob = doc.output('blob');
    const pdfFile = new File([pdfBlob], `Receipt_${payment.reference_number}.pdf`, { type: 'application/pdf' });
    
    // Save to financial documents
    const receiptData = {
      fileName: `Receipt_${payment.reference_number}.pdf`,
      category: 'Receipts',
      description: `Service payment receipt for ${request.service_request_type?.type_name || 'service'} - ${request.user?.name || 'N/A'}`,
      file: pdfFile,
      uploadDate: new Date().toISOString().split('T')[0],
      uploadedBy: 'Accountant'
    };
    
    // Store in localStorage for financial documents page
    try {
      const existingDocs = JSON.parse(localStorage.getItem('financialDocuments') || '[]');
      existingDocs.unshift(receiptData);
      localStorage.setItem('financialDocuments', JSON.stringify(existingDocs));
    } catch (error) {
      console.error('Error saving to financial documents:', error);
    }
    
    // Download the PDF
    doc.save(`Receipt_${payment.reference_number}.pdf`);
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRequests = serviceRequests.slice(indexOfFirstItem, indexOfLastItem);

  const stats = [
    {
      label: 'Total Requests',
      value: serviceRequests.length,
      icon: FileText,
      color: '#4158D0',
      bg: 'rgba(65, 88, 208, 0.1)'
    },
    {
      label: 'Unpaid',
      value: serviceRequests.filter(r => r.payment_status === 'unpaid').length,
      icon: AlertCircle,
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.1)'
    },
    {
      label: 'Paid',
      value: serviceRequests.filter(r => r.payment_status === 'paid').length,
      icon: CheckCircle,
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.1)'
    },
    {
      label: 'Total Revenue',
      value: `₱${serviceRequests.filter(r => r.payment_status === 'paid').reduce((sum, r) => sum + parseFloat(r.service_fee || 0), 0).toFixed(2)}`,
      icon: DollarSign,
      color: '#8b5cf6',
      bg: 'rgba(139, 92, 246, 0.1)'
    }
  ];

  const getStatusBadge = (status) => {
    const badges = {
      unpaid: { bg: 'bg-red-100', text: 'text-red-800', icon: AlertCircle },
      paid: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle }
    };
    const badge = badges[status] || badges.unpaid;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        <Icon size={12} />
        {status?.toUpperCase()}
      </span>
    );
  };

  // Get unique service types for filter
  const uniqueServiceTypes = [...new Set(serviceRequests.map(r => r.service_request_type?.type_name).filter(Boolean))];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#4158D0' }}>
                Service Request & Payment Management
              </h1>
              <p className="text-gray-600 mt-2">
                Comprehensive payment tracking and service request processing
              </p>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(65, 88, 208, 0.1)' }}>
              <CreditCard size={32} style={{ color: '#4158D0' }} />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={index} 
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div 
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: stat.bg }}
                  >
                    <Icon size={24} style={{ color: stat.color }} />
                  </div>
                  <TrendingUp size={16} className="text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Advanced Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} style={{ color: '#4158D0' }} />
            <h2 className="text-lg font-semibold text-gray-900">Advanced Filters</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Member name, service type..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Payment Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
              <select
                value={filterPaymentStatus}
                onChange={(e) => setFilterPaymentStatus(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            {/* Service Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
              <select
                value={filterServiceType}
                onChange={(e) => setFilterServiceType(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                {uniqueServiceTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Category Filter */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterCategory('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filterCategory === 'all'
                    ? 'text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={{
                  backgroundColor: filterCategory === 'all' ? '#4158D0' : undefined
                }}
              >
                All Categories
              </button>
              <button
                onClick={() => setFilterCategory('sacrament')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filterCategory === 'sacrament'
                    ? 'text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={{
                  backgroundColor: filterCategory === 'sacrament' ? '#4158D0' : undefined
                }}
              >
                Sacrament & Schedule
              </button>
              <button
                onClick={() => setFilterCategory('document')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filterCategory === 'document'
                    ? 'text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={{
                  backgroundColor: filterCategory === 'document' ? '#4158D0' : undefined
                }}
              >
                Document Request
              </button>
              <button
                onClick={() => setFilterCategory('facility')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filterCategory === 'facility'
                    ? 'text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={{
                  backgroundColor: filterCategory === 'facility' ? '#4158D0' : undefined
                }}
              >
                Facility & Event
              </button>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Service Requests ({serviceRequests.length})</h2>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="ml-4 text-gray-600">Loading requests...</p>
            </div>
          ) : serviceRequests.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-semibold mb-2">No service requests found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Service Type</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Member</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Payment Status</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-gray-900">#{request.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {request.service_request_type?.type_name || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500 capitalize">{request.category}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-gray-400" />
                          <span className="text-sm text-gray-900">{request.user?.name || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {formatDate(request.created_at)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-gray-900">
                          ₱{parseFloat(request.service_fee || 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(request.payment_status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleViewDetails(request)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                        >
                          <Eye size={16} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && serviceRequests.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={serviceRequests.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        )}
      </div>

      {/* Enhanced View Details Modal */}
      {showModal && selectedRequest && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-5 flex justify-between items-center border-b border-gray-200" style={{ backgroundColor: 'rgba(65, 88, 208, 0.05)' }}>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: '#4158D0' }}>Service Request #{selectedRequest.id}</h2>
                <p className="text-sm text-gray-600 mt-1">Complete request and payment information</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                style={{ color: '#4158D0' }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 bg-white">
              <div className="flex gap-2 px-6">
                <button
                  onClick={() => { setActiveTab('details'); setShowAddPayment(false); }}
                  className="px-6 py-3 font-semibold text-sm transition-all rounded-t-xl"
                  style={{
                    background: activeTab === 'details' ? 'rgba(65, 88, 208, 0.1)' : 'transparent',
                    color: activeTab === 'details' ? '#4158D0' : '#6b7280',
                    border: activeTab === 'details' ? '1px solid rgba(65, 88, 208, 0.2)' : '1px solid transparent',
                    borderBottom: 'none'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <FileText size={16} />
                    Request Details
                  </div>
                </button>
                <button
                  onClick={() => { setActiveTab('payments'); setShowAddPayment(false); }}
                  className="px-6 py-3 font-semibold text-sm transition-all rounded-t-xl"
                  style={{
                    background: activeTab === 'payments' ? 'rgba(65, 88, 208, 0.1)' : 'transparent',
                    color: activeTab === 'payments' ? '#4158D0' : '#6b7280',
                    border: activeTab === 'payments' ? '1px solid rgba(65, 88, 208, 0.2)' : '1px solid transparent',
                    borderBottom: 'none'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <CreditCard size={16} />
                    Payment Records ({paymentRecords.length})
                  </div>
                </button>
                <button
                  onClick={() => { setActiveTab('audit'); setShowAddPayment(false); }}
                  className="px-6 py-3 font-semibold text-sm transition-all rounded-t-xl"
                  style={{
                    background: activeTab === 'audit' ? 'rgba(65, 88, 208, 0.1)' : 'transparent',
                    color: activeTab === 'audit' ? '#4158D0' : '#6b7280',
                    border: activeTab === 'audit' ? '1px solid rgba(65, 88, 208, 0.2)' : '1px solid transparent',
                    borderBottom: 'none'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <History size={16} />
                    Audit Log ({auditLogs.length})
                  </div>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
              {/* Details Tab */}
              {activeTab === 'details' && (
                <div className="space-y-6">
                  {/* Status & Quick Actions */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Payment Status</p>
                        {getStatusBadge(selectedRequest.payment_status)}
                      </div>
                      <div className="h-12 w-px bg-gray-300"></div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Request Status</p>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 capitalize">
                          {selectedRequest.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {selectedRequest.payment_status === 'unpaid' && (
                        <button
                          onClick={handleAddPayment}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all hover:bg-gray-50"
                          style={{
                            background: 'rgba(65, 88, 208, 0.1)',
                            color: '#4158D0',
                            border: '1px solid rgba(65, 88, 208, 0.2)',
                            boxShadow: '0 4px 12px rgba(65, 88, 208, 0.15)'
                          }}
                        >
                          <Plus size={18} />
                          Add Payment
                        </button>
                      )}
                      {selectedRequest.payment_status === 'paid' && (
                        <button
                          onClick={handleMarkAsUnpaid}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all"
                          style={{
                            background: 'white',
                            color: '#f59e0b',
                            border: '1px solid #f59e0b',
                            boxShadow: '0 2px 8px rgba(245, 158, 11, 0.15)'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                        >
                          <RotateCcw size={18} />
                          Mark as Unpaid
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Request Information Grid */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2 md:col-span-1 space-y-4">
                      <div className="rounded-xl p-4 border" style={{ backgroundColor: 'rgba(65, 88, 208, 0.05)', borderColor: 'rgba(65, 88, 208, 0.2)' }}>
                        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: '#4158D0' }}>
                          <User size={16} />
                          Member Information
                        </h3>
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Full Name</p>
                            <p className="text-sm font-medium text-gray-900">{selectedRequest.user?.name || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Email</p>
                            <p className="text-sm text-gray-700">{selectedRequest.user?.email || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl p-4 border" style={{ backgroundColor: 'rgba(65, 88, 208, 0.05)', borderColor: 'rgba(65, 88, 208, 0.2)' }}>
                        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: '#4158D0' }}>
                          <FileText size={16} />
                          Service Information
                        </h3>
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Service Type</p>
                            <p className="text-sm font-medium text-gray-900">
                              {selectedRequest.service_request_type?.type_name || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Category</p>
                            <p className="text-sm text-gray-700 capitalize">{selectedRequest.category}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Service Fee</p>
                            <p className="text-lg font-bold" style={{ color: '#4158D0' }}>
                              ₱{parseFloat(selectedRequest.service_fee || 0).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-2 md:col-span-1 space-y-4">
                      <div className="rounded-xl p-4 border" style={{ backgroundColor: 'rgba(65, 88, 208, 0.05)', borderColor: 'rgba(65, 88, 208, 0.2)' }}>
                        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: '#4158D0' }}>
                          <Calendar size={16} />
                          Schedule Details
                        </h3>
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Preferred Date</p>
                            <p className="text-sm font-medium text-gray-900">
                              {selectedRequest.preferred_date ? formatDate(selectedRequest.preferred_date) : 'Not specified'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Request Date</p>
                            <p className="text-sm text-gray-700">{formatDate(selectedRequest.created_at)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl p-4 border" style={{ backgroundColor: 'rgba(65, 88, 208, 0.05)', borderColor: 'rgba(65, 88, 208, 0.2)' }}>
                        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: '#4158D0' }}>
                          <Activity size={16} />
                          Additional Details
                        </h3>
                        <div className="space-y-2">
                          {selectedRequest.details_json && (
                            <div className="text-sm text-gray-700">
                              {Object.entries(selectedRequest.details_json).slice(0, 3).map(([key, value]) => (
                                <div key={key} className="py-1">
                                  <span className="text-xs text-gray-500 capitalize">{key.replace(/_/g, ' ')}: </span>
                                  <span className="font-medium">{String(value)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {selectedRequest.special_instructions && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Special Instructions</p>
                              <p className="text-sm text-gray-700">{selectedRequest.special_instructions}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Payments Tab */}
              {activeTab === 'payments' && (
                <div className="space-y-6">
                  {showAddPayment ? (
                    // Add Payment Form
                    <div className="rounded-xl p-6 border-2" style={{ backgroundColor: 'rgba(65, 88, 208, 0.05)', borderColor: 'rgba(65, 88, 208, 0.3)' }}>
                      <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: '#4158D0' }}>
                        <Plus size={20} />
                        Record New Payment
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                          <input
                            type="number"
                            value={paymentForm.amount}
                            onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="0.00"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                          <select
                            value={paymentForm.payment_method}
                            onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="Cash">Cash</option>
                            <option value="Check">Check</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="GCash">GCash</option>
                            <option value="PayMaya">PayMaya</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Receipt Number</label>
                          <input
                            type="text"
                            value={paymentForm.receipt_number}
                            onChange={(e) => setPaymentForm({ ...paymentForm, receipt_number: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Payment Date</label>
                          <input
                            type="date"
                            value={paymentForm.payment_date}
                            onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                          <textarea
                            value={paymentForm.notes}
                            onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            rows={3}
                          />
                        </div>
                      </div>
                      
                      <div className="flex gap-3 mt-6">
                        <button
                          onClick={handleSubmitPayment}
                          className="flex-1 px-4 py-3 rounded-xl font-semibold transition-all hover:bg-gray-50"
                          style={{
                            background: 'rgba(65, 88, 208, 0.1)',
                            color: '#4158D0',
                            border: '1px solid rgba(65, 88, 208, 0.2)',
                            boxShadow: '0 4px 12px rgba(65, 88, 208, 0.15)'
                          }}
                        >
                          Submit Payment & Generate Receipt
                        </button>
                        <button
                          onClick={() => setShowAddPayment(false)}
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
                    </div>
                  ) : (
                    // Payment Records List
                    <>
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900">Payment History</h3>
                        {selectedRequest.payment_status === 'unpaid' && (
                          <button
                            onClick={handleAddPayment}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                          >
                            <Plus size={18} />
                            Add Payment
                          </button>
                        )}
                      </div>
                      
                      {paymentRecords.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                          <Receipt className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                          <p className="text-gray-600 font-medium">No payment records found</p>
                          <p className="text-sm text-gray-500 mt-1">Payments will appear here once recorded</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {paymentRecords.map((payment, index) => (
                            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                      <CheckCircle size={20} className="text-green-600" />
                                    </div>
                                    <div>
                                      <p className="font-semibold text-gray-900">
                                        ₱{parseFloat(payment.amount || 0).toFixed(2)}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        Receipt: {payment.reference_number || payment.receipt_number}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                                    <div>
                                      <p className="text-xs text-gray-500">Payment Method</p>
                                      <p className="font-medium text-gray-900">{payment.payment_method || 'N/A'}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500">Date</p>
                                      <p className="font-medium text-gray-900">
                                        {payment.payment_date ? formatDate(payment.payment_date) : 'N/A'}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500">Recorded By</p>
                                      <p className="font-medium text-gray-900">{payment.recorded_by || 'System'}</p>
                                    </div>
                                  </div>
                                  
                                  {payment.description && (
                                    <p className="text-sm text-gray-600 mt-3 italic">{payment.description}</p>
                                  )}
                                </div>
                                
                                <button
                                  onClick={() => generateReceiptPDF(payment, selectedRequest)}
                                  className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                                >
                                  <Download size={16} />
                                  Receipt
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Audit Log Tab */}
              {activeTab === 'audit' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <History size={20} />
                    Request Activity Timeline
                  </h3>
                  
                  <div className="space-y-3">
                    {auditLogs.map((log, index) => {
                      const isLast = index === auditLogs.length - 1;
                      const iconColors = {
                        info: 'bg-blue-100 text-blue-600',
                        success: 'bg-green-100 text-green-600',
                        warning: 'bg-yellow-100 text-yellow-600',
                        danger: 'bg-red-100 text-red-600'
                      };
                      
                      return (
                        <div key={log.id} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className={`p-2 rounded-full ${iconColors[log.type] || iconColors.info}`}>
                              <Activity size={16} />
                            </div>
                            {!isLast && <div className="w-px h-full bg-gray-200 my-1"></div>}
                          </div>
                          
                          <div className="flex-1 pb-6">
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                              <div className="flex items-start justify-between mb-2">
                                <p className="font-semibold text-gray-900">{log.description}</p>
                                <span className="text-xs text-gray-500">
                                  {log.timestamp ? formatDate(log.timestamp) : 'N/A'}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <User size={14} />
                                  {log.user}
                                </span>
                                <span className="px-2 py-1 bg-gray-200 rounded text-xs font-medium capitalize">
                                  {log.action.replace(/_/g, ' ')}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 px-6 py-4 bg-white flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 rounded-xl font-semibold transition-all hover:bg-gray-50"
                style={{
                  background: 'rgba(65, 88, 208, 0.1)',
                  color: '#4158D0',
                  border: '1px solid rgba(65, 88, 208, 0.2)'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ServicePaymentsEnhanced;
