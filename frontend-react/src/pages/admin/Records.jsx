import { useState, useEffect } from 'react';
import { FileText, Heart, Baby, Users, DollarSign } from 'lucide-react';
import MarriageRecords from './MarriageRecords';
import BirthRecords from './BirthRecords';
import Swal from 'sweetalert2';
import { formatDate } from '../../utils/dateFormatter';

const Records = () => {
  const [activeTab, setActiveTab] = useState('marriage');
  const [selectedOtherRecord, setSelectedOtherRecord] = useState(null);
  const [paidBills, setPaidBills] = useState([]);

  // Load paid bills from localStorage
  useEffect(() => {
    const loadPaidBills = () => {
      const notifications = JSON.parse(localStorage.getItem('churchAdminNotifications') || '[]');
      console.log('📥 Loading notifications from localStorage:', notifications);
      const paymentNotifications = notifications.filter(n => n.type === 'payment');
      console.log('💰 Filtered payment notifications:', paymentNotifications);
      setPaidBills(paymentNotifications);
    };
    
    loadPaidBills();
    
    // Poll for updates every 5 seconds
    const interval = setInterval(loadPaidBills, 5000);
    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 'marriage', label: 'Marriage Records', icon: Heart },
    { id: 'baptism', label: 'Baptism Records', icon: Baby },
    { id: 'billing', label: 'Paid Bills', icon: DollarSign },
    { id: 'others', label: 'Other Records', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#4158D0' }}>Records Management</h1>
            <p className="text-gray-600 mt-1">Manage church sacramental and administrative records</p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-3">
          <nav className="flex gap-2" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm
                    transition-all duration-200
                    ${isActive
                      ? 'text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-50'
                    }
                  `}
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
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-4">
          {activeTab === 'marriage' && (
            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
              <MarriageRecords />
            </div>
          )}
          
          {activeTab === 'baptism' && (
            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
              <BirthRecords />
            </div>
          )}
          
          {/* Paid Bills Tab */}
          {activeTab === 'billing' && (
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Paid Bills Overview
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Track all payments that have been marked as paid by the accountant
              </p>
              
              {paidBills.length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No paid bills recorded yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {paidBills.map((bill) => (
                    <div
                      key={bill.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <DollarSign size={18} className="text-green-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {bill.title}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {bill.message}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500 ml-12">
                            <span className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                              </svg>
                              {formatDate(bill.timestamp)}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                              {new Date(bill.timestamp).toLocaleTimeString()}
                            </span>
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                              Paid
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'others' && !selectedOtherRecord && (
            <div className="bg-white rounded-lg shadow border border-gray-200 p-8">
              <div className="text-center mb-8">
                <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Other Records
                </h3>
                <p className="text-gray-500 mb-6">
                  Select a record type to view and manage
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Confirmation Records */}
                <button
                  onClick={() => setSelectedOtherRecord('confirmation')}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md hover:border-blue-500 transition-all text-left"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users size={24} className="text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900">Confirmation Records</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Records of confirmation sacrament ceremonies
                  </p>
                </button>

                {/* First Communion Records */}
                <button
                  onClick={() => setSelectedOtherRecord('communion')}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md hover:border-blue-500 transition-all text-left"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Heart size={24} className="text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900">First Communion</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Records of first holy communion ceremonies
                  </p>
                </button>

                {/* Funeral Records */}
                <button
                  onClick={() => setSelectedOtherRecord('funeral')}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md hover:border-gray-500 transition-all text-left"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <FileText size={24} className="text-gray-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900">Funeral Records</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Records of funeral and memorial services
                  </p>
                </button>

                {/* Blessing Records */}
                <button
                  onClick={() => setSelectedOtherRecord('blessing')}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md hover:border-green-500 transition-all text-left"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FileText size={24} className="text-green-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900">Blessing Records</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    House blessings, vehicle blessings, and other special blessings
                  </p>
                </button>

                {/* Mass Intention Records */}
                <button
                  onClick={() => setSelectedOtherRecord('mass-intention')}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md hover:border-yellow-500 transition-all text-left"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <FileText size={24} className="text-yellow-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900">Mass Intentions</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Records of mass intentions and dedications
                  </p>
                </button>

                {/* Certificate Requests */}
                <button
                  onClick={() => setSelectedOtherRecord('certificate')}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md hover:border-blue-500 transition-all text-left"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <FileText size={24} className="text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900">Certificate Requests</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    Requests for sacramental certificates
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Other Record Details View */}
          {activeTab === 'others' && selectedOtherRecord && (
            <div className="space-y-4">
              {/* Back Button and Header */}
              <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
                <button
                  onClick={() => setSelectedOtherRecord(null)}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Other Records
                </button>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedOtherRecord === 'confirmation' && 'Confirmation Records'}
                  {selectedOtherRecord === 'communion' && 'First Communion Records'}
                  {selectedOtherRecord === 'funeral' && 'Funeral Records'}
                  {selectedOtherRecord === 'blessing' && 'Blessing Records'}
                  {selectedOtherRecord === 'mass-intention' && 'Mass Intention Records'}
                  {selectedOtherRecord === 'certificate' && 'Certificate Request Records'}
                </h2>
              </div>

              {/* Content Area */}
              <div className="bg-white rounded-lg shadow border border-gray-200 p-8">
                <div className="text-center">
                  <FileText size={64} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No Records Available
                  </h3>
                  <p className="text-gray-500">
                    This record type is under development. Records will be displayed here once the feature is implemented.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Records;
