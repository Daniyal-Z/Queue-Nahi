import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuthVerify } from '../../hooks'; 

const PManagerDashboard = () => {
  const [manager, setManager] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useAuthVerify('manager');
    
  // In ManagerDashboard.js
  useEffect(() => {
    const managerData = localStorage.getItem('manager');   
    if (managerData) {
      try{
        setManager(JSON.parse(managerData));
        //console.log(manager.name);
      } catch (err) {
        console.error("Failed to parse manager data:", err);
        handleLogout();
      }}
    setLoading(false);
  }, []);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
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
