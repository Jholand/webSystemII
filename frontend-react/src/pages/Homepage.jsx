import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { authAPI } from '../services/authAPI';
import { 
  Church, 
  Calendar, 
  Phone,
  MapPin,
  Mail,
  Menu,
  X,
  Music,
  Sparkles,
  Users,
  LogIn,
  Baby,
  Heart,
  Eye,
  EyeOff,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import ModalOverlay from '../components/ModalOverlay';
import { scheduleService } from '../services/churchService';
import crossartImage from '../assets/crossart.jpg';
import { formatDateShort } from '../utils/dateFormatter';

const Homepage = ({ onLogin }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [massSchedule, setMassSchedule] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [registrationStep, setRegistrationStep] = useState(1);
  
  // Additional registration fields
  const [registrationData, setRegistrationData] = useState({
    phone: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    birthdate: '',
    gender: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: ''
  });

  // Fetch schedules on component mount
  useEffect(() => {
    fetchSchedules();
    // Load registered users from localStorage
    const stored = localStorage.getItem('registeredUsers');
    if (stored) {
      setRegisteredUsers(JSON.parse(stored));
    }
    
    // Check if user is already logged in via cookies
    const isLoggedIn = Cookies.get('isLoggedIn');
    const userRole = Cookies.get('userRole');
    
    if (isLoggedIn && userRole) {
      const roleForRoute = userRole === 'church_admin' ? 'church-admin' : userRole;
      navigate(`/${roleForRoute}/dashboard`);
    }
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await scheduleService.getAll();
      // Handle both direct array and wrapped response
      const schedules = Array.isArray(response) ? response : (response.data || []);
      
      const upcomingSchedules = schedules
        .filter(s => new Date(s.date) >= new Date())
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 3);
      
      setUpcomingEvents(upcomingSchedules.map(s => ({
        date: formatDateShort(s.date),
        title: s.title,
        type: s.type,
        description: s.description || `${s.type} event at the church`,
        location: s.location || 'Main Church'
      })));

      // Filter mass schedules
      const masses = schedules.filter(s => s.type?.toLowerCase().includes('mass'));
      setMassSchedule(masses.map(s => ({
        day: new Date(s.date).toLocaleDateString('en-US', { weekday: 'long' }),
        time: s.time,
        type: s.title || s.type
      })));
    } catch (error) {
      console.error('Error fetching schedules:', error);
      // Fallback to default schedule
      setMassSchedule([
        { day: 'Sunday', time: '6:00 AM', type: 'First Mass' },
        { day: 'Sunday', time: '8:00 AM', type: 'Second Mass' },
        { day: 'Sunday', time: '10:00 AM', type: 'Third Mass' },
        { day: 'Weekdays', time: '6:00 AM', type: 'Morning Mass' },
        { day: 'Weekdays', time: '6:00 PM', type: 'Evening Mass' }
      ]);
    }
  };

  // Mock user database with predefined roles
  const users = {
    'admin@church.com': { password: 'admin', role: 'admin', name: 'Administrator' },
    'priest@church.com': { password: 'priest', role: 'priest', name: 'Father John' },
    'accountant@church.com': { password: 'accountant', role: 'accountant', name: 'Accountant' },
    'churchadmin@church.com': { password: 'churchadmin', role: 'church_admin', name: 'Church Admin' },
    'user@church.com': { password: 'user', role: 'user', name: 'Member' },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isSignUp) {
      // If not on the final step, don't submit - just for safety
      if (registrationStep !== 3) {
        setLoading(false);
        return;
      }

      // Final validation before submission
      if (!fullName || !emailOrUsername || !password || !confirmPassword) {
        setError('Please complete all required fields in Step 1');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }
      
      // Check if email already exists
      if (users[emailOrUsername.toLowerCase()] || registeredUsers.some(u => u.email.toLowerCase() === emailOrUsername.toLowerCase())) {
        setError('Email already registered');
        setLoading(false);
        return;
      }
      
      try {
        // Register new user in database with all collected data
        const response = await authAPI.register({
          name: fullName,
          email: emailOrUsername.toLowerCase(),
          password: password,
          phone: registrationData.phone || null,
          address: registrationData.address || null,
          city: registrationData.city || null,
          province: registrationData.province || null,
          postal_code: registrationData.postalCode || null,
          birthdate: registrationData.birthdate || null,
          gender: registrationData.gender || null,
          emergency_contact_name: registrationData.emergencyContactName || null,
          emergency_contact_phone: registrationData.emergencyContactPhone || null,
          emergency_contact_relation: registrationData.emergencyContactRelation || null,
        });
        
        // Save to localStorage for backward compatibility
        const newUser = {
          email: emailOrUsername.toLowerCase(),
          password: password,
          name: fullName,
          role: 'user',
          registeredAt: new Date().toISOString(),
          userId: response.user.id
        };
        
        const updatedUsers = [...registeredUsers, newUser];
        setRegisteredUsers(updatedUsers);
        localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
        
        // Set cookies for authentication (7 days expiry)
        Cookies.set('isLoggedIn', 'true', { expires: 7 });
        Cookies.set('userRole', 'user', { expires: 7 });
        Cookies.set('userName', fullName, { expires: 7 });
        Cookies.set('userId', response.user.id, { expires: 7 });
        localStorage.setItem('userId', response.user.id);
        
        // Auto login after registration
        onLogin('user');
        navigate('/user/dashboard');
      } catch (error) {
        console.error('Registration error:', error);
        setError(error.response?.data?.message || 'Registration failed. Please try again.');
        setLoading(false);
      }
    } else {
      // Sign in validation
      if (!emailOrUsername || !password) {
        setError('Please enter both email/username and password');
        setLoading(false);
        return;
      }

      try {
        // Call login API
        const response = await authAPI.login({
          email: emailOrUsername.trim().toLowerCase(),
          password: password.trim()
        });

        // Token is automatically stored by authAPI.login
        const user = response.user;
        
        // Set cookies for authentication (7 days expiry)
        Cookies.set('isLoggedIn', 'true', { expires: 7 });
        Cookies.set('userRole', user.role, { expires: 7 });
        Cookies.set('userName', user.name, { expires: 7 });
        Cookies.set('userId', user.id, { expires: 7 });
        
        // Convert role to route path
        const roleForRoute = user.role === 'church_admin' ? 'church-admin' : user.role;
        onLogin(user.role);
        navigate(`/${roleForRoute}/dashboard`);
        
      } catch (error) {
        console.error('Login error:', error);
        setError(error.response?.data?.message || 'Invalid email or password');
        setLoading(false);
      }
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setEmailOrUsername('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setRegistrationStep(1); // Reset to step 1 when toggling modes
  };

  return (
    <div className="min-h-screen">
      {/* Navbar with Transparent Background */}
      <nav className="fixed top-0 left-0 right-0 z-50" style={{ 
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(65, 88, 208, 0.15)',
        boxShadow: '0 2px 10px 0 rgba(0, 0, 0, 0.08)'
      }}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative p-3 rounded-2xl overflow-hidden group" style={{
                background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
                boxShadow: '0 2px 8px 0 rgba(65, 88, 208, 0.3)'
              }}>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Church className="h-7 w-7 text-white relative z-10" />
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{
                  color: '#1a1a1a'
                }}>Our Lady of Peace</h1>
                <p className="text-xs" style={{ color: '#4a5568' }}>and Good Voyage Mission Area</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setIsSignUp(false);
                  setShowLoginModal(true);
                }}
                className="px-6 py-2.5 font-semibold rounded-xl transition-all duration-300 flex items-center gap-2 group relative overflow-hidden hover:bg-gray-50"
                style={{ 
                  background: 'rgba(65, 88, 208, 0.1)',
                  color: '#4158D0',
                  border: '1px solid rgba(65, 88, 208, 0.2)',
                  boxShadow: '0 4px 12px rgba(65, 88, 208, 0.15)'
                }}
              >
                <LogIn size={18} className="group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
                Login
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Modern Dashboard Design */}
      <section className="relative min-h-screen flex items-center overflow-hidden" style={{
        background: 'linear-gradient(135deg, #e8f0fe 0%, #e3f2fd 50%, #f0f4ff 100%)',
      }}>
        {/* Decorative Background Elements */}
        <div className="absolute top-20 right-0 w-96 h-96 rounded-full blur-3xl opacity-30" style={{ background: 'radial-gradient(circle, #4158D0 0%, transparent 70%)' }}></div>
        <div className="absolute bottom-20 left-0 w-96 h-96 rounded-full blur-3xl opacity-30" style={{ background: 'radial-gradient(circle, #2563eb 0%, transparent 70%)' }}></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Text Content */}
            <div className="space-y-8 animate-fade-in-up">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{
                background: 'rgba(65, 88, 208, 0.1)',
                border: '1px solid rgba(65, 88, 208, 0.2)'
              }}>
                <Church size={16} style={{ color: '#4158D0' }} />
                <span className="text-sm font-semibold" style={{ color: '#4158D0' }}>Serving Our Community Since 1952</span>
              </div>

              <div className="space-y-6">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight" style={{ color: '#1a1a1a' }}>
                  Welcome to Our{' '}
                  <span style={{ color: '#4158D0' }}>Faith Community</span>
                </h1>
                
                <p className="text-xl md:text-2xl leading-relaxed" style={{ color: '#4a5568' }}>
                  A community of <span className="font-semibold" style={{ color: '#4158D0' }}>faith</span>, hope, and love, where everyone is welcome to worship, grow, and serve together.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => {
                    setIsSignUp(true);
                    setShowLoginModal(true);
                  }}
                  className="px-10 py-4 font-semibold text-lg rounded-2xl transition-all duration-300 inline-flex items-center gap-3 group relative overflow-hidden"
                  style={{ 
                    background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)',
                    color: 'white',
                    boxShadow: '0 4px 15px 0 rgba(65, 88, 208, 0.3)',
                    border: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px 0 rgba(65, 88, 208, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px 0 rgba(65, 88, 208, 0.3)';
                  }}
                >
                  <Users size={24} className="group-hover:scale-110 transition-transform" />
                  Join Our Community
                </button>
                
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="px-10 py-4 font-semibold text-lg rounded-2xl transition-all duration-300 inline-flex items-center gap-3 group"
                  style={{
                    background: 'white',
                    color: '#4158D0',
                    border: '2px solid #4158D0',
                    boxShadow: '0 4px 15px 0 rgba(65, 88, 208, 0.15)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#4158D0';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px 0 rgba(65, 88, 208, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.color = '#4158D0';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px 0 rgba(65, 88, 208, 0.15)';
                  }}
                >
                  <BookOpen size={24} />
                  Learn More
                  <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                </button>
              </div>
            </div>

            {/* Right Side - Dashboard Cards */}
            <div className="relative h-[600px] animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              {/* New Members Card */}
              <div 
                className="absolute top-8 right-12 bg-white rounded-2xl p-6 shadow-xl transition-all duration-300 hover:shadow-2xl"
                style={{ 
                  width: '220px',
                  transform: 'rotate(-2deg)',
                  animation: 'float 6s ease-in-out infinite'
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold" style={{ color: '#4a5568' }}>New Members</span>
                  <Users size={20} style={{ color: '#4158D0' }} />
                </div>
                <div className="text-4xl font-bold mb-2" style={{ color: '#1a1a1a' }}>125K</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full" style={{ background: '#e0e0e0' }}>
                    <div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #4158D0, #2563eb)', width: '75%' }}></div>
                  </div>
                  <span className="text-xs font-semibold" style={{ color: '#4158D0' }}>+25%</span>
                </div>
              </div>

              {/* Donations Card */}
              <div 
                className="absolute top-32 left-4 bg-white rounded-2xl p-6 shadow-xl transition-all duration-300 hover:shadow-2xl"
                style={{ 
                  width: '200px',
                  transform: 'rotate(2deg)',
                  animation: 'float 5s ease-in-out infinite',
                  animationDelay: '0.5s'
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold" style={{ color: '#4a5568' }}>Donations</span>
                  <Heart size={20} style={{ color: '#3b82f6' }} />
                </div>
                <div className="text-3xl font-bold mb-1" style={{ color: '#1a1a1a' }}>82%</div>
                <div className="text-xs" style={{ color: '#4a5568' }}>Collection Rate</div>
                <div className="text-xs mt-1" style={{ color: '#4158D0' }}>This month</div>
              </div>

              {/* Account/Sacraments Card - Center */}
              <div 
                className="absolute top-48 left-1/2 transform -translate-x-1/2 bg-white rounded-3xl p-8 shadow-2xl"
                style={{ 
                  width: '320px',
                  animation: 'float 7s ease-in-out infinite',
                  animationDelay: '1s'
                }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold" style={{ color: '#1a1a1a' }}>Sacraments</h3>
                  <ArrowRight size={20} style={{ color: '#4158D0' }} />
                </div>
                
                {/* Services Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="p-4 rounded-xl transition-all duration-300"
                    style={{ background: 'linear-gradient(135deg, rgba(65, 88, 208, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Baby size={28} style={{ color: '#4158D0' }} />
                      <span className="text-xs font-semibold" style={{ color: '#1e40af' }}>Baptism</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="p-4 rounded-xl transition-all duration-300"
                    style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Heart size={28} style={{ color: '#3b82f6' }} />
                      <span className="text-xs font-semibold" style={{ color: '#1e40af' }}>Wedding</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="p-4 rounded-xl transition-all duration-300"
                    style={{ background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(29, 78, 216, 0.1) 100%)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Church size={28} style={{ color: '#2563eb' }} />
                      <span className="text-xs font-semibold" style={{ color: '#1e40af' }}>Mass</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="p-4 rounded-xl transition-all duration-300"
                    style={{ background: 'linear-gradient(135deg, rgba(29, 78, 216, 0.1) 0%, rgba(65, 88, 208, 0.1) 100%)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Calendar size={28} style={{ color: '#1d4ed8' }} />
                      <span className="text-xs font-semibold" style={{ color: '#1e40af' }}>Events</span>
                    </div>
                  </button>
                </div>

                {/* Revenue Display */}
                <div className="pt-4 border-t" style={{ borderColor: '#e0e0e0' }}>
                  <div className="text-sm mb-2" style={{ color: '#4a5568' }}>Total Collections</div>
                  <div className="text-3xl font-bold" style={{ color: '#1a1a1a' }}>$2,995.85</div>
                  <div className="text-xs mt-1" style={{ color: '#4158D0' }}>+12.5% from last period</div>
                </div>
              </div>

              {/* Events/Returns Card */}
              <div 
                className="absolute bottom-12 right-4 bg-white rounded-2xl p-6 shadow-xl transition-all duration-300 hover:shadow-2xl"
                style={{ 
                  width: '180px',
                  transform: 'rotate(-3deg)',
                  animation: 'float 6s ease-in-out infinite',
                  animationDelay: '1.5s'
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold" style={{ color: '#4a5568' }}>Active</span>
                  <Calendar size={20} style={{ color: '#3b82f6' }} />
                </div>
  
              </div>

              {/* Floating Icon Elements */}
              <div 
                className="absolute top-4 left-8 bg-white rounded-2xl p-4 shadow-lg"
                style={{ 
                  animation: 'bounce-slow 4s ease-in-out infinite',
                  transform: 'rotate(-8deg)'
                }}
              >
                <BookOpen size={32} style={{ color: '#4158D0' }} />
              </div>

              <div 
                className="absolute bottom-24 left-12 bg-white rounded-2xl p-3 shadow-lg"
                style={{ 
                  animation: 'bounce-slow 5s ease-in-out infinite',
                  animationDelay: '1s',
                  transform: 'rotate(8deg)'
                }}
              >
                <Music size={24} style={{ color: '#3b82f6' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events Section with Glassmorphism */}
      <section className="relative py-24 overflow-hidden" style={{
        background: 'white'
      }}>
        {/* Background decorative elements */}
        <div className="absolute top-20 right-0 w-96 h-96 rounded-full blur-3xl opacity-10" style={{ background: 'radial-gradient(circle, #4158D0 0%, transparent 70%)' }}></div>
        <div className="absolute bottom-20 left-0 w-96 h-96 rounded-full blur-3xl opacity-10" style={{ background: 'radial-gradient(circle, #2563eb 0%, transparent 70%)' }}></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block px-6 py-2 rounded-full mb-4" style={{
              background: 'rgba(65, 88, 208, 0.1)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(65, 88, 208, 0.2)'
            }}>
              <span className="text-sm font-semibold" style={{ color: '#4158D0' }}>UPCOMING</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6" style={{ 
              color: '#1a1a1a'
            }}>
              Upcoming <span style={{ color: '#4158D0' }}>Events</span>
            </h2>
            <p className="text-xl font-light" style={{ color: '#4a5568' }}>Join us in celebrating faith and fellowship</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event, idx) => (
                <div key={idx} className="rounded-3xl p-8 group cursor-pointer transition-all duration-500" style={{ 
                  background: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 12px 48px 0 rgba(31, 38, 135, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(31, 38, 135, 0.15)';
                }}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-2xl relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)', boxShadow: '0 4px 16px rgba(65, 88, 208, 0.4)' }}>
                      {event.type === 'Wedding' ? <Heart className="h-7 w-7 text-white" /> :
                       event.type === 'Baptism' ? <Baby className="h-7 w-7 text-white" /> :
                       event.type === 'Conference' ? <Users className="h-7 w-7 text-white" /> :
                       <Calendar className="h-7 w-7 text-white" />}
                    </div>
                    <span className="text-sm font-bold tracking-wide" style={{ color: '#4158D0' }}>{event.date.toUpperCase()}</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4" style={{ color: '#1a1a1a' }}>{event.title}</h3>
                  <p className="text-sm mb-6 leading-relaxed" style={{ color: '#4a5568' }}>{event.description}</p>
                  <div className="flex items-center gap-2" style={{ color: '#2563eb' }}>
                    <MapPin size={18} className="flex-shrink-0" />
                    <p className="text-sm font-semibold">{event.location}</p>
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="rounded-3xl p-8 group cursor-pointer transition-all duration-500" style={{ 
                  background: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 12px 48px 0 rgba(31, 38, 135, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(31, 38, 135, 0.15)';
                }}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-2xl" style={{ background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)', boxShadow: '0 4px 16px rgba(65, 88, 208, 0.4)' }}>
                      <Music className="h-7 w-7 text-white" />
                    </div>
                    <span className="text-sm font-bold tracking-wide" style={{ color: '#4158D0' }}>DEC 15</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4" style={{ color: '#1a1a1a' }}>Choir Concert</h3>
                  <p className="text-sm mb-6 leading-relaxed" style={{ color: '#4a5568' }}>Join us for an evening of beautiful music and worship.</p>
                  <div className="flex items-center gap-2" style={{ color: '#2563eb' }}>
                    <Calendar size={18} />
                    <p className="text-sm font-semibold">6:00 PM</p>
                  </div>
                </div>
                
                <div className="rounded-3xl p-8 group cursor-pointer transition-all duration-500" style={{ 
                  background: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 12px 48px 0 rgba(31, 38, 135, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(31, 38, 135, 0.15)';
                }}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-2xl" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', boxShadow: '0 4px 16px rgba(59, 130, 246, 0.4)' }}>
                      <Sparkles className="h-7 w-7 text-white" />
                    </div>
                    <span className="text-sm font-bold tracking-wide" style={{ color: '#4158D0' }}>DEC 24</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4" style={{ color: '#1a1a1a' }}>Christmas Eve Mass</h3>
                  <p className="text-sm mb-6 leading-relaxed" style={{ color: '#4a5568' }}>Celebrate the birth of our Savior with a special midnight mass.</p>
                  <div className="flex items-center gap-2" style={{ color: '#2563eb' }}>
                    <Calendar size={18} />
                    <p className="text-sm font-semibold">11:00 PM</p>
                  </div>
                </div>
                
                <div className="rounded-3xl p-8 group cursor-pointer transition-all duration-500" style={{ 
                  background: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 12px 48px 0 rgba(31, 38, 135, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(31, 38, 135, 0.15)';
                }}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-2xl" style={{ background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)', boxShadow: '0 4px 16px rgba(65, 88, 208, 0.4)' }}>
                      <Users className="h-7 w-7 text-white" />
                    </div>
                    <span className="text-sm font-bold tracking-wide" style={{ color: '#4158D0' }}>JAN 5</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4" style={{ color: '#1a1a1a' }}>Leadership Summit</h3>
                  <p className="text-sm mb-6 leading-relaxed" style={{ color: '#4a5568' }}>Empowering young leaders through faith-based activities.</p>
                  <div className="flex items-center gap-2" style={{ color: '#2563eb' }}>
                    <Calendar size={18} />
                    <p className="text-sm font-semibold">9:00 AM - 4:00 PM</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-16 overflow-hidden" style={{ background: 'white', borderTop: '1px solid rgba(65, 88, 208, 0.15)' }}>
        {/* Subtle Background Elements */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-10" style={{ background: 'radial-gradient(circle, #4158D0 0%, transparent 70%)' }}></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl opacity-10" style={{ background: 'radial-gradient(circle, #2563eb 0%, transparent 70%)' }}></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl" style={{ background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)' }}>
                  <Church className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold" style={{ color: '#1a1a1a' }}>Our Lady of Peace</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: '#4a5568' }}>
                and Good Voyage Mission Area
              </p>
              <p className="text-sm mt-2" style={{ color: '#4a5568' }}>
                Serving God and our community since 1952.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: '#1a1a1a' }}>
                <Calendar className="h-5 w-5" style={{ color: '#4158D0' }} />
                Mass Schedule
              </h4>
              <ul className="space-y-2 text-sm" style={{ color: '#4a5568' }}>
                {massSchedule.length > 0 ? (
                  massSchedule.slice(0, 4).map((mass, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-white rounded-full shadow"></div>
                      {mass.day}: {mass.time.substring(0, 5)}
                    </li>
                  ))
                ) : (
                  <>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-white rounded-full shadow"></div>
                      Sunday: 7AM, 9AM, 11AM, 5PM
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-white rounded-full shadow"></div>
                      Weekdays: 6AM, 6PM
                    </li>
                  </>
                )}
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: '#1a1a1a' }}>
                <Phone className="h-5 w-5" style={{ color: '#4158D0' }} />
                Contact Us
              </h4>
              <ul className="space-y-3 text-sm" style={{ color: '#4a5568' }}>
                <li className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg shadow-sm" style={{ background: 'rgba(65, 88, 208, 0.1)' }}>
                    <MapPin className="h-4 w-4" style={{ color: '#4158D0' }} />
                  </div>
                  <span>123 Dalapian St, Brgy Centro</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg shadow-sm" style={{ background: 'rgba(65, 88, 208, 0.1)' }}>
                    <Phone className="h-4 w-4" style={{ color: '#4158D0' }} />
                  </div>
                  <span>+63 123 456 7890</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg shadow-sm" style={{ background: 'rgba(65, 88, 208, 0.1)' }}>
                    <Mail className="h-4 w-4" style={{ color: '#4158D0' }} />
                  </div>
                  <span>info@dalapianchurch.com</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-6" style={{ borderColor: 'rgba(65, 88, 208, 0.15)' }}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-center md:text-left" style={{ color: '#6b7280' }}>
                &copy; 2025 Our Lady of Peace and Good Voyage Mission Area. All rights reserved.
              </p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="text-sm font-medium transition-colors flex items-center gap-2"
                  style={{ color: '#4a5568' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#4158D0'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#4a5568'}
                >
                  <LogIn size={16} />
                  Member Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Login/Registration Modal */}
      <ModalOverlay isOpen={showLoginModal} onClose={() => setShowLoginModal(false)}>
        <div className="rounded-2xl shadow-2xl w-full overflow-hidden bg-white" style={{ maxWidth: isSignUp ? '900px' : '500px' }}>
          {isSignUp ? (
            // Split Layout for Registration
            <div className="flex flex-col md:flex-row">
              {/* Left Panel - Church Branding (Registration Only) */}
              <div className="md:w-1/2 p-8 bg-white relative overflow-hidden flex items-center justify-center">
                <div className="relative z-10 text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl mb-6 shadow-lg" style={{ background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)' }}>
                    <Church size={48} className="text-white" />
                  </div>
                  <h1 className="text-3xl font-bold leading-tight" style={{ color: '#1a1a1a' }}>
                    Our Lady of Peace<br />and Good Voyage<br />Mission Area
                  </h1>
                  <p className="text-sm mt-3" style={{ color: '#4a5568' }}>Join our faith community</p>
                </div>

                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-64 h-64 opacity-5 rounded-full -mr-32 -mt-32" style={{ background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)' }}></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 opacity-5 rounded-full -ml-24 -mb-24" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)' }}></div>
              </div>

              {/* Right Panel - Registration Form */}
              <div className="md:w-1/2 p-6 relative bg-gradient-to-br from-gray-50 to-gray-100">
                <button 
                  onClick={() => {
                    setShowLoginModal(false);
                    setIsSignUp(false);
                    setRegistrationStep(1);
                  }}
                  className="absolute top-4 right-4 p-2 rounded-lg transition-all duration-200 z-10 hover:rotate-90"
                  style={{ backgroundColor: 'rgba(65, 88, 208, 0.1)', color: '#4158D0' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(65, 88, 208, 0.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(65, 88, 208, 0.1)'}
                >
                  <X size={18} />
                </button>

                {/* Form Title */}
                <div className="mb-4">
                  <h2 className="text-xl font-bold mb-1" style={{ color: '#1a1a1a' }}>
                    Create Account
                  </h2>
                  <p className="text-xs" style={{ color: '#4a5568' }}>
                    Fill in your details to get started
                  </p>
                </div>

                {error && (
                  <div className="border-l-4 p-3 rounded-lg mb-4 shadow-sm" style={{ backgroundColor: '#fff5f5', borderColor: '#f87171' }}>
                    <p className="text-xs font-medium" style={{ color: '#dc2626' }}>{error}</p>
                  </div>
                )}

                {/* Step Indicator for Sign Up */}
                <div className="flex justify-center mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold transition-all ${registrationStep === 1 ? 'text-white shadow-lg' : 'bg-gray-200 text-gray-600'}`} style={registrationStep === 1 ? { background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)' } : {}}>
                      1
                    </div>
                    <div className={`w-12 h-1 rounded ${registrationStep > 1 ? 'bg-gradient-to-r' : 'bg-gray-200'}`} style={registrationStep > 1 ? { background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)' } : {}}></div>
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold transition-all ${registrationStep === 2 ? 'text-white shadow-lg' : 'bg-gray-200 text-gray-600'}`} style={registrationStep === 2 ? { background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)' } : {}}>
                      2
                    </div>
                    <div className={`w-12 h-1 rounded ${registrationStep > 2 ? 'bg-gradient-to-r' : 'bg-gray-200'}`} style={registrationStep > 2 ? { background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)' } : {}}></div>
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold transition-all ${registrationStep === 3 ? 'text-white shadow-lg' : 'bg-gray-200 text-gray-600'}`} style={registrationStep === 3 ? { background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)' } : {}}>
                      3
                    </div>
                  </div>
                </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Step 1: Account Information */}
                {isSignUp && registrationStep === 1 && (
                  <>
                    <h3 className="text-base font-bold mb-3" style={{ color: '#1a1a1a' }}>Account Information</h3>
                    <div>
                      <label htmlFor="fullName" className="block text-xs font-semibold mb-1" style={{ color: '#4158D0' }}>
                        Full Name
                      </label>
                      <input
                        id="fullName"
                        type="text"
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none transition-all duration-300 bg-white"
                        style={{ 
                          borderWidth: '2px',
                          borderColor: 'rgba(65, 88, 208, 0.2)',
                          color: '#1e293b'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#4158D0'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(65, 88, 208, 0.2)'}
                      />
                    </div>
                    <div>
                      <label htmlFor="emailOrUsername" className="block text-xs font-semibold mb-1" style={{ color: '#4158D0' }}>
                        Email
                      </label>
                      <input
                        id="emailOrUsername"
                        type="email"
                        placeholder="name@example.com"
                        value={emailOrUsername}
                        onChange={(e) => setEmailOrUsername(e.target.value)}
                        className="w-full px-4 py-3 text-sm rounded-lg focus:outline-none transition-all duration-300 bg-white"
                        style={{ 
                          borderWidth: '2px',
                          borderColor: 'rgba(65, 88, 208, 0.2)',
                          color: '#1e293b'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#4158D0'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(65, 88, 208, 0.2)'}
                      />
                    </div>
                    <div>
                      <label htmlFor="password" className="block text-sm font-semibold mb-2" style={{ color: '#4158D0' }}>
                        Password
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full px-4 py-3 pr-12 text-sm rounded-lg focus:outline-none transition-all duration-300 bg-white"
                          style={{ 
                            borderWidth: '2px',
                            borderColor: 'rgba(65, 88, 208, 0.2)',
                            color: '#1e293b'
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#4158D0'}
                          onBlur={(e) => e.target.style.borderColor = 'rgba(65, 88, 208, 0.2)'}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                          style={{ color: '#4158D0' }}
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-semibold mb-2" style={{ color: '#4158D0' }}>
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-3 py-2 pr-10 text-sm rounded-lg focus:outline-none transition-all duration-300 bg-white"
                          style={{ 
                            borderWidth: '2px',
                            borderColor: 'rgba(65, 88, 208, 0.2)',
                            color: '#1e293b'
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#4158D0'}
                          onBlur={(e) => e.target.style.borderColor = 'rgba(65, 88, 208, 0.2)'}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                          style={{ color: '#4158D0' }}
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!fullName || !emailOrUsername || !password || !confirmPassword) {
                          setError('Please fill in all fields');
                          return;
                        }
                        if (password !== confirmPassword) {
                          setError('Passwords do not match');
                          return;
                        }
                        setError('');
                        setRegistrationStep(2);
                      }}
                      className="w-full py-2.5 rounded-xl text-sm font-semibold shadow-lg transition-all duration-300 hover:bg-gray-50"
                      style={{ 
                        background: 'rgba(65, 88, 208, 0.1)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        color: '#4158D0',
                        border: '1px solid rgba(65, 88, 208, 0.2)',
                        boxShadow: '0 4px 12px rgba(65, 88, 208, 0.15)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      Next: Personal Information
                    </button>
                  </>
                )}

                {/* Step 2: Personal Information */}
                {isSignUp && registrationStep === 2 && (
                  <>
                    <h3 className="text-base font-bold mb-3" style={{ color: '#1a1a1a' }}>Personal Information</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color: '#4158D0' }}>
                          Birthdate
                        </label>
                        <input
                          type="date"
                          value={registrationData.birthdate}
                          onChange={(e) => setRegistrationData({...registrationData, birthdate: e.target.value})}
                          className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none bg-white"
                          style={{ borderWidth: '2px', borderColor: 'rgba(65, 88, 208, 0.2)', color: '#1e293b' }}
                          onFocus={(e) => e.target.style.borderColor = '#4158D0'}
                          onBlur={(e) => e.target.style.borderColor = 'rgba(65, 88, 208, 0.2)'}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color: '#4158D0' }}>
                          Gender
                        </label>
                        <select
                          value={registrationData.gender}
                          onChange={(e) => setRegistrationData({...registrationData, gender: e.target.value})}
                          className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none bg-white"
                          style={{ borderWidth: '2px', borderColor: 'rgba(65, 88, 208, 0.2)', color: '#1e293b' }}
                          onFocus={(e) => e.target.style.borderColor = '#4158D0'}
                          onBlur={(e) => e.target.style.borderColor = 'rgba(65, 88, 208, 0.2)'}
                        >
                          <option value="">Select</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1" style={{ color: '#4158D0' }}>
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="+63 912 345 6789"
                        value={registrationData.phone}
                        onChange={(e) => setRegistrationData({...registrationData, phone: e.target.value})}
                        className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none bg-white"
                        style={{ borderWidth: '2px', borderColor: 'rgba(65, 88, 208, 0.2)', color: '#1e293b' }}
                        onFocus={(e) => e.target.style.borderColor = '#4158D0'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(65, 88, 208, 0.2)'}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1" style={{ color: '#4158D0' }}>
                        Street Address
                      </label>
                      <input
                        type="text"
                        placeholder="123 Main Street"
                        value={registrationData.address}
                        onChange={(e) => setRegistrationData({...registrationData, address: e.target.value})}
                        className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none bg-white"
                        style={{ borderWidth: '2px', borderColor: 'rgba(65, 88, 208, 0.2)', color: '#1e293b' }}
                        onFocus={(e) => e.target.style.borderColor = '#4158D0'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(65, 88, 208, 0.2)'}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color: '#4158D0' }}>
                          City
                        </label>
                        <input
                          type="text"
                          placeholder="Manila"
                          value={registrationData.city}
                          onChange={(e) => setRegistrationData({...registrationData, city: e.target.value})}
                          className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none bg-white"
                          style={{ borderWidth: '2px', borderColor: 'rgba(65, 88, 208, 0.2)', color: '#1e293b' }}
                          onFocus={(e) => e.target.style.borderColor = '#4158D0'}
                          onBlur={(e) => e.target.style.borderColor = 'rgba(65, 88, 208, 0.2)'}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color: '#4158D0' }}>
                          Province
                        </label>
                        <input
                          type="text"
                          placeholder="Metro Manila"
                          value={registrationData.province}
                          onChange={(e) => setRegistrationData({...registrationData, province: e.target.value})}
                          className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none bg-white"
                          style={{ borderWidth: '2px', borderColor: 'rgba(65, 88, 208, 0.2)', color: '#1e293b' }}
                          onFocus={(e) => e.target.style.borderColor = '#4158D0'}
                          onBlur={(e) => e.target.style.borderColor = 'rgba(65, 88, 208, 0.2)'}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color: '#4158D0' }}>
                          Postal
                        </label>
                        <input
                          type="text"
                          placeholder="1000"
                          value={registrationData.postalCode}
                          onChange={(e) => setRegistrationData({...registrationData, postalCode: e.target.value})}
                          className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none bg-white"
                          style={{ borderWidth: '2px', borderColor: 'rgba(65, 88, 208, 0.2)', color: '#1e293b' }}
                          onFocus={(e) => e.target.style.borderColor = '#4158D0'}
                          onBlur={(e) => e.target.style.borderColor = 'rgba(65, 88, 208, 0.2)'}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => setRegistrationStep(1)}
                        className="w-1/3 py-2 rounded-xl text-sm font-semibold border transition-all duration-300 hover:bg-gray-50"
                        style={{ 
                          borderColor: 'rgba(65, 88, 208, 0.2)', 
                          color: '#4158D0',
                          background: 'white'
                        }}
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegistrationStep(3)}
                        className="w-2/3 py-2 rounded-xl text-sm font-semibold shadow-lg transition-all duration-300 hover:bg-gray-50"
                        style={{ 
                          background: 'rgba(65, 88, 208, 0.1)',
                          backdropFilter: 'blur(10px)',
                          WebkitBackdropFilter: 'blur(10px)',
                          color: '#4158D0',
                          border: '1px solid rgba(65, 88, 208, 0.2)',
                          boxShadow: '0 4px 12px rgba(65, 88, 208, 0.15)'
                        }}
                      >
                        Next: Emergency Contact
                      </button>
                    </div>
                  </>
                )}

                {/* Step 3: Emergency Contact */}
                {isSignUp && registrationStep === 3 && (
                  <>
                    <h3 className="text-base font-bold mb-3" style={{ background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Emergency Contact</h3>
                    <div>
                      <label className="block text-xs font-semibold mb-1" style={{ color: '#4158D0' }}>
                        Contact Name
                      </label>
                      <input
                        type="text"
                        placeholder="Jane Doe"
                        value={registrationData.emergencyContactName}
                        onChange={(e) => setRegistrationData({...registrationData, emergencyContactName: e.target.value})}
                        className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none bg-white"
                        style={{ borderWidth: '2px', borderColor: 'rgba(65, 88, 208, 0.2)', color: '#1e293b' }}
                        onFocus={(e) => e.target.style.borderColor = '#4158D0'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(65, 88, 208, 0.2)'}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1" style={{ color: '#4158D0' }}>
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        placeholder="+63 923 456 7890"
                        value={registrationData.emergencyContactPhone}
                        onChange={(e) => setRegistrationData({...registrationData, emergencyContactPhone: e.target.value})}
                        className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none bg-white"
                        style={{ borderWidth: '2px', borderColor: 'rgba(65, 88, 208, 0.2)', color: '#1e293b' }}
                        onFocus={(e) => e.target.style.borderColor = '#4158D0'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(65, 88, 208, 0.2)'}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1" style={{ color: '#4158D0' }}>
                        Relationship
                      </label>
                      <input
                        type="text"
                        placeholder="Spouse, Parent, Sibling, etc."
                        value={registrationData.emergencyContactRelation}
                        onChange={(e) => setRegistrationData({...registrationData, emergencyContactRelation: e.target.value})}
                        className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none bg-white"
                        style={{ borderWidth: '2px', borderColor: 'rgba(65, 88, 208, 0.2)', color: '#1e293b' }}
                        onFocus={(e) => e.target.style.borderColor = '#4158D0'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(65, 88, 208, 0.2)'}
                      />
                    </div>
                    <div className="flex gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => setRegistrationStep(2)}
                        className="w-1/3 py-2 rounded-xl text-sm font-semibold border transition-all duration-300 hover:bg-gray-50"
                        style={{ 
                          borderColor: 'rgba(65, 88, 208, 0.2)', 
                          color: '#4158D0',
                          background: 'white'
                        }}
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        className="w-2/3 py-2 rounded-xl text-sm font-semibold shadow-lg transition-all duration-300 hover:bg-gray-50"
                        style={{ 
                          background: 'rgba(65, 88, 208, 0.1)',
                          backdropFilter: 'blur(10px)',
                          WebkitBackdropFilter: 'blur(10px)',
                          color: '#4158D0',
                          border: '1px solid rgba(65, 88, 208, 0.2)',
                          boxShadow: '0 4px 12px rgba(65, 88, 208, 0.15)'
                        }}
                      >
                        Complete Registration
                      </button>
                    </div>
                  </>
                )}
              </form>

              <div className="mt-4 text-center">
                <button
                  onClick={toggleMode}
                  className="text-xs font-medium hover:underline"
                  style={{ color: '#4158D0' }}
                >
                  Already have an account? Sign In
                </button>
              </div>
            </div>
            </div>
          ) : (
            // Single Panel for Login
            <div className="p-8 relative bg-gradient-to-br from-gray-50 to-gray-100">
              <button 
                onClick={() => {
                  setShowLoginModal(false);
                  setIsSignUp(false);
                  setRegistrationStep(1);
                }}
                className="absolute top-4 right-4 p-2 rounded-lg transition-all duration-200 z-10 hover:rotate-90"
                style={{ backgroundColor: 'rgba(65, 88, 208, 0.1)', color: '#4158D0' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(65, 88, 208, 0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(65, 88, 208, 0.1)'}
              >
                <X size={18} />
              </button>

              {/* Church Logo for Login */}
              <div className="flex justify-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl shadow-lg" style={{ background: 'linear-gradient(135deg, #4158D0 0%, #2563eb 100%)' }}>
                  <Church size={40} className="text-white" />
                </div>
              </div>

              {/* Form Title */}
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold mb-2" style={{ color: '#1a1a1a' }}>
                  Welcome Back
                </h2>
                <p className="text-sm" style={{ color: '#4a5568' }}>
                  Sign in to continue to your account
                </p>
              </div>

              {error && (
                <div className="border-l-4 p-3 rounded-lg mb-4 shadow-sm" style={{ backgroundColor: '#fff5f5', borderColor: '#f87171' }}>
                  <p className="text-xs font-medium" style={{ color: '#dc2626' }}>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="emailOrUsername" className="block text-sm font-semibold mb-2" style={{ color: '#4158D0' }}>
                    Email or Username
                  </label>
                  <input
                    id="emailOrUsername"
                    type="text"
                    placeholder="name@example.com or username"
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                    className="w-full px-4 py-3 text-sm rounded-lg focus:outline-none transition-all duration-300 bg-white"
                    style={{ 
                      borderWidth: '2px',
                      borderColor: 'rgba(65, 88, 208, 0.2)',
                      color: '#1e293b'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#4158D0'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(65, 88, 208, 0.2)'}
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-semibold mb-2" style={{ color: '#4158D0' }}>
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 text-sm rounded-lg focus:outline-none transition-all duration-300 bg-white"
                      style={{ 
                        borderWidth: '2px',
                        borderColor: 'rgba(65, 88, 208, 0.2)',
                        color: '#1e293b'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#4158D0';
                        e.target.style.boxShadow = '0 0 0 4px rgba(65, 88, 208, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(65, 88, 208, 0.2)';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                      style={{ color: '#4158D0' }}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl text-sm font-semibold focus:outline-none transition-all duration-300 flex items-center justify-center gap-2 hover:bg-gray-50"
                  style={{ 
                    background: 'rgba(65, 88, 208, 0.1)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    color: '#4158D0',
                    border: '1px solid rgba(65, 88, 208, 0.2)',
                    boxShadow: '0 4px 12px rgba(65, 88, 208, 0.15)'
                  }}
                >
                  <LogIn size={20} strokeWidth={2.5} />
                  Sign In
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={toggleMode}
                  className="text-sm font-medium hover:underline"
                  style={{ color: '#4158D0' }}
                >
                  Don't have an account? Sign Up
                </button>
              </div>
            </div>
          )}
        </div>
      </ModalOverlay>
    </div>
  );
};

export default Homepage;
