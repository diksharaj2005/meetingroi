import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Icon } from './Icons';
import logo from '../assets/logomet.png';
import { useTheme } from '../contexts/ThemeContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Safe theme context with fallback
  let darkMode = false;
  let setDarkMode = () => {};
  try {
    const theme = useTheme();
    darkMode = theme.darkMode;
    setDarkMode = theme.setDarkMode;
  } catch (error) {
    console.warn('ThemeContext not available, using default light mode');
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const navItems = [
    { name: 'Dashboard', icon: 'home', path: '/' },
    { name: 'My Meetings', icon: 'calendar', path: '/meetings' },
    { name: 'Insights', icon: 'brain', path: '/insights' },
    { name: 'Team', icon: 'users', path: '/team' },
    { name: 'Help', icon: 'helpCircle', path: '/help' }
  ];

  // Don't show navbar on login/register pages
  if (!isAuthenticated) return null;

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? darkMode 
            ? 'bg-slate-900/95 backdrop-blur-md shadow-sm border-b border-slate-700' 
            : 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200'
          : darkMode 
            ? 'bg-slate-900/80 backdrop-blur-sm border-b border-slate-700'
            : 'bg-white/80 backdrop-blur-sm border-b border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group cursor-pointer">
              <img src={logo} alt="MeetingROI" className="h-9 w-auto object-contain" />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`group relative px-4 py-2 rounded-xl transition-all duration-300 ${
                    darkMode ? 'text-gray-300 hover:text-amber-400' : 'text-gray-600 hover:text-amber-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon name={item.icon} size={18} className="group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  <span className={`absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-amber-400 to-orange-400 group-hover:w-1/2 group-hover:left-1/4 transition-all duration-300`}></span>
                </Link>
              ))}
            </div>

            {/* Right side - User Menu & Dark Mode */}
            <div className="flex items-center gap-3">
              {/* Dark Mode Toggle - Slide Switch */}
              <div className="flex items-center gap-2">
                <Icon name="sun" size={16} className={darkMode ? 'text-gray-500' : 'text-amber-500'} />
                <button
                  onClick={toggleTheme}
                  className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                    darkMode ? 'bg-amber-500' : 'bg-gray-300'
                  }`}
                  aria-label="Toggle dark mode"
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ${
                      darkMode ? 'left-6' : 'left-0.5'
                    }`}
                  />
                </button>
                <Icon name="moon" size={16} className={darkMode ? 'text-amber-400' : 'text-gray-400'} />
              </div>

              {/* User Menu */}
              <div className="relative group">
                <button className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 ${
                  darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'
                }`}>
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-sm">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <span className={`hidden lg:inline text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {user?.name?.split(' ')[0] || 'User'}
                  </span>
                  <Icon name="chevronDown" size={14} className={darkMode ? 'text-gray-500' : 'text-gray-400'} />
                </button>
                
                {/* Dropdown Menu */}
                <div className={`absolute right-0 mt-3 w-48 rounded-2xl shadow-xl border transition-all duration-200 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible ${
                  darkMode 
                    ? 'bg-slate-800 border-slate-700' 
                    : 'bg-white border-gray-200'
                }`}>
                  <div className={`p-3 border-b rounded-t-2xl ${
                    darkMode 
                      ? 'border-slate-700 bg-slate-800/50' 
                      : 'border-gray-200 bg-gradient-to-r from-amber-50 to-orange-50'
                  }`}>
                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{user?.name}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user?.email}</p>
                  </div>
                  <div className="py-2">
                    <button
                      onClick={handleLogout}
                      className={`w-full flex items-center gap-3 px-4 py-2 transition ${
                        darkMode 
                          ? 'hover:bg-red-900/30 text-red-400' 
                          : 'hover:bg-red-50 text-red-600'
                      }`}
                    >
                      <Icon name="logout" size={18} />
                      <div>
                        <div className="text-sm font-medium">Sign out</div>
                        <div className="text-xs text-red-400">See you soon</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Mobile menu button */}
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`md:hidden p-2 rounded-full transition-all duration-300 ${
                  darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-100'
                }`}
              >
                <Icon name={isMenuOpen ? "close" : "menu"} size={20} className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className={`md:hidden border-b ${
            darkMode 
              ? 'bg-slate-900 border-slate-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="px-4 py-3 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                    darkMode 
                      ? 'text-gray-300 hover:bg-slate-700' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon name={item.icon} size={20} className="text-amber-600" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
              <div className="pt-3 mt-3 border-t border-gray-200 dark:border-slate-700">
                {/* Dark Mode Toggle in Mobile */}
                <div className="flex items-center justify-between px-4 py-3">
                  <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Dark Mode
                  </span>
                  <button
                    onClick={toggleTheme}
                    className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                      darkMode ? 'bg-amber-500' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ${
                        darkMode ? 'left-6' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>
                <button
                  onClick={handleLogout}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                    darkMode 
                      ? 'text-red-400 hover:bg-red-900/30' 
                      : 'text-red-600 hover:bg-red-50'
                  }`}
                >
                  <Icon name="logout" size={20} />
                  <span className="font-medium">Sign out</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
      <div className="h-16" />
    </>
  );
};

export default Navbar;