import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

const PManagerDashboard = () => {
  const [manager, setManager] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const managerData = localStorage.getItem('manager');
        
        if (!token || !managerData) {
          throw new Error('Missing authentication');
        }

        // Verify token with backend
        const response = await fetch('http://localhost:3001/managers/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Invalid session');
        }

        setManager(JSON.parse(managerData));
      } catch (err) {
        localStorage.removeItem('manager');
        localStorage.removeItem('access_token');
        navigate('/login/manager');
      }
    };

    verifyAuth();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("manager");
    localStorage.removeItem("access_token");
    navigate("/login/manager", { replace: true });
  };

  const handleViewPrintJobs = () => {
    window.location.href = `/pmanager/printcafe`; // create this route
  };

  const handleViewBookOrders = () => {
    window.location.href = `/pmanager/bookshop`; // create this route
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <button
          onClick={handleLogout}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Logout
        </button>
      <div className="bg-white p-6 rounded-xl shadow-lg max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Welcome, {manager?.name}!</h1>

        <div className="mt-6 space-y-4">
          <button
            onClick={handleViewPrintJobs}
            className="w-full bg-blue-500 text-white px-4 py-3 rounded hover:bg-blue-600 text-lg font-medium"
          >
            🖨️ Manage Print Cafe
          </button>

          <button
            onClick={handleViewBookOrders}
            className="w-full bg-green-500 text-white px-4 py-3 rounded hover:bg-green-600 text-lg font-medium"
          >
            📚 Manage Book Shop
          </button>
        </div>
      </div>  
    </div>
  );
};

export default PManagerDashboard;
