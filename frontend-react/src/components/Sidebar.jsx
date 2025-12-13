import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Baby, 
  Heart, 
  Calendar, 
  Users, 
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Church,
  DollarSign,
  CreditCard,
  UserPlus,
  Upload,
  FileText,
  BarChart3,
  CheckCircle,
  Plus,
  UserCog,
  Megaphone,
  User,
  Tag,
  Shield,
  Database,
  Award,
  FileCheck
} from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../services/api';

const Sidebar = ({ userRole, onLogout, onCollapse }) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [pendingPaymentsCount, setPendingPaymentsCount] = useState(0);
  const [pendingServiceRequestsCount, setPendingServiceRequestsCount] = useState(0);

  // Notify parent component about collapse state changes
  useEffect(() => {
    if (onCollapse) {
      onCollapse(collapsed);
    }
  }, [collapsed, onCollapse]);

  // Fetch pending payment requests count for accountant
  useEffect(() => {
    if (userRole === 'accountant') {
      const fetchPendingPayments = async () => {
        try {
          console.log('=== SIDEBAR: Fetching pending payments ===');
          const response = await api.get('/service-requests');
          console.log('SIDEBAR: Response:', response);
          const requests = response.data.data || [];
          console.log('SIDEBAR: Total requests:', requests.length);
          
          // Get viewed requests from localStorage
          const viewedRequests = JSON.parse(localStorage.getItem('viewedServiceRequests') || '[]');
          console.log('SIDEBAR: Viewed requests:', viewedRequests);
          
          const pending = requests.filter(r => {
            const fee = parseFloat(r.service_fee || 0);
            const isUnpaid = fee > 0 && r.payment_status === 'unpaid';
            const isNotViewed = !viewedRequests.includes(r.id);
            const isPending = isUnpaid && isNotViewed;
            console.log(`SIDEBAR: Request ${r.id} - fee: ${fee}, payment_status: ${r.payment_status}, viewed: ${!isNotViewed}, isPending: ${isPending}`);
            return isPending;
          });
          console.log('SIDEBAR: Pending payments count:', pending.length);
          setPendingPaymentsCount(pending.length);
        } catch (error) {
          console.error('SIDEBAR: Error fetching pending payments:', error);
        }
      };

      fetchPendingPayments();
      // Refresh every 30 seconds
      const interval = setInterval(fetchPendingPayments, 30000);
      
      // Listen for payment update events
      const handlePaymentUpdate = () => {
        console.log('SIDEBAR: Payment update event received, refreshing count...');
        fetchPendingPayments();
      };
      
      window.addEventListener('paymentViewed', handlePaymentUpdate);
      window.addEventListener('paymentUpdated', handlePaymentUpdate);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('paymentViewed', handlePaymentUpdate);
        window.removeEventListener('paymentUpdated', handlePaymentUpdate);
      };
    }
  }, [userRole]);

  // Fetch pending service requests count for church admin and priest
  useEffect(() => {
    if (userRole === 'church_admin' || userRole === 'priest') {
      const fetchPendingServiceRequests = async () => {
        try {
          console.log('=== SIDEBAR: Fetching pending service requests ===');
          const response = await api.get('/service-requests');
          const requests = response.data.data || response.data || [];
          console.log('SIDEBAR: Total service requests:', requests.length);
          
          // Get viewed requests from localStorage
          const viewedRequests = JSON.parse(localStorage.getItem('viewedServiceRequests') || '[]');
          console.log('SIDEBAR: Viewed service requests:', viewedRequests);
          
          const pending = requests.filter(r => {
            const isPending = r.status === 'pending';
            const isNotViewed = !viewedRequests.includes(r.id);
            const shouldCount = isPending && isNotViewed;
            return shouldCount;
          });
          console.log('SIDEBAR: Pending service requests count:', pending.length);
          setPendingServiceRequestsCount(pending.length);
        } catch (error) {
          console.error('SIDEBAR: Error fetching pending service requests:', error);
        }
      };

      fetchPendingServiceRequests();
      // Refresh every 30 seconds
      const interval = setInterval(fetchPendingServiceRequests, 30000);
      
      // Listen for service request update events
      const handleServiceRequestUpdate = () => {
        console.log('SIDEBAR: Service request update event received, refreshing count...');
        fetchPendingServiceRequests();
      };
      
      window.addEventListener('serviceRequestViewed', handleServiceRequestUpdate);
      window.addEventListener('serviceRequestUpdated', handleServiceRequestUpdate);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('serviceRequestViewed', handleServiceRequestUpdate);
        window.removeEventListener('serviceRequestUpdated', handleServiceRequestUpdate);
      };
    }
  }, [userRole]);

  const menuItems = {
    admin: [
      { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/admin/accounts', icon: UserPlus, label: 'Account Management' },
      { path: '/admin/records', icon: FileText, label: 'Sacrament Records' },
      { path: '/admin/schedules', icon: Calendar, label: 'Appointments & Schedules' },
      { path: '/admin/finance', icon: DollarSign, label: 'Finance & Donations' },
      { path: '/admin/audit-log', icon: Shield, label: 'Audit Logs' },
      { path: '/admin/settings', icon: Settings, label: 'System Settings' },
    ],
    priest: [
      { path: '/priest/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/priest/sacraments', icon: FileText, label: 'Sacrament Records (View)' },
      { path: '/priest/appointments', icon: Calendar, label: 'Appointments (View)' },
      { path: '/priest/service-requests', icon: FileCheck, label: 'Service Requests (View)' },
      { path: '/priest/finance', icon: DollarSign, label: 'Finance & Donations (View)' },
      { path: '/priest/reports', icon: BarChart3, label: 'Ministry Reports' },
    ],
    accountant: [
      { path: '/accountant/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/accountant/finance', icon: DollarSign, label: 'Finance & Donations' },
      { path: '/accountant/service-payments', icon: CreditCard, label: 'Service Payments' },
      { path: '/accountant/categories', icon: Settings, label: 'System Settings' },
      { path: '/accountant/receipts', icon: FileText, label: 'Receipts' },
      { path: '/accountant/documents', icon: FileText, label: 'Financial Documents' },
    ],
    church_admin: [
      { path: '/church-admin/dashboard', icon: LayoutDashboard, label: 'Secretary Dashboard' },
      { path: '/church-admin/members', icon: Users, label: 'Member Records' },
      { path: '/church-admin/calendar', icon: Calendar, label: 'Calendar & Events' },
      { path: '/church-admin/sacraments', icon: Award, label: 'Sacraments & Certificates' },
      { path: '/church-admin/service-requests', icon: CheckCircle, label: 'Service Requests' },
      { path: '/church-admin/finance', icon: DollarSign, label: 'Finance & Donations' },
      { path: '/church-admin/documents', icon: FileText, label: 'Documents' },
      { path: '/church-admin/announcements', icon: Megaphone, label: 'Announcements' },
    ],
    user: [
      { path: '/user/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/user/profile', icon: User, label: 'My Profile' },
      { path: '/user/service-requests', icon: FileText, label: 'Request Service' },
      { path: '/user/my-service-requests', icon: FileCheck, label: 'Service Request Records' },
      { path: '/user/payments', icon: DollarSign, label: 'My Payments' },
      { path: '/user/upload', icon: Upload, label: 'My Documents' },
    ],
  };

  const items = menuItems[userRole] || menuItems.user;

  return (
    <aside 
      id="app-sidebar"
      className={`${
        collapsed ? 'w-20' : 'w-72'
      } h-screen fixed top-0 left-0 transition-all duration-300 flex flex-col bg-white`}
      style={{ 
        zIndex: 10,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        borderRight: '1px solid rgba(0, 0, 0, 0.06)'
      }}
    >
      
      {/* Header with Logo */}
      <div className="relative p-6 border-b border-gray-200">
        {!collapsed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl shadow-lg" style={{ 
                background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
                boxShadow: '0 4px 12px rgba(65, 88, 208, 0.3)'
              }}>
                <Church size={22} className="text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold" style={{ color: '#4158D0' }}>OLPGV</h2>
                <p className="text-xs text-gray-500">Mission Area</p>
              </div>
            </div>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 hover:bg-gray-50 rounded-lg transition-all"
              title="Collapse"
            >
              <ChevronLeft size={18} className="text-gray-600" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 items-center">
            <div className="p-2.5 rounded-xl shadow-lg" style={{ 
              background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
              boxShadow: '0 4px 12px rgba(65, 88, 208, 0.3)'
            }}>
              <Church size={20} className="text-white" />
            </div>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 hover:bg-gray-50 rounded-lg transition-all"
              title="Expand"
            >
              <ChevronRight size={18} className="text-gray-600" />
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="relative flex-1 p-4 space-y-1 overflow-y-auto [&::-webkit-scrollbar]:hidden" style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? 'shadow-lg' 
                  : 'hover:bg-gray-50'
              }`}
              style={{
                background: isActive ? 'rgba(65, 88, 208, 0.1)' : 'transparent',
                backdropFilter: isActive ? 'blur(10px)' : 'none',
                WebkitBackdropFilter: isActive ? 'blur(10px)' : 'none',
                color: isActive ? '#4158D0' : '#64748b',
                border: isActive ? '1px solid rgba(65, 88, 208, 0.2)' : '1px solid transparent',
                boxShadow: isActive ? '0 4px 12px rgba(65, 88, 208, 0.15)' : 'none'
              }}
              title={collapsed ? item.label : ''}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              {!collapsed && (
                <span className={`text-sm ${isActive ? 'font-semibold' : 'font-medium'}`}>
                  {item.label}
                </span>
              )}
              {/* Notification badge for Service Payments */}
              {userRole === 'accountant' && item.path === '/accountant/service-payments' && pendingPaymentsCount > 0 && (
                <span className="ml-auto flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold bg-red-500 text-white shadow-lg">
                  {pendingPaymentsCount}
                </span>
              )}
              {/* Notification badge for Church Admin Service Requests */}
              {userRole === 'church_admin' && item.path === '/church-admin/service-requests' && pendingServiceRequestsCount > 0 && (
                <span className="ml-auto flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold bg-red-500 text-white shadow-lg">
                  {pendingServiceRequestsCount}
                </span>
              )}
              {/* Notification badge for Priest Service Requests */}
              {userRole === 'priest' && item.path === '/priest/service-requests' && pendingServiceRequestsCount > 0 && (
                <span className="ml-auto flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold bg-red-500 text-white shadow-lg">
                  {pendingServiceRequestsCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer with Administrator Info and Logout */}
      <div className="relative p-4 space-y-3 border-t border-gray-200">
        {!collapsed ? (
          <>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all border shadow-sm hover:shadow-md"
              style={{
                background: 'white',
                borderColor: 'rgba(0, 0, 0, 0.1)'
              }}
            >
              <div className="w-10 h-10 rounded-xl shadow-lg flex items-center justify-center" style={{ 
                background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)'
              }}>
                <User size={20} className="text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-gray-900 capitalize">
                  {userRole?.replace('_', ' ')}
                </p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <ChevronRight size={16} className={`text-gray-400 transition-transform ${showUserMenu ? 'rotate-90' : ''}`} style={{ color: '#4158D0' }} />
            </button>
            
            <div className={`overflow-hidden transition-all duration-300 ${
              showUserMenu ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
            }`}>
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all font-medium shadow-sm hover:shadow-md"
                style={{
                  background: 'rgba(254, 242, 242, 0.9)',
                  border: '1px solid rgba(254, 202, 202, 0.6)',
                  color: '#DC2626'
                }}
              >
                <LogOut size={18} />
                <span className="text-sm">Logout</span>
              </button>
            </div>
            
            <div className="pt-2">
              <p className="text-xs text-center font-medium text-gray-500">© {new Date().getFullYear()} OLPGVMA</p>
            </div>
          </>
        ) : (
          <>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex justify-center mb-2"
            >
              <div className="w-10 h-10 rounded-xl shadow-lg flex items-center justify-center hover:scale-105 transition-transform" style={{ 
                background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
                boxShadow: '0 4px 12px rgba(65, 88, 208, 0.3)'
              }}>
                <User size={20} className="text-white" />
              </div>
            </button>
            
            <div className={`overflow-hidden transition-all duration-300 ${
              showUserMenu ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
            }`}>
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center p-3 rounded-xl transition-all shadow-sm"
                style={{
                  background: 'rgba(254, 242, 242, 0.9)',
                  border: '1px solid rgba(254, 202, 202, 0.6)',
                  color: '#DC2626'
                }}
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
