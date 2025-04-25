import React, { useEffect, useState } from "react";
import OldOrdersModal from "./OldOrdersModal"; 

const StudentOrdersModal = ({ onClose }) => {
  const [orders, setOrders] = useState([]);
  const [student, setStudent] = useState(null);
  const [showOldOrders, setShowOldOrders] = useState(false); 

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
    const fetchOrders = async () => {
      try {
        const response = await fetch(`http://localhost:3001/students/${student.id}/active-orders`);
        const data = await response.json();
        setOrders(data);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      }
    };

    if (student?.id) {
      fetchOrders();
    }
  }, [student]);

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 w-3/4 rounded-lg max-h-[80vh] overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Your Active Orders</h2>

          {Array.isArray(orders) && orders.length > 0 ? (
            <ul className="space-y-6">
              {orders.map((order) => (
                <li key={order.FOrder_ID} className="border-b pb-3">
                  <p><strong>Restaurant:</strong> {order.Restaurant_Name}</p>
                  <p><strong>Items:</strong> {order.Item_Details}</p>
                  <p><strong>Total:</strong> Rs. {order.Amount_Total}</p>
                  <p>
                    <strong>Pickup Time:</strong>{" "}
                    {order.Pickup_Time ? new Date(order.Pickup_Time).toLocaleString() : "Not assigned yet"}
                  </p>
                  <p><strong>Status:</strong> {order.Food_Status}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No unpaid orders found.</p>
          )}


          <div className="mt-4 flex justify-between">
            <button onClick={onClose} className="text-red-500">Close</button>
            <button onClick={() => setShowOldOrders(true)} className="text-blue-600">View Old Orders</button>
          </div>
        </div>
      </div>

      {showOldOrders && (
        <OldOrdersModal studentId={student.id} onClose={() => setShowOldOrders(false)} />
      )}
    </>
  );
};

export default StudentOrdersModal;
