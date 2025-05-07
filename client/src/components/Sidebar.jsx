import { useLocation, useNavigate } from "react-router-dom";
import { 
  FiHome, 
  FiBook, 
  FiPrinter, 
  FiCoffee, 
  FiUsers,
  FiSettings,
  FiCalendar,
  FiX
} from "react-icons/fi";
import { useState } from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userType = location.pathname.split('/')[1]; // student, rmanager, etc

  const studentLinks = [
    { 
      to: "/student/dashboard", 
      icon: <FiHome />, 
      text: "Dashboard",
      match: "/student/dashboard"
    },
    { 
      to: "/student/dashboard/food", 
      icon: <FiCoffee />, 
      text: "Food",
      match: "/student/dashboard/food"
    },
    { 
      to: "/student/dashboard/print", 
      icon: <FiPrinter />, 
      text: "Print",
      match: "/student/dashboard/print"
    },
    { 
      to: "/student/dashboard/books", 
      icon: <FiBook />, 
      text: "Books",
      match: "/student/dashboard/books"
    },
    { 
      to: "/student/dashboard/grounds", 
      icon: <FiCalendar />, 
      text: "Grounds",
      match: "/student/dashboard/grounds"
    },
  ];

  const managerLinks = {
    rmanager: [
      { to: "/rmanager/dashboard", icon: <FiHome />, text: "Dashboard" },
      { to: "/rmanager/restaurant/1", icon: <FiCoffee />, text: "Restaurant" },
    ],
    pmanager: [
      { to: "/pmanager/dashboard", icon: <FiHome />, text: "Dashboard" },
      { to: "/pmanager/printcafe", icon: <FiPrinter />, text: "Print Cafe" },
      { to: "/pmanager/bookshop", icon: <FiBook />, text: "Book Shop" },
    ],
    gmanager: [
      { to: "/gmanager/dashboard", icon: <FiHome />, text: "Dashboard" },
      { to: "/gmanager/grounds", icon: <FiCalendar />, text: "Grounds" },
    ],
  };

  const adminLinks = [
    { to: "/admin/dashboard", icon: <FiHome />, text: "Dashboard" },
    { to: "/admin/users", icon: <FiUsers />, text: "Users" },
    { to: "/admin/settings", icon: <FiSettings />, text: "Settings" },
  ];

  const getLinks = () => {
    if (userType === 'student') return studentLinks;
    if (userType === 'admin') return adminLinks;
    if (userType in managerLinks) return managerLinks[userType];
    return [];
  };

  const isActive = (link) => {
    return location.pathname.startsWith(link.match || link.to);
  };

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 shadow-sm z-40">
      <div className="p-4">
        <div className="flex items-center space-x-2 px-2 py-4">
          <div className="w-8 h-8 bg-indigo-600 rounded-full"></div>
          <span className="text-lg font-semibold text-gray-800">Queue Nahi</span>
        </div>
        
        <nav className="mt-8">
          <ul className="space-y-1">
            {getLinks().map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive(link)
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-3 text-lg">{link.icon}</span>
                  {link.text}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;