import { useState } from 'react';
import { Upload, Download, FileText, Database, Calendar, DollarSign, Users, AlertCircle, CheckCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { showErrorToast, showInfoToast } from '../../utils/sweetAlertHelper';

const DataManagement = () => {
  const [activeTab, setActiveTab] = useState('export');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState(null);
  const [fieldMapping, setFieldMapping] = useState({});

  // Export state
  const [exportEntity, setExportEntity] = useState('members');
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportDateFrom, setExportDateFrom] = useState('');
  const [exportDateTo, setExportDateTo] = useState('');

  const entities = [
    { value: 'members', label: 'Church Members', icon: Users, count: 1234 },
    { value: 'births', label: 'Birth Records', icon: FileText, count: 856 },
    { value: 'marriages', label: 'Marriage Records', icon: FileText, count: 423 },
    { value: 'confirmations', label: 'Confirmation Records', icon: FileText, count: 654 },
    { value: 'deaths', label: 'Death Records', icon: FileText, count: 178 },
    { value: 'donations', label: 'Donations', icon: DollarSign, count: 3421 },
    { value: 'events', label: 'Events & Schedules', icon: Calendar, count: 245 }
  ];

  const formats = [
    { value: 'csv', label: 'CSV', icon: FileText },
    { value: 'excel', label: 'Excel (XLSX)', icon: FileText },
    { value: 'pdf', label: 'PDF', icon: FileText }
  ];

  // Sample CSV data structure for preview
  const sampleFields = {
    members: ['First Name', 'Last Name', 'Email', 'Phone', 'Address', 'Date of Birth', 'Baptism Date'],
    births: ['Child Name', 'Date of Birth', 'Father Name', 'Mother Name', 'Place of Birth', 'Certificate Number'],
    marriages: ['Groom Name', 'Bride Name', 'Marriage Date', 'Officiant', 'Witnesses', 'Certificate Number'],
    donations: ['Donor Name', 'Amount', 'Category', 'Date', 'Payment Method', 'Receipt Number']
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImportFile(file);
      
      // Simulate reading CSV file
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        // Show preview of first 3 rows
        const preview = lines.slice(1, 4).map(line => {
          const values = line.split(',');
          return headers.reduce((obj, header, idx) => {
            obj[header] = values[idx]?.trim() || '';
            return obj;
          }, {});
        });

        setImportPreview({ headers, data: preview });
        
        // Auto-map fields if they match
        const autoMapping = {};
        headers.forEach(header => {
          autoMapping[header] = header;
        });
        setFieldMapping(autoMapping);
      };
      reader.readAsText(file);
    }
  };

  const handleImport = () => {
    if (!importFile) {
      showErrorToast('Error!', 'Please select a file to import');
      return;
    }

    // Validate field mapping
    const unmappedFields = Object.keys(fieldMapping).filter(key => !fieldMapping[key]);
    if (unmappedFields.length > 0) {
      showErrorToast('Error!', 'Please map all fields before importing');
      return;
    }

    showInfoToast('Processing Import', `Importing ${importFile.name}...\n\nThis would process the CSV file and import ${importPreview?.data.length} records into the database.`);
    setShowImportModal(false);
    setImportFile(null);
    setImportPreview(null);
  };

  const handleExport = () => {
    if (!exportDateFrom || !exportDateTo) {
      showErrorToast('Error!', 'Please select a date range');
      return;
    }

    const entity = entities.find(e => e.value === exportEntity);
    const format = formats.find(f => f.value === exportFormat);

    // Simulate export
    const fileName = `${exportEntity}-${exportDateFrom}-to-${exportDateTo}.${exportFormat}`;
    
    if (exportFormat === 'csv') {
      // Create sample CSV
      const headers = sampleFields[exportEntity] || ['ID', 'Name', 'Date', 'Status'];
      const sampleRow = headers.map((_, idx) => `Sample Data ${idx + 1}`);
      const csv = [headers.join(','), sampleRow.join(',')].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
    } else {
      showInfoToast('Exporting', `Exporting ${entity.label} as ${format.label}...\n\nFile: ${fileName}\nDate Range: ${exportDateFrom} to ${exportDateTo}`);
    }
  };

  const tabs = [
    { id: 'export', label: 'Export Records', icon: Download },
    { id: 'import', label: 'Import Records', icon: Upload }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-purple-50/20 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="animate-fade-in-down">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 dark:from-gray-100 dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
            Data Management
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
            Import and export church records and data
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-semibold transition-all rounded-xl ${
                  isActive
                    ? 'shadow-lg'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
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
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Export Tab */}
        {activeTab === 'export' && (
          <div className="space-y-6">
            {/* Export Configuration */}
            <Card title="Export Configuration" padding="lg">
              <div className="space-y-6">
                {/* Select Entity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Select Data Type
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {entities.map(entity => {
                      const Icon = entity.icon;
                      return (
                        <button
                          key={entity.value}
                          onClick={() => setExportEntity(entity.value)}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            exportEntity === entity.value
                              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <Icon size={24} className={`mb-2 ${exportEntity === entity.value ? 'text-blue-600' : 'text-gray-400'}`} />
                          <p className={`text-sm font-medium ${exportEntity === entity.value ? 'text-blue-600' : 'text-gray-700 dark:text-gray-300'}`}>
                            {entity.label}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{entity.count} records</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Date Range
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">From Date</label>
                      <input
                        type="date"
                        value={exportDateFrom}
                        onChange={(e) => setExportDateFrom(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">To Date</label>
                      <input
                        type="date"
                        value={exportDateTo}
                        onChange={(e) => setExportDateTo(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Export Format */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Export Format
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {formats.map(format => {
                      const Icon = format.icon;
                      return (
                        <button
                          key={format.value}
                          onClick={() => setExportFormat(format.value)}
                          className={`p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                            exportFormat === format.value
                              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <Icon size={20} className={exportFormat === format.value ? 'text-blue-600' : 'text-gray-400'} />
                          <span className={`text-sm font-medium ${exportFormat === format.value ? 'text-blue-600' : 'text-gray-700 dark:text-gray-300'}`}>
                            {format.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Button variant="primary" onClick={handleExport} className="w-full">
                  <Download size={18} className="mr-2" />
                  Export Data
                </Button>
              </div>
            </Card>

            {/* Export History */}
            <Card title="Recent Exports" padding="none">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Entity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Format
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Records
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        User
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        2025-12-01 14:30
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        Donations
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Excel
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        342
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        Admin User
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        2025-11-30 16:15
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        Church Members
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          CSV
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        1234
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        John Doe
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Import Tab */}
        {activeTab === 'import' && (
          <div className="space-y-6">
            <Card title="Import Data" padding="lg">
              <div className="space-y-6">
                {/* Instructions */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertCircle size={20} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">Import Guidelines</h4>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                        <li>• Upload a CSV file with properly formatted data</li>
                        <li>• First row should contain column headers</li>
                        <li>• Review and map fields before importing</li>
                        <li>• Ensure dates are in YYYY-MM-DD format</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Upload CSV File
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                    <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Click to upload or drag and drop
                    </p>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="csv-upload"
                    />
                    <label htmlFor="csv-upload" className="cursor-pointer inline-block">
                      <span className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-xl transition-all">
                        <Upload size={18} />
                        Select CSV File
                      </span>
                    </label>
                    {importFile && (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-4 flex items-center justify-center gap-2">
                        <CheckCircle size={16} />
                        {importFile.name} selected
                      </p>
                    )}
                  </div>
                </div>

                {/* Preview and Mapping */}
                {importPreview && (
                  <div>
                    <Button variant="primary" onClick={() => setShowImportModal(true)} className="w-full">
                      Review & Map Fields
                    </Button>
                  </div>
                )}

                {/* Download Template */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Download Templates
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {entities.map(entity => (
                      <button
                        key={entity.value}
                        className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <FileText size={20} className="text-gray-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{entity.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Import History */}
            <Card title="Recent Imports" padding="none">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        File Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Records
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        User
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        2025-11-28 10:20
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        members_import_nov.csv
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        45
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Success
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        Admin User
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Import Preview Modal */}
      {showImportModal && importPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Review Import Data
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Map CSV columns to database fields
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Field Mapping */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Field Mapping
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {importPreview.headers.map((header, idx) => (
                    <div key={idx}>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">
                        CSV Column: <strong>{header}</strong>
                      </label>
                      <select
                        value={fieldMapping[header] || ''}
                        onChange={(e) => setFieldMapping({ ...fieldMapping, [header]: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-gray-100"
                      >
                        <option value="">Select field...</option>
                        <option value={header}>{header}</option>
                        <option value="skip">Skip this column</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Preview */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Data Preview (First 3 rows)
                </h4>
                <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        {importPreview.headers.map((header, idx) => (
                          <th key={idx} className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {importPreview.data.map((row, rowIdx) => (
                        <tr key={rowIdx}>
                          {importPreview.headers.map((header, colIdx) => (
                            <td key={colIdx} className="px-4 py-2 text-gray-900 dark:text-gray-100">
                              {row[header]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <Button variant="outline" onClick={() => setShowImportModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleImport}>
                <Upload size={18} className="mr-2" />
                Import Data
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataManagement;
