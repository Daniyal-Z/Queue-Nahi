import React, { useEffect, useState } from "react";
import MenuModal from "./MenuModal";

const RestaurantModal = ({ onClose }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  //const [roll_no, setRoll_No] = useState(null);

  const authorizedFetch = async (url, options = {}) => {
    const token = localStorage.getItem('access_token');
  
    // If token is missing, redirect immediately
    if (!token) {
      localStorage.removeItem('student');
      window.location.href = '/login/student';
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
      localStorage.removeItem('student');
      window.location.href = '/login/student';
      throw new Error('Authentication failed. Redirecting to login.');
    }
  
    return response;
  };  

  useEffect(() => {
    const fetchRestaurants = async () => {
        try {
            // 1. Get token from storage
            const token = localStorage.getItem('access_token');
            if (!token) {
                throw new Error('No authentication token');
            }

            // 2. Make request with token
            const response = await authorizedFetch("http://localhost:3001/restaurants");

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            setRestaurants(data);
        } catch (err) {
            console.error("Failed to fetch restaurants:", err);
            // Optional: Redirect to login if unauthorized
            if (err.message.includes('401')) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('student');
                window.location.href = '/login/student';
            }
        }
    };

    fetchRestaurants();
}, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 w-3/4 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Available Restaurants</h2>

        <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
          {restaurants.map((rest) => (
            <div key={rest.Restaurant_ID} className="border p-4 rounded shadow">
              <h3 className="text-lg font-semibold">{rest.Restaurant_Name}</h3>
              <p className="text-sm text-gray-500">{rest.Location}</p>
              <p className="text-sm text-gray-500">Status: {rest.Restaurant_Status}</p>
              <button
                onClick={() => setSelectedRestaurant(rest)}
                className="mt-2 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
              >
                View Menu
              </button>
            </div>
          ))}
        </div>

        <button onClick={onClose} className="mt-6 text-red-600">Close</button>

        {selectedRestaurant && (
          <MenuModal
            restaurant={selectedRestaurant}
            onClose={() => setSelectedRestaurant(null)}
          />
        )}
      </div>
    </div>
  );
};

export default RestaurantModal;
