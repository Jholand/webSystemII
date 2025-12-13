import { useState, useRef, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Bell, Search, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import Sidebar from './Sidebar';

const MainLayout = ({ userRole, onLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showSidebar = userRole !== 'priest';

  return (
    <div className="flex min-h-screen">
      {showSidebar && (
        <Sidebar 
          userRole={userRole} 
          onLogout={onLogout} 
          onCollapse={setSidebarCollapsed}
        />
      )}
      
      <div 
        id="main-content" 
        className={`flex-1 flex flex-col transition-all duration-300 ${showSidebar ? (sidebarCollapsed ? 'ml-20' : 'ml-72') : ''} bg-white`}
      >
        {/* Main Content Area */}
        <main className="flex-1 animate-fade-in overflow-auto pl-2">
          <Outlet context={{ onLogout }} />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
