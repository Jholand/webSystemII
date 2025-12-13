import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Check, X, DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import ModalOverlay from '../../components/ModalOverlay';
import Swal from 'sweetalert2';
import billingService from '../../services/billingService';

const Billing = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [filter, setFilter] = useState('all'); // all, pending, paid
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    paymentType: '',
    clientName: '',
    amount: '',
    amountPaid: '',
    status: 'Pending',
    paymentMethod: '',
    eventDate: '',
    notes: '',
  });

  // Load billings from database
  useEffect(() => {
    fetchBillings();
  }, []);

  const fetchBillings = async () => {
    try {
      setLoading(true);
      const data = await billingService.getAll();
      // Convert snake_case to camelCase for frontend
      const formattedData = data.map(bill => ({
        id: bill.id,
        paymentType: bill.payment_type,
        clientName: bill.client_name,
        amount: parseFloat(bill.amount),
        amountPaid: parseFloat(bill.amount_paid),
        status: bill.status,
        paymentMethod: bill.payment_method,
        dateCreated: bill.created_at?.split('T')[0],
        datePaid: bill.date_paid,
        eventDate: bill.event_date,
        notes: bill.notes,
      }));
      setBills(formattedData);
    } catch (error) {
      console.error('Error fetching billings:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to load billing data',
        icon: 'error',
        confirmButtonColor: '#4667CF'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setModalMode('add');
    setFormData({
      paymentType: '',
      clientName: '',
      amount: '',
      amountPaid: '',
      status: 'Pending',
      paymentMethod: '',
      eventDate: '',
      notes: '',
    });
    setShowModal(true);
  };

  const handleEdit = (bill) => {
    setModalMode('edit');
    setFormData({
      id: bill.id,
      paymentType: bill.paymentType,
      clientName: bill.clientName,
      amount: bill.amount,
      amountPaid: bill.amountPaid,
      status: bill.status,
      paymentMethod: bill.paymentMethod || '',
      eventDate: bill.eventDate,
      notes: bill.notes || '',
    });
    setShowModal(true);
  };

  const handleMarkAsPaid = async (bill) => {
    const result = await Swal.fire({
      title: 'Mark as Paid?',
      text: `Mark payment for ${bill.clientName} as paid?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4667CF',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, mark as paid',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        // Update in database
        await billingService.update(bill.id, {
          status: 'Paid',
          amount_paid: bill.amount,
          date_paid: new Date().toISOString().split('T')[0]
        });

        // Refresh billings
        await fetchBillings();
        
        // Send notification to church admin
        const notification = {
          id: Date.now(),
          type: 'payment',
          title: 'Payment Received',
          message: `Payment for ${bill.paymentType} - ${bill.clientName} has been marked as paid (₱${bill.amount.toLocaleString()})`,
          timestamp: new Date().toISOString(),
          read: false,
          billId: bill.id,
          billData: {
            paymentType: bill.paymentType,
            clientName: bill.clientName,
            amount: bill.amount,
            paymentMethod: bill.paymentMethod,
            eventDate: bill.eventDate,
            datePaid: new Date().toISOString().split('T')[0]
          }
        };
        
        const existingNotifications = JSON.parse(localStorage.getItem('churchAdminNotifications') || '[]');
        const updatedNotifications = [notification, ...existingNotifications];
        localStorage.setItem('churchAdminNotifications', JSON.stringify(updatedNotifications));
        
        await Swal.fire({
          title: 'Success!',
          text: 'Payment marked as paid. Church admin has been notified.',
          icon: 'success',
          confirmButtonColor: '#4667CF',
          timer: 2000
        });
      } catch (error) {
        console.error('Error marking as paid:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to update payment status',
          icon: 'error',
          confirmButtonColor: '#4667CF'
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const billingData = {
        payment_type: formData.paymentType,
        client_name: formData.clientName,
        amount: parseFloat(formData.amount),
        amount_paid: parseFloat(formData.amountPaid || 0),
        status: formData.status,
        payment_method: formData.paymentMethod,
        event_date: formData.eventDate,
        notes: formData.notes,
      };

      if (modalMode === 'add') {
        await billingService.create(billingData);
      } else {
        await billingService.update(formData.id, billingData);
      }

      // Refresh billings
      await fetchBillings();
      setShowModal(false);
      
      // If marked as paid, notify admin
      if (formData.status === 'Paid' && modalMode === 'add') {
        const notification = {
          id: Date.now(),
          type: 'payment',
          title: 'New Payment Recorded',
          message: `Payment for ${formData.paymentType} - ${formData.clientName} has been recorded (₱${parseFloat(formData.amount).toLocaleString()})`,
          timestamp: new Date().toISOString(),
          read: false,
          billData: {
            paymentType: formData.paymentType,
            clientName: formData.clientName,
            amount: parseFloat(formData.amount),
            paymentMethod: formData.paymentMethod,
            eventDate: formData.eventDate,
            datePaid: new Date().toISOString().split('T')[0]
          }
        };
        
        const existingNotifications = JSON.parse(localStorage.getItem('churchAdminNotifications') || '[]');
        const updatedNotifications = [notification, ...existingNotifications];
        localStorage.setItem('churchAdminNotifications', JSON.stringify(updatedNotifications));
        
        await Swal.fire({
          title: 'Success!',
          text: 'Payment recorded. Church admin has been notified.',
          icon: 'success',
          confirmButtonColor: '#4667CF',
          timer: 2000
        });
      } else if (modalMode === 'add') {
        await Swal.fire({
          title: 'Success!',
          text: 'Payment recorded successfully.',
          icon: 'success',
          confirmButtonColor: '#4667CF',
          timer: 1500
        });
      } else {
        await Swal.fire({
          title: 'Updated!',
          text: 'Payment information updated.',
          icon: 'success',
          confirmButtonColor: '#4667CF',
          timer: 1500
        });
      }
    } catch (error) {
      console.error('Error saving billing:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to save payment information',
        icon: 'error',
        confirmButtonColor: '#4667CF'
      });
    }
  };

  const filteredBills = bills.filter(bill => {
    const matchesSearch = 
      bill.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.paymentType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'pending' && bill.status === 'Pending') ||
      (filter === 'paid' && bill.status === 'Paid');

    return matchesSearch && matchesFilter;
  });

  const totalPending = bills.filter(b => b.status === 'Pending').reduce((sum, b) => sum + (b.amount - b.amountPaid), 0);
  const totalPaid = bills.filter(b => b.status === 'Paid').reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-gray-100 dark:from-gray-900 dark:via-blue-950 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl shadow-lg" style={{ backgroundColor: '#4667CF' }}>
              <DollarSign size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Billing & Payments</h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Track walk-in payments and event billing</p>
            </div>
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 text-white px-6 py-3 rounded-lg hover:opacity-90 transition-all font-medium shadow-lg"
            style={{ backgroundColor: '#4667CF' }}
          >
            <Plus size={20} />
            Record Walk-In Payment
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Pending</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">₱{totalPending.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Clock size={24} className="text-orange-600 dark:text-orange-300" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Paid</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">₱{totalPaid.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle size={24} className="text-green-600 dark:text-green-300" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Bills</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{bills.length}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <DollarSign size={24} className="text-blue-600 dark:text-blue-300" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by client name or payment type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 dark:text-gray-100"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'pending'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilter('paid')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'paid'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Paid
              </button>
            </div>
          </div>
        </div>

        {/* Bills Table */}
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Payment Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Client Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Amount Paid</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Balance</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Event Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100 font-medium">{bill.paymentType}</td>
                    <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">{bill.clientName}</td>
                    <td className="px-4 py-4 text-sm text-gray-900 dark:text-gray-100 font-semibold">₱{bill.amount.toLocaleString()}</td>
                    <td className="px-4 py-4 text-sm text-green-600 dark:text-green-400">₱{bill.amountPaid.toLocaleString()}</td>
                    <td className="px-4 py-4 text-sm text-orange-600 dark:text-orange-400 font-semibold">
                      ₱{(bill.amount - bill.amountPaid).toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">{bill.eventDate}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                        bill.status === 'Paid'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          : 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                      }`}>
                        {bill.status === 'Paid' ? <CheckCircle size={14} /> : <Clock size={14} />}
                        {bill.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {bill.status === 'Pending' && (
                          <button
                            onClick={() => handleMarkAsPaid(bill)}
                            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900 rounded-lg transition-colors"
                            title="Mark as Paid"
                          >
                            <Check size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(bill)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <ModalOverlay isOpen={showModal} onClose={() => setShowModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {modalMode === 'add' ? 'Record Walk-In Payment' : 'Edit Payment'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Type *
                  </label>
                  <select
                    value={formData.paymentType}
                    onChange={(e) => setFormData({...formData, paymentType: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select type</option>
                    <option value="Marriage Ceremony">Marriage Ceremony</option>
                    <option value="Baptism">Baptism</option>
                    <option value="Confirmation">Confirmation</option>
                    <option value="First Communion">First Communion</option>
                    <option value="Mass Intention">Mass Intention</option>
                    <option value="Blessing">Blessing</option>
                    <option value="Certificate Request">Certificate Request</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Total Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amount Paid
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amountPaid}
                    onChange={(e) => setFormData({...formData, amountPaid: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select method</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Event Date *
                </label>
                <input
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => setFormData({...formData, eventDate: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional notes or comments..."
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-white rounded-lg transition-all hover:opacity-90"
                  style={{ backgroundColor: '#4667CF' }}
                >
                  {modalMode === 'add' ? 'Record Payment' : 'Update Payment'}
                </button>
              </div>
            </form>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
};

export default Billing;
