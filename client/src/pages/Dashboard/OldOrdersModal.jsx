import React, { useEffect, useState } from "react";

const OldOrdersModal = ({ onClose }) => {
  const [oldOrders, setOldOrders] = useState([]);
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
    const fetchStudentAndOrders = async () => {
      try {
        // 1. Load student
        const storedStudent = localStorage.getItem('student');
        if (!storedStudent) {
          throw new Error('Student not found in localStorage.');
        }
        const studentData = JSON.parse(storedStudent);
        setStudent(studentData);
  
        // 2. Load token
        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error('Missing authentication token');
        }
  
        // 3. Fetch orders
        const response = await authorizedFetch(
          `http://localhost:3001/students/${studentData.id}/old-orders`);
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch orders');
        }
  
        const ordersData = await response.json();
        setOldOrders(ordersData);
  
      } catch (err) {
        console.error('Fetch error:', err);
  
        // 4. Handle unauthorized (401/403)
        if (err.message.includes('401') || err.message.includes('403')) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('student');
          window.location.href = '/login/student';
        }
      }
    };
  
    fetchStudentAndOrders();
  }, []);
  

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
