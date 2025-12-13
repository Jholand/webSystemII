import { useState, useEffect } from 'react';
import { DollarSign, Calendar, Filter, FileText, Tag, Award } from 'lucide-react';
import Card from '../../components/ui/Card';
import Pagination from '../../components/Pagination';
import { donationAPI, paymentRecordAPI, donationCategoryAPI, certificateRequestAPI } from '../../services/dataSync';
import { formatDate, formatDateTimeShort } from '../../utils/dateFormatter';

const UserPayments = () => {
  const [filter, setFilter] = useState('all'); // 'all', 'donations', 'eventfees', 'certificates'
  const [period, setPeriod] = useState('all'); // 'all', 'thisYear', 'lastYear'
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      const userName = localStorage.getItem('userName') || 'User';

      // Fetch categories for mapping
      const categoriesResponse = await donationCategoryAPI.getAll();
      const categoriesData = Array.isArray(categoriesResponse) ? categoriesResponse : (categoriesResponse?.data || []);
      setCategories(categoriesData);

      // Fetch donations
      const donationsResponse = await donationAPI.getAll();
      const donationsData = Array.isArray(donationsResponse) ? donationsResponse : (donationsResponse?.data || []);
      const userDonations = donationsData.filter(d => 
        d.donor_name?.toLowerCase() === userName.toLowerCase()
      ).map(d => ({
        id: `D-${d.id}`,
        date: d.donation_date,
        type: 'donation',
        category: d.category_name || 'General',
        amount: parseFloat(d.amount),
        receiptNumber: d.receipt_number || 'N/A',
        paymentMethod: d.payment_method || 'Walk-in',
      }));

      // Fetch payment records
      const paymentsResponse = await paymentRecordAPI.getAll();
      const paymentsData = Array.isArray(paymentsResponse) ? paymentsResponse : (paymentsResponse?.data || []);
      const userPayments = paymentsData.filter(p => 
        p.payer_name?.toLowerCase() === userName.toLowerCase()
      ).map(p => ({
        id: `P-${p.id}`,
        date: p.payment_date,
        type: 'eventfee',
        category: p.category || 'Event Fee',
        amount: parseFloat(p.amount),
        receiptNumber: p.receipt_number || 'N/A',
        paymentMethod: p.payment_method || 'Walk-in',
      }));

      // Fetch certificate requests with paid status
      const certificatesResponse = await certificateRequestAPI.getUserRequests(userId);
      const certificatesData = Array.isArray(certificatesResponse) ? certificatesResponse : (certificatesResponse?.data || []);
      const userCertificates = certificatesData.filter(c => 
        c.payment_status === 'paid'
      ).map(c => ({
        id: `C-${c.id}`,
        date: c.paid_at || c.created_at,
        type: 'certificate',
        category: `${c.certificate_type.charAt(0).toUpperCase() + c.certificate_type.slice(1)} Certificate`,
        amount: parseFloat(c.certificate_fee || 0),
        receiptNumber: c.payment_record_id ? `CERT-${c.payment_record_id}` : 'N/A',
        paymentMethod: 'Walk-in',
      }));

      // Combine and sort by date
      const allPayments = [...userDonations, ...userPayments, ...userCertificates].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      setPayments(allPayments);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter payments
  const filteredPayments = payments.filter(payment => {
    if (filter !== 'all' && payment.type !== filter) return false;
    
    if (period !== 'all') {
      const paymentDate = new Date(payment.date);
      const currentYear = new Date().getFullYear();
      
      if (period === 'thisYear' && paymentDate.getFullYear() !== currentYear) return false;
      if (period === 'lastYear' && paymentDate.getFullYear() !== currentYear - 1) return false;
    }
    
    return true;
  });

  // Pagination logic
  const indexOfLastPayment = currentPage * itemsPerPage;
  const indexOfFirstPayment = indexOfLastPayment - itemsPerPage;
  const currentPayments = filteredPayments.slice(indexOfFirstPayment, indexOfLastPayment);

  // Calculate totals
  const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  const donationsTotal = filteredPayments
    .filter(p => p.type === 'donation')
    .reduce((sum, p) => sum + p.amount, 0);
  const eventFeesTotal = filteredPayments
    .filter(p => p.type === 'eventfee')
    .reduce((sum, p) => sum + p.amount, 0);
  const certificatesTotal = filteredPayments
    .filter(p => p.type === 'certificate')
    .reduce((sum, p) => sum + p.amount, 0);

  const stats = [
    {
      label: 'Total Payments',
      value: `₱${totalAmount.toLocaleString()}`,
      subtext: `${filteredPayments.length} transactions`,
      icon: DollarSign,
      color: 'from-green-600 to-green-700',
    },
    {
      label: 'Donations',
      value: `₱${donationsTotal.toLocaleString()}`,
      subtext: `${filteredPayments.filter(p => p.type === 'donation').length} donations`,
      icon: Tag,
      color: 'from-blue-600 to-blue-700',
    },
    {
      label: 'Other Payments',
      value: `₱${(eventFeesTotal + certificatesTotal).toLocaleString()}`,
      subtext: 'Events & Certificates',
      icon: FileText,
      color: 'from-purple-600 to-purple-700',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#4158D0' }}>My Payments</h1>
              <p className="text-gray-600 text-sm mt-1">View your donation, event fee, and certificate payment history</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 mb-5">
          <div className="flex flex-col md:flex-row gap-5">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                <Filter className="inline-block mr-1" size={14} />
                Payment Type
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    filter === 'all'
                      ? 'shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={filter === 'all' ? { 
                    background: 'rgba(65, 88, 208, 0.1)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    color: '#4158D0',
                    boxShadow: '0 4px 12px rgba(65, 88, 208, 0.15)',
                    border: '1px solid rgba(65, 88, 208, 0.2)'
                  } : {}}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('donation')}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    filter === 'donation'
                      ? 'shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={filter === 'donation' ? { 
                    background: 'rgba(65, 88, 208, 0.1)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    color: '#4158D0',
                    boxShadow: '0 4px 12px rgba(65, 88, 208, 0.15)',
                    border: '1px solid rgba(65, 88, 208, 0.2)'
                  } : {}}
                >
                  Donations
                </button>
                <button
                  onClick={() => setFilter('eventfee')}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    filter === 'eventfee'
                      ? 'shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={filter === 'eventfee' ? { 
                    background: 'rgba(65, 88, 208, 0.1)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    color: '#4158D0',
                    boxShadow: '0 4px 12px rgba(65, 88, 208, 0.15)',
                    border: '1px solid rgba(65, 88, 208, 0.2)'
                  } : {}}
                >
                  Event Fees
                </button>
                <button
                  onClick={() => setFilter('certificate')}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    filter === 'certificate'
                      ? 'shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={filter === 'certificate' ? { 
                    background: 'rgba(65, 88, 208, 0.1)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    color: '#4158D0',
                    boxShadow: '0 4px 12px rgba(65, 88, 208, 0.15)',
                    border: '1px solid rgba(65, 88, 208, 0.2)'
                  } : {}}
                >
                  Certificates
                </button>
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                <Calendar className="inline-block mr-1" size={14} />
                Period
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setPeriod('all')}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    period === 'all'
                      ? 'shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={period === 'all' ? { 
                    background: 'rgba(65, 88, 208, 0.1)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    color: '#4158D0',
                    boxShadow: '0 4px 12px rgba(65, 88, 208, 0.15)',
                    border: '1px solid rgba(65, 88, 208, 0.2)'
                  } : {}}
                >
                  All Time
                </button>
                <button
                  onClick={() => setPeriod('thisYear')}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    period === 'thisYear'
                      ? 'shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={period === 'thisYear' ? { 
                    background: 'rgba(65, 88, 208, 0.1)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    color: '#4158D0',
                    boxShadow: '0 4px 12px rgba(65, 88, 208, 0.15)',
                    border: '1px solid rgba(65, 88, 208, 0.2)'
                  } : {}}
                >
                  This Year
                </button>
                <button
                  onClick={() => setPeriod('lastYear')}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    period === 'lastYear'
                      ? 'shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={period === 'lastYear' ? { 
                    background: 'rgba(65, 88, 208, 0.1)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    color: '#4158D0',
                    boxShadow: '0 4px 12px rgba(65, 88, 208, 0.15)',
                    border: '1px solid rgba(65, 88, 208, 0.2)'
                  } : {}}
                >
                  Last Year
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const gradients = [
              'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
              'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
            ];
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-2xl transition-all border border-gray-200 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-transparent rounded-full transform translate-x-12 -translate-y-12 opacity-50"></div>
                <div className="relative flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl shadow-lg transform group-hover:scale-110 transition-transform" style={{ 
                    background: gradients[index % gradients.length],
                    boxShadow: '0 4px 12px rgba(65, 88, 208, 0.3)'
                  }}>
                    <Icon className="text-white" size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{stat.label}</p>
                  </div>
                </div>
                <div className="relative">
                  <h3 className="text-2xl font-bold mb-1" style={{ color: '#4158D0' }}>{stat.value}</h3>
                  <p className="text-xs text-gray-500">{stat.subtext}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Payment History Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-5 border-b border-gray-200">
            <h2 className="text-lg font-semibold" style={{ color: '#4158D0' }}>Payment History</h2>
            <p className="text-xs text-gray-500 mt-1">Detailed record of all your transactions</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Receipt No.
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Method
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      Loading payments...
                    </td>
                  </tr>
                ) : filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No payments found for the selected filters
                    </td>
                  </tr>
                ) : (
                  currentPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {formatDate(payment.date)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-lg ${
                            payment.type === 'donation'
                              ? 'bg-blue-100 text-blue-800'
                              : payment.type === 'eventfee'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-cyan-100 text-cyan-800'
                          }`}
                        >
                          {payment.type === 'donation' ? 'Donation' : payment.type === 'eventfee' ? 'Event Fee' : 'Certificate'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{payment.category}</td>
                      <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                        ₱{payment.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {payment.receiptNumber}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {payment.paymentMethod}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {filteredPayments.length > 0 && (
            <div className="border-t border-gray-200">
              <Pagination
                currentPage={currentPage}
                totalItems={filteredPayments.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPayments;
