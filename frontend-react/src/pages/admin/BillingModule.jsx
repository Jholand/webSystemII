import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Download, DollarSign, FileText, CreditCard, Calendar, Filter, Printer, CheckCircle, XCircle, Clock } from 'lucide-react';
import ModalOverlay from '../../components/ModalOverlay';

const BillingModule = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const [invoices, setInvoices] = useState([
    {
      id: 1,
      invoiceNumber: 'INV-2025-001',
      client: 'John Doe Family',
      service: 'Wedding Ceremony',
      amount: 5000,
      date: '2025-11-15',
      dueDate: '2025-11-30',
      status: 'Paid',
      paymentMethod: 'Cash',
      paidDate: '2025-11-16',
    },
    {
      id: 2,
      invoiceNumber: 'INV-2025-002',
      client: 'Emily Brown',
      service: 'Baptism Certificate',
      amount: 500,
      date: '2025-11-18',
      dueDate: '2025-12-05',
      status: 'Pending',
      paymentMethod: '-',
      paidDate: '-',
    },
    {
      id: 3,
      invoiceNumber: 'INV-2025-003',
      client: 'Robert Wilson',
      service: 'Mass Intentions',
      amount: 1000,
      date: '2025-11-20',
      dueDate: '2025-11-25',
      status: 'Overdue',
      paymentMethod: '-',
      paidDate: '-',
    },
    {
      id: 4,
      invoiceNumber: 'INV-2025-004',
      client: 'Maria Garcia',
      service: 'Marriage License',
      amount: 1500,
      date: '2025-11-21',
      dueDate: '2025-12-10',
      status: 'Paid',
      paymentMethod: 'Bank Transfer',
      paidDate: '2025-11-22',
    },
  ]);

  const [formData, setFormData] = useState({
    client: '',
    service: '',
    amount: '',
    date: '',
    dueDate: '',
    notes: '',
  });

  const stats = [
    { label: 'Total Revenue', value: '₱8,000', icon: DollarSign, color: 'from-green-600 to-green-700' },
    { label: 'Pending Payments', value: '₱1,500', icon: FileText, color: 'from-yellow-600 to-yellow-700' },
    { label: 'Overdue', value: '₱1,000', icon: CreditCard, color: 'from-red-600 to-red-700' },
    { label: 'This Month', value: '₱8,000', icon: Calendar, color: 'from-blue-600 to-blue-700' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddInvoice = () => {
    setModalMode('add');
    setFormData({
      client: '',
      service: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      dueDate: '',
      notes: '',
    });
    setShowModal(true);
  };

  const handleEditInvoice = (invoice) => {
    setModalMode('edit');
    setSelectedInvoice(invoice);
    setFormData({
      client: invoice.client,
      service: invoice.service,
      amount: invoice.amount,
      date: invoice.date,
      dueDate: invoice.dueDate,
      notes: '',
    });
    setShowModal(true);
  };

  const handleViewInvoice = (invoice) => {
    setModalMode('view');
    setSelectedInvoice(invoice);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const result = await showDeleteConfirm('Delete Invoice?', 'This action cannot be undone!');
    if (result.isConfirmed) {
      setInvoices(invoices.filter(inv => inv.id !== id));
      showSuccessToast('Deleted!', 'Invoice has been deleted successfully');
    }
  };

  const handleTogglePaymentStatus = (id, currentStatus) => {
    const newStatus = currentStatus === 'Paid' ? 'Unpaid' : 'Paid';
    setInvoices(invoices.map(inv => 
      inv.id === id 
        ? { 
            ...inv, 
            status: newStatus,
            paidDate: newStatus === 'Paid' ? new Date().toISOString().split('T')[0] : '-',
            paymentMethod: newStatus === 'Paid' ? 'Cash' : '-'
          }
        : inv
    ));
  };

  const handlePrintReceipt = (invoice) => {
    showInfoToast('Printing', `Generating receipt for ${invoice.invoiceNumber}`);
    // Add actual print logic here
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modalMode === 'add') {
      const newInvoice = {
        id: invoices.length + 1,
        invoiceNumber: `INV-2025-${String(invoices.length + 1).padStart(3, '0')}`,
        client: formData.client,
        service: formData.service,
        amount: parseFloat(formData.amount),
        date: formData.date,
        dueDate: formData.dueDate,
        status: 'Pending',
        paymentMethod: '-',
        paidDate: '-',
      };
      setInvoices([...invoices, newInvoice]);
    } else if (modalMode === 'edit') {
      setInvoices(invoices.map(inv => 
        inv.id === selectedInvoice.id 
          ? { ...inv, ...formData, amount: parseFloat(formData.amount) }
          : inv
      ));
    }
    setShowModal(false);
    setShowInvoiceModal(false);
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.service.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || invoice.status.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50 dark:from-gray-900 dark:via-blue-950 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 animate-fade-in-down">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Billing Module</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Manage invoices and payments</p>
          </div>
          <button
            onClick={handleAddInvoice}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-lg hover:shadow-blue-500/50"
          >
            <Plus size={20} />
            Create Invoice
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-600 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100">
                  <stat.icon className="text-blue-600" size={24} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-5">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by invoice number, client, or service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-600" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Invoice #</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Service</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Due Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100">{invoice.invoiceNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{invoice.client}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{invoice.service}</td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-gray-100">₱{invoice.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{invoice.date}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{invoice.dueDate}</td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleTogglePaymentStatus(invoice.id, invoice.status)}
                          className={`p-2 rounded-lg transition-all ${
                            invoice.status === 'Paid' 
                              ? 'bg-green-50 hover:bg-green-100 text-green-600' 
                              : 'bg-yellow-50 hover:bg-yellow-100 text-yellow-600'
                          }`}
                          title={invoice.status === 'Paid' ? 'Mark as Unpaid' : 'Mark as Paid'}
                        >
                          {invoice.status === 'Paid' ? <CheckCircle size={16} /> : <Clock size={16} />}
                        </button>
                        <button
                          onClick={() => handlePrintReceipt(invoice)}
                          className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-all"
                          title="Print Receipt"
                        >
                          <Printer size={16} />
                        </button>
                        <button
                          onClick={() => handleViewInvoice(invoice)}
                          className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg transition-all"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEditInvoice(invoice)}
                          className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteInvoice(invoice.id)}
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredInvoices.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No invoices found matching your criteria
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <ModalOverlay isOpen={showModal} onClose={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border-2 border-blue-500 ring-4 ring-blue-500/30 shadow-blue-500/50">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900">
                {modalMode === 'add' ? 'New Invoice' : modalMode === 'edit' ? 'Edit Invoice' : 'Invoice Details'}
              </h2>
            </div>
            
            {modalMode === 'view' ? (
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Invoice Number</p>
                    <p className="font-semibold text-slate-900">{selectedInvoice?.invoiceNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Status</p>
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedInvoice?.status)}`}>
                      {selectedInvoice?.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Client</p>
                    <p className="font-semibold text-slate-900">{selectedInvoice?.client}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Service</p>
                    <p className="font-semibold text-slate-900">{selectedInvoice?.service}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Amount</p>
                    <p className="font-semibold text-slate-900">₱{selectedInvoice?.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Payment Method</p>
                    <p className="font-semibold text-slate-900">{selectedInvoice?.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Date</p>
                    <p className="font-semibold text-slate-900">{selectedInvoice?.date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Due Date</p>
                    <p className="font-semibold text-slate-900">{selectedInvoice?.dueDate}</p>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Client Name</label>
                    <input
                      type="text"
                      name="client"
                      value={formData.client}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Service</label>
                    <input
                      type="text"
                      name="service"
                      value={formData.service}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₱)</label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      required
                      step="0.01"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                    <input
                      type="date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-blue-500/50"
                  >
                    {modalMode === 'add' ? 'Create Invoice' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </ModalOverlay>
      )}
    </div>
  );
};

export default BillingModule;
