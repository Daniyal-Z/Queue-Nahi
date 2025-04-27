import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [admin, setAdmin] = useState(null);
    const navigate = useNavigate();


    // Form states
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const verifyAuth = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const adminData = localStorage.getItem('admin');
            
            if (!token || !adminData) {
            throw new Error('Missing authentication');
            }

            // Verify token with backend
            const response = await fetch('http://localhost:3001/admin/verify', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
            });

            if (!response.ok) {
            throw new Error('Invalid session');
            }

            setAdmin(JSON.parse(adminData));
        } catch (err) {
            console.log(err);
            localStorage.removeItem('admin');
            localStorage.removeItem('access_token');
            navigate('/login/admin');
        }
        };

        verifyAuth();
    }, [navigate]);

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