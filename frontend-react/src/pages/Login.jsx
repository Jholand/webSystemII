import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Church, Mail, Lock, UserCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Login = ({ onLogin }) => {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-gray-100">
      <div className="max-w-4xl w-full mx-4">
        <div className="rounded-2xl shadow-2xl overflow-hidden bg-white/80 backdrop-blur-sm border border-white/60 ring-2 ring-gray-100/50 grid md:grid-cols-2 animate-fade-in">
          {/* Left Side - Branding */}
          <div className="p-12 bg-gradient-to-br from-black via-[#0A1628] to-[#1E3A8A] backdrop-blur-md flex items-center justify-center border-r border-white/20 animate-fade-in-down">
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

          {/* Right Side - Login Form */}
          <div className="p-8 bg-white/90 backdrop-blur-md border-l border-white/40 animate-fade-in-up">
            <div className="mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
                Welcome Back
              </h2>
              <p className="text-sm text-slate-600">Sign in to your account</p>
            </div>

            {error && (
              <div className="bg-red-50/80 backdrop-blur-sm border-l-4 border-red-500 p-3 rounded mb-6 ring-1 ring-red-100/50">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="emailOrUsername" className="block text-sm font-medium text-slate-700 mb-2">
                  Email or Username
                </label>
                <input
                  id="emailOrUsername"
                  type="text"
                  placeholder="name@example.com or username"
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

              <button
                type="submit"
                className="w-full py-3 mt-6 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-black via-[#0A1628] to-[#1E3A8A] hover:shadow-xl hover:shadow-blue-900/40 focus:outline-none focus:ring-4 focus:ring-blue-300/40 transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-0.5 border border-white/20"
              >
                <LogIn size={18} />
                Sign In
              </button>
            </form>

            <div className="mt-6 space-y-2">
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
            </div>
          </div>
        </div>

        <div className="text-center mt-6 animate-fade-in">
          <p className="text-gray-600 text-sm drop-shadow-sm">
            © {new Date().getFullYear()} Church Record Management System
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
