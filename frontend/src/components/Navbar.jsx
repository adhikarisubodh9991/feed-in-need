import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import InboxBell from './InboxBell';
import { FiMenu, FiX, FiLogOut, FiUser, FiHome, FiHeart, FiGift, FiGrid, FiPackage, FiAward, FiCheckCircle, FiChevronDown, FiClipboard, FiCamera } from 'react-icons/fi';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, children, icon: Icon, mobile }) => (
    <Link
      to={to}
      onClick={() => setIsOpen(false)}
      className={`${mobile ? 'flex items-center gap-3 w-full' : 'flex items-center gap-2'} px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
        isActive(to)
          ? 'bg-primary-50 text-primary-600'
          : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
      }`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </Link>
  );

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3">
              <img src="/logo.png" alt="Starvation to Salvation" className="w-10 h-10 object-contain" />
              <span className="text-xl font-bold text-gray-800">
                Starvation to Salvation
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/" icon={FiHome}>Home</NavLink>
            <NavLink to="/donations" icon={FiGift}>Donations</NavLink>
            
            {user ? (
              <>
                {user.role === 'donor' && (
                  <NavLink to="/donate" icon={FiHeart}>Donate</NavLink>
                )}
                {(user.role === 'admin' || user.role === 'superadmin') && (
                  <NavLink to="/admin" icon={FiGrid}>Admin</NavLink>
                )}
                
                <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200">
                  <NotificationBell />
                  <InboxBell />
                  
                  {/* Profile Dropdown */}
                  <div className="relative" ref={profileDropdownRef}>
                    <button
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl font-medium transition-all duration-200 hover:bg-gray-50"
                    >
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover border-2 border-gray-200" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <FiUser className="w-4 h-4 text-gray-600" />
                        </div>
                      )}
                      <span className="text-gray-700">{user?.name?.split(' ')[0] || 'Profile'}</span>
                      <FiChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {/* Dropdown Menu */}
                    {profileDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                        {/* Profile Link */}
                        <Link
                          to="/profile"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <FiUser className="w-4 h-4" />
                          View Profile
                        </Link>
                        
                        {/* Donor Options (only for donors) */}
                        {user.role === 'donor' && (
                          <>
                            <div className="border-t border-gray-100 my-2"></div>
                            <Link
                              to="/my-donations"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <FiPackage className="w-4 h-4" />
                              My Donations
                            </Link>
                            <Link
                              to="/my-certificates"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <FiAward className="w-4 h-4" />
                              My Certificates
                            </Link>
                          </>
                        )}
                        
                        {/* Receiver Options */}
                        {user.role === 'receiver' && (
                          <>
                            <div className="border-t border-gray-100 my-2"></div>
                            <Link
                              to="/my-requests"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <FiClipboard className="w-4 h-4" />
                              My Requests
                            </Link>
                            <Link
                              to="/confirm-pickup"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <FiCamera className="w-4 h-4" />
                              Confirm Pickup
                            </Link>
                          </>
                        )}
                        
                        <div className="border-t border-gray-100 my-2"></div>
                        
                        {/* Logout */}
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            handleLogout();
                          }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <FiLogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3 ml-2 pl-2 border-l border-gray-200">
                <Link
                  to="/login"
                  className="px-5 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 bg-gray-800 text-white rounded-xl font-medium hover:bg-gray-900 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            {user && (
              <>
                <NotificationBell />
                <InboxBell />
              </>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
            >
              {isOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="px-4 py-4 space-y-2 bg-white border-t border-gray-100 shadow-lg">
          <NavLink to="/" icon={FiHome} mobile>Home</NavLink>
          <NavLink to="/donations" icon={FiGift} mobile>Available Donations</NavLink>
          
          {user ? (
            <>
              {user.role === 'donor' && (
                <NavLink to="/donate" icon={FiHeart} mobile>Donate Food</NavLink>
              )}
              {(user.role === 'admin' || user.role === 'superadmin') && (
                <NavLink to="/admin" icon={FiGrid} mobile>Admin Dashboard</NavLink>
              )}
              
              {/* Profile Section */}
              <div className="border-t border-gray-100 mt-2 pt-2">
                <p className="px-4 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Account</p>
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl font-medium transition-all duration-200 text-gray-600 hover:bg-gray-50"
                >
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover border-2 border-gray-200" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <FiUser className="w-4 h-4 text-gray-600" />
                    </div>
                  )}
                  View Profile
                </Link>
                
                {/* Donor Options */}
                {user.role === 'donor' && (
                  <>
                    <Link
                      to="/my-donations"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl font-medium transition-all duration-200 text-gray-600 hover:bg-gray-50"
                    >
                      <FiPackage className="w-4 h-4" />
                      My Donations
                    </Link>
                    <Link
                      to="/my-certificates"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl font-medium transition-all duration-200 text-gray-600 hover:bg-gray-50"
                    >
                      <FiAward className="w-4 h-4" />
                      My Certificates
                    </Link>
                  </>
                )}
                
                {/* Receiver Options */}
                {user.role === 'receiver' && (
                  <>
                    <Link
                      to="/my-requests"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl font-medium transition-all duration-200 text-gray-600 hover:bg-gray-50"
                    >
                      <FiClipboard className="w-4 h-4" />
                      My Requests
                    </Link>
                    <Link
                      to="/confirm-pickup"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl font-medium transition-all duration-200 text-gray-600 hover:bg-gray-50"
                    >
                      <FiCamera className="w-4 h-4" />
                      Confirm Pickup
                    </Link>
                  </>
                )}
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 mt-2 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
              >
                <FiLogOut className="w-4 h-4" />
                Logout
              </button>
            </>
          ) : (
            <div className="pt-2 space-y-2 border-t border-gray-100 mt-2">
            <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 text-center bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 text-center bg-gray-800 text-white rounded-xl font-medium hover:bg-gray-900 transition-colors"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;