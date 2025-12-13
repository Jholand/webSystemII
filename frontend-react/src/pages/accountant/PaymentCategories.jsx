import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Tag, DollarSign, Calendar } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { showDeleteConfirm, showSuccessToast, showErrorToast } from '../../utils/sweetAlertHelper';
import { donationCategoryAPI, eventFeeCategoryAPI } from '../../services/dataSync';
import Pagination from '../../components/Pagination';

const PaymentCategories = () => {
  const [activeTab, setActiveTab] = useState('donations');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Pagination states
  const [currentPageDonations, setCurrentPageDonations] = useState(1);
  const [itemsPerPageDonations, setItemsPerPageDonations] = useState(10);
  const [currentPageEventFees, setCurrentPageEventFees] = useState(1);
  const [itemsPerPageEventFees, setItemsPerPageEventFees] = useState(10);

  // Donation Categories State
  const [donationCategories, setDonationCategories] = useState([]);

  const [donationForm, setDonationForm] = useState({
    name: '',
    description: ''
  });

  // Event Fee Categories State
  const [eventFeeCategories, setEventFeeCategories] = useState([]);

  const [eventFeeForm, setEventFeeForm] = useState({
    name: '',
    suggested_amount: 0,
    description: ''
  });

  // Load categories from database on mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Hide sidebar and header when modal is open
  useEffect(() => {
    if (showModal) {
      const header = document.querySelector('header');
      const sidebar = document.querySelector('aside');
      if (header) header.style.display = 'none';
      if (sidebar) sidebar.style.display = 'none';
    } else {
      const header = document.querySelector('header');
      const sidebar = document.querySelector('aside');
      if (header) header.style.display = '';
      if (sidebar) sidebar.style.display = '';
    }
  }, [showModal]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const donations = await donationCategoryAPI.getAll();
      const eventFees = await eventFeeCategoryAPI.getAll();
      setDonationCategories(donations);
      setEventFeeCategories(eventFees);
    } catch (error) {
      console.error('Error loading categories:', error);
      showErrorToast('Error', 'Failed to load categories from database');
    } finally {
      setLoading(false);
    }
  };

  // Donation Category Handlers
  const handleCreateDonation = () => {
    setModalMode('create');
    setDonationForm({ name: '', description: '' });
    setShowModal(true);
  };

  const handleEditDonation = (category) => {
    setModalMode('edit');
    setEditingItem(category);
    setDonationForm({
      name: category.name,
      description: category.description
    });
    setShowModal(true);
  };

  const handleDeleteDonation = async (id) => {
    const result = await showDeleteConfirm('Delete Category?', 'Are you sure you want to delete this donation category?');
    if (result.isConfirmed) {
      try {
        await donationCategoryAPI.delete(id);
        setDonationCategories(prev => prev.filter(cat => cat.id !== id));
        showSuccessToast('Deleted!', 'Donation category deleted successfully');
      } catch (error) {
        console.error('Error deleting donation category:', error);
        showErrorToast('Error', 'Failed to delete category');
      }
    }
  };

  const handleSaveDonation = async () => {
    if (!donationForm.name || !donationForm.description) {
      showErrorToast('Error!', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      if (modalMode === 'create') {
        const newCategory = await donationCategoryAPI.create(donationForm);
        setDonationCategories(prev => [...prev, newCategory]);
        showSuccessToast('Success!', 'Donation category created successfully');
      } else {
        const updated = await donationCategoryAPI.update(editingItem.id, donationForm);
        setDonationCategories(prev =>
          prev.map(cat => cat.id === editingItem.id ? updated : cat)
        );
        showSuccessToast('Success!', 'Donation category updated successfully');
      }

      setShowModal(false);
      setDonationForm({ name: '', description: '' });
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving donation category:', error);
      showErrorToast('Error', 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  // Event Fee Category Handlers
  const handleCreateEventFee = () => {
    setModalMode('create');
    setEventFeeForm({ name: '', suggested_amount: 0, description: '' });
    setShowModal(true);
  };

  const handleEditEventFee = (category) => {
    setModalMode('edit');
    setEditingItem(category);
    setEventFeeForm({
      name: category.name,
      suggested_amount: category.suggested_amount,
      description: category.description
    });
    setShowModal(true);
  };

  const handleDeleteEventFee = async (id) => {
    const result = await showDeleteConfirm('Delete Category?', 'Are you sure you want to delete this event fee category?');
    if (result.isConfirmed) {
      try {
        await eventFeeCategoryAPI.delete(id);
        setEventFeeCategories(prev => prev.filter(cat => cat.id !== id));
        showSuccessToast('Deleted!', 'Event fee category deleted successfully');
      } catch (error) {
        console.error('Error deleting event fee category:', error);
        showErrorToast('Error', 'Failed to delete category');
      }
    }
  };

  const handleSaveEventFee = async () => {
    if (!eventFeeForm.name || !eventFeeForm.suggested_amount || !eventFeeForm.description) {
      showErrorToast('Error!', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      if (modalMode === 'create') {
        const newCategory = await eventFeeCategoryAPI.create(eventFeeForm);
        setEventFeeCategories(prev => [...prev, newCategory]);
        showSuccessToast('Success!', 'Event fee category created successfully');
      } else {
        const updated = await eventFeeCategoryAPI.update(editingItem.id, eventFeeForm);
        setEventFeeCategories(prev =>
          prev.map(cat => cat.id === editingItem.id ? updated : cat)
        );
        showSuccessToast('Success!', 'Event fee category updated successfully');
      }

      setShowModal(false);
      setEventFeeForm({ name: '', suggested_amount: 0, description: '' });
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving event fee category:', error);
      showErrorToast('Error', 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  // Pagination logic for donations
  const indexOfLastDonation = currentPageDonations * itemsPerPageDonations;
  const indexOfFirstDonation = indexOfLastDonation - itemsPerPageDonations;
  const currentDonations = donationCategories.slice(indexOfFirstDonation, indexOfLastDonation);
  
  // Pagination logic for event fees
  const indexOfLastEventFee = currentPageEventFees * itemsPerPageEventFees;
  const indexOfFirstEventFee = indexOfLastEventFee - itemsPerPageEventFees;
  const currentEventFees = eventFeeCategories.slice(indexOfFirstEventFee, indexOfLastEventFee);

  const tabs = [
    { id: 'donations', label: 'Donation Categories', icon: Tag },
    { id: 'eventfees', label: 'Event Fee Categories', icon: DollarSign }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center animate-fade-in-down">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#4158D0' }}>
              Payment Categories
            </h1>
            <p className="text-gray-600 mt-1">
              Manage donation and event fee categories for payment recording
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-xl transition-all ${
                  isActive ? 'shadow-lg' : 'text-gray-600 hover:bg-gray-50'
                }`}
                style={{
                  background: isActive ? 'rgba(65, 88, 208, 0.1)' : 'transparent',
                  backdropFilter: isActive ? 'blur(10px)' : 'none',
                  WebkitBackdropFilter: isActive ? 'blur(10px)' : 'none',
                  color: isActive ? '#4158D0' : undefined,
                  border: isActive ? '1px solid rgba(65, 88, 208, 0.2)' : '1px solid transparent',
                  boxShadow: isActive ? '0 4px 12px rgba(65, 88, 208, 0.15)' : 'none'
                }}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Donation Categories Tab */}
        {activeTab === 'donations' && (
          <Card title="Donation Categories" padding="none">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentDonations.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {category.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {category.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditDonation(category)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteDonation(category.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Pagination for Donations */}
              {donationCategories.length > 0 && (
                <div className="border-t border-gray-200">
                  <Pagination
                    currentPage={currentPageDonations}
                    totalItems={donationCategories.length}
                    itemsPerPage={itemsPerPageDonations}
                    onPageChange={setCurrentPageDonations}
                    onItemsPerPageChange={setItemsPerPageDonations}
                  />
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Event Fee Categories Tab */}
        {activeTab === 'eventfees' && (
          <Card title="Event Fee Categories" padding="none">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Suggested Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentEventFees.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {category.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          ₱{category.suggested_amount?.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {category.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditEventFee(category)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteEventFee(category.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Pagination for Event Fees */}
              {eventFeeCategories.length > 0 && (
                <div className="border-t border-gray-200">
                  <Pagination
                    currentPage={currentPageEventFees}
                    totalItems={eventFeeCategories.length}
                    itemsPerPage={itemsPerPageEventFees}
                    onPageChange={setCurrentPageEventFees}
                    onItemsPerPageChange={setItemsPerPageEventFees}
                  />
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PaymentCategories;
