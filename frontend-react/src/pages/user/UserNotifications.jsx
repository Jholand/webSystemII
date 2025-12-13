import { useState, useEffect } from 'react';
import { Bell, Check, Calendar, FileCheck, Mail, Settings } from 'lucide-react';
import { showSuccessToast, showInfoToast } from '../../utils/sweetAlertHelper';
import { userNotificationAPI } from '../../services/dataSync';
import Cookies from 'js-cookie';

const UserNotifications = () => {
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [notificationPrefs, setNotificationPrefs] = useState({
    bookingUpdates: true,
    certificateReady: true,
    scheduleApprovals: true,
    donationReceipts: true,
    generalAnnouncements: false,
  });

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId') || Cookies.get('userId');
    setUserId(storedUserId);
    if (storedUserId) {
      loadNotifications(storedUserId);
    }
  }, []);

  const loadNotifications = async (uid) => {
    try {
      setLoading(true);
      const data = await userNotificationAPI.getUserNotifications(uid);
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Get icon component based on notification type
  const getIconByType = (type) => {
    switch(type) {
      case 'certificate': return FileCheck;
      case 'booking': return Calendar;
      case 'schedule': return Calendar;
      default: return Bell;
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await userNotificationAPI.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      if (userId) {
        await userNotificationAPI.markAllAsRead(userId);
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleToggleEmailNotifications = () => {
    setEmailNotifications(!emailNotifications);
    showInfoToast('Updated', `Email notifications ${!emailNotifications ? 'enabled' : 'disabled'}`);
  };

  const handleSavePreferences = () => {
    showSuccessToast('Success!', 'Notification preferences saved');
    setShowSettings(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Notifications</h1>
            <p className="text-gray-600 text-sm mt-1">
              {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Check size={16} className="inline mr-1.5" />
                Mark All Read
              </button>
            )}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-black via-[#0A1628] to-[#1E3A8A] rounded-lg hover:opacity-90 transition-all"
            >
              <Settings size={16} className="inline mr-1.5" />
              Settings
            </button>
          </div>
        </div>

        {/* Email Notification Toggle */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail size={24} className="text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Email Notifications</h3>
                <p className="text-sm text-gray-600">Receive notifications via email</p>
              </div>
            </div>
            <button
              onClick={handleToggleEmailNotifications}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                emailNotifications ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  emailNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
            <div className="space-y-3">
              {Object.entries(notificationPrefs).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between py-2">
                  <label className="text-sm text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <button
                    onClick={() => setNotificationPrefs(prev => ({ ...prev, [key]: !value }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      value ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        value ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 justify-end mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePreferences}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-black via-[#0A1628] to-[#1E3A8A] rounded-lg hover:opacity-90 transition-all"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Notifications</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => {
              const Icon = getIconByType(notification.type);
              return (
                <div
                  key={notification.id}
                  className={`p-6 transition-colors ${
                    !notification.read ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2.5 rounded-lg ${
                      !notification.read ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <Icon size={20} className={!notification.read ? 'text-blue-600' : 'text-gray-600'} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className={`font-semibold ${
                          !notification.read ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full ml-2"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">{notification.date}</p>
                        <div className="flex gap-2">
                          {notification.link && (
                            <a
                              href={notification.link}
                              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                              View Details →
                            </a>
                          )}
                          {!notification.read && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="text-sm text-gray-600 hover:text-gray-800 font-medium ml-3"
                            >
                              Mark as Read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-gray-100 rounded-lg p-4 border border-gray-300">
          <div className="flex items-start gap-3">
            <Bell size={20} className="text-gray-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">About Notifications</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Notifications are sent when your bookings are processed</li>
                <li>• You'll be notified when certificates are ready for download</li>
                <li>• Reminders are sent for upcoming scheduled events</li>
                <li>• Enable email notifications to receive updates via email</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserNotifications;
