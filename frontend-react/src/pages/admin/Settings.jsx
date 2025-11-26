import { Save, User, Bell, Shield, Database, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const Settings = () => {
  const [notifications, setNotifications] = useState(true);
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [autoBackup, setAutoBackup] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-purple-50/20 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="animate-fade-in-down">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 dark:from-gray-100 dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">Settings</h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">Manage your application preferences and configurations</p>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <Card title="Profile Information" padding="lg">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  placeholder="John"
                  defaultValue="Administrator"
                />
                <Input
                  label="Last Name"
                  placeholder="Doe"
                  defaultValue="User"
                />
              </div>
              <Input
                label="Email Address"
                type="email"
                placeholder="admin@church.com"
                defaultValue="admin@church.com"
              />
              <Input
                label="Phone Number"
                type="tel"
                placeholder="+1 (555) 000-0000"
              />
              <div className="pt-4">
                <Button variant="primary">
                  <Save size={18} className="mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </Card>

          {/* Security Settings */}
          <Card title="Security" padding="lg">
            <div className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                placeholder="••••••••"
              />
              <Input
                label="New Password"
                type="password"
                placeholder="••••••••"
              />
              <Input
                label="Confirm New Password"
                type="password"
                placeholder="••••••••"
              />
              <div className="pt-4">
                <Button variant="secondary">
                  <Shield size={18} className="mr-2" />
                  Update Password
                </Button>
              </div>
            </div>
          </Card>

          {/* System Settings */}
          <Card title="System Preferences" padding="lg">
            <div className="space-y-6">
              {/* Notifications Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-2.5 rounded-xl">
                    <Bell size={20} className="text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Email Notifications</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Receive email alerts for important updates</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications}
                    onChange={(e) => setNotifications(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-2.5 rounded-xl">
                    {darkMode ? <Moon size={20} className="text-gray-700" /> : <Sun size={20} className="text-gray-700" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Dark Mode</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Switch to dark theme for better visibility</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={toggleDarkMode}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-700"></div>
                </label>
              </div>

              {/* Auto Backup Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-2.5 rounded-xl">
                    <Database size={20} className="text-gray-700" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Automatic Backup</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Enable daily automatic data backup</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoBackup}
                    onChange={(e) => setAutoBackup(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Account Info Card */}
          <Card padding="lg">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-600 to-primary-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <User size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">Administrator</h3>
              <p className="text-sm text-gray-600 mb-4">admin@church.com</p>
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">Member since</p>
                <p className="text-sm font-medium text-gray-900">January 2025</p>
              </div>
            </div>
          </Card>

          {/* Quick Stats */}
          <Card title="Account Activity" padding="lg">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Last Login</span>
                <span className="text-sm font-medium text-gray-900">Today, 9:30 AM</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Sessions</span>
                <span className="text-sm font-medium text-gray-900">247</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Account Status</span>
                <span className="px-3 py-1 bg-gradient-to-r from-blue-50 to-blue-100 text-primary-700 text-xs font-semibold rounded-full border border-blue-200">
                  Active
                </span>
              </div>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h3>
            <div className="space-y-3">
              <Button variant="outline" fullWidth className="text-gray-600 border-gray-300">
                Export Data
              </Button>
              <Button variant="danger" fullWidth>
                Delete Account
              </Button>
            </div>
          </Card>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Settings;
