import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Eye, Edit, Filter } from 'lucide-react';

const SecretaryMembers = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Sample members data
  const members = [
    { id: 'MEM-001', name: 'John Doe', familyHead: 'John Doe', contact: '+63 912 345 6789', status: 'Active', joinDate: '2020-01-15' },
    { id: 'MEM-002', name: 'Maria Santos', familyHead: 'Pedro Santos', contact: '+63 923 456 7890', status: 'Active', joinDate: '2019-05-20' },
    { id: 'MEM-003', name: 'Pedro Santos', familyHead: 'Pedro Santos', contact: '+63 923 456 7890', status: 'Active', joinDate: '2019-05-20' },
    { id: 'MEM-004', name: 'Anna Rodriguez', familyHead: 'Robert Rodriguez', contact: '+63 934 567 8901', status: 'Active', joinDate: '2021-03-10' },
    { id: 'MEM-005', name: 'Robert Rodriguez', familyHead: 'Robert Rodriguez', contact: '+63 934 567 8901', status: 'Active', joinDate: '2021-03-10' },
    { id: 'MEM-006', name: 'Baby Maria Santos', familyHead: 'Pedro Santos', contact: '+63 923 456 7890', status: 'Active', joinDate: '2025-11-01' },
    { id: 'MEM-007', name: 'Jose Cruz', familyHead: 'Jose Cruz', contact: '+63 945 678 9012', status: 'Inactive', joinDate: '2018-07-22' },
    { id: 'MEM-008', name: 'Elena Garcia', familyHead: 'Jose Cruz', contact: '+63 945 678 9012', status: 'Active', joinDate: '2018-07-22' },
  ];

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.contact.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || member.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Member Management</h1>
            <p className="text-gray-600 text-sm mt-1">Manage church members and families</p>
          </div>
          <button
            onClick={() => navigate('/church-admin/secretary/members/new')}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-black via-[#0A1628] to-[#1E3A8A] rounded-lg hover:opacity-90 transition-all"
          >
            <Plus size={16} className="inline mr-1.5" />
            Add New Member
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, member ID, or contact..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <div className="relative">
                <Filter size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow border border-gray-200">
            <p className="text-sm text-gray-600">Total Members</p>
            <p className="text-2xl font-bold text-gray-900">{members.length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow border border-gray-200">
            <p className="text-sm text-gray-600">Active Members</p>
            <p className="text-2xl font-bold text-green-600">{members.filter(m => m.status === 'Active').length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow border border-gray-200">
            <p className="text-sm text-gray-600">Families</p>
            <p className="text-2xl font-bold text-blue-600">{new Set(members.map(m => m.familyHead)).size}</p>
          </div>
        </div>

        {/* Members Table */}
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Member ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Family Head</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono text-gray-900">{member.id}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{member.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{member.familyHead}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{member.contact}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        member.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/church-admin/secretary/members/${member.id}`)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => navigate(`/church-admin/secretary/members/${member.id}/edit`)}
                          className="p-1.5 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                          title="Edit Member"
                        >
                          <Edit size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecretaryMembers;
