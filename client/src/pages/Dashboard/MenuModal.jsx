import React, { useEffect, useState } from "react";

const MenuModal = ({ restaurant, onClose }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [orderItems, setOrderItems] = useState({});
  //const [roll_no, setRoll_No] = useState(null);
  const [student, setStudent] = useState(null);

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
    const fetchMenu = async () => {
      try {
        // 1. Get token and student data
        const token = localStorage.getItem('access_token');
        const storedStudent = localStorage.getItem('student');
        
        if (!token || !storedStudent) {
          throw new Error('Missing authentication data');
        }
  
        // 2. Parse student data (with error handling)
        const student = JSON.parse(storedStudent);
        setStudent(student);
  
        // 3. Fetch menu with authorization
        const response = await authorizedFetch(`http://localhost:3001/restaurants/${restaurant.Restaurant_ID}/menu`);
  
        // 4. Handle response
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch menu');
        }
  
        const menuData = await response.json();
        setMenuItems(menuData);
  
      } catch (err) {
        console.error("Menu fetch error:", err);
        
        // 5. Handle unauthorized access
        if (err.message.includes('401') || err.message.includes('403')) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('student');
          window.location.href = '/login/student';
        }
      }
    };
  
    if (restaurant?.Restaurant_ID) {
      fetchMenu();
    }
  }, [restaurant]);

  const handleQuantityChange = (itemId, qty) => {
    setOrderItems((prev) => ({
      ...prev,
      [itemId]: qty
    }));
  };

  const calculateTotal = () => {
    return menuItems.reduce((sum, item) => {
      const qty = orderItems[item.Item_ID] || 0;
      return sum + qty * item.Item_Amount;
    }, 0);
  };

  const placeOrder = async () => {
    // 1. Validate at least one item is selected
    if (Object.values(orderItems).every(qty => qty === 0)) {
      alert("Please select at least one item.");
      return;
    }
  
    // 2. Prepare payload with token
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No authentication token found');
  
      const payload = {
        roll_no: student.id,
        restaurant_id: restaurant.Restaurant_ID,
        order_time: new Date().toISOString(),
        total_amount: calculateTotal(),
        items: Object.entries(orderItems)
          .filter(([_, qty]) => qty > 0)
          .map(([id, qty]) => ({
            item_id: parseInt(id),
            quantity: qty,
          })),
      };
  
      // 3. Make authenticated request
      const response = await authorizedFetch("http://localhost:3001/restaurants/food-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
  
      // 4. Handle response
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to place order');
      }
  
      alert("Order placed successfully!");
      onClose();
      
      // 5. Optional: Refresh order history
      //fetchOrderHistory(); 
  
    } catch (error) {
      console.error("Order error:", error);
      
      // Handle unauthorized access
      if (error.message.includes('401') || error.message.includes('403')) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('student');
        window.location.href = '/login/student';
        return;
      }
  
      alert(error.message || "Something went wrong");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 w-3/4 max-h-[80vh] overflow-y-auto rounded-lg">
        <h2 className="text-xl font-bold mb-4">Menu - {restaurant.Restaurant_Name}</h2>

        <div className="space-y-4">
          {menuItems.map(item => (
            <div key={item.Item_ID} className="flex justify-between items-center border-b pb-2">
              <div>
                <h3 className="font-semibold">{item.Item_Name}</h3>
                <p className="text-sm text-gray-600">Rs. {item.Item_Amount}</p>
              </div>
              <input
                type="number"
                min="0"
                value={orderItems[item.Item_ID] || ""}
                onChange={(e) => handleQuantityChange(item.Item_ID, parseInt(e.target.value || 0))}
                className="border px-2 py-1 w-20 rounded"
              />
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-between items-center">
          <span className="font-bold text-lg">Total: Rs. {calculateTotal()}</span>
          <button
            onClick={placeOrder}
            className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
          >
            Place Order
          </button>
        </div>

        <button onClick={onClose} className="mt-4 text-red-500">Back</button>
      </div>
    </div>
  );
};

export default MenuModal;
