import React, { useState, useEffect } from "react";
import RestaurantModal from "./RestaurantModal";
import StudentOrdersModal from "./StudentR_OrdersModal";
import BookCafeModal from "./BookCafeModal";
import PrintCafeModal from "./PrintCafeModal";
import GroundsModal from "./GroundsModal"; // ⬅️ NEW

const StudentDashboard = () => {
  const [student, setStudent] = useState();
  const [showRestaurantModal, setShowRestaurantModal] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [showBookCafeModal, setShowBookCafeModal] = useState(false);
  const [showPrintCafeModal, setShowPrintCafeModal] = useState(false);
  const [showGroundsModal, setShowGroundsModal] = useState(false); // ⬅️ NEW

  useEffect(() => {
    const stored = localStorage.getItem("student");
    if (!stored) {
      window.location.href = "/student/login";
    } else {
      setStudent(JSON.parse(stored));
    }
  }, []);

  if (!student) return null;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{student.name}'s Dashboard</h1>

      <div className="space-x-4">
        <button
          onClick={() => setShowRestaurantModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          View Restaurants
        </button>

        <button
          onClick={() => setShowOrdersModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          View Restaurant Orders
        </button>

        <button
          onClick={() => setShowBookCafeModal(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          View Book Café
        </button>

        <button
          onClick={() => setShowPrintCafeModal(true)}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          View Print Café
        </button>

        <button
          onClick={() => setShowGroundsModal(true)}
          className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
        >
          View Grounds
        </button>
      </div>

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
