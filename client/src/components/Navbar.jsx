import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FiLogIn, FiUserPlus, FiLogOut, FiUser, FiChevronDown } from "react-icons/fi";

const Navbar = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoginDropdownOpen, setIsLoginDropdownOpen] = useState(false);
  const [isSignupDropdownOpen, setIsSignupDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  // Check auth status from localStorage
  useEffect(() => {
    const checkAuth = () => {
      const student = localStorage.getItem("student");
      const manager = localStorage.getItem("manager");
      const admin = localStorage.getItem("admin");
      const token = localStorage.getItem("access_token");

      if (token) {
        setIsLoggedIn(true);
        if (student) setUserRole("student");
        else if (manager) setUserRole("manager");
        else if (admin) setUserRole("admin");
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
      }
    };

    // Check immediately
    checkAuth();

    // Also check when storage changes
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const handleLogout = () => {
    // Clear all auth-related items
    localStorage.removeItem("student");
    localStorage.removeItem("manager");
    localStorage.removeItem("admin");
    localStorage.removeItem("access_token");
    
    // Update state
    setIsLoggedIn(false);
    setUserRole(null);
    setIsUserMenuOpen(false);
    
    // Redirect to home
    navigate("/");
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm sticky top-0 z-40">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">QN</span>
          </div>
          <span className="text-xl font-bold text-indigo-600">Queue Nahi</span>
        </Link>

        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-1 text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-lg hover:bg-indigo-50 transition-colors"
                >
                  <FiUser className="text-lg" />
                  <span className="capitalize">{userRole}</span>
                  <FiChevronDown className={`transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <button
                      onClick={handleLogout}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <FiLogOut className="mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              {/* Login Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setIsLoginDropdownOpen(!isLoginDropdownOpen);
                    setIsSignupDropdownOpen(false);
                  }}
                  className="flex items-center space-x-1 text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-lg hover:bg-indigo-50 transition-colors"
                >
                  <FiLogIn className="text-lg" />
                  <span>Login</span>
                  <FiChevronDown className={`transition-transform ${isLoginDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isLoginDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <Link
                      to="/login/student"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsLoginDropdownOpen(false)}
                    >
                      As Student
                    </Link>
                    <Link
                      to="/login/manager"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsLoginDropdownOpen(false)}
                    >
                      As Manager
                    </Link>
                    <Link
                      to="/login/admin"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsLoginDropdownOpen(false)}
                    >
                      As Admin
                    </Link>
                  </div>
                )}
              </div>

              {/* Signup Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setIsSignupDropdownOpen(!isSignupDropdownOpen);
                    setIsLoginDropdownOpen(false);
                  }}
                  className="flex items-center space-x-1 text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-lg hover:bg-indigo-50 transition-colors"
                >
                  <FiUserPlus className="text-lg" />
                  <span>Sign Up</span>
                  <FiChevronDown className={`transition-transform ${isSignupDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isSignupDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <Link
                      to="/signup/student"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsSignupDropdownOpen(false)}
                    >
                      As Student
                    </Link>
                    <Link
                      to="/signup/manager"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsSignupDropdownOpen(false)}
                    >
                      As Manager
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;