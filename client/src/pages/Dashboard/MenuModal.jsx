import React, { useEffect, useState } from "react";

const MenuModal = ({ restaurant, onClose }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [orderItems, setOrderItems] = useState({});
  //const [roll_no, setRoll_No] = useState(null);
  const [student, setStudent] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3001/restaurants/${restaurant.Restaurant_ID}/menu`)
      .then(res => res.json())
      .then(data => setMenuItems(data))
      .catch(err => console.error("Failed to fetch menu:", err));
      const stored = localStorage.getItem("student");
      console.log(stored);
      setStudent(JSON.parse(stored));
    
      //console.log(roll_no);
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
    //const roll_no = localStorage.getItem("Roll_No");
    if (Object.values(orderItems).every(qty => qty === 0)) {
        alert("Please select at least one item.");
        return;
      }

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

    try {
      const res = await fetch("http://localhost:3001/restaurants/food-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("Order placed successfully!");
        onClose(); // close menu
      } else {
        alert("Failed to place order.");
      }
    } catch (error) {
      console.error("Order error:", error);
      alert("Something went wrong.");
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
