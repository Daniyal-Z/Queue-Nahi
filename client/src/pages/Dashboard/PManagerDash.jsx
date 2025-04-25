import { useEffect, useState } from "react";

const PManagerDashboard = () => {
  const [manager, setManager] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("manager");
    if (!stored) {
      window.location.href = "/manager/login"; // redirect to login
    } else {
      setManager(JSON.parse(stored));
    }
  }, []);

  const handleViewPrintJobs = () => {
    window.location.href = `/pmanager/printcafe`; // create this route
  };

  const handleViewBookOrders = () => {
    window.location.href = `/pmanager/bookshop`; // create this route
  };

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
