import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, Save, Eye, Plus, Edit, Trash2 } from 'lucide-react';
import { showSuccessToast } from '../../utils/sweetAlertHelper';

const RolePermissions = () => {
  const { role } = useParams();
  const navigate = useNavigate();

  const roleLabels = {
    admin: 'Administrator',
    priest: 'Priest',
    accountant: 'Accountant',
    church_admin: 'Church Admin',
    user: 'User',
  };

  const modules = [
    {
      name: 'Birth Records',
      key: 'birth_records',
      description: 'Manage birth certificates and records'
    },
    {
      name: 'Marriage Records',
      key: 'marriage_records',
      description: 'Manage marriage certificates and records'
    },
    {
      name: 'Donations',
      key: 'donations',
      description: 'Track donations and collections'
    },
    {
      name: 'Calendar',
      key: 'calendar',
      description: 'Schedule events and masses'
    },
    {
      name: 'Membership',
      key: 'membership',
      description: 'Manage church members and priests'
    },
    {
      name: 'User Management',
      key: 'user_management',
      description: 'Manage system users and accounts'
    },
    {
      name: 'Settings',
      key: 'settings',
      description: 'Configure system settings'
    },
    {
      name: 'Reports',
      key: 'reports',
      description: 'View and generate reports'
    },
  ];

  const [permissions, setPermissions] = useState(() => {
    // Initialize with default permissions based on role
    const defaultPermissions = {};
    modules.forEach(module => {
      if (role === 'admin') {
        defaultPermissions[module.key] = { view: true, create: true, edit: true, delete: true };
      } else if (role === 'priest') {
        defaultPermissions[module.key] = { view: true, create: true, edit: true, delete: false };
      } else if (role === 'accountant') {
        defaultPermissions[module.key] = { 
          view: ['donations', 'reports'].includes(module.key), 
          create: module.key === 'donations',
          edit: module.key === 'donations',
          delete: false
        };
      } else if (role === 'church_admin') {
        defaultPermissions[module.key] = { view: true, create: true, edit: true, delete: false };
      } else {
        defaultPermissions[module.key] = { view: false, create: false, edit: false, delete: false };
      }
    });
    return defaultPermissions;
  });

  const handlePermissionToggle = (moduleKey, permissionType) => {
    setPermissions(prev => ({
      ...prev,
      [moduleKey]: {
        ...prev[moduleKey],
        [permissionType]: !prev[moduleKey][permissionType]
      }
    }));
  };

  const handleSave = () => {
    // Save permissions logic here
    console.log('Saving permissions for role:', role, permissions);
    showSuccessToast('Saved!', `Permissions for ${roleLabels[role]} have been saved successfully!`);
  };

  const getRoleBadgeColor = (roleKey) => {
    switch (roleKey) {
      case 'admin': return 'bg-red-100 text-red-700 border-red-200';
      case 'priest': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'accountant': return 'bg-green-100 text-green-700 border-green-200';
      case 'church_admin': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'user': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen p-6 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/accounts')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to User Management
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Shield size={28} className="text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Role Permissions</h1>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-gray-600">Editing permissions for:</span>
                  <span className={`px-4 py-1 text-sm font-semibold rounded-full border ${getRoleBadgeColor(role)}`}>
                    {roleLabels[role]}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold shadow-lg hover:shadow-xl"
            >
              <Save size={20} />
              Save Changes
            </button>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Permissions control what users with this role can access and perform in the system. 
            Toggle each permission to enable or disable specific actions for this role.
          </p>
        </div>

        {/* Permissions Table */}
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-1/3">Module</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center justify-center gap-2">
                    <Eye size={16} />
                    View
                  </div>
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center justify-center gap-2">
                    <Plus size={16} />
                    Create
                  </div>
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center justify-center gap-2">
                    <Edit size={16} />
                    Edit
                  </div>
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center justify-center gap-2">
                    <Trash2 size={16} />
                    Delete
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {modules.map((module) => (
                <tr key={module.key} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{module.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{module.description}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={permissions[module.key]?.view || false}
                        onChange={() => handlePermissionToggle(module.key, 'view')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={permissions[module.key]?.create || false}
                        onChange={() => handlePermissionToggle(module.key, 'create')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={permissions[module.key]?.edit || false}
                        onChange={() => handlePermissionToggle(module.key, 'edit')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
                    </label>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={permissions[module.key]?.delete || false}
                        onChange={() => handlePermissionToggle(module.key, 'delete')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Card */}
        <div className="mt-6 bg-white rounded-lg shadow p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Permission Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-blue-600 font-medium">View Access</p>
              <p className="text-2xl font-bold text-blue-700 mt-1">
                {Object.values(permissions).filter(p => p.view).length}/{modules.length}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-sm text-green-600 font-medium">Create Access</p>
              <p className="text-2xl font-bold text-green-700 mt-1">
                {Object.values(permissions).filter(p => p.create).length}/{modules.length}
              </p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <p className="text-sm text-yellow-600 font-medium">Edit Access</p>
              <p className="text-2xl font-bold text-yellow-700 mt-1">
                {Object.values(permissions).filter(p => p.edit).length}/{modules.length}
              </p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <p className="text-sm text-red-600 font-medium">Delete Access</p>
              <p className="text-2xl font-bold text-red-700 mt-1">
                {Object.values(permissions).filter(p => p.delete).length}/{modules.length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolePermissions;
