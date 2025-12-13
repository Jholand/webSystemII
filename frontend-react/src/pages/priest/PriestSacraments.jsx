import { useState } from 'react';
import { Search, Download, Eye, X, FileText, Calendar } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { showInfoToast } from '../../utils/sweetAlertHelper';

const PriestSacraments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const sacramentRecords = [
    {
      id: 1,
      name: 'Baby Michael Doe',
      type: 'Baptism',
      date: '2025-11-28',
      encodedBy: 'Admin User',
      status: 'Completed',
      performedBy: 'Fr. Joseph Smith',
      parents: 'John & Mary Doe',
      sponsors: 'Robert Smith, Anna Cruz',
      certificateNumber: 'BAPT-2025-001',
      files: ['baptism-cert.pdf', 'photo-1.jpg']
    },
    {
      id: 2,
      name: 'Robert Cruz & Jennifer Santos',
      type: 'Wedding',
      date: '2025-11-25',
      encodedBy: 'Church Admin',
      status: 'Completed',
      performedBy: 'Fr. Joseph Smith',
      witnesses: 'Michael Doe, Sarah Johnson',
      certificateNumber: 'MARR-2025-034',
      files: ['marriage-cert.pdf']
    },
    {
      id: 3,
      name: 'Anna Rodriguez',
      type: 'Confirmation',
      date: '2025-11-20',
      encodedBy: 'Admin User',
      status: 'Completed',
      performedBy: 'Fr. Joseph Smith',
      sponsor: 'Maria Elena Santos',
      certificateNumber: 'CONF-2025-089',
      files: ['confirmation-cert.pdf', 'photo-2.jpg']
    },
    {
      id: 4,
      name: 'Sofia Martinez',
      type: 'Baptism',
      date: '2025-11-15',
      encodedBy: 'Church Admin',
      status: 'Completed',
      performedBy: 'Fr. Joseph Smith',
      parents: 'Carlos & Maria Martinez',
      sponsors: 'Juan dela Cruz, Elena Reyes',
      certificateNumber: 'BAPT-2025-002',
      files: ['baptism-cert.pdf']
    }
  ];

  const filteredRecords = sacramentRecords.filter(record => {
    const matchesSearch = record.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || record.type === filterType;
    
    let matchesDate = true;
    if (dateFrom && dateTo) {
      const recordDate = new Date(record.date);
      matchesDate = recordDate >= new Date(dateFrom) && recordDate <= new Date(dateTo);
    }

    return matchesSearch && matchesType && matchesDate;
  });

  const handleViewDetails = (record) => {
    setSelectedRecord(record);
    setShowDetailModal(true);
  };

  const handleDownloadCertificate = (record) => {
    showInfoToast('Downloading', `Downloading certificate: ${record.certificateNumber}`);
  };

  const getSacramentColor = (type) => {
    const colors = {
      Baptism: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      Wedding: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      Confirmation: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-purple-50/20 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="animate-fade-in-down">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 dark:from-gray-100 dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
            Sacrament Records
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
            View and search sacrament records and certificates
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
          <div className="flex items-start">
            <FileText className="text-blue-600 mr-3 mt-0.5" size={20} />
            <div>
              <p className="text-sm font-medium text-blue-800">View-Only Access</p>
              <p className="text-sm text-blue-700 mt-1">
                These sacrament records are encoded and managed by the Church Admin/Secretary. You have read-only access to view records, certificates, and member information.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card padding="lg">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Records</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{sacramentRecords.length}</p>
            </div>
          </Card>

          <Card padding="lg">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Baptisms</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {sacramentRecords.filter(r => r.type === 'Baptism').length}
              </p>
            </div>
          </Card>

          <Card padding="lg">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Weddings</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {sacramentRecords.filter(r => r.type === 'Wedding').length}
              </p>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card title="Search & Filter" padding="lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Input
                label="Search by Name"
                icon={<Search size={18} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sacrament Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
              >
                <option value="all">All Types</option>
                <option value="Baptism">Baptism</option>
                <option value="Wedding">Wedding</option>
                <option value="Confirmation">Confirmation</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date From
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date To
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>
          </div>
        </Card>

        {/* Records Table */}
        <Card title={`Sacrament Records (${filteredRecords.length} records)`} padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Encoded By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{record.name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getSacramentColor(record.type)}`}>
                        {record.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{record.date}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{record.encodedBy}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewDetails(record)}
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
      {showDetailModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Sacrament Record Details</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedRecord.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Type</p>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getSacramentColor(selectedRecord.type)}`}>
                      {selectedRecord.type}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Date</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedRecord.date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Certificate Number</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedRecord.certificateNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Performed By</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedRecord.performedBy}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Encoded By</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedRecord.encodedBy}</p>
                  </div>
                </div>

                {selectedRecord.parents && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Parents</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedRecord.parents}</p>
                  </div>
                )}

                {selectedRecord.sponsors && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Sponsors/Godparents</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedRecord.sponsors}</p>
                  </div>
                )}

                {selectedRecord.witnesses && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Witnesses</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{selectedRecord.witnesses}</p>
                  </div>
                )}
              </div>

              {/* Uploaded Files */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Uploaded Files</h4>
                <div className="space-y-2">
                  {selectedRecord.files.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText size={20} className="text-gray-400" />
                        <span className="text-sm text-gray-900 dark:text-gray-100">{file}</span>
                      </div>
                      <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                        <Download size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certificate Preview */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Certificate Preview</h4>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                  <FileText size={48} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">Certificate preview would appear here</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                Close
              </Button>
              <Button variant="primary" onClick={() => handleDownloadCertificate(selectedRecord)}>
                <Download size={18} className="mr-2" />
                Download Certificate
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriestSacraments;
