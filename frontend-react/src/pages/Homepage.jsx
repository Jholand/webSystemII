import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Heart
} from 'lucide-react';
import ModalOverlay from '../components/ModalOverlay';

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

  // Mock user database with predefined roles
  const users = {
    'admin@church.com': { role: 'admin', name: 'Administrator' },
    'priest@church.com': { role: 'priest', name: 'Father John' },
    'accountant@church.com': { role: 'accountant', name: 'Accountant' },
    'churchadmin@church.com': { role: 'church_admin', name: 'Church Admin' },
    'user@church.com': { role: 'user', name: 'Member' },
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (isSignUp) {
      // Sign up validation
      if (!fullName || !emailOrUsername || !password || !confirmPassword) {
        setError('Please fill in all fields');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      // Default to user role for new signups
      onLogin('user');
      navigate('/user/dashboard');
    } else {
      // Sign in validation
      if (!emailOrUsername || !password) {
        setError('Please enter both email/username and password');
        return;
      }

      // Automatically detect role based on email
      const user = users[emailOrUsername.toLowerCase()];
      
      if (!user) {
        // Default to user role if email not found
        const detectedRole = 'user';
        onLogin(detectedRole);
        navigate(`/${detectedRole}/dashboard`);
      } else {
        // Use the role from the database
        const roleForRoute = user.role === 'church_admin' ? 'church-admin' : user.role;
        onLogin(user.role);
        navigate(`/${roleForRoute}/dashboard`);
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
  };

  return (
    <div className="min-h-screen animate-fade-in">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Church className="h-8 w-8 text-white drop-shadow-lg" />
              <div>
                <h1 className="text-xl font-bold text-white drop-shadow-lg">Dalapian Church</h1>
                <p className="text-xs text-white/80 drop-shadow-md">Est. 1952</p>
              </div>
            </div>
            
            <button
              onClick={() => {
                setIsSignUp(false);
                setShowLoginModal(true);
              }}
              className="px-6 py-2 bg-white text-blue-900 font-semibold rounded-lg shadow-lg hover:shadow-white/50 hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              <LogIn size={18} />
              Login
            </button>
          </div>
        </div>
      </nav>

      {/* Church Background Image - Covers Hero + Events */}
      <div className="relative">
        {/* Background with Blue Cross Image */}
        <div className="absolute inset-0 z-0">
          {/* Blue Cross Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('/src/assets/bluecross.jpg')`,
              backgroundPosition: 'center',
              backgroundSize: 'cover'
            }}
          ></div>

          {/* Dark Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40"></div>
        </div>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center z-10 pt-20">
        {/* Hero Content - Centered */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 py-16 w-full text-center">
          <div className="animate-fade-in-up space-y-8">
            {/* Title and Subtitle */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white drop-shadow-2xl">
                Welcome to Our Faith Community
              </h1>
              
              <p className="text-xl md:text-2xl text-white/90 drop-shadow-lg max-w-3xl mx-auto">
                A community of faith, hope, and love.
              </p>
            </div>

            {/* Join Now Button */}
            <div>
              <button
                onClick={() => {
                  setIsSignUp(true);
                  setShowLoginModal(true);
                }}
                className="px-10 py-4 bg-white text-blue-900 font-bold text-lg rounded-xl shadow-2xl hover:shadow-white/50 hover:scale-105 transition-all duration-300 inline-flex items-center gap-3"
              >
                <Users size={24} />
                Join Our Community
              </button>
            </div>

            {/* Quick Links - Single Row */}
            <div className="max-w-4xl mx-auto pt-8">
              <h3 className="text-white text-lg font-semibold mb-6 drop-shadow-lg">Quick Access</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="p-6 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl hover:bg-white/20 transition-all duration-300 flex flex-col items-center gap-3 group"
                >
                  <Baby className="h-10 w-10 text-white group-hover:scale-110 transition-transform" />
                  <p className="text-white font-semibold text-sm">Baptism</p>
                </button>
                
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="p-6 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl hover:bg-white/20 transition-all duration-300 flex flex-col items-center gap-3 group"
                >
                  <Heart className="h-10 w-10 text-white group-hover:scale-110 transition-transform" />
                  <p className="text-white font-semibold text-sm">Wedding</p>
                </button>
                
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="p-6 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl hover:bg-white/20 transition-all duration-300 flex flex-col items-center gap-3 group"
                >
                  <Church className="h-10 w-10 text-white group-hover:scale-110 transition-transform" />
                  <p className="text-white font-semibold text-sm">Mass</p>
                </button>
                
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="p-6 bg-white/10 backdrop-blur-md border border-white/30 rounded-xl hover:bg-white/20 transition-all duration-300 flex flex-col items-center gap-3 group"
                >
                  <Phone className="h-10 w-10 text-white group-hover:scale-110 transition-transform" />
                  <p className="text-white font-semibold text-sm">Contact</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Info Cards Section - Below Hero */}
      <section className="relative z-10 pb-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 hover:bg-white/15 hover:border-white/30 transition-all shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="h-8 w-8 text-blue-300" />
                <h3 className="text-xl font-bold text-white">Mass Schedule</h3>
              </div>
              <p className="text-white/80 text-sm mb-2 leading-relaxed">Sunday: 7AM, 9AM, 11AM, 5PM</p>
              <p className="text-white/80 text-sm leading-relaxed">Weekdays: 6AM, 6PM</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 hover:bg-white/15 hover:border-white/30 transition-all shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <Phone className="h-8 w-8 text-green-300" />
                <h3 className="text-xl font-bold text-white">Contact</h3>
              </div>
              <p className="text-white/80 text-sm leading-relaxed">+63 123 456 7890</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 hover:bg-white/15 hover:border-white/30 transition-all shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="h-8 w-8 text-purple-300" />
                <h3 className="text-xl font-bold text-white">Location</h3>
              </div>
              <p className="text-white/80 text-sm leading-relaxed">123 Dalapian St, Brgy Centro</p>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="relative py-20 z-10">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12 drop-shadow-lg">
            Upcoming Events
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <Music className="h-8 w-8 text-blue-300" />
                <span className="text-white text-sm font-bold">DEC 15</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Choir Concert</h3>
              <p className="text-white/80 text-sm mb-4 leading-relaxed">Join us for an evening of beautiful music and worship.</p>
              <p className="text-white/70 text-sm font-semibold">6:00 PM</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="h-8 w-8 text-yellow-300" />
                <span className="text-white text-sm font-bold">DEC 24</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Christmas Eve Mass</h3>
              <p className="text-white/80 text-sm mb-4 leading-relaxed">Celebrate the birth of our Savior with a special midnight mass.</p>
              <p className="text-white/70 text-sm font-semibold">11:00 PM</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-8 w-8 text-green-300" />
                <span className="text-white text-sm font-bold">JAN 5</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Leadership Summit</h3>
              <p className="text-white/80 text-sm mb-4 leading-relaxed">Empowering young leaders through faith-based activities.</p>
              <p className="text-white/70 text-sm font-semibold">9:00 AM - 4:00 PM</p>
            </div>
          </div>
        </div>
      </section>
      </div>

      {/* Footer */}
      <footer className="bg-white py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-6 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Church className="h-6 w-6 text-blue-600" />
                <span className="text-lg font-bold text-gray-900">Dalapian Church</span>
              </div>
              <p className="text-gray-600 text-sm">
                Serving God and our community since 1952.
              </p>
            </div>

            <div>
              <h4 className="text-base font-bold mb-2 text-gray-900">Mass Schedule</h4>
              <ul className="space-y-1 text-gray-600 text-sm">
                <li>Sunday: 7AM, 9AM, 11AM, 5PM</li>
                <li>Weekdays: 6AM, 6PM</li>
              </ul>
            </div>

            <div>
              <h4 className="text-base font-bold mb-2 text-gray-900">Contact</h4>
              <ul className="space-y-1 text-gray-600 text-sm">
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  123 Dalapian St, Brgy Centro
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  +63 123 456 7890
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  info@dalapianchurch.com
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-3 text-center text-gray-500 text-xs">
            <p>&copy; 2025 Dalapian Church. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <ModalOverlay isOpen={showLoginModal} onClose={() => setShowLoginModal(false)}>
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden">
          <div className="grid md:grid-cols-2">
            {/* Left Side - Branding */}
            <div className="p-12 bg-gradient-to-br from-black via-[#0A1628] to-[#1E3A8A] backdrop-blur-md flex items-center justify-center border-r border-white/20">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white/95 backdrop-blur-sm rounded-xl mb-6 shadow-xl shadow-blue-600/40 ring-2 ring-white/30">
                  <Church size={40} className="text-blue-500" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
                  Dalapian Church
                </h1>
                <p className="text-blue-50/90 drop-shadow-md">Management System</p>
              </div>
            </div>

            {/* Right Side - Login/Signup Form */}
            <div className="p-8 bg-white/90 backdrop-blur-md border-l border-white/40">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
                    {isSignUp ? 'Join Our Community' : 'Welcome Back'}
                  </h2>
                  <p className="text-sm text-slate-600">
                    {isSignUp ? 'Create your account' : 'Sign in to your account'}
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setShowLoginModal(false);
                    setIsSignUp(false);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {error && (
                <div className="bg-red-50/80 backdrop-blur-sm border-l-4 border-red-500 p-3 rounded mb-6 ring-1 ring-red-100/50">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {isSignUp && (
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-2">
                      Full Name
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-3 text-sm border border-gray-200/60 rounded-lg text-slate-900 bg-white/50 backdrop-blur-sm focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/20 focus:outline-none transition-all duration-300 placeholder:text-slate-400 ring-1 ring-gray-100/50"
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="emailOrUsername" className="block text-sm font-medium text-slate-700 mb-2">
                    {isSignUp ? 'Email' : 'Email or Username'}
                  </label>
                  <input
                    id="emailOrUsername"
                    type="text"
                    placeholder={isSignUp ? 'name@example.com' : 'name@example.com or username'}
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                    className="w-full px-4 py-3 text-sm border border-gray-200/60 rounded-lg text-slate-900 bg-white/50 backdrop-blur-sm focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/20 focus:outline-none transition-all duration-300 placeholder:text-slate-400 ring-1 ring-gray-100/50"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 text-sm border border-gray-200/60 rounded-lg text-slate-900 bg-white/50 backdrop-blur-sm focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/20 focus:outline-none transition-all duration-300 placeholder:text-slate-400 ring-1 ring-gray-100/50"
                  />
                </div>

                {isSignUp && (
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 text-sm border border-gray-200/60 rounded-lg text-slate-900 bg-white/50 backdrop-blur-sm focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/20 focus:outline-none transition-all duration-300 placeholder:text-slate-400 ring-1 ring-gray-100/50"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 mt-6 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-black via-[#0A1628] to-[#1E3A8A] hover:shadow-xl hover:shadow-blue-900/40 focus:outline-none focus:ring-4 focus:ring-blue-300/40 transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-0.5 border border-white/20"
                >
                  {isSignUp ? <Users size={18} /> : <LogIn size={18} />}
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </button>
              </form>

              <div className="mt-6 space-y-2">
                <p className="text-xs text-gray-600 text-center">
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                  <button onClick={toggleMode} className="text-blue-600 font-semibold hover:underline">
                    {isSignUp ? 'Sign in' : 'Join now'}
                  </button>
                </p>
                {!isSignUp && (
                  <>
                    <p className="text-xs text-gray-600 bg-blue-50/50 backdrop-blur-sm py-2 px-4 rounded-lg border border-blue-100/50">
                      Demo credentials:
                    </p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>• admin@church.com - Administrator</p>
                      <p>• priest@church.com - Priest</p>
                      <p>• accountant@church.com - Accountant</p>
                      <p>• churchadmin@church.com - Church Admin</p>
                      <p>• user@church.com - Member</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </ModalOverlay>
    </div>
  );
};

export default Homepage;
