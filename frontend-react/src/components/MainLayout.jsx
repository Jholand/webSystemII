import { useState, useRef, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Bell, Search, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import Sidebar from './Sidebar';

const MainLayout = ({ userRole, onLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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
      {showSidebar && <Sidebar userRole={userRole} onLogout={onLogout} />}
      
      <div id="main-content" className="flex-1 flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        {/* Main Content Area */}
        <main className="flex-1 p-6 animate-fade-in overflow-auto">
          <div className="max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
