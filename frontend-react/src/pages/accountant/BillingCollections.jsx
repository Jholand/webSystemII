import { useState } from 'react';
import { Plus, Search, Filter, Eye, Edit, Trash2, CheckCircle, Clock, Printer, Download, CreditCard, DollarSign, Receipt } from 'lucide-react';
import ModalOverlay from '../../components/ModalOverlay';

const BillingCollections = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const [formData, setFormData] = useState({
    invoiceNumber: '',
    client: '',
    service: '',
    amount: '',
    date: '',
    dueDate: '',
    paymentMethod: '',
    notes: ''
  });

  const [invoices, setInvoices] = useState([
    { id: 1, invoiceNumber: 'INV-2025-001', client: 'John Doe', service: 'Wedding Ceremony', amount: 15000, date: '2025-11-20', dueDate: '2025-11-25', status: 'paid', paymentMethod: 'Cash', paidDate: '2025-11-22', notes: 'Full payment received' },
    { id: 2, invoiceNumber: 'INV-2025-002', client: 'Maria Santos', service: 'Baptism', amount: 5000, date: '2025-11-21', dueDate: '2025-11-26', status: 'paid', paymentMethod: 'Bank Transfer', paidDate: '2025-11-23', notes: 'Certificate issued' },
    { id: 3, invoiceNumber: 'INV-2025-003', client: 'Jose Garcia', service: 'Funeral Mass', amount: 8000, date: '2025-11-22', dueDate: '2025-11-27', status: 'unpaid', paymentMethod: '', paidDate: null, notes: 'Pending payment' },
    { id: 4, invoiceNumber: 'INV-2025-004', client: 'Anna Cruz', service: 'House Blessing', amount: 3000, date: '2025-11-22', dueDate: '2025-11-28', status: 'unpaid', paymentMethod: '', paidDate: null, notes: 'Follow up needed' },
    { id: 5, invoiceNumber: 'INV-2025-005', client: 'Pedro Lopez', service: 'Wedding Pledge', amount: 12000, date: '2025-11-23', dueDate: '2025-12-01', status: 'unpaid', paymentMethod: '', paidDate: null, notes: 'Event scheduled for December' },
  ]);

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.service.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleOpenModal = (mode, invoice = null) => {
    setModalMode(mode);
    if (invoice) {
      setSelectedInvoice(invoice);
      setFormData({
        invoiceNumber: invoice.invoiceNumber,
        client: invoice.client,
        service: invoice.service,
        amount: invoice.amount,
        date: invoice.date,
        dueDate: invoice.dueDate,
        paymentMethod: invoice.paymentMethod || '',
        notes: invoice.notes
      });
    } else {
      setFormData({
        invoiceNumber: `INV-2025-${String(invoices.length + 1).padStart(3, '0')}`,
        client: '',
        service: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        dueDate: '',
        paymentMethod: '',
        notes: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedInvoice(null);
    setFormData({
      invoiceNumber: '',
      client: '',
      service: '',
      amount: '',
      date: '',
      dueDate: '',
      paymentMethod: '',
      notes: ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modalMode === 'add') {
      const newInvoice = {
        id: invoices.length + 1,
        ...formData,
        amount: parseFloat(formData.amount),
        status: 'unpaid',
        paidDate: null
      };
      setInvoices([...invoices, newInvoice]);
    } else if (modalMode === 'edit') {
      setInvoices(invoices.map(inv => 
        inv.id === selectedInvoice.id 
          ? { ...inv, ...formData, amount: parseFloat(formData.amount) }
          : inv
      ));
    }
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      setInvoices(invoices.filter(inv => inv.id !== id));
    }
  };

  const handleTogglePayment = (invoice) => {
    const updatedStatus = invoice.status === 'paid' ? 'unpaid' : 'paid';
    const paidDate = updatedStatus === 'paid' ? new Date().toISOString().split('T')[0] : null;
    
    setInvoices(invoices.map(inv =>
      inv.id === invoice.id
        ? { ...inv, status: updatedStatus, paidDate: paidDate }
        : inv
    ));
  };

  const handleRecordPayment = (invoice) => {
    const paymentMethod = window.prompt('Enter payment method (Cash/Bank Transfer/Check/Online):', 'Cash');
    if (paymentMethod) {
      setInvoices(invoices.map(inv =>
        inv.id === invoice.id
          ? { ...inv, status: 'paid', paymentMethod: paymentMethod, paidDate: new Date().toISOString().split('T')[0] }
          : inv
      ));
    }
  };

  const handlePrintReceipt = (invoice) => {
    alert(`Printing receipt for ${invoice.invoiceNumber}...`);
  };

  const getTotalAmount = () => invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const getPaidAmount = () => invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
  const getUnpaidAmount = () => invoices.filter(inv => inv.status === 'unpaid').reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              Billing & Collections
            </h1>
            <p className="text-blue-900">Manage invoices, payments, and outstanding balances</p>
          </div>
          <button
            onClick={() => handleOpenModal('add')}
            className="px-5 py-2.5 bg-gradient-to-r from-black via-[#0A1628] to-[#1E3A8A] text-white rounded-lg hover:from-[#1E3A8A] hover:to-blue-700 transition-all shadow-md hover:shadow-lg font-semibold flex items-center gap-2"
          >
            <Plus size={18} />
            Create Invoice
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all border border-blue-200/50 hover:border-blue-600/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-900 mb-1.5 font-medium">Total Invoiced</p>
                <p className="text-2xl font-bold text-gray-900">₱{getTotalAmount().toLocaleString()}</p>
              </div>
              <div className="p-2.5 bg-gradient-to-br from-black via-[#0A1628] to-[#1E3A8A] rounded-lg shadow-md">
                <CreditCard className="text-white" size={22} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all border border-blue-200/50 hover:border-blue-600/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-900 mb-1.5 font-medium">Paid</p>
                <p className="text-2xl font-bold text-emerald-600">₱{getPaidAmount().toLocaleString()}</p>
              </div>
              <div className="p-2.5 bg-emerald-50 rounded-lg">
                <CheckCircle className="text-emerald-600" size={22} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all border border-blue-200/50 hover:border-blue-600/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-900 mb-1.5 font-medium">Outstanding</p>
                <p className="text-2xl font-bold text-amber-600">₱{getUnpaidAmount().toLocaleString()}</p>
              </div>
              <div className="p-2.5 bg-amber-50 rounded-lg">
                <Clock className="text-amber-600" size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-5 border border-slate-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by invoice, client, or service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400 text-sm"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 bg-white text-sm font-medium"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Invoice #</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Service</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-slate-900">{invoice.invoiceNumber}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{invoice.client}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{invoice.service}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900">₱{invoice.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{invoice.date}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{invoice.dueDate}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {invoice.status === 'paid' ? (
                        <span className="px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700 border border-green-200">
                          Paid
                        </span>
                      ) : (
                        <span className="px-3 py-1 text-xs font-bold rounded-full bg-orange-100 text-orange-700 border border-orange-200">
                          Unpaid
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {invoice.status === 'unpaid' && (
                          <button
                            onClick={() => handleRecordPayment(invoice)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Record Payment"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
                        {invoice.status === 'paid' && (
                          <button
                            onClick={() => handlePrintReceipt(invoice)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Print Receipt"
                          >
                            <Printer size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenModal('edit', invoice)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(invoice.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredInvoices.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <CreditCard size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No invoices found</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <ModalOverlay isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {modalMode === 'add' ? 'Create New Invoice' : 'Edit Invoice'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Invoice Number</label>
                  <input
                    type="text"
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData({...formData, invoiceNumber: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Client Name</label>
                  <input
                    type="text"
                    value={formData.client}
                    onChange={(e) => setFormData({...formData, client: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Service/Event</label>
                  <select
                    value={formData.service}
                    onChange={(e) => setFormData({...formData, service: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Service</option>
                    <option value="Wedding Ceremony">Wedding Ceremony</option>
                    <option value="Wedding Pledge">Wedding Pledge</option>
                    <option value="Baptism">Baptism</option>
                    <option value="Funeral Mass">Funeral Mass</option>
                    <option value="House Blessing">House Blessing</option>
                    <option value="Mass Intention">Mass Intention</option>
                    <option value="Certificate Fee">Certificate Fee</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (₱)</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Issue Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-black via-[#0A1628] to-[#1E3A8A] text-white rounded-lg hover:shadow-xl transition-all font-semibold"
                >
                  {modalMode === 'add' ? 'Create Invoice' : 'Update Invoice'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
      </ModalOverlay>
    </div>
  );
};

export default BillingCollections;
