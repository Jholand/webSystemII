import { useState, useEffect } from 'react';
import { Search, Download, Filter, Calendar, User, Shield, Activity, CheckCircle, XCircle, TrendingUp, AlertTriangle } from 'lucide-react';
import { showInfoToast } from '../../utils/sweetAlertHelper';
import { auditLogAPI } from '../../services/dataSync';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Pagination from '../../components/Pagination';

const AuditLog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUser, setFilterUser] = useState('all');
  const [filterAction, setFilterAction] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    loadAuditLogs();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadAuditLogs();
    }, 30000);
    
    // Listen for custom events from other pages
    const handleAuditUpdate = () => {
      console.log('🔄 Audit log update triggered');
      loadAuditLogs();
    };
    
    window.addEventListener('auditLogUpdated', handleAuditUpdate);
    window.addEventListener('paymentUpdated', handleAuditUpdate);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('auditLogUpdated', handleAuditUpdate);
      window.removeEventListener('paymentUpdated', handleAuditUpdate);
    };
  }, []);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const response = await auditLogAPI.getAll();
      const data = response?.data || response || [];
      
      // Also load from localStorage and merge
      const localLogs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
      
      // Merge and deduplicate logs
      const allLogs = [...data, ...localLogs];
      const uniqueLogs = Array.from(
        new Map(allLogs.map(log => [log.id || log.timestamp + log.details, log])).values()
      );
      
      // Sort by timestamp descending (newest first)
      uniqueLogs.sort((a, b) => {
        const dateA = new Date(a.timestamp || a.created_at);
        const dateB = new Date(b.timestamp || b.created_at);
        return dateB - dateA;
      });
      
      setAuditLogs(uniqueLogs);
      console.log(`📋 Loaded ${uniqueLogs.length} audit logs`);
    } catch (error) {
      console.error('Error loading audit logs:', error);
      // Load from localStorage as fallback
      try {
        const localLogs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
        setAuditLogs(localLogs);
      } catch {
        setAuditLogs([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Sample audit log data (kept as fallback)
  const [sampleLogs] = useState([
    {
      id: 1,
      timestamp: '2025-12-01 14:32:15',
      user: 'John Doe',
      role: 'Admin',
      action: 'Create',
      module: 'Birth Records',
      details: 'Created new birth record for Maria Santos',
      ip: '192.168.1.100',
      type: 'success'
    },
    {
      id: 2,
      timestamp: '2025-12-01 13:45:22',
      user: 'Jane Smith',
      role: 'Priest',
      action: 'Update',
      module: 'Marriage Records',
      details: 'Updated marriage certificate #MC-2025-045',
      ip: '192.168.1.105',
      type: 'info'
    },
    {
      id: 3,
      timestamp: '2025-12-01 12:18:33',
      user: 'Admin User',
      role: 'Admin',
      action: 'Delete',
      module: 'Donations',
      details: 'Deleted donation record #DON-2025-123',
      ip: '192.168.1.100',
      type: 'error'
    },
    {
      id: 4,
      timestamp: '2025-12-01 11:05:47',
      user: 'Michael Chen',
      role: 'Accountant',
      action: 'Export',
      module: 'Financial Reports',
      details: 'Exported November 2025 financial report',
      ip: '192.168.1.108',
      type: 'info'
    },
    {
      id: 5,
      timestamp: '2025-12-01 10:22:11',
      user: 'Sarah Johnson',
      role: 'Church Admin',
      action: 'Create',
      module: 'Calendar',
      details: 'Created new event: Christmas Mass',
      ip: '192.168.1.112',
      type: 'success'
    },
    {
      id: 6,
      timestamp: '2025-12-01 09:15:28',
      user: 'John Doe',
      role: 'Admin',
      action: 'Login',
      module: 'Authentication',
      details: 'Successful login',
      ip: '192.168.1.100',
      type: 'success'
    },
    {
      id: 7,
      timestamp: '2025-11-30 18:45:33',
      user: 'Admin User',
      role: 'Admin',
      action: 'Update',
      module: 'Settings',
      details: 'Updated church information',
      ip: '192.168.1.100',
      type: 'info'
    },
    {
      id: 8,
      timestamp: '2025-11-30 16:30:15',
      user: 'Jane Smith',
      role: 'Priest',
      action: 'Create',
      module: 'Birth Records',
      details: 'Created baptism certificate for Pedro Cruz',
      ip: '192.168.1.105',
      type: 'success'
    },
    {
      id: 9,
      timestamp: '2025-11-30 15:12:44',
      user: 'Michael Chen',
      role: 'Accountant',
      action: 'View',
      module: 'Donations',
      details: 'Viewed donation summary report',
      ip: '192.168.1.108',
      type: 'info'
    },
    {
      id: 10,
      timestamp: '2025-11-30 14:08:22',
      user: 'John Doe',
      role: 'Admin',
      action: 'Create',
      module: 'User Management',
      details: 'Created new user account: test@church.com',
      ip: '192.168.1.100',
      type: 'success'
    }
  ]);

  // Use real audit logs or sample logs as fallback
  const displayLogs = auditLogs.length > 0 ? auditLogs : sampleLogs;

  // Normalize log data to handle different formats
  const normalizedLogs = displayLogs.map(log => ({
    ...log,
    user: log.user_name || log.user || 'Unknown',
    role: log.user_role || log.role || 'N/A',
    action: log.action || 'N/A',
    module: log.module || 'N/A',
    details: log.details || 'No details',
    timestamp: log.timestamp || log.created_at || new Date().toISOString(),
    ip: log.ip_address || log.ip || 'N/A',
    type: log.type || (log.action?.includes('DELETE') || log.action?.includes('VOID') ? 'error' : 
                       log.action?.includes('CREATE') || log.action?.includes('PAYMENT') ? 'success' : 'info')
  }));

  // Get unique users and actions for filters
  const uniqueUsers = [...new Set(normalizedLogs.map(log => log.user).filter(Boolean))];
  const uniqueActions = [...new Set(normalizedLogs.map(log => log.action).filter(Boolean))];

  // Filter logs
  const filteredLogs = normalizedLogs.filter(log => {
    const matchesSearch = (log.user || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (log.module || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (log.details || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUser = filterUser === 'all' || log.user === filterUser;
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    
    let matchesDate = true;
    if (dateFrom && dateTo) {
      const logDate = new Date(log.timestamp);
      matchesDate = logDate >= new Date(dateFrom) && logDate <= new Date(dateTo);
    }

    return matchesSearch && matchesUser && matchesAction && matchesDate;
  });

  // Pagination logic
  const indexOfLastLog = currentPage * itemsPerPage;
  const indexOfFirstLog = indexOfLastLog - itemsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.setTextColor(70, 103, 207);
    doc.text('Audit Logs', 105, 20, { align: 'center' });
    
    // Add subtitle with date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`, 105, 28, { align: 'center' });
    
    // Add filter info if any filters are active
    let filterInfo = [];
    if (filterUser !== 'all') filterInfo.push(`User: ${filterUser}`);
    if (filterAction !== 'all') filterInfo.push(`Action: ${filterAction}`);
    if (dateFrom) filterInfo.push(`From: ${dateFrom}`);
    if (dateTo) filterInfo.push(`To: ${dateTo}`);
    
    if (filterInfo.length > 0) {
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(`Filters: ${filterInfo.join(' | ')}`, 105, 34, { align: 'center' });
    }
    
    // Prepare table data - map database fields correctly
    const tableData = filteredLogs.map((log) => {
      // Get timestamp - from database it's created_at, from sample it's timestamp
      const timestamp = log.created_at 
        ? new Date(log.created_at).toLocaleString()
        : (log.timestamp || 'N/A');
      
      // Get user - from database it's actor, from sample it's user
      const user = log.actor || log.user || 'N/A';
      
      // Get role - from database it's not available, from sample it's role
      const role = log.role || '-';
      
      // Get action
      const action = log.action || 'N/A';
      
      // Get module - from database it's category, from sample it's module
      const module = log.category || log.module || 'N/A';
      
      // Get details
      const details = log.details || log.description || 'N/A';
      
      return [timestamp, user, role, action, module, details];
    });
    
    // Add table using autoTable
    autoTable(doc, {
      startY: filterInfo.length > 0 ? 40 : 35,
      head: [['Timestamp', 'User', 'Role', 'Action', 'Category', 'Details']],
      body: tableData,
      theme: 'striped',
      styles: {
        overflow: 'linebreak',
        cellPadding: 2,
        fontSize: 7
      },
      headStyles: {
        fillColor: [70, 103, 207],
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        textColor: [50, 50, 50]
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250]
      },
      columnStyles: {
        0: { cellWidth: 32 },
        1: { cellWidth: 30 },
        2: { cellWidth: 22 },
        3: { cellWidth: 28 },
        4: { cellWidth: 28 },
        5: { cellWidth: 50 }
      },
      margin: { top: 35, left: 10, right: 10, bottom: 20 }
    });
    
    // Add page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(150);
      doc.text(
        `Page ${i} of ${pageCount}`,
        105,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
    
    // Save the PDF
    const fileName = `Audit_Logs_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  const getActionBadgeColor = (action) => {
    const colors = {
      Create: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      Update: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      Delete: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      View: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      Export: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      Login: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
    };
    return colors[action] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      Admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      Priest: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      Accountant: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'Church Admin': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      User: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
    };
    return colors[role] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#4158D0' }}>Audit Logs</h1>
              <p className="text-gray-600 mt-1">Track all system activities and user actions</p>
            </div>
            <button 
              onClick={handleExportPDF}
              className="px-5 py-3 text-white rounded-lg font-semibold transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
              style={{ 
                background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
              }}
            >
              <Download size={20} />
              Export PDF
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-5 shadow hover:shadow-lg transition-all border border-gray-200 cursor-pointer group">
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 rounded-lg group-hover:scale-110 transition-transform" style={{ backgroundColor: '#E8E9F5' }}>
                <Filter size={24} style={{ color: '#4158D0' }} />
              </div>
              <TrendingUp size={16} className="text-gray-400" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{filteredLogs.length}</h3>
            <p className="text-sm font-semibold text-gray-700">Total Logs</p>
          </div>

          <div className="bg-white rounded-lg p-5 shadow hover:shadow-lg transition-all border border-gray-200 cursor-pointer group">
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 rounded-lg group-hover:scale-110 transition-transform" style={{ backgroundColor: '#d1fae5' }}>
                <Calendar size={24} style={{ color: '#10b981' }} />
              </div>
              <TrendingUp size={16} className="text-gray-400" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">6</h3>
            <p className="text-sm font-semibold text-gray-700">Today's Actions</p>
          </div>

          <div className="bg-white rounded-lg p-5 shadow hover:shadow-lg transition-all border border-gray-200 cursor-pointer group">
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 rounded-lg group-hover:scale-110 transition-transform" style={{ backgroundColor: '#ede9fe' }}>
                <User size={24} style={{ color: '#8b5cf6' }} />
              </div>
              <TrendingUp size={16} className="text-gray-400" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{uniqueUsers.length}</h3>
            <p className="text-sm font-semibold text-gray-700">Active Users</p>
          </div>

          <div className="bg-white rounded-lg p-5 shadow hover:shadow-lg transition-all border border-gray-200 cursor-pointer group">
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 rounded-lg group-hover:scale-110 transition-transform" style={{ backgroundColor: '#fee2e2' }}>
                <AlertTriangle size={24} style={{ color: '#ef4444' }} />
              </div>
              <TrendingUp size={16} className="text-gray-400" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">1</h3>
            <p className="text-sm font-semibold text-gray-700">Critical Actions</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Filter size={20} style={{ color: '#4158D0' }} />
            Filters
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search
              </label>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by user, module, or details..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                User
              </label>
              <select
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="all">All Users</option>
                {uniqueUsers.map(user => (
                  <option key={user} value={user}>{user}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Action Type
              </label>
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="all">All Actions</option>
                {uniqueActions.map(action => (
                  <option key={action} value={action}>{action}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date Range
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-2 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Audit Log Display - Card Style */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Activity size={20} className="text-blue-600" />
              Recent Activity ({filteredLogs.length} logs)
            </h2>
          </div>

          <div className="space-y-3">
            {currentLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-sm transition-all">
                <div className="flex-shrink-0">
                  {log.type === 'success' && (
                    <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
                    </div>
                  )}
                  {log.type === 'error' && (
                    <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <XCircle size={20} className="text-red-600 dark:text-red-400" />
                    </div>
                  )}
                  {log.type === 'info' && (
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Activity size={20} className="text-blue-600 dark:text-blue-400" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{log.action}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getActionBadgeColor(log.action)}`}>
                      {log.action}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getRoleBadgeColor(log.role)}`}>
                      {log.role}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{log.details}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-medium">{log.user}</span>
                    <span>•</span>
                    <span>{log.module}</span>
                    <span>•</span>
                    <span>{log.timestamp}</span>
                    <span>•</span>
                    <span>IP: {log.ip}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={filteredLogs.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(value) => {
              setItemsPerPage(value);
              setCurrentPage(1);
            }}
          />

          {filteredLogs.length === 0 && (
            <div className="text-center py-12">
              <Activity size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No audit logs found</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditLog;
