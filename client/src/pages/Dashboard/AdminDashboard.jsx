import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuthVerify } from '../../hooks'; 

const AdminDashboard = () => {
    const [admin, setAdmin] = useState(null);
    const navigate = useNavigate();


    // Form states
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    useAuthVerify('admin');
  
    // In ManagerDashboard.js
    useEffect(() => {
          const adminData = localStorage.getItem('admin');
          
          if (adminData)
          {
            try {
              setAdmin(JSON.parse(adminData));
            }
            catch (err) {
              console.error("Failed to parse admin data:", err);
              handleLogout();
            }  
          }
      }
    );

    const handleLogout = () => {
        localStorage.removeItem("admin");
        localStorage.removeItem("access_token");
        navigate("/login/admin", { replace: true });
    };

    return (
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">{admin?.name}'s Dashboard</h1>
            <button
              onClick={handleLogout}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Logout
            </button>
          </div>
        </div>
      );
};

export default AdminDashboard;