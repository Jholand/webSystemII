import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Printer, X, Upload, Search } from 'lucide-react';
import { showSuccessToast, showInfoToast, showErrorToast } from '../../utils/sweetAlertHelper';
import { useAuth } from '../../contexts/AuthContext';

const RecordDonation = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
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
    attachments: []
  });

  const [errors, setErrors] = useState({});
  const [showMemberSearch, setShowMemberSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Sample members for search
  const members = [
    { id: 1, name: 'John Doe', family: 'Doe Family' },
    { id: 2, name: 'Maria Santos', family: 'Santos Family' },
    { id: 3, name: 'Robert Johnson', family: 'Johnson Family' },
    { id: 4, name: 'Anna Rodriguez', family: 'Rodriguez Family' },
  ];

  const categories = [
    'Tithes',
    'Offerings',
    'Building Fund',
    'Mass Intentions',
    'Special Collection',
    'Candles',
    'Other'
  ];

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.family.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
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

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (formData.donorType === 'member' && !formData.donorId) {
      newErrors.donor = 'Please select a member';
    }

    if (formData.donorType === 'guest' && !formData.guestName) {
      newErrors.guestName = 'Guest name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      showSuccessToast('Success!', 'Donation record saved successfully');
      navigate('/accountant/donations');
    }
  };

  const handleSaveAndPrint = () => {
    if (validate()) {
      showSuccessToast('Success!', 'Donation saved');
      showInfoToast('Printing', 'Opening print view');
      // In real app, would navigate to receipt print page
      navigate('/accountant/receipts/new');
    }
  };

  const handleCancel = () => {
    navigate('/accountant/dashboard');
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Record Walk-In Donation</h1>
          <p className="text-gray-600 text-sm mt-1">Create new donation entry and generate receipt</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="space-y-6">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Donor Type */}
            <div>
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
                  <span className="text-sm text-gray-700">Church Member</span>
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
                  <span className="text-sm text-gray-700">Guest</span>
                </label>
              </div>
            </div>

            {/* Member Search */}
            {formData.donorType === 'member' && (
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Member <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.donorName || searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowMemberSearch(true);
                    }}
                    onFocus={() => setShowMemberSearch(true)}
                    placeholder="Search member by name..."
                    className={`w-full px-4 py-2.5 border ${errors.donor ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  />
                  <Search className="absolute right-3 top-3 text-gray-400" size={20} />
                </div>
                {errors.donor && <p className="text-red-500 text-xs mt-1">{errors.donor}</p>}

                {/* Search Results Dropdown */}
                {showMemberSearch && searchTerm && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredMembers.length > 0 ? (
                      filteredMembers.map(member => (
                        <button
                          key={member.id}
                          onClick={() => handleMemberSelect(member)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                        >
                          <p className="font-medium text-gray-900">{member.name}</p>
                          <p className="text-xs text-gray-500">{member.family}</p>
                        </button>
                      ))
                    ) : (
                      <p className="px-4 py-2 text-sm text-gray-500">No members found</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Guest Entry */}
            {formData.donorType === 'guest' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Guest Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="guestName"
                    value={formData.guestName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 border ${errors.guestName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="Enter guest name"
                  />
                  {errors.guestName && <p className="text-red-500 text-xs mt-1">{errors.guestName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact (Optional)
                  </label>
                  <input
                    type="text"
                    name="guestContact"
                    value={formData.guestContact}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Phone or email"
                  />
                </div>
              </div>
            )}

            {/* Category and Amount */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 border ${errors.category ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                >
                  <option value="">Select category...</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (₱) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className={`w-full px-4 py-2.5 border ${errors.amount ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="0.00"
                />
                {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
              </div>
            </div>

            {/* Payment Method (Fixed) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <input
                type="text"
                value={formData.paymentMethod}
                disabled
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
              />
            </div>

            {/* Collector (Auto) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Collector
              </label>
              <input
                type="text"
                value={formData.collector}
                disabled
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Additional notes..."
              />
            </div>

            {/* Attachments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attachments (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <label className="cursor-pointer">
                  <div className="flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900">
                    <Upload size={20} />
                    <span className="text-sm">Click to upload files</span>
                  </div>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*,.pdf"
                  />
                </label>

                {formData.attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {formData.attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <button
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
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700 transition-all flex items-center gap-2"
          >
            <Save size={18} />
            Save
          </button>
          <button
            onClick={handleSaveAndPrint}
            className="px-6 py-2.5 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-all flex items-center gap-2"
            style={{ backgroundColor: '#4667CF' }}
          >
            <Printer size={18} />
            Save & Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecordDonation;
