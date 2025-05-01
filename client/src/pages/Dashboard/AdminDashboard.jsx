import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuthVerify } from '../../hooks';

const AdminDashboard = () => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showStudents, setShowStudents] = useState(false);
  const [showManagers, setShowManagers] = useState(false);
  const [showRestaurants, setShowRestaurants] = useState(false);
  const [showGrounds, setShowGrounds] = useState(false);
  const [showBooks, setShowBooks] = useState(false);
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState("active");
  const [managers, setManagers] = useState([]);

  const navigate = useNavigate();

  useAuthVerify('admin');

  const authorizedFetch = async (url, options = {}) => {
    const token = localStorage.getItem('access_token');
  
    // If token is missing, redirect immediately
    if (!token) {
      localStorage.removeItem('admin');
      window.location.href = '/login/admin';
      throw new Error('No authentication token found. Redirecting to login.');
    }
  
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
  
    // If token is invalid (expired, tampered, etc.)
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('admin');
      window.location.href = '/login/admin';
      throw new Error('Authentication failed. Redirecting to login.');
    }
  
    return response;
  };

  useEffect(() => {
    const adminData = localStorage.getItem('admin');
    if (adminData) {
      try {
        setAdmin(JSON.parse(adminData));
      } catch (err) {
        console.error("Failed to parse admin data:", err);
        handleLogout();
      }
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("admin");
    localStorage.removeItem("access_token");
    navigate("/login/admin", { replace: true });
  };

  const Modal = ({ title, onClose, children }) => (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-11/12 max-w-2xl relative">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-lg"
          onClick={onClose}
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );

  const fetchStudents = async () => {
    try {
      const res = await authorizedFetch('http://localhost:3001/admins/students');
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      console.error("Failed to fetch students:", err);
    }
  };
  
  const toggleStudentActive = async (rollNo, newStatus) => {
    try {
      await authorizedFetch(`http://localhost:3001/admins/students/status`, {
        method: 'PUT',
        body: JSON.stringify({ active: newStatus, rollNum: rollNo })
      });
      fetchStudents(); // refresh
    } catch (err) {
      console.error("Failed to update student:", err);
    }
  };

  const deleteStudent = async (rollNo) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
  
    try {
      await authorizedFetch(`http://localhost:3001/admins/students/remove`, {
        method: 'DELETE',
        body: JSON.stringify({ id: rollNo })
      });
      fetchStudents(); // refresh list
    } catch (err) {
      console.error("Failed to delete student:", err);
    }
  };
  
  const fetchManagers = async () => {
    try {
      const res = await authorizedFetch('http://localhost:3001/admins/managers');
      const data = await res.json();
      setManagers(data);
    } catch (err) {
      console.error("Failed to fetch managers:", err);
    }
  };
  
  const deleteManager = async (id) => {
    if (!window.confirm("Are you sure you want to delete this manager?")) return;

    // Prompt for admin password
    const pass = prompt("Please enter your admin password to confirm deletion:");

    if (!pass) return;

    try {
      const res = await fetch('http://localhost:3001/admins/verify/identity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: admin.email, password: pass })
      });

      const data = await res.json();
      
      if (data.message !== true) {
        alert("Password verification failed. Deletion cancelled.");
        return;
      } 

      await authorizedFetch('http://localhost:3001/admins/managers/remove', {
        method: 'DELETE',
        body: JSON.stringify({ id }),
      });

      fetchManagers(); // refresh
      } catch (err) {
        console.error("Failed to delete manager:", err);
      }
  };
  

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <button onClick={() => {setShowStudents(true); fetchStudents(); }} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          View Students
        </button>
        <button onClick={() => { setShowManagers(true); fetchManagers(); }} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
          View Managers
        </button>
        <button onClick={() => setShowRestaurants(true)} className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
          View Restaurants
        </button>
        <button onClick={() => setShowGrounds(true)} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
          View Grounds
        </button>
        <button onClick={() => setShowBooks(true)} className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600">
          View Books
        </button>
      </div>

      {/* Popups */}
      {showStudents && (
        <Modal title="Students" onClose={() => setShowStudents(false) }>
        <div>
          <div className="flex space-x-4 mb-4">
            <button
              onClick={() => setActiveTab("active")}
              className={`px-4 py-2 rounded ${activeTab === "active" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            >
              Active Students
            </button>
            <button
              onClick={() => setActiveTab("inactive")}
              className={`px-4 py-2 rounded ${activeTab === "inactive" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            >
              Inactive Students
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full table-auto border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-4 py-2">Roll No</th>
                  <th className="border px-4 py-2">Name</th>
                  <th className="border px-4 py-2">Email</th>
                  <th className="border px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {students
                  .filter(student => student.Active === (activeTab === "active" ? true : false))
                  .map(student => (
                    <tr key={student.Roll_No} className="text-center">
                      <td className="border px-4 py-2">{student.Roll_No}</td>
                      <td className="border px-4 py-2">{student.Name}</td>
                      <td className="border px-4 py-2">{student.Email}</td>
                      <td className="border px-4 py-2 space-x-2">
                        {student.Active ? (
                          <button
                            className="px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white"
                            onClick={() => toggleStudentActive(student.Roll_No, false)}
                          >
                            Deactivate
                          </button>
                        ) : (
                          <>
                            <button
                              className="px-3 py-1 rounded bg-green-500 hover:bg-green-600 text-white"
                              onClick={() => toggleStudentActive(student.Roll_No, true)}
                            >
                              Activate
                            </button>
                            <button
                              className="px-3 py-1 rounded bg-red-700 hover:bg-red-800 text-white"
                              onClick={() => deleteStudent(student.Roll_No)}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        </Modal>
      )}
      {showManagers && (
        <Modal title="Managers" onClose={() => setShowManagers(false)}>
          <div className="overflow-x-auto">
            <table className="w-full table-auto border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-4 py-2">ID</th>
                  <th className="border px-4 py-2">Name</th>
                  <th className="border px-4 py-2">Email</th>
                  <th className="border px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {managers.map(manager => (
                  <tr key={manager.Mgr_ID} className="text-center">
                    <td className="border px-4 py-2">{manager.Mgr_ID}</td>
                    <td className="border px-4 py-2">{manager.Name}</td>
                    <td className="border px-4 py-2">{manager.Email}</td>
                    <td className="border px-4 py-2">
                      {manager.Mgr_ID !== 1 && manager.Mgr_ID !== 2 && (
                        <button
                          className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white"
                          onClick={() => deleteManager(manager.Mgr_ID)}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal>
      )}

      {showRestaurants && (
        <Modal title="Restaurants" onClose={() => setShowRestaurants(false)}>
          <p>Restaurant data will go here.</p>
        </Modal>
      )}
      {showGrounds && (
        <Modal title="Grounds" onClose={() => setShowGrounds(false)}>
          <p>Ground data will go here.</p>
        </Modal>
      )}
      {showBooks && (
        <Modal title="Books" onClose={() => setShowBooks(false)}>
          <p>Book data will go here.</p>
        </Modal>
      )}
    </div>
  );
};

export default AdminDashboard;
