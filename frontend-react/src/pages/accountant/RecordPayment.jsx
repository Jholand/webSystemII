import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { Save, Printer, X, Upload, Search, DollarSign, Tag, Calendar } from 'lucide-react';
import { showSuccessToast, showInfoToast, showErrorToast } from '../../utils/sweetAlertHelper';
import { useAuth } from '../../contexts/AuthContext';
import appointmentAPI from '../../services/appointmentAPI';
import { donationCategoryAPI, eventFeeCategoryAPI, donationAPI, paymentRecordAPI } from '../../services/dataSync';
import api from '../../services/api';

const RecordPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [lastPayment, setLastPayment] = useState(null);
  
  // Load categories from database
  const [donationCategories, setDonationCategories] = useState([]);
  const [eventFeeCategories, setEventFeeCategories] = useState([]);

  useEffect(() => {
    const loadCategories = async () => {
      // Only load if user is authenticated and is an accountant
      if (!user || user.role !== 'accountant') return;
      
      try {
        const donations = await donationCategoryAPI.getAll();
        const eventFees = await eventFeeCategoryAPI.getAll();
        setDonationCategories(donations);
        setEventFeeCategories(eventFees);
      } catch (error) {
        console.error('Error loading categories:', error);
        showErrorToast('Error', 'Failed to load payment categories');
      }
    };
    loadCategories();
  }, [user]);

  // Pre-fill form from appointment data if coming from appointments page
  // OR from service request payment
  useEffect(() => {
    if (location.state?.appointment) {
      const apt = location.state.appointment;
      setFormData(prev => ({
        ...prev,
        paymentType: 'eventfee',
        donorType: 'guest',
        guestName: apt.client_name,
        guestContact: apt.contact_number,
        category: apt.type,
        amount: apt.event_fee,
        notes: location.state.notes || `Payment for ${apt.type} appointment on ${apt.appointment_date}`
      }));
    } else if (location.state?.fromServiceRequest) {
      // Pre-fill from service request payment
      setFormData(prev => ({
        ...prev,
        paymentType: 'eventfee', // Always use 'eventfee' for service requests
        donorType: 'guest',
        guestName: location.state.guestName || '',
        guestContact: location.state.guestContact || '',
        category: location.state.category || '',
        amount: location.state.amount || '',
        notes: location.state.notes || '',
        serviceRequestId: location.state.serviceRequestId
      }));
      console.log('📝 Pre-filled form from service request:', {
        serviceRequestId: location.state.serviceRequestId,
        category: location.state.category,
        amount: location.state.amount
      });
    }
  }, [location.state]);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    paymentType: 'donation', // 'donation' or 'eventfee'
    isAnonymous: false,
    donorType: 'member', // 'member' or 'guest'
    donorId: '',
    donorName: '',
    guestName: '',
    guestContact: '',
    category: '',
    amount: '',
    paymentMethod: 'Walk-in',
    collector: 'Current Accountant',
    notes: '',
    attachments: [],
    serviceRequestId: null
  });

  const [errors, setErrors] = useState({});
  const [showMemberSearch, setShowMemberSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventId, setEventId] = useState('');
  const [foundEvent, setFoundEvent] = useState(null);
  const [appointments, setAppointments] = useState([]);

  // Fetch appointments from database
  useEffect(() => {
    const fetchAppointments = async () => {
      // Only load if user is authenticated and is an accountant
      if (!user || user.role !== 'accountant') return;
      
      try {
        const data = await appointmentAPI.getAll();
        setAppointments(data);
      } catch (error) {
        console.error('Failed to load appointments:', error);
      }
    };
    fetchAppointments();
  }, [user]);

  // Sample members for search
  const members = [
    { id: 1, name: 'John Doe', family: 'Doe Family' },
    { id: 2, name: 'Maria Santos', family: 'Santos Family' },
    { id: 3, name: 'Robert Johnson', family: 'Johnson Family' },
    { id: 4, name: 'Anna Rodriguez', family: 'Rodriguez Family' },
  ];

  // Get current categories based on payment type
  const currentCategories = formData.paymentType === 'donation' 
    ? donationCategories 
    : eventFeeCategories;

  // Get suggested amount for selected event fee
  const selectedEventFee = eventFeeCategories.find(cat => cat.name === formData.category);
  const suggestedAmount = selectedEventFee?.suggested_amount || 0;

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.family.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle Event ID search
  const handleEventIdSearch = () => {
    if (!eventId) {
      showErrorToast('Input Required', 'Please enter an Event ID');
      return;
    }

    const event = appointments.find(apt => apt.id === parseInt(eventId));
    
    if (event) {
      if (event.is_paid) {
        showErrorToast('Already Paid', 'This event has already been paid for');
        return;
      }
      
      if (event.status !== 'Confirmed') {
        showErrorToast('Not Confirmed', 'Only confirmed events can be paid');
        return;
      }

      // Auto-fill form with event details
      setFormData({
        ...formData,
        paymentType: 'eventfee',
        donorType: 'guest',
        guestName: event.client_name,
        guestContact: event.contact_number,
        category: event.type,
        amount: event.event_fee,
        notes: `Payment for ${event.type} appointment on ${event.appointment_date}`
      });
      
      setFoundEvent(event);
      showSuccessToast('Event Found!', `${event.type} for ${event.client_name} - ₱${parseFloat(event.event_fee).toLocaleString()}`);
    } else {
      showErrorToast('Not Found', `No event found with ID: ${eventId}`);
      setFoundEvent(null);
    }
  };

  // Handle payment type change
  const handlePaymentTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      paymentType: type,
      category: '', // Reset category when type changes
      amount: '' // Reset amount
    }));
  };

  // Handle category change
  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setFormData(prev => ({
      ...prev,
      category
    }));

    // Auto-fill suggested amount for event fees
    if (formData.paymentType === 'eventfee') {
      const eventFee = eventFeeCategories.find(cat => cat.name === category);
      if (eventFee) {
        setFormData(prev => ({
          ...prev,
          amount: eventFee.suggested_amount?.toString() || '0'
        }));
      }
    }
  };

  const handleMemberSelect = (member) => {
    setFormData(prev => ({
      ...prev,
      donorId: member.id,
      donorName: member.name
    }));
    setShowMemberSearch(false);
    setSearchTerm('');
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const removeAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.paymentType) newErrors.paymentType = 'Payment type is required';
    
    // Donor validation (only if not anonymous)
    if (!formData.isAnonymous) {
      if (formData.donorType === 'member') {
        if (!formData.donorId) newErrors.donorId = 'Please select a member';
      } else {
        if (!formData.guestName) newErrors.guestName = 'Guest name is required';
      }
    }
    
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.amount || formData.amount <= 0) newErrors.amount = 'Valid amount is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validate()) {
      try {
        // Prepare payment data
        const receiptNumber = `RCP-2025-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
        const paymentData = {
          ...formData,
          receiptNumber: receiptNumber,
          recordedBy: user?.name || 'Accountant',
          recordedAt: new Date().toISOString(),
          id: Date.now()
        };

        console.log('Payment recorded:', paymentData);
        
        // Save payment to database based on type
        if (formData.paymentType === 'donation') {
          // Create donation record
          const donationRecord = {
            donor_name: formData.isAnonymous ? 'Anonymous' : 
                       (formData.donorType === 'member' ? formData.donorName : formData.guestName),
            amount: parseFloat(formData.amount),
            donation_date: formData.date,
            category_name: formData.category,
            payment_method: formData.paymentMethod,
            receipt_number: receiptNumber,
            notes: formData.notes
          };
          await donationAPI.create(donationRecord);
          console.log('✅ Donation saved to database');
          showSuccessToast('Success!', 'Donation recorded successfully. Click "Print Receipt" to print.');
        } else if (formData.paymentType === 'eventfee') {
          // Create payment record for event fee
          const paymentRecord = {
            user_id: null, // Walk-in payments don't have a user_id
            payment_type: 'event_fee',
            service_name: formData.category,
            amount: parseFloat(formData.amount),
            payment_method: formData.paymentMethod,
            reference_number: receiptNumber,
            description: `Payment from ${formData.donorType === 'member' ? formData.donorName : formData.guestName}. ${formData.notes || ''}`.trim(),
            recorded_by: user?.name || 'Accountant',
            payment_date: formData.date,
            visible_to_user: false // Walk-in payments are not visible to users by default
          };
          const savedPayment = await paymentRecordAPI.create(paymentRecord);
          console.log('✅ Payment record saved to database:', savedPayment);
          
          // If this payment is for a service request, update its payment status
          if (formData.serviceRequestId) {
            console.log(`🔄 Updating service request ${formData.serviceRequestId} payment status...`);
            try {
              const updateResponse = await api.put(`/service-requests/${formData.serviceRequestId}/payment-status`, {
                payment_status: 'paid',
                donation_id: savedPayment.id
              });
              console.log(`✅ Service request ${formData.serviceRequestId} marked as PAID:`, updateResponse.data);
              showSuccessToast(
                'Payment Confirmed!', 
                `Service payment recorded successfully. Service request #${formData.serviceRequestId} marked as PAID. Click "Print Receipt" to print.`
              );
              
              // Remove from viewed requests since it's now paid
              const viewedRequests = JSON.parse(localStorage.getItem('viewedServiceRequests') || '[]');
              const updatedViewed = viewedRequests.filter(id => id !== formData.serviceRequestId);
              localStorage.setItem('viewedServiceRequests', JSON.stringify(updatedViewed));
              
              // Dispatch event to refresh sidebar count and service payments page
              console.log('📡 Dispatching paymentUpdated event...');
              window.dispatchEvent(new CustomEvent('paymentUpdated'));
            } catch (error) {
              console.error('❌ Error updating service request status:', error);
              console.error('Error response:', error.response?.data);
              showSuccessToast('Success!', 'Payment recorded but failed to update request status automatically.');
            }
            // Navigate back to service payments after successful payment
            setTimeout(() => navigate('/accountant/service-payments'), 2000);
            return;
          }
          
          // Update appointment's payment status
          const appointmentId = foundEvent?.id || location.state?.appointment?.id;
          if (appointmentId) {
            await appointmentAPI.updatePaymentStatus(appointmentId, true, savedPayment.id);
            console.log(`✅ Updated appointment ${appointmentId} payment status to PAID`);
            showSuccessToast(
              'Payment Confirmed!', 
              `Event fee payment recorded and appointment #${appointmentId} marked as PAID. Click "Print Receipt" to print.`
            );
          } else {
            showSuccessToast('Success!', `Event fee recorded successfully. Click "Print Receipt" to print.`);
          }
        }
        
        // Save payment data for receipt
        setLastPayment(paymentData);
      
        // Reset form
        setFormData({
          date: new Date().toISOString().split('T')[0],
          paymentType: 'donation',
          isAnonymous: false,
          donorType: 'member',
          donorId: '',
          donorName: '',
          guestName: '',
          guestContact: '',
          category: '',
          amount: '',
          paymentMethod: 'Walk-in',
          collector: 'Current Accountant',
          notes: '',
          attachments: [],
          serviceRequestId: null
        });
        setErrors({});
        setEventId('');
        setFoundEvent(null);
      } catch (error) {
        console.error('Error saving payment:', error);
        showErrorToast('Error', 'Failed to save payment. Please try again.');
      }
    } else {
      showErrorToast('Validation Error', 'Please fill in all required fields');
    }
  };

  const handlePrint = () => {
    if (lastPayment) {
      // Close modal before printing
      setShowReceiptModal(false);
      // Trigger print after modal closes
      setTimeout(() => {
        handlePrintReceipt();
      }, 100);
    } else {
      showInfoToast('No Receipt', 'Please save a payment first to print a receipt');
    }
  };

  const handlePrintReceipt = () => {
    if (!lastPayment) {
      showErrorToast('Error', 'No payment data found');
      return;
    }

    const donorName = lastPayment.isAnonymous 
      ? 'Anonymous' 
      : lastPayment.donorType === 'member' 
        ? lastPayment.donorName 
        : lastPayment.guestName;

    const donorType = lastPayment.isAnonymous 
      ? 'Anonymous' 
      : lastPayment.donorType === 'member' 
        ? 'Member' 
        : 'Guest';

    const printWindow = window.open('', '_blank', 'width=600,height=800');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Receipt</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            @page {
              size: 58mm auto;
              margin: 0;
            }
            
            body {
              font-family: 'Courier New', monospace;
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              width: 58mm;
            }
            
            .receipt {
              width: 100%;
              font-size: 8px;
              line-height: 1.3;
              color: #000;
              padding: 3mm;
              background: white;
            }
            
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .divider { 
              border-top: 1px dashed #666; 
              margin: 2mm 0;
            }
            .row {
              display: flex;
              justify-content: space-between;
              margin: 1mm 0;
            }
            .amount-box {
              background: #f3f4f6;
              padding: 2mm;
              margin: 2mm 0;
              text-align: center;
            }
            .amount-large {
              font-size: 14px;
              font-weight: bold;
              margin: 1mm 0;
            }
            .small { font-size: 7px; }
            .gray { color: #555; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <!-- Header -->
            <div class="center bold" style="font-size: 9px;">OLPGVMA CHURCH</div>
            <div class="center small">123 Church Street</div>
            <div class="center small">Manila, Philippines</div>
            <div class="center small">Tel: +63 2 1234 5678</div>
            
            <div class="divider"></div>
            
            <!-- Receipt Title -->
            <div class="center bold">OFFICIAL RECEIPT</div>
            <div class="center small">${lastPayment.receiptNumber}</div>
            
            <div class="divider"></div>
            
            <!-- Date & Time -->
            <div class="row">
              <span>Date:</span>
              <span class="bold">${lastPayment.date}</span>
            </div>
            <div class="row">
              <span>Time:</span>
              <span class="bold">${new Date(lastPayment.recordedAt).toLocaleTimeString()}</span>
            </div>
            
            <div class="divider"></div>
            
            <!-- Donor -->
            <div class="small bold">RECEIVED FROM:</div>
            <div class="bold" style="font-size: 8px; margin: 1mm 0;">${donorName}</div>
            <div class="small gray">(${donorType})</div>
            
            <div class="divider"></div>
            
            <!-- Payment Details -->
            <div class="row">
              <span>Type:</span>
              <span class="bold">${lastPayment.paymentType === 'donation' ? 'Donation' : 'Event Fee'}</span>
            </div>
            <div class="row">
              <span>Category:</span>
              <span class="bold">${lastPayment.category}</span>
            </div>
            <div class="row">
              <span>Method:</span>
              <span class="bold">${lastPayment.paymentMethod}</span>
            </div>
            
            <div class="divider"></div>
            
            <!-- Amount -->
            <div class="amount-box">
              <div class="small gray">AMOUNT</div>
              <div class="amount-large">₱${parseFloat(lastPayment.amount).toLocaleString()}</div>
              <div class="small" style="font-style: italic; margin-top: 1mm;">
                ${convertAmountToWords(parseFloat(lastPayment.amount))}
              </div>
            </div>
            
            ${lastPayment.notes ? `
            <div class="divider"></div>
            <div class="small bold">Notes:</div>
            <div class="small" style="margin-top: 1mm;">${lastPayment.notes}</div>
            ` : ''}
            
            <div class="divider"></div>
            
            <!-- Collector -->
            <div class="small">Collected by: <span class="bold">${lastPayment.recordedBy}</span></div>
            <div class="small gray">Accountant</div>
            
            <div class="divider"></div>
            
            <!-- Footer -->
            <div class="center small gray" style="margin-top: 2mm;">
              This is an official receipt.<br>
              Please keep for your records.<br>
              Thank you for your support!
            </div>
            
            <div class="divider"></div>
            <div class="center small">*${lastPayment.receiptNumber}*</div>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 250);
              setTimeout(function() {
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const convertAmountToWords = (amount) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    
    if (amount === 0) return 'Zero Pesos';
    
    const num = Math.floor(amount);
    const thousands = Math.floor(num / 1000);
    const hundreds = Math.floor((num % 1000) / 100);
    const tensPlace = Math.floor((num % 100) / 10);
    const onesPlace = num % 10;
    
    let words = '';
    
    if (thousands > 0) {
      words += ones[thousands] + ' Thousand ';
    }
    
    if (hundreds > 0) {
      words += ones[hundreds] + ' Hundred ';
    }
    
    if (tensPlace === 1) {
      words += teens[onesPlace] + ' ';
    } else {
      if (tensPlace > 1) {
        words += tens[tensPlace] + ' ';
      }
      if (onesPlace > 0) {
        words += ones[onesPlace] + ' ';
      }
    }
    
    return words.trim() + ' Pesos Only';
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Record Payment</h1>
              <p className="text-sm text-gray-600 mt-1">Record walk-in donations and event fees</p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Event ID Banner - Show when coming from appointments */}
        {location.state?.appointment && (
          <div className="bg-green-50 border-l-4 border-green-400 rounded-r-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <Calendar className="text-green-600 mt-0.5" size={20} />
              <div>
                <p className="text-sm font-semibold text-green-900">
                  Event ID #{location.state.appointment.id} - {location.state.appointment.type}
                </p>
                <p className="text-sm text-green-700 mt-1">
                  Form pre-filled from Church Admin appointment. Client: {location.state.appointment.client_name} | Fee: ₱{parseFloat(location.state.appointment.event_fee).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
          {/* Payment Type Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Payment Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handlePaymentTypeChange('donation')}
                className={`p-4 border-2 rounded-lg flex items-center justify-center gap-3 transition-all ${
                  formData.paymentType === 'donation'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Tag size={20} />
                <span className="font-medium">Donation</span>
              </button>
              <button
                type="button"
                onClick={() => handlePaymentTypeChange('eventfee')}
                className={`p-4 border-2 rounded-lg flex items-center justify-center gap-3 transition-all ${
                  formData.paymentType === 'eventfee'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <DollarSign size={20} />
                <span className="font-medium">Event Fee</span>
              </button>
            </div>
          </div>

          {/* Event ID Search - Only show for Event Fee payment type */}
          {formData.paymentType === 'eventfee' && (
            <div className="mb-6 p-5 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <label className="block text-sm font-semibold text-blue-900 mb-3">
                Search by Event ID (from Church Admin)
              </label>
              <div className="flex gap-3">
                <div className="flex-1">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 font-bold">#</span>
                    <input
                      type="number"
                      value={eventId}
                      onChange={(e) => setEventId(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleEventIdSearch())}
                      placeholder="Enter Event ID (e.g., 1, 2, 3...)"
                      className="w-full pl-8 pr-4 py-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleEventIdSearch}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold flex items-center gap-2"
                >
                  <Search size={20} />
                  Search Event
                </button>
              </div>
              
              {foundEvent && (
                <div className="mt-4 p-4 bg-green-50 border-2 border-green-300 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Calendar className="text-green-600 mt-1" size={24} />
                    <div className="flex-1">
                      <p className="font-bold text-green-900 text-lg mb-2">
                        Event ID #{foundEvent.id} - {foundEvent.type}
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-green-700 font-medium">Client:</span>
                          <span className="text-green-900 ml-2">{foundEvent.client_name}</span>
                        </div>
                        <div>
                          <span className="text-green-700 font-medium">Contact:</span>
                          <span className="text-green-900 ml-2">{foundEvent.contact_number}</span>
                        </div>
                        <div>
                          <span className="text-green-700 font-medium">Date:</span>
                          <span className="text-green-900 ml-2">{foundEvent.appointment_date} at {foundEvent.appointment_time}</span>
                        </div>
                        <div>
                          <span className="text-green-700 font-medium">Event Fee:</span>
                          <span className="text-green-900 ml-2 font-bold text-lg">₱{parseFloat(foundEvent.event_fee).toLocaleString()}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-green-700 font-medium">Payment Status:</span>
                          <span className={`ml-2 px-2 py-1 rounded text-xs font-bold ${
                            foundEvent.is_paid ? 'bg-green-200 text-green-900' : 'bg-yellow-200 text-yellow-900'
                          }`}>
                            {foundEvent.is_paid ? '✓ ALREADY PAID' : '⏱ UNPAID - Will be marked as PAID after saving'}
                          </span>
                        </div>
                      </div>
                      <p className="text-green-700 text-xs mt-2">✓ Form auto-filled with event details below</p>
                    </div>
                  </div>
                </div>
              )}
              
              <p className="text-blue-700 text-xs mt-3">
                💡 Tip: Church Admin provides the Event ID for walk-in payments. Enter it above to auto-fill all event details.
              </p>
            </div>
          )}

          {/* Date */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4667CF] focus:border-transparent ${
                errors.date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
          </div>

          {/* Anonymous Checkbox */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="isAnonymous"
                checked={formData.isAnonymous}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm font-medium text-blue-900">
                Anonymous Payment (No donor information required)
              </span>
            </label>
          </div>

          {/* Donor Information - Only show if not anonymous */}
          {!formData.isAnonymous && (
            <>
              {/* Donor Type */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Donor Type <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="donorType"
                      value="member"
                      checked={formData.donorType === 'member'}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    Member
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="donorType"
                      value="guest"
                      checked={formData.donorType === 'guest'}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    Guest
                  </label>
                </div>
              </div>

              {/* Member Selection */}
              {formData.donorType === 'member' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Member <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div
                      onClick={() => setShowMemberSearch(!showMemberSearch)}
                      className={`w-full px-4 py-2 border rounded-lg cursor-pointer flex items-center justify-between ${
                        errors.donorId ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <span className={formData.donorName ? 'text-gray-900' : 'text-gray-400'}>
                        {formData.donorName || 'Select a member'}
                      </span>
                      <Search size={18} />
                    </div>

                    {showMemberSearch && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        <div className="p-2">
                          <input
                            type="text"
                            placeholder="Search member..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                        <div className="max-h-40 overflow-y-auto">
                          {filteredMembers.map(member => (
                            <div
                              key={member.id}
                              onClick={() => handleMemberSelect(member)}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            >
                              <div className="font-medium">{member.name}</div>
                              <div className="text-sm text-gray-500">{member.family}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {errors.donorId && <p className="text-red-500 text-sm mt-1">{errors.donorId}</p>}
                </div>
              )}

              {/* Guest Information */}
              {formData.donorType === 'guest' && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Guest Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="guestName"
                      value={formData.guestName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4667CF] focus:border-transparent ${
                        errors.guestName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter guest name"
                    />
                    {errors.guestName && <p className="text-red-500 text-sm mt-1">{errors.guestName}</p>}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Number (Optional)
                    </label>
                    <input
                      type="text"
                      name="guestContact"
                      value={formData.guestContact}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4667CF] focus:border-transparent"
                      placeholder="Enter contact number"
                    />
                  </div>
                </>
              )}
            </>
          )}

          {/* Category - Only show for Donation */}
          {formData.paymentType === 'donation' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleCategoryChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4667CF] focus:border-transparent ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a category</option>
                {currentCategories.map(cat => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
            </div>
          )}

          {/* Amount */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (₱) <span className="text-red-500">*</span>
              {formData.paymentType === 'eventfee' && suggestedAmount > 0 && (
                <span className="text-sm text-gray-500 ml-2">
                  (Suggested: ₱{suggestedAmount.toLocaleString()})
                </span>
              )}
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4667CF] focus:border-transparent ${
                errors.amount ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter amount"
              min="0"
              step="0.01"
            />
            {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
          </div>

          {/* Payment Method */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <input
              type="text"
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              readOnly
            />
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4667CF] focus:border-transparent"
              placeholder="Add any additional notes"
            />
          </div>

          {/* Attachments */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attachments (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                onChange={handleFileUpload}
                multiple
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="flex items-center justify-center gap-2 cursor-pointer text-gray-600 hover:text-gray-900"
              >
                <Upload size={20} />
                <span>Click to upload files</span>
              </label>
              {formData.attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {formData.attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <Printer size={18} />
              Print Receipt
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#4667CF] text-white rounded-lg hover:bg-[#3551B5] flex items-center gap-2"
            >
              <Save size={18} />
              {formData.paymentType === 'eventfee' && (foundEvent || location.state?.appointment) 
                ? 'Confirm Payment & Mark as Paid' 
                : 'Save Payment'}
            </button>
          </div>
        </form>
      </div>

      {/* Receipt Modal */}
      {showReceiptModal && lastPayment && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center no-print" style={{ zIndex: 9999 }}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Receipt Preview</h3>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Thermal Receipt Preview */}
            <div id="receipt-print" className="thermal-receipt bg-white border border-gray-300 p-4 mb-4">
              {/* Church Header */}
              <div className="text-center border-b border-dashed border-gray-400 pb-2 mb-2">
                <div className="font-bold text-base">OLPGVMA CHURCH</div>
                <div className="text-xs leading-tight">
                  123 Church Street<br />
                  Manila, Philippines<br />
                  Tel: +63 2 1234 5678
                </div>
              </div>

              {/* Receipt Title */}
              <div className="text-center mb-2">
                <div className="font-bold text-sm uppercase">Official Receipt</div>
                <div className="text-xs font-mono mt-1">{lastPayment.receiptNumber}</div>
              </div>

              <div className="border-b border-dashed border-gray-400 mb-2"></div>

              {/* Receipt Details */}
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span className="font-semibold">{lastPayment.date}</span>
                </div>
                <div className="flex justify-between">
                  <span>Time:</span>
                  <span className="font-semibold">{new Date(lastPayment.recordedAt).toLocaleTimeString()}</span>
                </div>
              </div>

              <div className="border-b border-dashed border-gray-400 my-2"></div>

              {/* Donor Information */}
              <div className="text-xs mb-2">
                <div className="font-semibold mb-1">RECEIVED FROM:</div>
                <div className="font-bold text-sm">
                  {lastPayment.isAnonymous 
                    ? 'Anonymous' 
                    : lastPayment.donorType === 'member' 
                      ? lastPayment.donorName 
                      : lastPayment.guestName}
                </div>
                <div className="text-gray-600">
                  ({lastPayment.isAnonymous ? 'Anonymous' : lastPayment.donorType === 'member' ? 'Member' : 'Guest'})
                </div>
              </div>

              {/* Payment Details */}
              <div className="text-xs space-y-1 mb-2">
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="font-semibold">{lastPayment.paymentType === 'donation' ? 'Donation' : 'Event Fee'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Category:</span>
                  <span className="font-semibold">{lastPayment.category}</span>
                </div>
                <div className="flex justify-between">
                  <span>Method:</span>
                  <span className="font-semibold">{lastPayment.paymentMethod}</span>
                </div>
              </div>

              <div className="border-b border-dashed border-gray-400 my-2"></div>

              {/* Amount */}
              <div className="text-center py-2 bg-gray-100 mb-2">
                <div className="text-xs text-gray-600 mb-1">AMOUNT</div>
                <div className="text-2xl font-bold">₱{parseFloat(lastPayment.amount).toLocaleString()}</div>
                <div className="text-xs italic mt-1 px-2">
                  {convertAmountToWords(parseFloat(lastPayment.amount))}
                </div>
              </div>

              {/* Notes */}
              {lastPayment.notes && (
                <>
                  <div className="border-b border-dashed border-gray-400 my-2"></div>
                  <div className="text-xs mb-2">
                    <div className="font-semibold mb-1">Notes:</div>
                    <div>{lastPayment.notes}</div>
                  </div>
                </>
              )}

              <div className="border-b border-dashed border-gray-400 my-2"></div>

              {/* Collector Info */}
              <div className="text-xs mb-2">
                <div>Collected by: <span className="font-semibold">{lastPayment.recordedBy}</span></div>
                <div className="text-gray-600">Accountant</div>
              </div>

              {/* Footer */}
              <div className="border-t border-dashed border-gray-400 pt-2 mt-2">
                <div className="text-center text-xs leading-tight text-gray-600">
                  This is an official receipt.<br />
                  Please keep for your records.<br />
                  Thank you for your support!
                </div>
              </div>

              {/* Barcode */}
              <div className="text-center mt-2 pt-2 border-t border-dashed border-gray-400">
                <div className="text-xs font-mono">*{lastPayment.receiptNumber}*</div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowReceiptModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={handlePrintReceipt}
                className="flex-1 px-4 py-2 bg-[#4667CF] text-white rounded-lg hover:bg-[#3551B5] flex items-center justify-center gap-2"
              >
                <Printer size={18} />
                Print
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <style>{`
        .thermal-receipt {
          width: 58mm;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.4;
          color: #000;
        }

        @media print {
          @page {
            size: 58mm auto;
            margin: 0;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body {
            margin: 0 !important;
            padding: 0 !important;
          }

          .no-print {
            display: none !important;
          }

          #receipt-print {
            width: 58mm;
            padding: 3mm;
            margin: 0;
            border: none !important;
            font-size: 10px;
            line-height: 1.3;
          }
        }
      `}</style>
    </div>
  );
};

export default RecordPayment;
