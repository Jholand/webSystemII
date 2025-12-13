import { useState } from 'react';
import { Download, FileCheck, Calendar } from 'lucide-react';
import { showSuccessToast, showInfoToast } from '../../utils/sweetAlertHelper';

const UserSacraments = () => {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedSacrament, setSelectedSacrament] = useState(null);
  const [requestData, setRequestData] = useState({
    contact: '+63 912 345 6789',
    purpose: '',
  });

  // Sample sacraments data
  const sacraments = [
    { 
      id: 1, 
      type: 'Baptism', 
      date: '1985-04-20', 
      location: 'St. Mary\'s Church',
      officiant: 'Fr. John Smith',
      status: 'Completed',
      certificateReady: true,
      certificateUrl: '#'
    },
    { 
      id: 2, 
      type: 'First Communion', 
      date: '1993-05-15', 
      location: 'St. Mary\'s Church',
      officiant: 'Fr. Robert Johnson',
      status: 'Completed',
      certificateReady: true,
      certificateUrl: '#'
    },
    { 
      id: 3, 
      type: 'Confirmation', 
      date: '1995-06-10', 
      location: 'St. Mary\'s Church',
      officiant: 'Bishop Michael Brown',
      status: 'Completed',
      certificateReady: false,
      certificateUrl: null
    },
    { 
      id: 4, 
      type: 'Marriage', 
      date: '2010-03-20', 
      location: 'St. Mary\'s Church',
      officiant: 'Fr. David Garcia',
      status: 'Completed',
      certificateReady: true,
      certificateUrl: '#'
    },
  ];

  const handleRequestCertificate = (sacrament) => {
    setSelectedSacrament(sacrament);
    setShowRequestModal(true);
  };

  const handleSubmitRequest = () => {
    if (requestData.purpose.trim()) {
      showSuccessToast('Success!', `Certificate request submitted for ${selectedSacrament.type}`);
      setShowRequestModal(false);
      setRequestData({ contact: '+63 912 345 6789', purpose: '' });
      setSelectedSacrament(null);
    }
  };

  const handleDownloadCertificate = (sacrament) => {
    showInfoToast('Downloading', `Downloading certificate for ${sacrament.type}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Sacraments</h1>
          <p className="text-gray-600 text-sm mt-1">View your sacrament records and request certificates</p>
        </div>

        {/* Sacraments List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sacraments.map((sacrament) => (
            <div key={sacrament.id} className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{sacrament.type}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600">{sacrament.date}</span>
                  </div>
                </div>
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  {sacrament.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div>
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="text-sm text-gray-900">{sacrament.location}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Officiant</p>
                  <p className="text-sm text-gray-900">{sacrament.officiant}</p>
                </div>
              </div>

              {sacrament.certificateReady ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                    <FileCheck size={16} className="text-green-600" />
                    <span className="text-sm text-green-800 font-medium">Certificate Ready</span>
                  </div>
                  <button
                    onClick={() => handleDownloadCertificate(sacrament)}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-black via-[#0A1628] to-[#1E3A8A] rounded-lg hover:opacity-90 transition-all"
                  >
                    <Download size={16} className="inline mr-1.5" />
                    Download Certificate
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleRequestCertificate(sacrament)}
                  className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Request Certificate
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">About Certificate Requests</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Certificate requests are processed by the church secretary</li>
            <li>• Processing typically takes 3-5 business days</li>
            <li>• You will receive a notification when your certificate is ready</li>
            <li>• Certificates can be downloaded directly from this page once ready</li>
          </ul>
        </div>

        {/* Request Certificate Modal */}
        {showRequestModal && selectedSacrament && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Request Certificate - {selectedSacrament.type}
              </h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    value={requestData.contact}
                    onChange={(e) => setRequestData({ ...requestData, contact: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purpose <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={requestData.purpose}
                    onChange={(e) => setRequestData({ ...requestData, purpose: e.target.value })}
                    placeholder="e.g., For employment requirements, School enrollment, etc."
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setShowRequestModal(false);
                    setSelectedSacrament(null);
                    setRequestData({ contact: '+63 912 345 6789', purpose: '' });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitRequest}
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-black via-[#0A1628] to-[#1E3A8A] rounded-lg hover:opacity-90 transition-all"
                >
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSacraments;
