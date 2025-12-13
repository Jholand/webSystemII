import { Save, User, Bell, Shield, Database, Moon, Sun, Church, FileText, Settings as SettingsIcon, Upload, Eye, Globe, Clock } from 'lucide-react';
import { useState, useRef } from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Swal from 'sweetalert2';
import { showSuccessToast, showErrorToast } from '../../utils/sweetAlertHelper';

const Settings = () => {
  const [notifications, setNotifications] = useState(true);
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [autoBackup, setAutoBackup] = useState(true);
  const [activeTab, setActiveTab] = useState('church');

  // Church Information
  const [churchInfo, setChurchInfo] = useState({
    name: 'Our Lady of Peace and Good Voyage Mission Area',
    address: '123 Dalapian St, Brgy Centro',
    phone: '+63 123 456 7890',
    email: 'church@olpgvma.com',
    priest: 'Fr. Joseph Smith',
    founded: '1950',
    parishioners: '1,234',
    timezone: 'Asia/Manila',
    language: 'en'
  });

  // Module Settings
  const [modules, setModules] = useState({
    donations: true,
    events: true
  });

  // Certificate Templates State
  const [certificateTemplates, setCertificateTemplates] = useState({
    Baptism: null,
    Marriage: null,
    Confirmation: null,
    Death: null
  });
  
  const fileInputRefs = useRef({
    Baptism: null,
    Marriage: null,
    Confirmation: null,
    Death: null
  });

  // Handle template file upload
  const handleTemplateUpload = (type, event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/pdf',
      'text/html',
      'application/msword' // .doc
    ];
    
    const validExtensions = ['.docx', '.pdf', '.html', '.doc'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      showErrorToast('Invalid File Type', 'Please upload a DOCX, PDF, or HTML file.');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showErrorToast('File Too Large', 'File size should not exceed 5MB.');
      return;
    }

    // Store the file
    setCertificateTemplates(prev => ({
      ...prev,
      [type]: {
        file: file,
        name: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString()
      }
    }));

    showSuccessToast('Success', `${type} certificate template uploaded successfully!`);
    
    // Reset file input
    event.target.value = '';
  };

  // Trigger file input click
  const triggerFileUpload = (type) => {
    if (fileInputRefs.current[type]) {
      fileInputRefs.current[type].click();
    }
  };

  // Handle preview
  const handlePreview = (type) => {
    const template = certificateTemplates[type];
    if (!template) {
      showErrorToast('No Template', `Please upload a ${type} certificate template first.`);
      return;
    }

    // Create a preview (for now, show file info)
    Swal.fire({
      title: `${type} Certificate Template`,
      html: `
        <div class="text-left">
          <p><strong>File Name:</strong> ${template.name}</p>
          <p><strong>File Size:</strong> ${(template.size / 1024).toFixed(2)} KB</p>
          <p><strong>Uploaded:</strong> ${new Date(template.uploadedAt).toLocaleString()}</p>
          <p class="mt-4 text-sm text-gray-600">Template preview and editing features will be available in the full version.</p>
        </div>
      `,
      icon: 'info',
      confirmButtonColor: '#4158D0'
    });
  };

  // Remove template
  const handleRemoveTemplate = (type) => {
    Swal.fire({
      title: 'Remove Template?',
      text: `Are you sure you want to remove the ${type} certificate template?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, remove it',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        setCertificateTemplates(prev => ({
          ...prev,
          [type]: null
        }));
        showSuccessToast('Removed', 'Template removed successfully!');
      }
    });
  };

  const handleChurchInfoChange = (field, value) => {
    setChurchInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleModuleToggle = (module) => {
    setModules(prev => ({ ...prev, [module]: !prev[module] }));
  };

  const tabs = [
    { id: 'church', label: 'Church Info', icon: Church },
    { id: 'certificates', label: 'Certificates', icon: FileText },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'system', label: 'System', icon: Database }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#4158D0' }}>System Settings</h1>
            <p className="text-gray-600 mt-1">Manage church information and system preferences</p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-3">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
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

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Church Information Tab */}
          {activeTab === 'church' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Form */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Church size={20} style={{ color: '#4158D0' }} />
                    Church Information
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Church Name
                      </label>
                      <input
                        type="text"
                        value={churchInfo.name}
                        onChange={(e) => handleChurchInfoChange('name', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                        placeholder="Enter church name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        value={churchInfo.address}
                        onChange={(e) => handleChurchInfoChange('address', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                        placeholder="Enter church address"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="text"
                          value={churchInfo.phone}
                          onChange={(e) => handleChurchInfoChange('phone', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                          placeholder="+63 123 456 7890"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={churchInfo.email}
                          onChange={(e) => handleChurchInfoChange('email', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                          placeholder="church@example.com"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Parish Priest
                        </label>
                        <input
                          type="text"
                          value={churchInfo.priest}
                          onChange={(e) => handleChurchInfoChange('priest', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                          placeholder="Enter priest name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Year Founded
                        </label>
                        <input
                          type="text"
                          value={churchInfo.founded}
                          onChange={(e) => handleChurchInfoChange('founded', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                          placeholder="1950"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total Parishioners
                      </label>
                      <input
                        type="text"
                        value={churchInfo.parishioners}
                        onChange={(e) => handleChurchInfoChange('parishioners', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                        placeholder="1,234"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Clock size={16} className="inline mr-2" />
                          Timezone
                        </label>
                        <select
                          value={churchInfo.timezone}
                          onChange={(e) => handleChurchInfoChange('timezone', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                        >
                          <option value="Asia/Manila">Asia/Manila (UTC+8)</option>
                          <option value="America/New_York">America/New York (EST)</option>
                          <option value="America/Los_Angeles">America/Los Angeles (PST)</option>
                          <option value="Europe/London">Europe/London (GMT)</option>
                          <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Globe size={16} className="inline mr-2" />
                          Default Language
                        </label>
                        <select
                          value={churchInfo.language}
                          onChange={(e) => handleChurchInfoChange('language', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                        >
                          <option value="en">English</option>
                          <option value="tl">Tagalog</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <button className="px-4 py-2 text-white text-sm font-medium rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2" style={{ 
                        background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                      }}>
                        <Save size={18} />
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Church Logo */}
                <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Church Logo</h3>
                  <div className="flex flex-col items-center">
                    <div className="w-32 h-32 rounded-full flex items-center justify-center mb-4 shadow" style={{ background: 'linear-gradient(135deg, #4158D0 0%, #3651B5 100%)' }}>
                      <Church size={48} className="text-white" />
                    </div>
                    <button className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
                      <Upload size={18} />
                      Upload Logo
                    </button>
                    <p className="text-xs text-gray-500 mt-3 text-center">
                      Recommended: 500x500px<br/>PNG or JPG format
                    </p>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Quick Info</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                      <span className="text-sm text-gray-600">Last Updated</span>
                      <span className="text-sm font-medium text-gray-900">Today</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                      <span className="text-sm text-gray-600">Status</span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">Active</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Version</span>
                      <span className="text-sm font-medium text-gray-900">2.0.1</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* Certificate Templates Tab */}
        {activeTab === 'certificates' && (
          <div className="space-y-6">
            {/* Certificate Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {['Baptism', 'Marriage', 'Confirmation', 'Death'].map((type) => {
                const template = certificateTemplates[type];
                return (
                  <div key={type} className="bg-white rounded-lg shadow border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{type} Certificate</h3>
                    
                    {/* Hidden file input */}
                    <input
                      type="file"
                      ref={el => fileInputRefs.current[type] = el}
                      onChange={(e) => handleTemplateUpload(type, e)}
                      accept=".docx,.pdf,.html,.doc"
                      className="hidden"
                    />
                    
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4">
                      {template ? (
                        <div>
                          <FileText size={48} className="mx-auto text-green-500 mb-3" />
                          <p className="text-sm font-medium text-gray-900 mb-1">{template.name}</p>
                          <p className="text-xs text-gray-500 mb-2">{(template.size / 1024).toFixed(2)} KB</p>
                          <p className="text-xs text-green-600">✓ Uploaded</p>
                        </div>
                      ) : (
                        <div>
                          <FileText size={48} className="mx-auto text-gray-400 mb-3" />
                          <p className="text-sm text-gray-600 mb-1">Upload a template file</p>
                          <p className="text-xs text-gray-500">Supported: DOCX, PDF, HTML</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <button 
                        onClick={() => triggerFileUpload(type)}
                        className="w-full px-4 py-2 text-sm font-medium text-white rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2" 
                        style={{ 
                          background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                        }}
                      >
                        <Upload size={18} />
                        {template ? 'Replace Template' : 'Upload Template'}
                      </button>
                      <button 
                        onClick={() => handlePreview(type)}
                        disabled={!template}
                        className={`w-full px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
                          template 
                            ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' 
                            : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <Eye size={18} />
                        Preview & Edit
                      </button>
                      {template && (
                        <button 
                          onClick={() => handleRemoveTemplate(type)}
                          className="w-full px-4 py-2 text-sm font-medium bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                        >
                          Remove Template
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Form */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <User size={20} style={{ color: '#4158D0' }} />
                Profile Information
              </h2>
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      defaultValue="Administrator"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      defaultValue="User"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    defaultValue="admin@church.com"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="admin@church.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div className="pt-4">
                  <button className="px-4 py-2 text-sm font-medium text-white rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2" style={{ 
                    background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                  }}>
                    <Save size={18} />
                    Save Changes
                  </button>
                </div>
              </div>
            </div>

            {/* Profile Picture Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h3>
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full flex items-center justify-center mb-4 shadow-lg" style={{ background: 'linear-gradient(135deg, #4158D0 0%, #3651B5 100%)' }}>
                    <User size={48} className="text-white" />
                  </div>
                  <button className="w-full px-4 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2">
                    <Upload size={18} />
                    Upload Photo
                  </button>
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    JPG or PNG, max 2MB
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Info</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Member Since</span>
                    <span className="text-sm font-medium text-gray-900">Jan 2025</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Last Login</span>
                    <span className="text-sm font-medium text-gray-900">Today</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Sessions</span>
                    <span className="text-sm font-medium text-gray-900">247</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System Tab */}
        {activeTab === 'system' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Database Info */}
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Database size={20} style={{ color: '#4158D0' }} />
                  Database Information
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Database Size</span>
                    <span className="text-sm font-semibold text-gray-900">12.5 MB</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Total Records</span>
                    <span className="text-sm font-semibold text-gray-900">1,234</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Last Backup</span>
                    <span className="text-sm font-semibold text-gray-900">Today, 3:00 AM</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-sm text-gray-600">Database Version</span>
                    <span className="text-sm font-semibold text-gray-900">SQLite 3.40.1</span>
                  </div>
                </div>
              </div>

              {/* System Preferences */}
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <SettingsIcon size={20} style={{ color: '#4158D0' }} />
                  System Preferences
                </h2>
                <div className="space-y-5">
                  {/* Email Notifications */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-100 rounded-lg">
                        <Bell size={20} style={{ color: '#4158D0' }} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">Email Notifications</p>
                        <p className="text-xs text-gray-600">Receive email alerts</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications}
                        onChange={(e) => setNotifications(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Auto Backup */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-green-100 rounded-lg">
                        <Database size={20} className="text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">Automatic Backup</p>
                        <p className="text-xs text-gray-600">Daily automatic backup</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoBackup}
                        onChange={(e) => setAutoBackup(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Dark Mode */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-purple-100 rounded-lg">
                        {darkMode ? <Moon size={20} className="text-blue-600" /> : <Sun size={20} className="text-blue-600" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">Dark Mode</p>
                        <p className="text-xs text-gray-600">Switch to dark theme</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={darkMode}
                        onChange={toggleDarkMode}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Security */}
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Shield size={20} style={{ color: '#4158D0' }} />
                  Security
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="pt-2">
                    <button className="w-full px-4 py-2 text-sm font-medium text-white rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2" style={{ 
                      background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                    }}>
                      <Shield size={18} />
                      Update Password
                    </button>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-white rounded-lg shadow border border-red-200 p-6">
                <h2 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h2>
                <p className="text-sm text-gray-600 mb-6">
                  These actions are permanent and cannot be undone. Please proceed with caution.
                </p>
                <div className="space-y-3">
                  <button className="w-full px-4 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2 border border-gray-300">
                    <Database size={18} />
                    Export All Data
                  </button>
                  <button className="w-full px-4 py-2 text-sm font-medium bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-lg transition-colors border border-orange-300">
                    Reset System Settings
                  </button>
                  <button className="w-full px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                    Delete All Records
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
