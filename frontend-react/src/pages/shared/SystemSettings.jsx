import { useState, useEffect, useRef } from 'react';
import { Save, Church, Tag, FileText, Bell, Database, Plus, Edit, Trash2, X, Upload, Eye, Download, Globe, Clock, Shield, Mail, Phone, MapPin, User, DollarSign, Calendar as CalendarIcon } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../contexts/AuthContext';
import { donationCategoryAPI, eventFeeCategoryAPI } from '../../services/dataSync';
import { showDeleteConfirm, showSuccessToast, showErrorToast, showInfoToast } from '../../utils/sweetAlertHelper';
import { logActivity, auditActions, auditModules } from '../../utils/auditLogger';

const SystemSettings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('church-info');
  const [loading, setLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryModalMode, setCategoryModalMode] = useState('create');
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryType, setCategoryType] = useState('donation');

  // Church Information
  const [churchInfo, setChurchInfo] = useState({
    name: 'Our Lady of Peace and Good Voyage Mission Area',
    shortName: 'OLPGVMA',
    address: '123 Dalapian St, Brgy Centro',
    city: 'Your City',
    province: 'Your Province',
    zipCode: '1000',
    phone: '+63 123 456 7890',
    email: 'church@olpgvma.com',
    website: 'www.olpgvma.com',
    priest: 'Fr. Joseph Smith',
    founded: '1950',
    parishioners: '1,234',
    timezone: 'Asia/Manila',
    language: 'en',
    currency: 'PHP'
  });

  // Categories
  const [donationCategories, setDonationCategories] = useState([]);
  const [eventCategories, setEventCategories] = useState([]);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    amount: '',
    default_duration: 60
  });

  // Certificate Templates
  const [certificateTemplates, setCertificateTemplates] = useState({
    baptism: { file: null, version: 1, lastUpdated: null, placeholders: ['Name', 'Date', 'Priest', 'Parents'] },
    wedding: { file: null, version: 1, lastUpdated: null, placeholders: ['Groom', 'Bride', 'Date', 'Priest', 'Witnesses'] },
    confirmation: { file: null, version: 1, lastUpdated: null, placeholders: ['Name', 'Date', 'Priest', 'Sponsor'] },
    funeral: { file: null, version: 1, lastUpdated: null, placeholders: ['Name', 'Date', 'Priest', 'DateOfDeath'] }
  });
  const [showTemplatePreview, setShowTemplatePreview] = useState(null);
  const fileInputRefs = useRef({});

  // Notifications
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    newServiceRequest: true,
    paymentReceived: true,
    appointmentReminder: true,
    certificateReady: true,
    lowInventory: false,
    systemUpdates: true
  });

  // Backup Settings
  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    backupTime: '02:00',
    retentionDays: 30,
    includeFiles: true
  });

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    loadCategories();
    loadSettings();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const [donations, events] = await Promise.all([
        donationCategoryAPI.getAll().catch(() => ({ data: [] })),
        eventFeeCategoryAPI.getAll().catch(() => ({ data: [] }))
      ]);

      setDonationCategories(Array.isArray(donations?.data) ? donations.data : (Array.isArray(donations) ? donations : []));
      setEventCategories(Array.isArray(events?.data) ? events.data : (Array.isArray(events) ? events : []));
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = () => {
    // Load settings from localStorage
    const savedChurchInfo = localStorage.getItem('churchInfo');
    const savedNotifications = localStorage.getItem('notificationSettings');
    const savedBackup = localStorage.getItem('backupSettings');

    if (savedChurchInfo) setChurchInfo(JSON.parse(savedChurchInfo));
    if (savedNotifications) setNotificationSettings(JSON.parse(savedNotifications));
    if (savedBackup) setBackupSettings(JSON.parse(savedBackup));
  };

  const handleSaveChurchInfo = async () => {
    try {
      localStorage.setItem('churchInfo', JSON.stringify(churchInfo));
      
      await logActivity({
        action: auditActions.UPDATE,
        module: auditModules.SETTINGS,
        details: `Updated church information`,
        userId: user?.id,
        userName: user?.name || 'Unknown',
        userRole: user?.role || 'admin',
        newValue: churchInfo
      });

      showSuccessToast('Success!', 'Church information saved successfully');
    } catch (error) {
      console.error('Error saving church info:', error);
      showErrorToast('Error', 'Failed to save church information');
    }
  };

  const handleOpenCategoryModal = (type, mode, category = null) => {
    setCategoryType(type);
    setCategoryModalMode(mode);
    setEditingCategory(category);
    
    if (mode === 'edit' && category) {
      setCategoryForm({
        name: category.name || '',
        description: category.description || '',
        amount: category.amount || '',
        default_duration: category.default_duration || 60
      });
    } else {
      setCategoryForm({
        name: '',
        description: '',
        amount: '',
        default_duration: 60
      });
    }
    
    setShowCategoryModal(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    
    try {
      if (categoryType === 'donation') {
        const data = {
          name: categoryForm.name,
          description: categoryForm.description
        };

        if (categoryModalMode === 'create') {
          await donationCategoryAPI.create(data);
          showSuccessToast('Success!', 'Donation category created');
        } else {
          await donationCategoryAPI.update(editingCategory.id, data);
          showSuccessToast('Success!', 'Donation category updated');
        }
      } else {
        const data = {
          name: categoryForm.name,
          description: categoryForm.description,
          amount: parseFloat(categoryForm.amount) || 0,
          default_duration: parseInt(categoryForm.default_duration) || 60
        };

        if (categoryModalMode === 'create') {
          await eventFeeCategoryAPI.create(data);
          showSuccessToast('Success!', 'Event category created');
        } else {
          await eventFeeCategoryAPI.update(editingCategory.id, data);
          showSuccessToast('Success!', 'Event category updated');
        }
      }

      await logActivity({
        action: categoryModalMode === 'create' ? auditActions.CREATE : auditActions.UPDATE,
        module: auditModules.SETTINGS,
        details: `${categoryModalMode === 'create' ? 'Created' : 'Updated'} ${categoryType} category: ${categoryForm.name}`,
        userId: user?.id,
        userName: user?.name || 'Unknown',
        userRole: user?.role || 'admin',
        newValue: categoryForm
      });

      setShowCategoryModal(false);
      loadCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      showErrorToast('Error', 'Failed to save category');
    }
  };

  const handleDeleteCategory = async (type, category) => {
    const result = await showDeleteConfirm('Delete Category?', `Are you sure you want to delete "${category.name}"?`);
    
    if (result.isConfirmed) {
      try {
        if (type === 'donation') {
          await donationCategoryAPI.delete(category.id);
        } else {
          await eventFeeCategoryAPI.delete(category.id);
        }

        await logActivity({
          action: auditActions.DELETE,
          module: auditModules.SETTINGS,
          details: `Deleted ${type} category: ${category.name}`,
          userId: user?.id,
          userName: user?.name || 'Unknown',
          userRole: user?.role || 'admin',
          oldValue: category
        });

        showSuccessToast('Deleted!', 'Category deleted successfully');
        loadCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        showErrorToast('Error', 'Failed to delete category');
      }
    }
  };

  const handleTemplateUpload = (type, event) => {
    const file = event.target.files[0];
    if (!file) return;

    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const validExtensions = ['.pdf', '.docx'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      showErrorToast('Invalid File Type', 'Please upload a PDF or DOCX file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showErrorToast('File Too Large', 'File size should not exceed 10MB.');
      return;
    }

    setCertificateTemplates(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        file: file,
        lastUpdated: new Date().toISOString(),
        version: prev[type].version + 1
      }
    }));

    showSuccessToast('Success!', `${type.charAt(0).toUpperCase() + type.slice(1)} template uploaded`);
  };

  const handleSaveNotifications = () => {
    localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
    showSuccessToast('Success!', 'Notification settings saved');
  };

  const handleSaveBackup = () => {
    localStorage.setItem('backupSettings', JSON.stringify(backupSettings));
    showSuccessToast('Success!', 'Backup settings saved');
  };

  const handleExportData = () => {
    showInfoToast('Export Started', 'Data export will be downloaded shortly...');
    // Implement actual export logic
  };

  const handleImportData = () => {
    showInfoToast('Import', 'Please select a file to import');
    // Implement actual import logic
  };

  const handleBackupNow = () => {
    showSuccessToast('Backup Started', 'System backup is being created...');
    // Implement actual backup logic
  };

  const tabs = [
    { id: 'church-info', label: 'Church Info', icon: Church },
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'certificates', label: 'Certificate Templates', icon: FileText },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'backup', label: 'Backup & Data', icon: Database }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: '#4158D0' }}>
                System Settings
              </h1>
              <p className="text-gray-600">
                Configure church information, categories, templates, and system preferences
              </p>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(65, 88, 208, 0.1)' }}>
              <Shield style={{ color: '#4158D0' }} size={32} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
          <div className="flex flex-wrap gap-2 mb-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                    activeTab === tab.id ? 'shadow-lg' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  style={{
                    background: activeTab === tab.id ? 'rgba(65, 88, 208, 0.1)' : 'transparent',
                    color: activeTab === tab.id ? '#4158D0' : undefined,
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: activeTab === tab.id ? 'rgba(65, 88, 208, 0.2)' : 'transparent',
                    boxShadow: activeTab === tab.id ? '0 4px 12px rgba(65, 88, 208, 0.15)' : 'none'
                  }}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === 'church-info' && (
              <ChurchInfoTab 
                churchInfo={churchInfo}
                setChurchInfo={setChurchInfo}
                onSave={handleSaveChurchInfo}
                isAdmin={isAdmin}
              />
            )}

            {activeTab === 'categories' && (
              <CategoriesTab
                donationCategories={donationCategories}
                eventCategories={eventCategories}
                onAdd={handleOpenCategoryModal}
                onEdit={handleOpenCategoryModal}
                onDelete={handleDeleteCategory}
                loading={loading}
                isAdmin={isAdmin}
              />
            )}

            {activeTab === 'certificates' && (
              <CertificateTemplatesTab
                templates={certificateTemplates}
                onUpload={handleTemplateUpload}
                onPreview={setShowTemplatePreview}
                fileInputRefs={fileInputRefs}
                isAdmin={isAdmin}
              />
            )}

            {activeTab === 'notifications' && (
              <NotificationsTab
                settings={notificationSettings}
                setSettings={setNotificationSettings}
                onSave={handleSaveNotifications}
                isAdmin={isAdmin}
              />
            )}

            {activeTab === 'backup' && (
              <BackupTab
                settings={backupSettings}
                setSettings={setBackupSettings}
                onSave={handleSaveBackup}
                onBackupNow={handleBackupNow}
                onExport={handleExportData}
                onImport={handleImportData}
                isAdmin={isAdmin}
              />
            )}
          </div>
        </div>
      </div>

      {/* Category Modal */}
      {showCategoryModal && createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 flex justify-between items-center border-b border-gray-200" style={{ backgroundColor: 'rgba(65, 88, 208, 0.05)' }}>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: '#4158D0' }}>
                  {categoryModalMode === 'create' ? 'Add' : 'Edit'} {categoryType === 'donation' ? 'Donation' : 'Event'} Category
                </h2>
                <p className="text-sm text-gray-600 mt-1">Fill in the category details</p>
              </div>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                style={{ color: '#4158D0' }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  required
                  placeholder="e.g., Tithes, Wedding, Baptism"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  rows="3"
                  placeholder="Brief description of this category"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent resize-none"
                />
              </div>

              {categoryType === 'event' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Default Fee <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₱</span>
                      <input
                        type="number"
                        value={categoryForm.amount}
                        onChange={(e) => setCategoryForm({ ...categoryForm, amount: e.target.value })}
                        required
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Default Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={categoryForm.default_duration}
                      onChange={(e) => setCategoryForm({ ...categoryForm, default_duration: e.target.value })}
                      min="15"
                      step="15"
                      placeholder="60"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-xl font-semibold text-white transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
                    boxShadow: '0 4px 12px rgba(65, 88, 208, 0.3)'
                  }}
                >
                  {categoryModalMode === 'create' ? 'Create' : 'Update'} Category
                </button>
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-6 py-3 rounded-xl font-semibold transition-all hover:bg-gray-100"
                  style={{
                    background: 'white',
                    color: '#6b7280',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: '#d1d5db'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

// Church Info Tab Component
const ChurchInfoTab = ({ churchInfo, setChurchInfo, onSave, isAdmin }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Church className="inline mr-2" size={16} />
            Church Name
          </label>
          <input
            type="text"
            value={churchInfo.name}
            onChange={(e) => setChurchInfo({ ...churchInfo, name: e.target.value })}
            disabled={!isAdmin}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Short Name</label>
          <input
            type="text"
            value={churchInfo.shortName}
            onChange={(e) => setChurchInfo({ ...churchInfo, shortName: e.target.value })}
            disabled={!isAdmin}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent disabled:bg-gray-100"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <MapPin className="inline mr-2" size={16} />
            Address
          </label>
          <input
            type="text"
            value={churchInfo.address}
            onChange={(e) => setChurchInfo({ ...churchInfo, address: e.target.value })}
            disabled={!isAdmin}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
          <input
            type="text"
            value={churchInfo.city}
            onChange={(e) => setChurchInfo({ ...churchInfo, city: e.target.value })}
            disabled={!isAdmin}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Province</label>
          <input
            type="text"
            value={churchInfo.province}
            onChange={(e) => setChurchInfo({ ...churchInfo, province: e.target.value })}
            disabled={!isAdmin}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Phone className="inline mr-2" size={16} />
            Phone
          </label>
          <input
            type="tel"
            value={churchInfo.phone}
            onChange={(e) => setChurchInfo({ ...churchInfo, phone: e.target.value })}
            disabled={!isAdmin}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Mail className="inline mr-2" size={16} />
            Email
          </label>
          <input
            type="email"
            value={churchInfo.email}
            onChange={(e) => setChurchInfo({ ...churchInfo, email: e.target.value })}
            disabled={!isAdmin}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Globe className="inline mr-2" size={16} />
            Website
          </label>
          <input
            type="text"
            value={churchInfo.website}
            onChange={(e) => setChurchInfo({ ...churchInfo, website: e.target.value })}
            disabled={!isAdmin}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <User className="inline mr-2" size={16} />
            Parish Priest
          </label>
          <input
            type="text"
            value={churchInfo.priest}
            onChange={(e) => setChurchInfo({ ...churchInfo, priest: e.target.value })}
            disabled={!isAdmin}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Clock className="inline mr-2" size={16} />
            Timezone
          </label>
          <select
            value={churchInfo.timezone}
            onChange={(e) => setChurchInfo({ ...churchInfo, timezone: e.target.value })}
            disabled={!isAdmin}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent disabled:bg-gray-100"
          >
            <option value="Asia/Manila">Asia/Manila (PHT)</option>
            <option value="UTC">UTC</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Founded Year</label>
          <input
            type="text"
            value={churchInfo.founded}
            onChange={(e) => setChurchInfo({ ...churchInfo, founded: e.target.value })}
            disabled={!isAdmin}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Total Parishioners</label>
          <input
            type="text"
            value={churchInfo.parishioners}
            onChange={(e) => setChurchInfo({ ...churchInfo, parishioners: e.target.value })}
            disabled={!isAdmin}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent disabled:bg-gray-100"
          />
        </div>
      </div>

      {isAdmin && (
        <div className="flex justify-end pt-4">
          <button
            onClick={onSave}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all"
            style={{
              background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
              boxShadow: '0 4px 12px rgba(65, 88, 208, 0.3)'
            }}
          >
            <Save size={18} />
            Save Church Information
          </button>
        </div>
      )}
    </div>
  );
};

// Categories Tab Component
const CategoriesTab = ({ donationCategories, eventCategories, onAdd, onEdit, onDelete, loading, isAdmin }) => {
  const [categoryView, setCategoryView] = useState('donations');

  return (
    <div className="space-y-6">
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setCategoryView('donations')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            categoryView === 'donations' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
          }`}
        >
          <DollarSign className="inline mr-2" size={16} />
          Donation Categories
        </button>
        <button
          onClick={() => setCategoryView('events')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            categoryView === 'events' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
          }`}
        >
          <CalendarIcon className="inline mr-2" size={16} />
          Event Categories
        </button>
      </div>

      {isAdmin && (
        <button
          onClick={() => onAdd(categoryView === 'donations' ? 'donation' : 'event', 'create')}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all"
          style={{
            background: 'rgba(16, 185, 129, 0.1)',
            color: '#10B981',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'rgba(16, 185, 129, 0.2)'
          }}
        >
          <Plus size={18} />
          Add {categoryView === 'donations' ? 'Donation' : 'Event'} Category
        </button>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : categoryView === 'donations' ? (
          donationCategories.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              No donation categories found. Add your first category!
            </div>
          ) : (
            donationCategories.map((category) => (
              <div key={category.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-900">{category.name}</h3>
                  {isAdmin && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => onEdit('donation', 'edit', category)}
                        className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                        style={{ color: '#4158D0' }}
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => onDelete('donation', category)}
                        className="p-1.5 hover:bg-red-50 rounded transition-colors text-red-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600">{category.description || 'No description'}</p>
              </div>
            ))
          )
        ) : (
          eventCategories.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              No event categories found. Add your first category!
            </div>
          ) : (
            eventCategories.map((category) => (
              <div key={category.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-900">{category.name}</h3>
                  {isAdmin && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => onEdit('event', 'edit', category)}
                        className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                        style={{ color: '#4158D0' }}
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => onDelete('event', category)}
                        className="p-1.5 hover:bg-red-50 rounded transition-colors text-red-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">{category.description || 'No description'}</p>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Fee: ₱{(category.amount || 0).toLocaleString()}</span>
                  <span>Duration: {category.default_duration || 60}min</span>
                </div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
};

// Certificate Templates Tab Component
const CertificateTemplatesTab = ({ templates, onUpload, onPreview, fileInputRefs, isAdmin }) => {
  const templateTypes = [
    { id: 'baptism', name: 'Baptism Certificate', icon: '💧' },
    { id: 'wedding', name: 'Wedding Certificate', icon: '💍' },
    { id: 'confirmation', name: 'Confirmation Certificate', icon: '✝️' },
    { id: 'funeral', name: 'Funeral Certificate', icon: '🕊️' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
        <h3 className="font-bold text-blue-900 mb-1">Certificate Template Guidelines</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Upload PDF or DOCX templates with placeholders for dynamic data</li>
          <li>• Use placeholders like [Name], [Date], [Priest] etc. that will be replaced with actual data</li>
          <li>• Templates are versioned - uploading new ones increments the version number</li>
          <li>• Generated certificates are one-time use PDFs sent to users</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templateTypes.map((type) => {
          const template = templates[type.id];
          return (
            <div key={type.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{type.icon}</span>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{type.name}</h3>
                  <p className="text-xs text-gray-500">
                    Version {template.version} {template.lastUpdated && `• Updated ${new Date(template.lastUpdated).toLocaleDateString()}`}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Available Placeholders:</p>
                  <div className="flex flex-wrap gap-1">
                    {template.placeholders.map((placeholder) => (
                      <span key={placeholder} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        [{placeholder}]
                      </span>
                    ))}
                  </div>
                </div>

                {template.file && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-white rounded-lg p-3 border border-gray-200">
                    <FileText size={16} className="text-green-600" />
                    <span className="flex-1 truncate">{template.file.name}</span>
                  </div>
                )}

                {isAdmin && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => fileInputRefs.current[type.id]?.click()}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all"
                      style={{
                        background: 'rgba(65, 88, 208, 0.1)',
                        color: '#4158D0',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: 'rgba(65, 88, 208, 0.2)'
                      }}
                    >
                      <Upload size={16} />
                      Upload
                    </button>
                    <input
                      ref={(el) => fileInputRefs.current[type.id] = el}
                      type="file"
                      accept=".pdf,.docx"
                      onChange={(e) => onUpload(type.id, e)}
                      className="hidden"
                    />
                    {template.file && (
                      <button
                        onClick={() => onPreview(type.id)}
                        className="px-4 py-2 rounded-lg font-semibold transition-all"
                        style={{
                          background: 'rgba(16, 185, 129, 0.1)',
                          color: '#10B981',
                          borderWidth: '1px',
                          borderStyle: 'solid',
                          borderColor: 'rgba(16, 185, 129, 0.2)'
                        }}
                      >
                        <Eye size={16} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Notifications Tab Component
const NotificationsTab = ({ settings, setSettings, onSave, isAdmin }) => {
  const notifications = [
    { id: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email' },
    { id: 'smsNotifications', label: 'SMS Notifications', description: 'Receive notifications via SMS (requires setup)' },
    { id: 'newServiceRequest', label: 'New Service Requests', description: 'Alert when new service requests are submitted' },
    { id: 'paymentReceived', label: 'Payment Received', description: 'Alert when payments are recorded' },
    { id: 'appointmentReminder', label: 'Appointment Reminders', description: 'Send reminders for upcoming appointments' },
    { id: 'certificateReady', label: 'Certificate Ready', description: 'Notify when certificates are ready for download' },
    { id: 'systemUpdates', label: 'System Updates', description: 'Receive system maintenance and update notifications' }
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {notifications.map((notification) => (
          <div key={notification.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{notification.label}</h3>
              <p className="text-sm text-gray-600">{notification.description}</p>
            </div>
            <label className="relative inline-block w-12 h-6">
              <input
                type="checkbox"
                checked={settings[notification.id]}
                onChange={(e) => setSettings({ ...settings, [notification.id]: e.target.checked })}
                disabled={!isAdmin}
                className="sr-only peer"
              />
              <div className="w-full h-full bg-gray-300 rounded-full peer peer-checked:bg-blue-600 peer-disabled:opacity-50 transition-colors"></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-6 transition-transform"></div>
            </label>
          </div>
        ))}
      </div>

      {isAdmin && (
        <div className="flex justify-end pt-4">
          <button
            onClick={onSave}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all"
            style={{
              background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
              boxShadow: '0 4px 12px rgba(65, 88, 208, 0.3)'
            }}
          >
            <Save size={18} />
            Save Notification Settings
          </button>
        </div>
      )}
    </div>
  );
};

// Backup Tab Component
const BackupTab = ({ settings, setSettings, onSave, onBackupNow, onExport, onImport, isAdmin }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Automatic Backup</label>
          <select
            value={settings.autoBackup ? 'enabled' : 'disabled'}
            onChange={(e) => setSettings({ ...settings, autoBackup: e.target.value === 'enabled' })}
            disabled={!isAdmin}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent disabled:bg-gray-100"
          >
            <option value="enabled">Enabled</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Backup Frequency</label>
          <select
            value={settings.backupFrequency}
            onChange={(e) => setSettings({ ...settings, backupFrequency: e.target.value })}
            disabled={!isAdmin || !settings.autoBackup}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent disabled:bg-gray-100"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Backup Time</label>
          <input
            type="time"
            value={settings.backupTime}
            onChange={(e) => setSettings({ ...settings, backupTime: e.target.value })}
            disabled={!isAdmin || !settings.autoBackup}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Retention (Days)</label>
          <input
            type="number"
            value={settings.retentionDays}
            onChange={(e) => setSettings({ ...settings, retentionDays: parseInt(e.target.value) })}
            disabled={!isAdmin}
            min="7"
            max="365"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent disabled:bg-gray-100"
          />
        </div>
      </div>

      {isAdmin && (
        <>
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              onClick={onSave}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all"
              style={{
                background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
                boxShadow: '0 4px 12px rgba(65, 88, 208, 0.3)'
              }}
            >
              <Save size={18} />
              Save Backup Settings
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
            <button
              onClick={onBackupNow}
              className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold transition-all"
              style={{
                background: 'rgba(16, 185, 129, 0.1)',
                color: '#10B981',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'rgba(16, 185, 129, 0.2)'
              }}
            >
              <Database size={20} />
              Backup Now
            </button>

            <button
              onClick={onExport}
              className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold transition-all"
              style={{
                background: 'rgba(65, 88, 208, 0.1)',
                color: '#4158D0',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'rgba(65, 88, 208, 0.2)'
              }}
            >
              <Download size={20} />
              Export Data
            </button>

            <button
              onClick={onImport}
              className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold transition-all"
              style={{
                background: 'rgba(245, 147, 24, 0.1)',
                color: '#F59318',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'rgba(245, 147, 24, 0.2)'
              }}
            >
              <Upload size={20} />
              Import Data
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SystemSettings;
