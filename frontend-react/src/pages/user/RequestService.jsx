import { useState, useEffect } from 'react';
import { Plus, Baby, Heart, Church, MessageSquare, Calendar, FileText, X, Upload as UploadIcon } from 'lucide-react';
import ModalOverlay from '../../components/ModalOverlay';

const RequestService = () => {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestType, setRequestType] = useState('');
  const [formData, setFormData] = useState({
    type: '',
    name: '',
    contactNumber: '',
    email: '',
    preferredDate: '',
    preferredTime: '',
    notes: '',
    // Baptism specific
    childName: '',
    dateOfBirth: '',
    fatherName: '',
    motherName: '',
    // Wedding specific
    groomName: '',
    brideName: '',
    groomBirthdate: '',
    brideBirthdate: '',
    // Funeral specific
    deceasedName: '',
    dateOfDeath: '',
    relationship: '',
    // Counseling specific
    concernType: '',
    counselingNotes: ''
  });

  useEffect(() => {
    if (showRequestModal) {
      const header = document.querySelector('header');
      const sidebar = document.querySelector('aside');
      if (header) header.style.display = 'none';
      if (sidebar) sidebar.style.display = 'none';
    } else {
      const header = document.querySelector('header');
      const sidebar = document.querySelector('aside');
      if (header) header.style.display = '';
      if (sidebar) sidebar.style.display = '';
    }
  }, [showRequestModal]);

  const serviceTypes = [
    {
      id: 'baptism',
      title: 'Baptism',
      description: 'Request baptism service for your child',
      icon: Baby,
      requirements: ['Birth Certificate', 'Marriage Certificate of Parents', 'Baptismal Certificates of Godparents']
    },
    {
      id: 'wedding',
      title: 'Wedding',
      description: 'Request wedding ceremony at the church',
      icon: Heart,
      requirements: ['Birth Certificates', 'Baptismal Certificates', 'Confirmation Certificates', 'Pre-Cana Seminar Certificate']
    },
    {
      id: 'funeral',
      title: 'Funeral',
      description: 'Request funeral mass and burial service',
      icon: Church,
      requirements: ['Death Certificate', 'Baptismal Certificate of Deceased', 'Valid ID']
    },
    {
      id: 'counseling',
      title: 'Counseling',
      description: 'Request spiritual guidance or counseling',
      icon: MessageSquare,
      requirements: ['Valid ID']
    }
  ];

  const handleServiceClick = (service) => {
    setRequestType(service.id);
    setFormData({ ...formData, type: service.title });
    setShowRequestModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Request submitted:', formData);
    alert('Your request has been submitted successfully! You will receive a confirmation email shortly.');
    setShowRequestModal(false);
    setFormData({
      type: '',
      name: '',
      contactNumber: '',
      email: '',
      preferredDate: '',
      preferredTime: '',
      notes: '',
      childName: '',
      dateOfBirth: '',
      fatherName: '',
      motherName: '',
      groomName: '',
      brideName: '',
      groomBirthdate: '',
      brideBirthdate: '',
      deceasedName: '',
      dateOfDeath: '',
      relationship: '',
      concernType: '',
      counselingNotes: ''
    });
  };

  const renderFormFields = () => {
    switch(requestType) {
      case 'baptism':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Child's Full Name *</label>
              <input
                type="text"
                name="childName"
                value={formData.childName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Father's Name *</label>
                <input
                  type="text"
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mother's Name *</label>
                <input
                  type="text"
                  name="motherName"
                  value={formData.motherName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </>
        );
      case 'wedding':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Groom's Full Name *</label>
                <input
                  type="text"
                  name="groomName"
                  value={formData.groomName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Groom's Birthdate *</label>
                <input
                  type="date"
                  name="groomBirthdate"
                  value={formData.groomBirthdate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bride's Full Name *</label>
                <input
                  type="text"
                  name="brideName"
                  value={formData.brideName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bride's Birthdate *</label>
                <input
                  type="date"
                  name="brideBirthdate"
                  value={formData.brideBirthdate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </>
        );
      case 'funeral':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Deceased's Full Name *</label>
              <input
                type="text"
                name="deceasedName"
                value={formData.deceasedName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Death *</label>
                <input
                  type="date"
                  name="dateOfDeath"
                  value={formData.dateOfDeath}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Relationship *</label>
                <input
                  type="text"
                  name="relationship"
                  value={formData.relationship}
                  onChange={handleInputChange}
                  placeholder="e.g., Son, Daughter, Spouse"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </>
        );
      case 'counseling':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type of Counseling *</label>
              <select
                name="concernType"
                value={formData.concernType}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select type...</option>
                <option value="Marriage">Marriage Counseling</option>
                <option value="Family">Family Issues</option>
                <option value="Spiritual">Spiritual Guidance</option>
                <option value="Personal">Personal Concerns</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Brief Description *</label>
              <textarea
                name="counselingNotes"
                value={formData.counselingNotes}
                onChange={handleInputChange}
                rows={4}
                required
                placeholder="Please briefly describe your concern..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Request Church Services</h1>
          <p className="text-gray-600 mt-1">Choose a service to submit your request</p>
        </div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {serviceTypes.map((service) => (
            <button
              key={service.id}
              onClick={() => handleServiceClick(service)}
              className="bg-white rounded-lg shadow hover:shadow-md transition-all p-5 text-left border border-gray-200 hover:border-blue-300"
            >
              <div className="p-3 bg-gradient-to-br from-black via-[#0A1628] to-[#1E3A8A] rounded-lg inline-block mb-3">
                <service.icon className="text-white" size={28} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{service.description}</p>
              <div className="flex items-center gap-2 text-blue-600 font-medium">
                <span>Request Now</span>
                <Plus size={16} />
              </div>
            </button>
          ))}
        </div>

        {/* Requirements Section */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">General Requirements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {serviceTypes.map((service) => (
              <div key={service.id} className="space-y-3">
                <div className="flex items-center gap-2">
                  <service.icon className="text-blue-600" size={20} />
                  <h3 className="font-semibold text-gray-900">{service.title}</h3>
                </div>
                <ul className="space-y-2">
                  {service.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                      <FileText size={14} className="mt-1 text-blue-600 flex-shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
          <h3 className="font-bold text-blue-900 mb-3">Important Notes:</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• All requests are subject to approval by the church administration</li>
            <li>• Please ensure all required documents are ready before your scheduled date</li>
            <li>• You will receive a confirmation email within 2-3 business days</li>
            <li>• For urgent requests, please contact the church office directly</li>
          </ul>
        </div>
      </div>

      {/* Request Form Modal */}
      <ModalOverlay isOpen={showRequestModal} onClose={() => setShowRequestModal(false)}>
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-blue-500 ring-4 ring-blue-500/30">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Request {formData.type}</h2>
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="text-gray-500" size={24} />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">Please fill out all required fields</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Common Fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number *</label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Type-specific fields */}
              {renderFormFields()}

              {/* Preferred Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date *</label>
                  <input
                    type="date"
                    name="preferredDate"
                    value={formData.preferredDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time *</label>
                  <input
                    type="time"
                    name="preferredTime"
                    value={formData.preferredTime}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Any special requests or additional information..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium shadow-lg"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
      </ModalOverlay>
    </div>
  );
};

export default RequestService;
