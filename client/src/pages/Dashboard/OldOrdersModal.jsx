import React, { useEffect, useState } from "react";

const OldOrdersModal = ({ onClose }) => {
  const [oldOrders, setOldOrders] = useState([]);
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("student");
    if (stored) {
      const parsed = JSON.parse(stored);
      setStudent(parsed);
    } else {
      console.error("Student not found in localStorage.");
    }
  }, []);

  useEffect(() => {
    const fetchOldOrders = async () => {
      try {
        const response = await fetch(`http://localhost:3001/students/${student.id}/old-orders`);
        const data = await response.json();

        if (Array.isArray(data)) {
          setOldOrders(data);
        } else {
          console.warn("Expected array but got:", data);
          setOldOrders([]);
        }
      } catch (err) {
        console.error("Failed to fetch old orders:", err);
        setOldOrders([]);
      }
    };

    if (student?.id) {
      fetchOldOrders();
    }
  }, [student]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 w-3/4 rounded-lg max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Old Food Orders</h2>

        {oldOrders.length === 0 ? (
          <p>No old food orders found.</p>
        ) : (
          <ul className="space-y-6">
            {oldOrders.map((order) => (
              <li key={order.FOrder_ID} className="border-b pb-3">
                <p><strong>Restaurant:</strong> {order.Restaurant_Name}</p>
                <p><strong>Items:</strong> {order.Item_Details}</p>
                <p><strong>Total:</strong> Rs. {order.Amount_Total}</p>
                <p><strong>Pickup Time:</strong> {new Date(order.Pickup_Time).toLocaleString()}</p>
                <p><strong>Status:</strong> {order.Food_Status}</p>
              </li>
            ))}
          </ul>
        )}

        <button onClick={onClose} className="mt-4 text-red-500">Close</button>
      </div>
    </div>
  );
};

export default OldOrdersModal;
