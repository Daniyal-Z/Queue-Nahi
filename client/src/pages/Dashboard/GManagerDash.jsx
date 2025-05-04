import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const GManagerDashboard = () => {
  //booking component
  const [showG_BookingsModal, setShowG_BookingsModal] = useState(false);
  const [g_bookings, setG_Bookings] = useState([]);
  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [selectedGroundForBookings, setSelectedGroundForBookings] = useState(null);
  const [manager, setManager] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showSlotsModal, setShowSlotsModal] = useState(false);
  const [groundName, setGroundName] = useState("");
  const [grounds, setGrounds] = useState([]);
  const [editingGround, setEditingGround] = useState(null);
  const [editName, setEditName] = useState("");
  const [editStatus, setEditStatus] = useState("Available");
  const [groundSlots, setGroundSlots] = useState([]);
  const [newSlot, setNewSlot] = useState({
    StartTime: 9,
    EndTime: 10
  });
  const [error, setError] = useState("");

  const authorizedFetch = async (url, options = {}) => {
    const token = localStorage.getItem('access_token');
  
    // If token is missing, redirect immediately
    if (!token) {
      localStorage.removeItem('manager');
      window.location.href = '/login/manager';
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
      localStorage.removeItem('manager');
      window.location.href = '/login/manager';
      throw new Error('Authentication failed. Redirecting to login.');
    }
  
    return response;
  };

  useEffect(() => {
    const stored = localStorage.getItem("manager");
    if (!stored) {
      window.location.href = "/login/manager";
    } else {
      setManager(JSON.parse(stored));
    }
  }, []);

  // Fetch bookings for a specific ground
  const fetchG_Bookings = async (groundId) => {
    try {
      const res = await authorizedFetch(`http://localhost:3001/grounds/${groundId}/bookings`);
      const data = await res.json();
      setG_Bookings(data); 
      setSelectedGroundForBookings(groundId); // optional
      setShowG_BookingsModal(true); // show modal or section
    } catch (err) {
      setError('Failed to fetch bookings');
    }
  };

  // Fetch bookings for a specific ground
  const fetchAllBookings = async (groundId) => {
    try {
      const res = await authorizedFetch(`http://localhost:3001/grounds/bookings/all`);
      const data = await res.json();
      setBookings(data); 
      setShowBookingsModal(true); // show modal or section
    } catch (err) {
      setError('Failed to fetch bookings');
    }
  };

  
  const fetchGrounds = async () => {
    try {
      const res = await authorizedFetch("http://localhost:3001/grounds");
      const data = await res.json();
      if (res.ok) {
        setGrounds(data);
        setShowViewModal(true);
      } else {
        setError("Failed to fetch grounds");
      }
    } catch (err) {
      setError("Server error");
    }
  };

  const handleAddGround = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      const res = await authorizedFetch("http://localhost:3001/grounds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ground_type: groundName })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add ground");
      
      setShowAddModal(false);
      setGroundName("");
      fetchGrounds();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      const res = await authorizedFetch(
        `http://localhost:3001/grounds/${editingGround.G_ID}`,
        {
          method: "PUT",
          body: JSON.stringify({
            Ground_Type: editName,
            G_Status: editStatus
          })
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");
      
      setEditingGround(null);
      fetchGrounds();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    try {
      if (!window.confirm('Are you sure you want to delete this booking?')) return;
      
      const res = await authorizedFetch(`http://localhost:3001/grounds/bookings/${bookingId}`, {
        method: 'DELETE'
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete booking');
      }
      
      // Refresh the bookings list
      fetchG_Bookings(selectedGroundForBookings);
      fetchAllBookings();
      alert('Booking deleted successfully');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this ground?")) return;
    
    try {
      const response = await authorizedFetch(`http://localhost:3001/grounds/${id}`, {
        method: "DELETE"
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Delete failed");
      }
      
      fetchGrounds();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddSlot = async () => {
    try {
      // Validate time inputs
      if (newSlot.StartTime >= newSlot.EndTime) {
        setError("End time must be after start time");
        return;
      }
  
      // console.log("Sending slot data:", {
      //   // date: formattedDate,
      //   startTime: newSlot.StartTime,
      //   endTime: newSlot.EndTime
      // });
  
      const response = await authorizedFetch(
        `http://localhost:3001/grounds/slots`, 
        {
          method: "POST",
          body: JSON.stringify({
            startTime: newSlot.StartTime,
            endTime: newSlot.EndTime
          })
        }
      );
  
      const responseData = await response.json();
      console.log("Backend response:", responseData);
  
      if (!response.ok) {
        throw new Error(responseData.message || "Failed to add slot");
      }
  
      // setNewSlot({ StartTime: newSlot.StartTime, EndTime: newSlot.EndTime });
      setError("");
    } catch (err) {
      console.error("Slot creation error:", err);
      setError(err.message);
    }
  };

  /// Delete Slot function
  /// This function deletes a slot by its ID and refreshes the slots list.
  const deleteSlot = async (slotId) => {
    try {
      if (!window.confirm('Are you sure you want to delete this slot?')) return;
  
      const res = await authorizedFetch(
        `http://localhost:3001/grounds/slots/${slotId}`,
        { 
          method: 'DELETE'
        }
      );
  
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete slot');
      }
  
      alert('Slot deleted successfully');
    } catch (err) {
      alert(err.message);
    }
  };

  // const fetchAvailableSlots = async (id, dateI) => {
  //   try {
  //     const res = await authorizedFetch(`http://localhost:3001/grounds/${id}/slots`, 
  //       {
  //         method: "POST",
  //         body: JSON.stringify({
  //           date: dateI
  //         })
  //       }
  //     );

  //     const data = await res.json();
  //     if (res.ok) {
        
  //       setShowSlotsModal(true);
  //     } else {
  //       setError("Failed to fetch grounds");
  //     }
  //   } catch (err) {
  //     setError("Server error");
  //   }
  // };

  const fetchSlots = async () => {
    try {
      const res = await authorizedFetch(`http://localhost:3001/grounds/slots/all`);

      const data = await res.json();
      if (res.ok) {
        
        //setShowSlotsModal(true);
        setGroundSlots(data);
      } else {
        setError("Failed to fetch grounds");
      }
    } catch (err) {
      setError("Server error");
    }
  };


  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-6 rounded-xl shadow-lg max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">
          Welcome, {manager?.name || "Manager"}!
        </h1>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-2 mb-4">
            {error}
          </div>
        )}

        <div className="mt-6 space-x-4">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={fetchGrounds}
          >
            View All Grounds
          </button>
          <button
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            onClick={() => {setShowBookingsModal(true); fetchAllBookings(); }}
            >
            View Bookings
          </button>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            onClick={() => setShowAddModal(true)}
          >
            Add Ground
          </button>

          <button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            onClick={() => {fetchSlots(); setShowSlotsModal(true); } }
          >
            View Slots
          </button>
        </div>
      </div>
      
      {/* View Bookings Modal */}
      {showG_BookingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl shadow-lg">
            <h3 className="text-lg font-semibold mb-4">
              Bookings for Ground {selectedGroundForBookings}
            </h3>
            
            <div className="overflow-y-auto max-h-96">
              {/* Replace the existing table with this new one */}
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slot Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {g_bookings.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500">No bookings found</td>
                    </tr>
                  ) : (
                    g_bookings.map((booking) => (
                      <tr key={booking.Booking_ID}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.Booking_ID}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {booking.StartTime}:00 - {booking.EndTime}:00
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.Roll_No}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(booking.B_Time).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => handleDeleteBooking(booking.Booking_ID)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowG_BookingsModal(false)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Bookings Modal */}
      {showBookingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl shadow-lg">
            <h3 className="text-lg font-semibold mb-4">
              Bookings
            </h3>
            
            <div className="overflow-y-auto max-h-96">
              {/* Replace the existing table with this new one */}
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ground ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ground </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slot Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slot Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500">No bookings found</td>
                    </tr>
                  ) : (
                    bookings.map((booking) => (
                      <tr key={booking.Booking_ID}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.Booking_ID}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.G_ID}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.Ground_Type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {booking?.StartTime}:00 - {booking?.EndTime}:00
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.Roll_No}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(booking.B_Time).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(booking.Day).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => handleDeleteBooking(booking.Booking_ID)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowBookingsModal(false)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Add Ground Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Add New Ground</h2>
            <form onSubmit={handleAddGround} className="space-y-4">
              <input
                type="text"
                placeholder="Ground Name (e.g., Cricket)"
                value={groundName}
                onChange={(e) => setGroundName(e.target.value)}
                required
                className="w-full border px-3 py-2 rounded"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="bg-gray-300 px-4 py-2 rounded"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Add Ground
                </button>
              </div>
            </form>
          </div>
        </div>
      )}




      {/* View Grounds Modal */}
      {showViewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-40">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Grounds Management</h2>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {grounds.length === 0 ? (
                <p>No grounds available.</p>
              ) : (
                grounds.map((g) => (
                  <div
                    key={g.G_ID}
                    className="flex justify-between items-center border-b pb-2 text-sm"
                  >
                    <div>
                      <span className="font-medium">{g.Ground_Type}</span> -{" "}
                      <span className="text-gray-600">{g.G_Status}</span>
                    </div>
                    <div className="space-x-2">
                      <button
                        className="bg-yellow-400 px-3 py-1 rounded text-white text-xs hover:bg-yellow-500"
                        onClick={() => {
                          setEditingGround(g);
                          setEditName(g.Ground_Type);
                          setEditStatus(g.G_Status);
                        }}
                      >
                        Update
                      </button>
                      <button
                        className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                        onClick={() => fetchG_Bookings(g.G_ID)}
                      >
                        Bookings
                      </button>
                      <button
                        onClick={() => handleDelete(g.G_ID)}
                        className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowViewModal(false)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Ground Modal */}
      {editingGround && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Update Ground</h2>
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                className="w-full border px-3 py-2 rounded"
              />
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full border px-3 py-2 rounded"
              >
                <option value="Available">Available</option>
                <option value="Booked">Booked</option>
                <option value="Maintenance">Maintenance</option>
              </select>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingGround(null)}
                  className="bg-gray-300 px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Slots Modal */}
      {showSlotsModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4">
            Time Slots
          </h3>

          {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-2 mb-4">
            {error}
          </div>
        )}
          
          <div className="grid grid-cols-3 gap-2 mb-4 max-h-64 overflow-y-auto">
            {groundSlots.length === 0 ? (
              <p className="col-span-3 text-gray-500 p-2">No slots available</p>
            ) : (
              groundSlots.map((slot) => (
                <div
                  key={slot.SlotID}
                  className="border p-2 rounded text-sm"
                >
                  {slot.SlotID}: {slot.StartTime}:00-{slot.EndTime}:00
                  <button
                    onClick={() => deleteSlot(slot.SlotID)}
                    className="text-red-500 hover:text-red-700"
                    title="Delete slot"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="space-y-2 border-t pt-4">
            <h4 className="font-medium">Add New Slot</h4>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                value={newSlot.StartTime}
                onChange={(e) => setNewSlot({...newSlot, StartTime: e.target.value})}
                placeholder="Start hour"
                className="border p-2 rounded"
                min="0"
                max="23"
              />
              <input
                type="number"
                value={newSlot.EndTime}
                onChange={(e) => setNewSlot({...newSlot, EndTime: e.target.value})}
                placeholder="End hour"
                className="border p-2 rounded"
                min="1"
                max="24"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={() => setShowSlotsModal(false)}
              className="bg-gray-300 px-4 py-2 rounded"
            >
              Close
            </button>
            <button
              onClick={handleAddSlot}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Add Slot
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
};

export default GManagerDashboard;