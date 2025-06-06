import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuthVerify } from '../../hooks'; 

const ManagerDashboard = () => {
  const [manager, setManager] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [cafesModal, setCafesModal] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const navigate = useNavigate();


  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");

  useAuthVerify('manager');

  const authorizedFetch = async (url, options = {}) => {
    const token = localStorage.getItem('access_token');
  
    // If token is missing, redirect immediately
    if (!token) {
      localStorage.removeItem('manager');
      //window.location.href = '/login/manager';
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
      localStorage.removeItem('manager');
      //window.location.href = '/login/manager';
      throw new Error('Authentication failed. Redirecting to login.');
    }
  
    return response;
  };
  

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

  const handleAddRestaurant = async (e) => {
    e.preventDefault();
    setMessage("");
  
    try {
      const response = await authorizedFetch("http://localhost:3001/restaurantMgr/add-restaurant", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          phone,
          location,
          mgrId: manager.id,
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        setMessage(data.message || "Failed to add restaurant");
      } else {
        setMessage("Restaurant added successfully!");
        setName("");
        setEmail("");
        setPhone("");
        setLocation("");
        setShowModal(false);
      }
    } catch (err) {
      setMessage("Something went wrong");
    }
  };
  
  const fetchRestaurants = async () => {
    try {
      const res = await authorizedFetch(`http://localhost:3001/restaurants/by-manager/${manager.id}`);
      const data = await res.json();
      setRestaurants(data);
      setCafesModal(true);
    } catch (err) {
      console.error("Failed to fetch restaurants:", err);
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
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-6 rounded-xl shadow-lg max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Welcome, {manager.name}!</h1>
        <div className="mt-6 space-y-3">
          <button
            onClick={() => setShowModal(true)}
            className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Add Restaurant
          </button>

          <button
            onClick={fetchRestaurants}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            View All Cafes
          </button>
          </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">Add New Restaurant</h2>
            <form onSubmit={handleAddRestaurant} className="space-y-3">
              <input
                type="text"
                placeholder="Restaurant Name"
                className="w-full p-2 border rounded"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full p-2 border rounded"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Phone"
                className="w-full p-2 border rounded"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Location"
                className="w-full p-2 border rounded"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />

              {message && <p className="text-red-500">{message}</p>}

              <div className="flex justify-between mt-4">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setMessage("");
                  }}
                  className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {cafesModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Your Restaurants</h2>
              <button
                onClick={() => setCafesModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {restaurants.length === 0 ? (
              <p>No restaurants found.</p>
            ) : (
              <div className="space-y-3">
                {restaurants.map((rest) => (
                  <div
                    key={rest.Restaurant_ID}
                    className="border p-4 rounded-lg flex justify-between items-center hover:shadow"
                  >
                    <div>
                      <h3 className="font-bold">{rest.Restaurant_Name}</h3>
                      <p className="text-sm text-gray-600">{rest.Location}</p>
                    </div>
                    
                    <button
                     onClick={() => navigate(`/rmanager/restaurant/${rest.Restaurant_ID}`)}
                      className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default ManagerDashboard;
