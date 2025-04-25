import { Link } from "react-router-dom";
import { useState } from "react";

const Navbar = () => {
  const [signupOpen, setSignupOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <h1 className="text-lg font-bold">Queue Nahi</h1>

      <div className="flex items-center gap-4 relative">
        {/* Sign Up Dropdown */}
        <div className="relative">
          <button
            className="hover:bg-blue-700 px-4 py-2 rounded"
            onClick={() => {
              setSignupOpen(!signupOpen);
              setLoginOpen(false); // close the other dropdown
            }}
          >
            Sign Up
          </button>

          {signupOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded shadow-lg z-10">
              <Link
                to="/signup/student"
                className="block px-4 py-2 hover:bg-gray-200"
                onClick={() => setSignupOpen(false)}
              >
                Student
              </Link>
              <Link
                to="/signup/manager"
                className="block px-4 py-2 hover:bg-gray-200"
                onClick={() => setSignupOpen(false)}
              >
                Manager
              </Link>
            </div>
          )}
        </div>

        {/* Login Dropdown */}
        <div className="relative">
          <button
            className="hover:bg-blue-700 px-4 py-2 rounded"
            onClick={() => {
              setLoginOpen(!loginOpen);
              setSignupOpen(false); // close the other dropdown
            }}
          >
            Login
          </button>

          {loginOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded shadow-lg z-10">
              <Link
                to="/login/student"
                className="block px-4 py-2 hover:bg-gray-200"
                onClick={() => setLoginOpen(false)}
              >
                Student
              </Link>
              <Link
                to="/login/manager"
                className="block px-4 py-2 hover:bg-gray-200"
                onClick={() => setLoginOpen(false)}
              >
                Manager
              </Link>
              <Link
                to="/login/admin"
                className="block px-4 py-2 hover:bg-gray-200"
                onClick={() => setLoginOpen(false)}
              >
                Admin
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
