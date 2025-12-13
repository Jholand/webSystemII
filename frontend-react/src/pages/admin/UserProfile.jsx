import { useState, useEffect } from 'react';
import { Save, AlertCircle, Bell, X, Check } from 'lucide-react';
import { showSuccessToast, showErrorToast } from '../../utils/sweetAlertHelper';
import { authAPI } from '../../services/authAPI';
import Cookies from 'js-cookie';
import ModalOverlay from '../../components/ModalOverlay';
import { correctionRequestAPI, userNotificationAPI, syncLocalStorageToDatabase, loadDataFromDatabase } from '../../services/dataSync';
import { formatDate } from '../../utils/dateFormatter';

const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [correctionRequest, setCorrectionRequest] = useState('');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [approvedFields, setApprovedFields] = useState([]);
  const [selectedFields, setSelectedFields] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotificationBanner, setShowNotificationBanner] = useState(false);

  // Display-only data
  const [memberInfo, setMemberInfo] = useState({
    memberId: 'MEM-001',
    dateJoined: '2020-01-15',
    familyGroup: 'Doe Family',
    name: 'John Doe',
    birthdate: '1985-03-15',
    gender: 'Male',
  });

  // Editable fields
  const [formData, setFormData] = useState({
    address: '123 Main Street, Barangay Centro',
    city: 'Manila',
    province: 'Metro Manila',
    postalCode: '1000',
    phone: '+63 912 345 6789',
    email: 'john.doe@email.com',
    emergencyContactName: 'Jane Doe',
    emergencyContactPhone: '+63 923 456 7890',
    emergencyContactRelation: 'Spouse',
  });

  const [originalData, setOriginalData] = useState(formData);

  // Load user profile from database
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const storedUserId = localStorage.getItem('userId') || Cookies.get('userId');
        if (storedUserId) {
          setUserId(storedUserId);
          
          // Load correction requests from database
          await loadDataFromDatabase(storedUserId);
          
          // Check for approved correction requests
          const response = await correctionRequestAPI.getUserRequests(storedUserId);
          const allRequests = response.data;
          
          console.log('🔍 All correction requests from DB:', allRequests);
          console.log('🔍 Current user ID:', storedUserId);
          
          const userApprovedRequest = allRequests.find(
            req => String(req.user_id) === String(storedUserId) && req.status === 'approved' && !req.completed
          );
          
          console.log('✅ Found approved request:', userApprovedRequest);
          
          if (userApprovedRequest) {
            console.log('📋 Request details:', {
              id: userApprovedRequest.id,
              status: userApprovedRequest.status,
              completed: userApprovedRequest.completed,
              fieldsToEdit: userApprovedRequest.fields_to_edit,
              hasFieldsToEdit: !!userApprovedRequest.fields_to_edit,
              fieldsLength: userApprovedRequest.fields_to_edit?.length
            });
            
            if (userApprovedRequest.fields_to_edit && Array.isArray(userApprovedRequest.fields_to_edit)) {
              console.log('📝 Setting approved fields:', userApprovedRequest.fields_to_edit);
              setApprovedFields(userApprovedRequest.fields_to_edit);
            } else {
              console.warn('⚠️ Old correction request format detected (no fields_to_edit). Marking as completed.');
              // Mark old requests as completed
              await correctionRequestAPI.update(userApprovedRequest.id, { completed: true });
              showErrorToast('Notice', 'Please submit a new correction request with specific fields selected.');
              setApprovedFields([]);
            }
          } else {
            console.log('ℹ️ No approved request found');
            setApprovedFields([]);
          }
          
          const profile = await authAPI.getProfile();
          
          // Update member info
          setMemberInfo(prev => ({
            ...prev,
            memberId: `MEM-${String(profile.id).padStart(3, '0')}`,
            name: profile.name,
            dateJoined: formatDate(profile.created_at),
            birthdate: profile.birthdate || 'Not provided',
            gender: profile.gender || 'Not provided',
            familyGroup: profile.family_group || 'Not assigned',
          }));
          
          // Update editable fields
          const updatedFormData = {
            email: profile.email,
            phone: profile.phone || '',
            address: profile.address || '',
            city: profile.city || '',
            province: profile.province || '',
            postalCode: profile.postal_code || '',
            emergencyContactName: profile.emergency_contact_name || '',
            emergencyContactPhone: profile.emergency_contact_phone || '',
            emergencyContactRelation: profile.emergency_contact_relation || '',
          };
          setFormData(updatedFormData);
          setOriginalData(updatedFormData);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        showErrorToast('Error', 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // Poll for approved correction requests and notifications every 5 seconds
  useEffect(() => {
    const checkApprovals = async () => {
      const storedUserId = localStorage.getItem('userId') || Cookies.get('userId');
      if (storedUserId) {
        try {
          // Check for approved requests from database
          const response = await correctionRequestAPI.getUserRequests(storedUserId);
          const allRequests = response.data;
          
          const userApprovedRequest = allRequests.find(
            req => String(req.user_id) === String(storedUserId) && req.status === 'approved' && !req.completed
          );
          
          if (userApprovedRequest && userApprovedRequest.fields_to_edit && Array.isArray(userApprovedRequest.fields_to_edit)) {
            setApprovedFields(userApprovedRequest.fields_to_edit);
            console.log('🔄 Polling: Updated approved fields:', userApprovedRequest.fields_to_edit);
          } else {
            setApprovedFields([]);
          }
          
          // Check for notifications from database
          const notificationsResponse = await userNotificationAPI.getUserNotifications(storedUserId);
          const allNotifications = notificationsResponse.data;
          
          setNotifications(allNotifications);
          
          const unreadNotifications = allNotifications.filter(n => !n.read);
          
          if (unreadNotifications.length > 0) {
            const latestNotification = unreadNotifications[unreadNotifications.length - 1];
            setNotification({
              type: latestNotification.type,
              message: latestNotification.message
            });
            setShowNotification(true);
            
            // Auto-dismiss after 5 seconds
            setTimeout(() => {
              setShowNotification(false);
            }, 5000);
          }
          
          // Show banner if there's an unread correction notification
          const hasUnreadCorrectionNotif = unreadNotifications.some(
            n => n.type === 'correction_approved' || n.type === 'correction_rejected'
          );
          setShowNotificationBanner(hasUnreadCorrectionNotif);
        } catch (error) {
          console.error('Error polling for updates:', error);
        }
      }
    };
    
    checkApprovals(); // Check immediately
    const interval = setInterval(checkApprovals, 5000);
    return () => clearInterval(interval);
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showCorrectionModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showCorrectionModal]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await authAPI.updateProfile({
        name: memberInfo.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        province: formData.province,
        postal_code: formData.postalCode,
        emergency_contact_name: formData.emergencyContactName,
        emergency_contact_phone: formData.emergencyContactPhone,
        emergency_contact_relation: formData.emergencyContactRelation,
      });
      
      // Mark correction request as completed in database
      const allRequests = await correctionRequestAPI.getUserRequests(userId);
      const approvedRequest = allRequests.data.find(
        req => String(req.user_id) === String(userId) && req.status === 'approved' && !req.completed
      );
      
      if (approvedRequest) {
        await correctionRequestAPI.update(approvedRequest.id, { completed: true });
      }
      
      await syncLocalStorageToDatabase(userId);
      
      // Clear approved fields
      setApprovedFields([]);
      
      // Update displayed data immediately
      setOriginalData(formData);
      showSuccessToast('Success!', 'Profile updated successfully');
      setIsEditing(false);
      
      // Reload profile to ensure data is in sync
      const profile = await authAPI.getProfile();
      const updatedFormData = {
        email: profile.email,
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        province: profile.province || '',
        postalCode: profile.postal_code || '',
        emergencyContactName: profile.emergency_contact_name || '',
        emergencyContactPhone: profile.emergency_contact_phone || '',
        emergencyContactRelation: profile.emergency_contact_relation || '',
      };
      setFormData(updatedFormData);
      setOriginalData(updatedFormData);
    } catch (error) {
      console.error('Error updating profile:', error);
      showErrorToast('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
  };

  const handleSubmitCorrection = async () => {
    if (correctionRequest.trim() && selectedFields.length > 0) {
      try {
        // Save correction request to database
        const newRequest = {
          user_id: userId,
          user_name: memberInfo.name,
          user_email: formData.email,
          member_id: memberInfo.memberId,
          request: correctionRequest,
          fields_to_edit: selectedFields,
          status: 'pending',
          completed: false,
        };
        
        await correctionRequestAPI.create(newRequest);
        await syncLocalStorageToDatabase(userId);
        
        showSuccessToast('Success!', 'Correction request submitted for church admin approval');
        setCorrectionRequest('');
        setSelectedFields([]);
        setShowCorrectionModal(false);
      } catch (error) {
        console.error('Error submitting correction request:', error);
        showErrorToast('Error', 'Failed to submit correction request');
      }
    } else if (selectedFields.length === 0) {
      showErrorToast('Error', 'Please select at least one field to edit');
    } else {
      showErrorToast('Error', 'Please describe the correction needed');
    }
  };
  
  const handleFieldToggle = (field) => {
    setSelectedFields(prev => 
      prev.includes(field) 
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };
  
  const isFieldEditable = (fieldName) => {
    if (!isEditing) return false;
    if (approvedFields.length === 0) return false;
    return approvedFields.includes(fieldName);
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await userNotificationAPI.markAsRead(notificationId);
      await syncLocalStorageToDatabase(userId);
      
      const response = await userNotificationAPI.getUserNotifications(userId);
      setNotifications(response.data);
      setShowNotificationBanner(false);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const dismissNotificationBanner = () => {
    // Mark all correction notifications as read
    const allNotifications = JSON.parse(localStorage.getItem('userNotifications') || '[]');
    const updated = allNotifications.map(n => 
      String(n.userId) === String(userId) && (n.type === 'correction_approved' || n.type === 'correction_rejected')
        ? { ...n, read: true }
        : n
    );
    localStorage.setItem('userNotifications', JSON.stringify(updated));
    setNotifications(updated.filter(n => String(n.userId) === String(userId)));
    setShowNotificationBanner(false);
  };

  const unreadNotifications = notifications.filter(n => !n.read);
  const latestCorrectionNotif = unreadNotifications.find(
    n => n.type === 'correction_approved' || n.type === 'correction_rejected'
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="space-y-6">
        {/* Notification Banner */}
        {showNotificationBanner && latestCorrectionNotif && (
          <div className={`rounded-lg border-l-4 p-4 shadow-md ${
            latestCorrectionNotif.type === 'correction_approved' 
              ? 'bg-green-50 border-green-500' 
              : 'bg-red-50 border-red-500'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                {latestCorrectionNotif.type === 'correction_approved' ? (
                  <div className="bg-green-100 rounded-full p-2">
                    <Check size={20} className="text-green-600" />
                  </div>
                ) : (
                  <div className="bg-red-100 rounded-full p-2">
                    <AlertCircle size={20} className="text-red-600" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className={`font-semibold text-sm ${
                    latestCorrectionNotif.type === 'correction_approved' ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {latestCorrectionNotif.title}
                  </h3>
                  <p className={`text-sm mt-1 ${
                    latestCorrectionNotif.type === 'correction_approved' ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {latestCorrectionNotif.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(latestCorrectionNotif.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={dismissNotificationBanner}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">My Profile</h1>
            <p className="text-gray-600 text-sm mt-1">View and update your profile information</p>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setShowCorrectionModal(true)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Request Correction
                </button>
                <button
                  onClick={() => {
                    console.log('🔘 Edit button clicked. Approved fields:', approvedFields);
                    setIsEditing(true);
                  }}
                  disabled={approvedFields.length === 0}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-all ${
                    approvedFields.length === 0 
                      ? 'opacity-50 cursor-not-allowed bg-gray-400' 
                      : 'hover:opacity-90'
                  }`}
                  style={{ backgroundColor: approvedFields.length === 0 ? '#9CA3AF' : '#4158D0' }}
                  title={approvedFields.length === 0 ? 'No approved correction request. Submit a request first.' : 'Click to edit approved fields'}
                >
                  Edit Profile {approvedFields.length > 0 && `(${approvedFields.length} fields)`}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-all"
                  style={{ backgroundColor: '#4158D0' }}
                >
                  <Save size={16} className="inline mr-1.5" />
                  Save Changes
                </button>
              </>
            )}
          </div>
        </div>

        {/* Display-Only Information */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Member Information (Read-Only)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Member ID</p>
              <p className="text-lg font-semibold text-gray-900 font-mono">{memberInfo.memberId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date Joined</p>
              <p className="text-lg font-semibold text-gray-900">{memberInfo.dateJoined}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Family Group</p>
              <p className="text-lg font-semibold text-gray-900">{memberInfo.familyGroup}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Full Name</p>
              <p className="text-lg font-semibold text-gray-900">{memberInfo.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Birthdate</p>
              <p className="text-lg font-semibold text-gray-900">{memberInfo.birthdate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Gender</p>
              <p className="text-lg font-semibold text-gray-900">{memberInfo.gender}</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-start gap-2">
            <AlertCircle size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-900">
              To update member information, birthdate, or family group, please submit a correction request using the button above.
            </p>
          </div>
        </div>

        {/* Approval Notice */}
        {approvedFields.length > 0 && (
          <div className="bg-green-50 rounded-lg shadow border border-green-200 p-4">
            <div className="flex items-start gap-3">
              <div className="bg-green-100 rounded-full p-2">
                <AlertCircle size={20} className="text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-green-900 mb-1">Correction Request Approved</h3>
                <p className="text-sm text-green-700 mb-2">
                  Your request to edit the following fields has been approved. Click "Edit Profile" to make your changes.
                </p>
                <div className="flex flex-wrap gap-2">
                  {approvedFields.map((field) => (
                    <span key={field} className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full border border-green-300">
                      {field === 'emergencyContactName' ? 'Emergency Contact Name' :
                       field === 'emergencyContactPhone' ? 'Emergency Contact Phone' :
                       field === 'emergencyContactRelation' ? 'Emergency Contact Relationship' :
                       field === 'postalCode' ? 'Postal Code' :
                       field.charAt(0).toUpperCase() + field.slice(1)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
                {isEditing && isFieldEditable('email') && (
                  <span className="ml-2 text-xs text-green-600 font-semibold">✓ Editable</span>
                )}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isFieldEditable('email')}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  !isFieldEditable('email') ? 'bg-gray-50 text-gray-600 border-gray-300' : 'border-green-400 bg-green-50'
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
                {isEditing && isFieldEditable('phone') && (
                  <span className="ml-2 text-xs text-green-600 font-semibold">✓ Editable</span>
                )}
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isFieldEditable('phone')}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  !isFieldEditable('phone') ? 'bg-gray-50 text-gray-600 border-gray-300' : 'border-green-400 bg-green-50'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Address</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address
                {isEditing && isFieldEditable('address') && (
                  <span className="ml-2 text-xs text-green-600 font-semibold">✓ Editable</span>
                )}
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                disabled={!isFieldEditable('address')}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  !isFieldEditable('address') ? 'bg-gray-50 text-gray-600 border-gray-300' : 'border-green-400 bg-green-50'
                }`}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                  {isEditing && isFieldEditable('city') && (
                    <span className="ml-2 text-xs text-green-600 font-semibold">✓ Editable</span>
                  )}
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={!isFieldEditable('city')}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    !isFieldEditable('city') ? 'bg-gray-50 text-gray-600 border-gray-300' : 'border-green-400 bg-green-50'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Province
                  {isEditing && isFieldEditable('province') && (
                    <span className="ml-2 text-xs text-green-600 font-semibold">✓ Editable</span>
                  )}
                </label>
                <input
                  type="text"
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  disabled={!isFieldEditable('province')}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    !isFieldEditable('province') ? 'bg-gray-50 text-gray-600 border-gray-300' : 'border-green-400 bg-green-50'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Postal Code
                  {isEditing && isFieldEditable('postalCode') && (
                    <span className="ml-2 text-xs text-green-600 font-semibold">✓ Editable</span>
                  )}
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  disabled={!isFieldEditable('postalCode')}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    !isFieldEditable('postalCode') ? 'bg-gray-50 text-gray-600 border-gray-300' : 'border-green-400 bg-green-50'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Name
                {isEditing && isFieldEditable('emergencyContactName') && (
                  <span className="ml-2 text-xs text-green-600 font-semibold">✓ Editable</span>
                )}
              </label>
              <input
                type="text"
                name="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={handleChange}
                disabled={!isFieldEditable('emergencyContactName')}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  !isFieldEditable('emergencyContactName') ? 'bg-gray-50 text-gray-600 border-gray-300' : 'border-green-400 bg-green-50'
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Phone
                {isEditing && isFieldEditable('emergencyContactPhone') && (
                  <span className="ml-2 text-xs text-green-600 font-semibold">✓ Editable</span>
                )}
              </label>
              <input
                type="tel"
                name="emergencyContactPhone"
                value={formData.emergencyContactPhone}
                onChange={handleChange}
                disabled={!isFieldEditable('emergencyContactPhone')}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  !isFieldEditable('emergencyContactPhone') ? 'bg-gray-50 text-gray-600 border-gray-300' : 'border-green-400 bg-green-50'
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Relationship
                {isEditing && isFieldEditable('emergencyContactRelation') && (
                  <span className="ml-2 text-xs text-green-600 font-semibold">✓ Editable</span>
                )}
              </label>
              <input
                type="text"
                name="emergencyContactRelation"
                value={formData.emergencyContactRelation}
                onChange={handleChange}
                disabled={!isFieldEditable('emergencyContactRelation')}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  !isFieldEditable('emergencyContactRelation') ? 'bg-gray-50 text-gray-600 border-gray-300' : 'border-green-400 bg-green-50'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Correction Request Modal */}
        <ModalOverlay isOpen={showCorrectionModal} onClose={() => setShowCorrectionModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Profile Correction</h3>
            <p className="text-sm text-gray-600 mb-4">
              Select the fields you want to edit and describe the correction needed. Once approved by the church admin, you'll be able to edit only the selected fields.
            </p>
            
            {/* Field Selection */}
            <div className="mb-4 p-4 border border-gray-300 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Select Fields to Edit:</h4>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedFields.includes('email')}
                    onChange={() => handleFieldToggle('email')}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span>Email</span>
                </label>
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedFields.includes('phone')}
                    onChange={() => handleFieldToggle('phone')}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span>Phone Number</span>
                </label>
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedFields.includes('address')}
                    onChange={() => handleFieldToggle('address')}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span>Street Address</span>
                </label>
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedFields.includes('city')}
                    onChange={() => handleFieldToggle('city')}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span>City</span>
                </label>
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedFields.includes('province')}
                    onChange={() => handleFieldToggle('province')}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span>Province</span>
                </label>
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedFields.includes('postalCode')}
                    onChange={() => handleFieldToggle('postalCode')}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span>Postal Code</span>
                </label>
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedFields.includes('emergencyContactName')}
                    onChange={() => handleFieldToggle('emergencyContactName')}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span>Emergency Contact Name</span>
                </label>
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedFields.includes('emergencyContactPhone')}
                    onChange={() => handleFieldToggle('emergencyContactPhone')}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span>Emergency Contact Phone</span>
                </label>
                <label className="flex items-center space-x-2 text-sm col-span-2">
                  <input
                    type="checkbox"
                    checked={selectedFields.includes('emergencyContactRelation')}
                    onChange={() => handleFieldToggle('emergencyContactRelation')}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span>Emergency Contact Relationship</span>
                </label>
              </div>
              {selectedFields.length > 0 && (
                <div className="mt-3 text-xs text-blue-600">
                  {selectedFields.length} field(s) selected
                </div>
              )}
            </div>
            
            <textarea
              value={correctionRequest}
              onChange={(e) => setCorrectionRequest(e.target.value)}
              placeholder="Describe why you need to make these changes..."
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowCorrectionModal(false);
                  setSelectedFields([]);
                  setCorrectionRequest('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitCorrection}
                className="px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-all"
                style={{ backgroundColor: '#4158D0' }}
              >
                Submit Request
              </button>
            </div>
          </div>
        </ModalOverlay>
      </div>
    </div>
  );
};

export default UserProfile;
