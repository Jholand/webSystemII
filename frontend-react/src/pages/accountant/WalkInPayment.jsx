import { useState, useEffect } from 'react';
import { DollarSign, CreditCard, Calendar, User, Hash, FileText, CheckCircle, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { showSuccessToast, showErrorToast } from '../../utils/sweetAlertHelper';
import { donationAPI, paymentRecordAPI, donationCategoryAPI, eventFeeCategoryAPI, scheduleAPI } from '../../services/dataSync';
import { logActivity, auditActions, auditModules } from '../../utils/auditLogger';

const WalkInPayment = () => {
  const { user } = useAuth();
  const [paymentType, setPaymentType] = useState('donation');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [events, setEvents] = useState([]);
  const [searchEventId, setSearchEventId] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  const [paymentForm, setPaymentForm] = useState({
    payer_name: '',
    amount: '',
    payment_method: 'cash',
    category_id: '',
    category_name: '',
    event_id: '',
    event_name: '',
    receipt_number: '',
    notes: ''
  });

  useEffect(() => {
    loadCategories();
    loadEvents();
    generateReceiptNumber();
  }, []);

  useEffect(() => {
    loadCategories();
    setPaymentForm(prev => ({ 
      ...prev, 
      category_id: '', 
      category_name: '', 
      amount: '',
      event_id: '',
      event_name: ''
    }));
    setSelectedEvent(null);
  }, [paymentType]);

  const loadCategories = async () => {
    try {
      if (paymentType === 'donation') {
        const res = await donationCategoryAPI.getAll();
        setCategories(Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []));
      } else {
        const res = await eventFeeCategoryAPI.getAll();
        setCategories(Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []));
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadEvents = async () => {
    try {
      const res = await scheduleAPI.getAll();
      const allEvents = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      
      // Filter future events and format with event ID
      const today = new Date();
      const upcomingEvents = allEvents
        .filter(e => new Date(e.appointment_date || e.event_date) >= today)
        .map(e => ({
          ...e,
          event_id: `EVT-${e.id}-${new Date(e.appointment_date || e.event_date).getFullYear()}`,
          display_name: `${e.appointment_type || e.event_type} - ${e.requester_name || e.member_name || 'Guest'}`
        }));
      
      setEvents(upcomingEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const generateReceiptNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const receiptNumber = `RCP-${timestamp}-${random}`;
    setPaymentForm(prev => ({ ...prev, receipt_number: receiptNumber }));
  };

  const handleSearchEvent = () => {
    const event = events.find(e => e.event_id === searchEventId.toUpperCase());
    if (event) {
      setSelectedEvent(event);
      setPaymentForm(prev => ({
        ...prev,
        event_id: event.event_id,
        event_name: event.display_name,
        payer_name: event.requester_name || event.member_name || ''
      }));
      
      // Auto-fill amount if event has a category with default fee
      const category = categories.find(c => c.name === event.appointment_type);
      if (category && category.amount) {
        setPaymentForm(prev => ({
          ...prev,
          amount: category.amount.toString(),
          category_id: category.id,
          category_name: category.name
        }));
      }
    } else {
      showErrorToast('Event Not Found', 'No event found with this Event ID');
      setSelectedEvent(null);
    }
  };

  const handleCategoryChange = (categoryId) => {
    const category = categories.find(c => c.id === parseInt(categoryId));
    if (category) {
      setPaymentForm(prev => ({
        ...prev,
        category_id: categoryId,
        category_name: category.name,
        amount: paymentType === 'event' && category.amount ? category.amount.toString() : prev.amount
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!paymentForm.payer_name || !paymentForm.amount || (paymentType === 'donation' && !paymentForm.category_id)) {
      showErrorToast('Validation Error', 'Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      if (paymentType === 'donation') {
        // Record donation
        const donationData = {
          donor_name: paymentForm.payer_name,
          amount: parseFloat(paymentForm.amount),
          donation_date: new Date().toISOString().split('T')[0],
          payment_method: paymentForm.payment_method,
          category_id: paymentForm.category_id,
          receipt_number: paymentForm.receipt_number,
          notes: paymentForm.notes,
          recorded_by: user?.id,
          status: 'completed'
        };

        await donationAPI.create(donationData);

        await logActivity({
          action: auditActions.CREATE,
          module: auditModules.DONATIONS,
          details: `Recorded walk-in donation: ${paymentForm.payer_name} - ₱${paymentForm.amount}`,
          userId: user?.id,
          userName: user?.name || 'Accountant',
          userRole: user?.role || 'accountant',
          newValue: donationData
        });

        showSuccessToast('Donation Recorded!', `Receipt #${paymentForm.receipt_number}`);
      } else {
        // Record event payment
        const paymentData = {
          payer_name: paymentForm.payer_name,
          amount: parseFloat(paymentForm.amount),
          payment_date: new Date().toISOString().split('T')[0],
          payment_method: paymentForm.payment_method,
          event_id: paymentForm.event_id || null,
          event_name: paymentForm.event_name || paymentForm.category_name,
          category: paymentForm.category_name,
          receipt_number: paymentForm.receipt_number,
          notes: paymentForm.notes,
          recorded_by: user?.id,
          status: 'completed',
          payment_type: 'walk-in'
        };

        await paymentRecordAPI.create(paymentData);

        await logActivity({
          action: auditActions.CREATE,
          module: auditModules.PAYMENTS,
          details: `Recorded walk-in event payment: ${paymentForm.payer_name} - ₱${paymentForm.amount} for ${paymentForm.event_name || paymentForm.category_name}`,
          userId: user?.id,
          userName: user?.name || 'Accountant',
          userRole: user?.role || 'accountant',
          newValue: paymentData
        });

        showSuccessToast('Payment Recorded!', `Receipt #${paymentForm.receipt_number}`);
      }

      // Reset form
      setPaymentForm({
        payer_name: '',
        amount: '',
        payment_method: 'cash',
        category_id: '',
        category_name: '',
        event_id: '',
        event_name: '',
        receipt_number: '',
        notes: ''
      });
      setSelectedEvent(null);
      setSearchEventId('');
      generateReceiptNumber();

    } catch (error) {
      console.error('Error recording payment:', error);
      showErrorToast('Error', 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: '#4158D0' }}>
                Walk-In Payment Recording
              </h1>
              <p className="text-gray-600">
                Record donations and event payments received at the office
              </p>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(65, 88, 208, 0.1)' }}>
              <DollarSign style={{ color: '#4158D0' }} size={32} />
            </div>
          </div>
        </div>

        {/* Payment Type Selection */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Payment Type</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setPaymentType('donation')}
              className={`p-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-3 ${
                paymentType === 'donation' ? 'shadow-lg' : 'hover:bg-gray-50'
              }`}
              style={{
                background: paymentType === 'donation' ? 'rgba(16, 185, 129, 0.1)' : 'white',
                color: paymentType === 'donation' ? '#10B981' : '#6b7280',
                borderWidth: '2px',
                borderStyle: 'solid',
                borderColor: paymentType === 'donation' ? 'rgba(16, 185, 129, 0.3)' : '#e5e7eb'
              }}
            >
              <DollarSign size={20} />
              Donation
            </button>
            <button
              type="button"
              onClick={() => setPaymentType('event')}
              className={`p-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-3 ${
                paymentType === 'event' ? 'shadow-lg' : 'hover:bg-gray-50'
              }`}
              style={{
                background: paymentType === 'event' ? 'rgba(65, 88, 208, 0.1)' : 'white',
                color: paymentType === 'event' ? '#4158D0' : '#6b7280',
                borderWidth: '2px',
                borderStyle: 'solid',
                borderColor: paymentType === 'event' ? 'rgba(65, 88, 208, 0.3)' : '#e5e7eb'
              }}
            >
              <Calendar size={20} />
              Event Payment
            </button>
          </div>
        </div>

        {/* Event ID Search (only for event payments) */}
        {paymentType === 'event' && (
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Search by Event ID (Optional)
            </label>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={searchEventId}
                  onChange={(e) => setSearchEventId(e.target.value.toUpperCase())}
                  placeholder="EVT-123-2024"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent uppercase"
                />
              </div>
              <button
                type="button"
                onClick={handleSearchEvent}
                className="px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2"
                style={{
                  background: 'rgba(65, 88, 208, 0.1)',
                  color: '#4158D0',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: 'rgba(65, 88, 208, 0.2)'
                }}
              >
                <Search size={18} />
                Search
              </button>
            </div>
            
            {selectedEvent && (
              <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={18} style={{ color: '#10B981' }} />
                  <span className="font-semibold" style={{ color: '#10B981' }}>Event Found</span>
                </div>
                <div className="text-sm text-gray-700">
                  <p><strong>Event:</strong> {selectedEvent.display_name}</p>
                  <p><strong>Date:</strong> {new Date(selectedEvent.appointment_date || selectedEvent.event_date).toLocaleDateString()}</p>
                  <p><strong>Event ID:</strong> {selectedEvent.event_id}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Receipt Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={paymentForm.receipt_number}
              readOnly
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Payer Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={paymentForm.payer_name}
                onChange={(e) => setPaymentForm({ ...paymentForm, payer_name: e.target.value })}
                required
                placeholder="Enter payer's full name"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {paymentType === 'donation' ? 'Donation Category' : 'Event/Service Category'} <span className="text-red-500">*</span>
            </label>
            <select
              value={paymentForm.category_id}
              onChange={(e) => handleCategoryChange(e.target.value)}
              required={paymentType === 'donation'}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
            >
              <option value="">Select category...</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} {paymentType === 'event' && cat.amount ? `(₱${parseFloat(cat.amount).toLocaleString()})` : ''}
                </option>
              ))}
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
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                required
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              />
            </div>
            {paymentType === 'event' && paymentForm.category_id && (
              <p className="text-xs text-gray-500 mt-1">
                Default fee auto-filled. You can adjust if needed.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Payment Method <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['cash', 'check', 'bank_transfer'].map(method => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentForm({ ...paymentForm, payment_method: method })}
                  className={`p-3 rounded-lg font-semibold transition-all ${
                    paymentForm.payment_method === method ? 'shadow-md' : 'hover:bg-gray-50'
                  }`}
                  style={{
                    background: paymentForm.payment_method === method ? 'rgba(65, 88, 208, 0.1)' : 'white',
                    color: paymentForm.payment_method === method ? '#4158D0' : '#6b7280',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: paymentForm.payment_method === method ? 'rgba(65, 88, 208, 0.2)' : '#e5e7eb'
                  }}
                >
                  {method.replace('_', ' ').toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Notes (Optional)</label>
            <textarea
              value={paymentForm.notes}
              onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
              rows="3"
              placeholder="Add any additional notes..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-4 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
                boxShadow: '0 4px 12px rgba(65, 88, 208, 0.3)'
              }}
            >
              <CreditCard size={20} />
              {loading ? 'Recording...' : 'Record Payment'}
            </button>
            <button
              type="button"
              onClick={() => {
                setPaymentForm({
                  payer_name: '',
                  amount: '',
                  payment_method: 'cash',
                  category_id: '',
                  category_name: '',
                  event_id: '',
                  event_name: '',
                  receipt_number: '',
                  notes: ''
                });
                setSelectedEvent(null);
                setSearchEventId('');
                generateReceiptNumber();
              }}
              className="px-6 py-4 rounded-xl font-semibold transition-all hover:bg-gray-100"
              style={{
                background: 'white',
                color: '#6b7280',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: '#d1d5db'
              }}
            >
              Clear Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WalkInPayment;
