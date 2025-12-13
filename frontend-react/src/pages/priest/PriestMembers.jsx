import { useState } from 'react';
import { Search, Users, Phone, Mail, MapPin, Eye, X } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const PriestMembers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const members = [
    {
      id: 1,
      name: 'John Michael Doe',
      family: 'Doe Family',
      status: 'Active',
      phone: '+63 912 345 6789',
      email: 'john.doe@email.com',
      address: '123 Main St, Brgy Centro',
      dateJoined: '2020-01-15',
      sacraments: [
        { type: 'Baptism', date: '1985-03-20', certificate: 'BAPT-1985-001' },
        { type: 'First Communion', date: '1992-05-10', certificate: 'FC-1992-045' },
        { type: 'Confirmation', date: '1995-04-15', certificate: 'CONF-1995-023' }
      ],
      familyMembers: ['Mary Jane Doe (Wife)', 'Baby Michael Doe (Son)']
    },
    {
      id: 2,
      name: 'Maria Santos',
      family: 'Santos Family',
      status: 'Active',
      phone: '+63 923 456 7890',
      email: 'maria.santos@email.com',
      address: '456 Church Ave, Brgy San Jose',
      dateJoined: '2018-06-20',
      sacraments: [
        { type: 'Baptism', date: '1990-08-12', certificate: 'BAPT-1990-089' },
        { type: 'Wedding', date: '2015-12-05', certificate: 'MARR-2015-034' }
      ],
      familyMembers: ['Pedro Santos (Husband)', 'Sofia Santos (Daughter)', 'Lucas Santos (Son)']
    },
    {
      id: 3,
      name: 'Robert Johnson',
      family: 'Johnson Family',
      status: 'Inactive',
      phone: '+63 934 567 8901',
      email: 'robert.j@email.com',
      address: '789 Peace St, Brgy Bagong Bayan',
      dateJoined: '2015-03-10',
      sacraments: [
        { type: 'Baptism', date: '1988-11-25', certificate: 'BAPT-1988-134' }
      ],
      familyMembers: ['Jennifer Johnson (Wife)']
    },
    {
      id: 4,
      name: 'Anna Rodriguez',
      family: 'Rodriguez Family',
      status: 'Active',
      phone: '+63 945 678 9012',
      email: 'anna.rod@email.com',
      address: '321 Hope Rd, Brgy Maligaya',
      dateJoined: '2021-09-15',
      sacraments: [
        { type: 'Baptism', date: '2000-04-18', certificate: 'BAPT-2000-067' },
        { type: 'Confirmation', date: '2013-10-20', certificate: 'CONF-2013-089' }
      ],
      familyMembers: ['Carlos Rodriguez (Father)', 'Elena Rodriguez (Mother)']
    }
  ];

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.family.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || member.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (member) => {
    setSelectedMember(member);
    setShowDetailModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-purple-50/20 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="animate-fade-in-down">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 dark:from-gray-100 dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
            Members Directory
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
            View parishioner information and sacrament history
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
          <div className="flex items-start">
            <Users className="text-blue-600 mr-3 mt-0.5" size={20} />
            <div>
              <p className="text-sm font-medium text-blue-800">View-Only Access</p>
              <p className="text-sm text-blue-700 mt-1">
                Member records are managed by the Church Admin/Secretary. You can view parishioner information, sacrament history, and family details. User accounts are not visible to maintain privacy.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card padding="lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Members</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{members.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Users size={24} className="text-blue-600 dark:text-blue-300" />
              </div>
            </div>
          </Card>

          <Card padding="lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Members</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {members.filter(m => m.status === 'Active').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <Users size={24} className="text-green-600 dark:text-green-300" />
              </div>
            </div>
          </Card>

          <Card padding="lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Families</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {new Set(members.map(m => m.family)).size}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Users size={24} className="text-purple-600 dark:text-purple-300" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card title="Search & Filter" padding="lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Search"
                icon={<Search size={18} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or family..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Members Table */}
        <Card title={`Members (${filteredMembers.length} records)`} padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Family</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{member.name}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{member.family}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        member.status === 'Active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-gray-100">{member.phone}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{member.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewDetails(member)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Member Details</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Personal Info */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Personal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Full Name</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{selectedMember.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Family</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{selectedMember.family}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      selectedMember.status === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedMember.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Date Joined</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{selectedMember.dateJoined}</p>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Contact Information</h4>
                <div className="space-y-3 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Phone size={18} className="text-gray-400" />
                    <span className="text-gray-900 dark:text-gray-100">{selectedMember.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={18} className="text-gray-400" />
                    <span className="text-gray-900 dark:text-gray-100">{selectedMember.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-gray-400" />
                    <span className="text-gray-900 dark:text-gray-100">{selectedMember.address}</span>
                  </div>
                </div>
              </div>

              {/* Family Members */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Family Members</h4>
                <ul className="space-y-2 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  {selectedMember.familyMembers.map((member, idx) => (
                    <li key={idx} className="text-gray-900 dark:text-gray-100">• {member}</li>
                  ))}
                </ul>
              </div>

              {/* Sacrament History */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Sacrament History</h4>
                <div className="space-y-3">
                  {selectedMember.sacraments.map((sacrament, idx) => (
                    <div key={idx} className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-gray-100">{sacrament.type}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Date: {sacrament.date}</p>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Cert: {sacrament.certificate}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
              <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriestMembers;
