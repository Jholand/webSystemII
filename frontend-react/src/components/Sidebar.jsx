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
  User
} from 'lucide-react';
import { useState } from 'react';

const Sidebar = ({ userRole, onLogout }) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const menuItems = {
    admin: [
      { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/admin/billing', icon: CreditCard, label: 'Billing Module' },
      { path: '/admin/donations', icon: DollarSign, label: 'Donations' },
      { path: '/admin/calendar', icon: Calendar, label: 'Scheduling' },
      { path: '/admin/accounts', icon: UserPlus, label: 'Account Management' },
      { path: '/admin/upload', icon: Upload, label: 'Files' },
      { path: '/admin/birth-records', icon: Baby, label: 'Birth Records' },
      { path: '/admin/marriage-records', icon: Heart, label: 'Marriage Records' },
      { path: '/admin/membership', icon: Users, label: 'Church Membership' },
      { path: '/admin/settings', icon: Settings, label: 'Settings' },
    ],
    priest: [
      { path: '/priest/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ],
    accountant: [
      { path: '/accountant/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/accountant/billing', icon: CreditCard, label: 'Billing / Collections' },
      { path: '/accountant/donations', icon: DollarSign, label: 'Donations & Offerings' },
      { path: '/accountant/reports', icon: BarChart3, label: 'Financial Reports' },
      { path: '/accountant/documents', icon: FileText, label: 'Financial Documents' },
    ],
    church_admin: [
      { path: '/church-admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/church-admin/members', icon: Users, label: 'Member Records' },
      { path: '/church-admin/service-requests', icon: CheckCircle, label: 'Service Requests' },
      { path: '/church-admin/calendar', icon: Calendar, label: 'Calendar' },
      { path: '/church-admin/events', icon: Plus, label: 'Event Planning' },
      { path: '/church-admin/staff-schedules', icon: UserCog, label: 'Staff Schedules' },
      { path: '/church-admin/reports', icon: BarChart3, label: 'Reports' },
      { path: '/church-admin/documents', icon: FileText, label: 'Documents' },
      { path: '/church-admin/announcements', icon: Megaphone, label: 'Announcements' },
    ],
    user: [
      { path: '/user/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/user/my-requests', icon: FileText, label: 'My Requests' },
      { path: '/user/request-service', icon: Plus, label: 'Request Service' },
      { path: '/user/payments-billing', icon: DollarSign, label: 'Payments & Billing' },
      { path: '/user/upload', icon: Upload, label: 'My Documents' },
    ],
  };

  const items = menuItems[userRole] || menuItems.user;

  return (
    <aside 
      id="app-sidebar"
      className={`${
        collapsed ? 'w-20' : 'w-72'
      } h-screen sticky top-0 z-30 transition-all duration-300 flex flex-col bg-gradient-to-br from-black via-[#0A1628] to-[#1E3A8A] border-r border-blue-900/30 shadow-2xl`}
    >
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#1E3A8A]/20 via-blue-900/30 to-blue-800/20 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-700/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-[#1E3A8A]/15 via-transparent to-transparent pointer-events-none" />
      
      {/* Header with Logo */}
      <div className="relative p-6 border-b border-blue-900/30">
        {!collapsed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-600 blur-2xl opacity-50 rounded-full animate-pulse" />
                <div className="relative bg-gradient-to-br from-[#1E3A8A] via-blue-700 to-blue-600 p-3 rounded-2xl shadow-2xl shadow-blue-900/60">
                  <Church size={24} className="text-white drop-shadow-2xl" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white drop-shadow-lg tracking-wide">
                  Church Records
                </h2>
                <p className="text-xs font-semibold text-blue-300 capitalize mt-0.5">
                  {userRole?.replace('_', ' ')} Portal
                </p>
              </div>
            </div>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 bg-blue-900/20 hover:bg-blue-800/30 backdrop-blur-sm rounded-xl transition-all duration-200 text-blue-300 hover:text-white border border-blue-900/30"
              title="Collapse sidebar"
            >
              <ChevronLeft size={18} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-600 blur-2xl opacity-50 rounded-full animate-pulse" />
              <div className="relative bg-gradient-to-br from-[#1E3A8A] via-blue-700 to-blue-600 p-2.5 rounded-2xl shadow-2xl shadow-blue-900/60">
                <Church size={22} className="text-white drop-shadow-2xl" />
              </div>
            </div>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="w-full p-2 bg-blue-900/20 hover:bg-blue-800/30 backdrop-blur-sm rounded-xl transition-all duration-200 text-blue-300 hover:text-white flex items-center justify-center border border-blue-900/30"
              title="Expand sidebar"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="relative flex-1 p-4 space-y-2 overflow-y-auto scrollbar-hide">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                group relative flex items-center gap-3 px-4 py-3.5 rounded-xl
                transition-all duration-300 overflow-hidden
                ${isActive
                  ? 'bg-gradient-to-r from-[#1E3A8A] via-blue-700 to-blue-600 text-white shadow-xl shadow-blue-900/60 scale-[1.02]'
                  : 'text-blue-200/90 hover:text-white hover:bg-blue-900/20 backdrop-blur-sm border border-transparent hover:border-blue-800/30'
                }
              `}
              title={collapsed ? item.label : ''}
            >
              {/* Animated gradient background for active */}
              {isActive && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#1E3A8A] via-blue-700 to-blue-600 animate-pulse" />
                  <div className="absolute inset-0 bg-gradient-to-l from-[#1E3A8A]/60 via-transparent to-blue-700/60" />
                </>
              )}
              
              {/* Glow effect on hover */}
              {!isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-[#1E3A8A]/0 via-blue-700/0 to-blue-600/0 group-hover:from-[#1E3A8A]/30 group-hover:via-blue-700/30 group-hover:to-blue-600/30 transition-all duration-300" />
              )}
              
              <div className={`relative flex-shrink-0 z-10 ${isActive ? 'text-white' : 'text-blue-200'}`}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2.2} />
              </div>
              
              {!collapsed && (
                <span className={`relative z-10 font-semibold text-sm ${isActive ? 'font-bold tracking-wide' : ''}`}>
                  {item.label}
                </span>
              )}
              
              {/* Shine effect on active */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer with Administrator Info and Logout */}
      <div className="relative p-4 border-t border-blue-900/30 space-y-3">
        {!collapsed ? (
          <>
            {/* Administrator Profile - Clickable */}
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center gap-3 px-3 py-3 bg-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-800/30 hover:bg-blue-900/30 transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-[#1E3A8A] via-blue-700 to-blue-600 shadow-lg">
                <User size={20} className="text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-bold text-white capitalize">
                  {userRole?.replace('_', ' ')}
                </p>
                <p className="text-xs text-blue-300">Administrator</p>
              </div>
              <ChevronRight 
                size={16} 
                className={`text-blue-300 transition-transform duration-200 ${showUserMenu ? 'rotate-90' : ''}`} 
              />
            </button>
            
            {/* Logout Button - Slides down */}
            <div 
              className={`overflow-hidden transition-all duration-300 ease-out ${
                showUserMenu 
                  ? 'max-h-20 opacity-100' 
                  : 'max-h-0 opacity-0'
              }`}
            >
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center px-4 py-3 bg-blue-900/20 hover:bg-blue-900/30 backdrop-blur-sm border border-blue-800/30 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <LogOut size={18} className="text-white" />
              </button>
            </div>
            
            {/* Copyright */}
            <div className="pt-2">
              <p className="text-xs text-blue-300/80 text-center font-medium">
                © {new Date().getFullYear()} Church Records
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Collapsed User Icon - Clickable */}
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex justify-center mb-2"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-[#1E3A8A] via-blue-700 to-blue-600 shadow-lg hover:scale-110 transition-transform">
                <User size={20} className="text-white" />
              </div>
            </button>
            
            {/* Collapsed Logout Button - Slides down */}
            <div 
              className={`overflow-hidden transition-all duration-300 ease-out ${
                showUserMenu 
                  ? 'max-h-20 opacity-100' 
                  : 'max-h-0 opacity-0'
              }`}
            >
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center p-3 bg-blue-900/20 hover:bg-blue-900/30 backdrop-blur-sm border border-blue-800/30 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                title="Logout"
              >
                <LogOut size={18} className="text-white" />
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
