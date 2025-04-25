import React, { useEffect, useState } from "react";
import MenuModal from "./MenuModal";

const RestaurantModal = ({ onClose }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [roll_no, setRoll_No] = useState(null);

  useEffect(() => {
    // Fetch restaurants
    fetch("http://localhost:3001/restaurants")
      .then(res => res.json())
      .then(data => setRestaurants(data))
      .catch(err => console.error("Failed to fetch restaurants:", err));

    // Get Roll No. from localStorage
    const storedRollNo = localStorage.getItem("id");
    if (storedRollNo) {
      setRoll_No(JSON.parse(storedRollNo)); // Set Roll No. in state
      
    }
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
