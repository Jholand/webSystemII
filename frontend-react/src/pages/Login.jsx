import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Church, Mail, Lock, UserCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Login = ({ onLogin }) => {
  // Login component with gradient design - Updated
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

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

    // Simple validation
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
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4" 
      style={{ 
        background: 'linear-gradient(to bottom right, #667eea 0%, #764ba2 100%)'
      }}>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 -top-48 -left-48 rounded-full opacity-30 blur-3xl animate-pulse"
          style={{ background: 'radial-gradient(circle, #667eea 0%, transparent 70%)' }}></div>
        <div className="absolute w-96 h-96 -bottom-48 -right-48 rounded-full opacity-30 blur-3xl animate-pulse"
          style={{ background: 'radial-gradient(circle, #764ba2 0%, transparent 70%)', animationDelay: '1s' }}></div>
      </div>

      <div className="max-w-6xl w-full relative z-10">
        <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-5 border-2"
          style={{ borderColor: 'rgba(102, 126, 234, 0.3)' }}>
          
          {/* Left Side - Branding (3 columns) */}
          <div className="md:col-span-3 p-16 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0" style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}></div>
            
            <div className="absolute top-10 right-10 w-72 h-72 rounded-full opacity-20 blur-2xl" 
              style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)' }}></div>
            <div className="absolute bottom-10 left-10 w-56 h-56 rounded-full opacity-20 blur-2xl" 
              style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)' }}></div>

            <div className="text-center relative z-10 max-w-lg">
              <div className="inline-flex items-center justify-center w-28 h-28 bg-white/98 backdrop-blur-sm rounded-3xl mb-8 shadow-2xl">
                <Church size={56} style={{ color: '#667eea' }} />
              </div>
              <h1 className="text-5xl font-extrabold text-white mb-4 drop-shadow-2xl leading-tight">
                Our Lady of Peace and Good Voyage Mission Area
              </h1>
              <p className="text-white/95 text-xl drop-shadow-lg font-medium">Church Management System</p>
            </div>
          </div>

          {/* Right Side - Login Form (2 columns) */}
          <div className="md:col-span-2 p-12 bg-white relative">
            <div className="h-full flex flex-col justify-center">
              <div className="mb-10">
                <h2 className="text-4xl font-extrabold mb-3" style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  Welcome Back
                </h2>
                <p className="text-gray-600 text-lg">Sign in to your account</p>
              </div>

              {error && (
                <div className="border-l-4 p-4 rounded-lg mb-6" style={{ 
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  borderColor: '#ef4444' 
                }}>
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="emailOrUsername" className="block text-sm font-bold mb-3" style={{ color: '#667eea' }}>
                    Email or Username
                  </label>
                  <input
                    id="emailOrUsername"
                    type="text"
                    placeholder="name@example.com or username"
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                    className="w-full px-5 py-4 text-base rounded-2xl text-gray-900 focus:outline-none transition-all duration-300 border-2 font-medium"
                    style={{ 
                      backgroundColor: '#f5f3ff',
                      borderColor: '#e0d5ff'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.2)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e0d5ff';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-bold mb-3" style={{ color: '#667eea' }}>
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-4 text-base rounded-2xl text-gray-900 focus:outline-none transition-all duration-300 border-2 font-medium"
                    style={{ 
                      backgroundColor: '#f5f3ff',
                      borderColor: '#e0d5ff'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.2)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e0d5ff';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-5 mt-8 rounded-2xl text-base font-bold text-white hover:shadow-2xl hover:scale-[1.03] focus:outline-none transition-all duration-300 flex items-center justify-center gap-3 shadow-xl"
                  style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                >
                  <LogIn size={24} />
                  Sign In
                </button>
              </form>

              <div className="mt-10 space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Don't have an account? <button className="font-bold" style={{ color: '#667eea' }}>Join now</button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-10">
          <p className="text-white text-base font-medium drop-shadow-lg">
            © {new Date().getFullYear()} Church Record Management System
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
