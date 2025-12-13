import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Tag, DollarSign, Calendar } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import ModalOverlay from '../../components/ModalOverlay';
import { showDeleteConfirm, showSuccessToast, showErrorToast } from '../../utils/sweetAlertHelper';
import { donationCategoryAPI, eventFeeCategoryAPI } from '../../services/dataSync';

const Categories = () => {
  const [activeTab, setActiveTab] = useState('donations');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);

  // Donation Categories State
  const [donationCategories, setDonationCategories] = useState([]);

  const [donationForm, setDonationForm] = useState({
    name: '',
    description: ''
  });

  // Event Fee Categories State (for payments)
  const [eventFeeCategories, setEventFeeCategories] = useState([]);

  const [eventFeeForm, setEventFeeForm] = useState({
    name: '',
    amount: 0,
    description: ''
  });

  // Event Categories State (for scheduling)
  const [eventCategories, setEventCategories] = useState([
    { id: 1, name: 'Mass & Worship', defaultDuration: 60 },
    { id: 2, name: 'Baptism', defaultDuration: 120 },
    { id: 3, name: 'Wedding', defaultDuration: 180 },
    { id: 4, name: 'Funeral Service', defaultDuration: 90 },
    { id: 5, name: 'Bible Study', defaultDuration: 90 },
    { id: 6, name: 'Youth Ministry', defaultDuration: 120 }
  ]);

  const [eventForm, setEventForm] = useState({
    name: '',
    defaultDuration: 60
  });

  // Load categories from database
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const donations = await donationCategoryAPI.getAll();
      const eventFees = await eventFeeCategoryAPI.getAll();
      
      setDonationCategories(Array.isArray(donations) ? donations : []);
      setEventFeeCategories(Array.isArray(eventFees) ? eventFees : []);
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
    setEventFeeForm({ name: '', amount: 0, description: '' });
    setShowModal(true);
  };

  const handleEditEventFee = (category) => {
    setModalMode('edit');
    setEditingItem(category);
    setEventFeeForm({
      name: category.name,
      amount: category.suggested_amount || category.amount || 0,
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
    if (!eventFeeForm.name || !eventFeeForm.amount || !eventFeeForm.description) {
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
    } catch (error) {
      console.error('Error saving event fee category:', error);
      showErrorToast('Error', 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  // Event Category Handlers
  const handleCreateEvent = () => {
    setModalMode('create');
    setEventForm({ name: '', defaultDuration: 60 });
    setShowModal(true);
  };

  const handleEditEvent = (category) => {
    setModalMode('edit');
    setEditingItem(category);
    setEventForm({
      name: category.name,
      defaultDuration: category.defaultDuration
    });
    setShowModal(true);
  };

  const handleDeleteEvent = async (id) => {
    const result = await showDeleteConfirm('Delete Category?', 'Are you sure you want to delete this event category?');
    if (result.isConfirmed) {
      setEventCategories(prev => prev.filter(cat => cat.id !== id));
      showSuccessToast('Deleted!', 'Event category deleted successfully');
    }
  };

  const handleSaveEvent = () => {
    if (!eventForm.name || !eventForm.defaultDuration) {
      showErrorToast('Error!', 'Please fill in all fields');
      return;
    }

    if (modalMode === 'create') {
      const newCategory = {
        id: Math.max(...eventCategories.map(c => c.id)) + 1,
        ...eventForm
      };
      setEventCategories(prev => [...prev, newCategory]);
    } else {
      setEventCategories(prev =>
        prev.map(cat => cat.id === editingItem.id ? { ...cat, ...eventForm } : cat)
      );
    }

    setShowModal(false);
    setEventForm({ name: '', defaultDuration: 60 });
    setEditingItem(null);
  };

  const tabs = [
    { id: 'donations', label: 'Donation Categories', icon: Tag },
    { id: 'eventfees', label: 'Event Fee Categories', icon: DollarSign },
    { id: 'events', label: 'Event Scheduling', icon: Calendar }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#4158D0' }}>
                Category Management
              </h1>
              <p className="text-gray-600 mt-1">
                View donation and event categories
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-3">
          <div className="flex gap-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 font-semibold transition-all rounded-xl ${
                    isActive
                      ? 'shadow-lg'
                      : 'text-gray-600 hover:bg-gray-50'
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
        </div>

        {/* Donation Categories Tab */}
        {activeTab === 'donations' && (
          <Card title="Donation Categories" padding="none">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Category Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {donationCategories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {category.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {category.description}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Event Fee Categories Tab */}
        {activeTab === 'eventfees' && (
          <Card title="Event Fee Categories" padding="none">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Category Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Suggested Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {eventFeeCategories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {category.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          ₱{((category.suggested_amount || category.amount || 0)).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {category.description}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Event Categories Tab */}
        {activeTab === 'events' && (
          <Card title="Event Categories" padding="none">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Category Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Default Duration
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {eventCategories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {category.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          {category.defaultDuration} minutes
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Categories;
