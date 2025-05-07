import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RestaurantModal from "./RestaurantModal";
import StudentOrdersModal from "./StudentR_OrdersModal";
import BookCafeModal from "./BookCafeModal";
import PrintCafeModal from "./PrintCafeModal";
import GroundsModal from "./GroundsModal";
import { useAuthVerify } from '../../hooks'; 

const StudentDashboard = () => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRestaurantModal, setShowRestaurantModal] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [showBookCafeModal, setShowBookCafeModal] = useState(false);
  const [showPrintCafeModal, setShowPrintCafeModal] = useState(false);
  const [showGroundsModal, setShowGroundsModal] = useState(false);
  const navigate = useNavigate();

  //auth verif hook
  useAuthVerify('student');

  useEffect(() => {
    const storedStudent = localStorage.getItem('student');
    if (storedStudent) {
      try {
        setStudent(JSON.parse(storedStudent));
      } catch (err) {
        console.error("Failed to parse student data:", err);
        handleLogout();
      }
    }
    setLoading(false);
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem("student");
    localStorage.removeItem("access_token");
    navigate("/login/student", { replace: true });
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