import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RestaurantModal from "./RestaurantModal";
import StudentOrdersModal from "./StudentR_OrdersModal";
import BookCafeModal from "./BookCafeModal";
import PrintCafeModal from "./PrintCafeModal";
import GroundsModal from "./GroundsModal";

const StudentDashboard = () => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRestaurantModal, setShowRestaurantModal] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [showBookCafeModal, setShowBookCafeModal] = useState(false);
  const [showPrintCafeModal, setShowPrintCafeModal] = useState(false);
  const [showGroundsModal, setShowGroundsModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // In your useEffect
    const verifyAuth = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) throw new Error('No token found');

        const response = await fetch('http://localhost:3001/students/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        
        if (!response.ok || !data.valid) {
          throw new Error('Session invalid');
        }

        // Token is valid, proceed
        const storedStudent = localStorage.getItem('student');
        if (!storedStudent) throw new Error('No user data');
        
        setStudent(JSON.parse(storedStudent));
      } catch (err) {
        // Clear storage and redirect
        localStorage.removeItem('student');
        localStorage.removeItem('access_token');
        navigate('/login/student');
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("student");
    localStorage.removeItem("access_token");
    navigate("/student/login", { replace: true });
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
        <h1 className="text-2xl font-bold">{student?.name}'s Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Logout
        </button>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={() => setShowRestaurantModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          View Restaurants
        </button>

        <button
          onClick={() => setShowOrdersModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
        >
          View Orders
        </button>

        <button
          onClick={() => setShowBookCafeModal(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
        >
          Book Café
        </button>

        <button
          onClick={() => setShowPrintCafeModal(true)}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
        >
          Print Café
        </button>

        <button
          onClick={() => setShowGroundsModal(true)}
          className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition-colors"
        >
          Sports Grounds
        </button>
      </div>

      {/* Modals */}
      {showRestaurantModal && (
        <RestaurantModal onClose={() => setShowRestaurantModal(false)} />
      )}

      {showOrdersModal && (
        <StudentOrdersModal onClose={() => setShowOrdersModal(false)} />
      )}

      {showBookCafeModal && (
        <BookCafeModal onClose={() => setShowBookCafeModal(false)} />
      )}

      {showPrintCafeModal && (
        <PrintCafeModal onClose={() => setShowPrintCafeModal(false)} />
      )}

      {showGroundsModal && (
        <GroundsModal onClose={() => setShowGroundsModal(false)} />
      )}
    </div>
  );
};

export default StudentDashboard;