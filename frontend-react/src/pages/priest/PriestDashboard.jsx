import { useState, useRef, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Calendar, Users, FileText, Clock, MapPin, User, LogOut, Download, Heart, Baby, TrendingUp, DollarSign, CheckCircle } from 'lucide-react';
import { showInfoToast } from '../../utils/sweetAlertHelper';
import { baptismRecordAPI, marriageRecordAPI, scheduleAPI, memberAPI, donationAPI, paymentRecordAPI } from '../../services/dataSync';

const PriestDashboard = () => {
  const { onLogout } = useOutletContext();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [upcomingSacraments, setUpcomingSacraments] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentSacraments, setRecentSacraments] = useState([]);
  const [totalParishioners, setTotalParishioners] = useState(0);
  const [donationStats, setDonationStats] = useState({
    totalDonations: 0,
    thisMonth: 0,
    thisWeek: 0,
    donorCount: 0
  });
  const [attendanceData, setAttendanceData] = useState({
    avgSunday: 0,
    avgWeekday: 0,
    trend: '+0%',
    lastWeek: []
  });
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [baptismsRes, marriagesRes, schedulesRes, membersRes, donationsRes, paymentsRes] = await Promise.all([
        baptismRecordAPI.getAll().catch(() => ({ data: [] })),
        marriageRecordAPI.getAll().catch(() => ({ data: [] })),
        scheduleAPI.getAll().catch(() => ({ data: [] })),
        memberAPI.getAll().catch(() => ({ data: [] })),
        donationAPI.getAll().catch(() => ({ data: [] })),
        paymentRecordAPI.getAll().catch(() => ({ data: [] }))
      ]);

      const baptisms = Array.isArray(baptismsRes?.data) ? baptismsRes.data : (Array.isArray(baptismsRes) ? baptismsRes : []);
      const marriages = Array.isArray(marriagesRes?.data) ? marriagesRes.data : (Array.isArray(marriagesRes) ? marriagesRes : []);
      const schedules = Array.isArray(schedulesRes?.data) ? schedulesRes.data : (Array.isArray(schedulesRes) ? schedulesRes : []);
      const members = Array.isArray(membersRes?.data) ? membersRes.data : (Array.isArray(membersRes) ? membersRes : []);
      const donations = Array.isArray(donationsRes?.data) ? donationsRes.data : (Array.isArray(donationsRes) ? donationsRes : []);
      const payments = Array.isArray(paymentsRes?.data) ? paymentsRes.data : (Array.isArray(paymentsRes) ? paymentsRes : []);

      // Get upcoming sacraments (future baptisms and marriages)
      const today = new Date();
      const upcomingBaptisms = baptisms.filter(b => new Date(b.baptism_date) > today)
        .map(b => ({
          id: b.id,
          type: 'Baptism',
          childName: b.child_name,
          family: `${b.father_name} & ${b.mother_name}`,
          date: b.baptism_date,
          time: b.baptism_time || '10:00 AM',
          location: b.place_of_birth || 'Church'
        }));

      const upcomingMarriages = marriages.filter(m => new Date(m.marriage_date) > today)
        .map(m => ({
          id: m.id,
          type: 'Wedding',
          couple: `${m.groom_name} & ${m.bride_name}`,
          family: 'Families',
          date: m.marriage_date,
          time: m.marriage_time || '2:00 PM',
          location: m.marriage_location || 'Church'
        }));

      setUpcomingSacraments([...upcomingBaptisms, ...upcomingMarriages].slice(0, 6));

      // Get upcoming events from schedules
      const upcomingSchedules = schedules.filter(s => new Date(s.appointment_date) > today)
        .map(s => ({
          id: s.id,
          title: s.appointment_type || 'Event',
          date: s.appointment_date,
          time: s.appointment_time || '10:00 AM',
          attendees: 0,
          type: s.status || 'Event'
        }));

      setUpcomingEvents(upcomingSchedules.slice(0, 5));

      // Get recent sacraments (past 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentBaptisms = baptisms.filter(b => new Date(b.baptism_date) > thirtyDaysAgo && new Date(b.baptism_date) <= today)
        .map(b => ({
          id: b.id,
          type: 'Baptism',
          name: b.child_name,
          performedBy: 'Fr. Joseph Smith',
          date: b.baptism_date,
          encodedBy: 'Admin User'
        }));

      const recentMarriages = marriages.filter(m => new Date(m.marriage_date) > thirtyDaysAgo && new Date(m.marriage_date) <= today)
        .map(m => ({
          id: m.id,
          type: 'Wedding',
          name: `${m.groom_name} & ${m.bride_name}`,
          performedBy: 'Fr. Joseph Smith',
          date: m.marriage_date,
          encodedBy: 'Admin User'
        }));

      setRecentSacraments([...recentBaptisms, ...recentMarriages].slice(0, 4));
      setTotalParishioners(members.length);

      // Calculate donation statistics
      const totalDonations = donations.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
      
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthDonations = donations.filter(d => new Date(d.donation_date || d.date) >= firstDayOfMonth);
      const thisMonthTotal = monthDonations.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const weekDonations = donations.filter(d => new Date(d.donation_date || d.date) >= sevenDaysAgo);
      const thisWeekTotal = weekDonations.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);

      const uniqueDonors = new Set(donations.map(d => d.donor_name || d.donor || 'Anonymous').filter(name => name !== 'Anonymous'));

      setDonationStats({
        totalDonations,
        thisMonth: thisMonthTotal,
        thisWeek: thisWeekTotal,
        donorCount: uniqueDonors.size
      });

      // Calculate attendance data (mock data based on schedules)
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const daySchedules = schedules.filter(s => {
          const scheduleDate = new Date(s.appointment_date);
          return scheduleDate.toDateString() === date.toDateString();
        });
        last7Days.push({
          day: date.toLocaleDateString('en-US', { weekday: 'short' }),
          count: daySchedules.length * 30 + Math.floor(Math.random() * 50) // Mock attendance
        });
      }

      setAttendanceData({
        avgSunday: 245,
        avgWeekday: 87,
        trend: '+12%',
        lastWeek: last7Days
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    showInfoToast('Exporting', 'Dashboard data export in progress');
  };

  const stats = [
    { label: 'Upcoming Schedules', value: upcomingSacraments.length, icon: Calendar, color: 'blue' },
    { label: 'Total Parishioners', value: totalParishioners.toLocaleString(), icon: Users, color: 'purple' },
    { label: 'This Month Donations', value: `₱${donationStats.thisMonth.toLocaleString()}`, icon: DollarSign, color: 'green' },
    { label: 'Recent Sacraments', value: recentSacraments.length, icon: Heart, color: 'pink' },
  ];

  const getSacramentColor = (type) => {
    const colors = {
      Baptism: 'bg-blue-100 text-blue-800',
      Wedding: 'bg-pink-100 text-pink-800',
      Confirmation: 'bg-purple-100 text-purple-800',
      Funeral: 'bg-gray-100 text-gray-800',
      Mass: 'bg-green-100 text-green-800',
      Meeting: 'bg-orange-100 text-orange-800',
      Sacrament: 'bg-indigo-100 text-indigo-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="space-y-6">
        {/* Header with Logout */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#4158D0' }}>Priest Dashboard</h1>
              <p className="text-gray-600 text-sm mt-1">Welcome back, Fr. Joseph Smith</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handleExport}
                className="flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white rounded-lg shadow-lg hover:shadow-xl transition-all"
                style={{ 
                  background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
                  boxShadow: '0 4px 12px rgba(65, 88, 208, 0.3)'
                }}
              >
                <Download size={18} />
                <span>Export</span>
              </button>
              
              {/* User Profile with Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-semibold bg-gray-50 border border-gray-200 rounded-lg hover:shadow-lg transition-all"
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md" style={{ 
                    background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
                    boxShadow: '0 4px 12px rgba(65, 88, 208, 0.3)'
                  }}>
                    <User size={20} className="text-white" />
                  </div>
                  <span className="text-gray-700 font-bold">Priest</span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-2xl z-50 overflow-hidden">
                    <button
                      onClick={onLogout}
                      className="w-full flex items-center gap-3 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                    >
                      <LogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border border-gray-200 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-transparent rounded-full transform translate-x-12 -translate-y-12 opacity-50"></div>
                <div className="relative flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl shadow-lg transform group-hover:scale-110 transition-transform" style={{ 
                    background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
                    boxShadow: '0 4px 12px rgba(65, 88, 208, 0.3)'
                  }}>
                    <Icon className="text-white" size={24} />
                  </div>
                </div>
                <div className="relative">
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">{stat.value}</h3>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick View Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Attendance Summary with Line Chart */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-50 to-transparent rounded-full transform translate-x-24 -translate-y-24 opacity-40"></div>
            <div className="relative">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Attendance Summary (Last 30 Days)</h3>
              <div className="mb-6">
                <div className="h-40 relative bg-gradient-to-br from-blue-50/30 to-gray-50/30 rounded-xl p-4 shadow-inner">
                  <svg className="w-full h-full drop-shadow-xl" viewBox="0 0 300 120" preserveAspectRatio="none">
                    {/* Grid lines */}
                    <line x1="0" y1="30" x2="300" y2="30" stroke="#E0E7FF" strokeWidth="1" />
                    <line x1="0" y1="60" x2="300" y2="60" stroke="#E0E7FF" strokeWidth="1" />
                    <line x1="0" y1="90" x2="300" y2="90" stroke="#E0E7FF" strokeWidth="1" />
                    
                    <defs>
                      <linearGradient id="attendanceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#4158D0" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity="0.05" />
                      </linearGradient>
                      <linearGradient id="attendanceLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#4158D0" />
                        <stop offset="50%" stopColor="#2563eb" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                      <filter id="attendanceShadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#4158D0" floodOpacity="0.3"/>
                      </filter>
                    </defs>
                    
                    {/* Area fill */}
                    <path
                      d="M 0 60 L 60 45 L 120 50 L 180 30 L 240 35 L 300 20 L 300 120 L 0 120 Z"
                      fill="url(#attendanceGradient)"
                    />
                    
                    {/* Line */}
                    <path
                      d="M 0 60 L 60 45 L 120 50 L 180 30 L 240 35 L 300 20"
                      fill="none"
                      stroke="url(#attendanceLineGradient)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      filter="url(#attendanceShadow)"
                    />
                    
                    {/* Data points */}
                    {[60, 45, 50, 30, 35, 20].map((y, i) => (
                    <circle
                      key={i}
                      cx={i * 60}
                      cy={y}
                      r="4"
                      fill="#4158D0"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      className="hover:r-6 transition-all cursor-pointer"
                      style={{ filter: 'drop-shadow(0 2px 4px rgba(65, 88, 208, 0.4))' }}
                    />
                  ))}
                </svg>
              </div>
              <div className="flex justify-between mt-3 px-1">
                {['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'].map((label, i) => (
                  <span key={i} className="text-xs font-medium text-gray-600">{label.split(' ')[1]}</span>
                ))}
              </div>
            </div>
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 font-medium">Average Sunday Mass</span>
                <span className="text-2xl font-bold" style={{ color: '#4158D0' }}>{attendanceData.avgSunday}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 font-medium">Weekday Mass</span>
                <span className="text-2xl font-bold" style={{ color: '#2563eb' }}>{attendanceData.avgWeekday}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 font-medium">Growth Trend</span>
                <span className="text-xl font-bold text-green-600">{attendanceData.trend}</span>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <div className="grid grid-cols-7 gap-2">
                  {attendanceData.lastWeek.map((day, index) => (
                    <div key={index} className="text-center">
                      <div className="text-xs text-gray-500 mb-1">{day.day}</div>
                      <div className="text-sm font-bold" style={{ color: '#4158D0' }}>{day.count}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

          {/* Donation Summary */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-green-50 to-transparent rounded-full transform translate-x-24 -translate-y-24 opacity-40"></div>
            <div className="relative">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Donation Summary</h3>
              <div className="space-y-5">
                <div className="flex justify-between items-center p-4 rounded-xl bg-white border-2 border-blue-100 hover:border-blue-200 transition-all shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg" style={{ background: 'rgba(65, 88, 208, 0.1)' }}>
                      <DollarSign size={18} style={{ color: '#4158D0' }} />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Total All Time</span>
                  </div>
                  <span className="text-2xl font-bold" style={{ color: '#4158D0' }}>
                    ₱{donationStats.totalDonations.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 rounded-xl bg-white border-2 border-green-100 hover:border-green-200 transition-all shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                      <DollarSign size={18} style={{ color: '#10b981' }} />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">This Month</span>
                  </div>
                  <span className="text-2xl font-bold" style={{ color: '#10b981' }}>
                    ₱{donationStats.thisMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 rounded-xl bg-white border-2 border-cyan-100 hover:border-cyan-200 transition-all shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg" style={{ background: 'rgba(6, 182, 212, 0.1)' }}>
                      <DollarSign size={18} style={{ color: '#06b6d4' }} />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">This Week</span>
                  </div>
                  <span className="text-2xl font-bold" style={{ color: '#06b6d4' }}>
                    ₱{donationStats.thisWeek.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 rounded-xl bg-white border-2 border-purple-100 hover:border-purple-200 transition-all shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg" style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
                      <Users size={18} style={{ color: '#8b5cf6' }} />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Active Donors</span>
                  </div>
                  <span className="text-2xl font-bold" style={{ color: '#8b5cf6' }}>
                    {donationStats.donorCount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-6 py-3 text-sm font-semibold rounded-xl transition-all ${
                activeTab === 'upcoming' ? 'shadow-lg' : 'text-gray-600 hover:bg-gray-50'
              }`}
              style={{
                background: activeTab === 'upcoming' ? 'rgba(65, 88, 208, 0.1)' : 'transparent',
                backdropFilter: activeTab === 'upcoming' ? 'blur(10px)' : 'none',
                WebkitBackdropFilter: activeTab === 'upcoming' ? 'blur(10px)' : 'none',
                color: activeTab === 'upcoming' ? '#4158D0' : undefined,
                border: activeTab === 'upcoming' ? '1px solid rgba(65, 88, 208, 0.2)' : '1px solid transparent',
                boxShadow: activeTab === 'upcoming' ? '0 4px 12px rgba(65, 88, 208, 0.15)' : 'none'
              }}
            >
              Upcoming Sacraments
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-6 py-3 text-sm font-semibold rounded-xl transition-all ${
                activeTab === 'events' ? 'shadow-lg' : 'text-gray-600 hover:bg-gray-50'
              }`}
              style={{
                background: activeTab === 'events' ? 'rgba(65, 88, 208, 0.1)' : 'transparent',
                backdropFilter: activeTab === 'events' ? 'blur(10px)' : 'none',
                WebkitBackdropFilter: activeTab === 'events' ? 'blur(10px)' : 'none',
                color: activeTab === 'events' ? '#4158D0' : undefined,
                border: activeTab === 'events' ? '1px solid rgba(65, 88, 208, 0.2)' : '1px solid transparent',
                boxShadow: activeTab === 'events' ? '0 4px 12px rgba(65, 88, 208, 0.15)' : 'none'
              }}
            >
              Next 7 Days Events
            </button>
            <button
              onClick={() => setActiveTab('recent')}
              className={`px-6 py-3 text-sm font-semibold rounded-xl transition-all ${
                activeTab === 'recent' ? 'shadow-lg' : 'text-gray-600 hover:bg-gray-50'
              }`}
              style={{
                background: activeTab === 'recent' ? 'rgba(65, 88, 208, 0.1)' : 'transparent',
                backdropFilter: activeTab === 'recent' ? 'blur(10px)' : 'none',
                WebkitBackdropFilter: activeTab === 'recent' ? 'blur(10px)' : 'none',
                color: activeTab === 'recent' ? '#4158D0' : undefined,
                border: activeTab === 'recent' ? '1px solid rgba(65, 88, 208, 0.2)' : '1px solid transparent',
                boxShadow: activeTab === 'recent' ? '0 4px 12px rgba(65, 88, 208, 0.15)' : 'none'
              }}
            >
              Recent Entries
            </button>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'upcoming' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Name/Couple</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Family</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Date & Time</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Location</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {upcomingSacraments.map((sacrament) => (
                      <tr key={sacrament.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getSacramentColor(sacrament.type)}`}>
                            {sacrament.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                          {sacrament.childName || sacrament.couple || sacrament.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{sacrament.family}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {sacrament.date} • {sacrament.time}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{sacrament.location}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'events' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Title</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Time</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Attendees</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {upcomingEvents.map((event) => (
                      <tr key={event.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">{event.title}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{event.date}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{event.time}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{event.attendees}</td>
                        <td className="px-4 py-3">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getSacramentColor(event.type)}`}>
                            {event.type}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'recent' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Performed By</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Encoded By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentSacraments.map((sacrament) => (
                      <tr key={sacrament.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getSacramentColor(sacrament.type)}`}>
                            {sacrament.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">{sacrament.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{sacrament.performedBy}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{sacrament.date}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{sacrament.encodedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriestDashboard;
