import { useEffect, useState } from "react";

const GManagerDashboard = () => {
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
  const [selectedGroundForSlots, setSelectedGroundForSlots] = useState(null);
  const [newSlot, setNewSlot] = useState({
    Day: "Mon",
    StartTime: 9,
    EndTime: 10
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("manager");
    if (!stored) {
      window.location.href = "/manager/login";
    } else {
      setManager(JSON.parse(stored));
    }
  }, []);

  const fetchGrounds = async () => {
    try {
      const res = await fetch("http://localhost:3001/grounds");
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

  const fetchGroundSlots = async (groundId) => {
    try {
      const res = await fetch(`http://localhost:3001/grounds/${groundId}/slots`);
      const data = await res.json();
      setGroundSlots(data);
      setSelectedGroundForSlots(groundId);
      setShowSlotsModal(true);
    } catch (err) {
      setError("Failed to load slots");
    }
  };

  const handleAddGround = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      const res = await fetch("http://localhost:3001/grounds", {
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
      const res = await fetch(
        `http://localhost:3001/grounds/${editingGround.G_ID}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
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

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this ground?")) return;
    
    try {
      const response = await fetch(`http://localhost:3001/grounds/${id}`, {
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
      const response = await fetch(
        `http://localhost:3001/grounds/${selectedGroundForSlots}/slots`, 
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newSlot)
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add slot");
      }
  
      const data = await response.json();
      fetchGroundSlots(selectedGroundForSlots);
      setNewSlot({ Day: "Mon", StartTime: 9, EndTime: 10 });
    } catch (err) {
      setError(err.message);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-6 rounded-xl shadow-lg max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">
          Welcome, {manager?.Name || "Manager"}!
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
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            onClick={() => setShowAddModal(true)}
          >
            Add Ground
          </button>
        </div>
      </div>

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
                        className="bg-purple-500 text-white px-2 py-1 rounded text-xs hover:bg-purple-600"
                        onClick={() => fetchGroundSlots(g.G_ID)}
                      >
                        Slots
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
              Time Slots for Ground {selectedGroundForSlots}
            </h3>
            
            <div className="grid grid-cols-3 gap-2 mb-4 max-h-64 overflow-y-auto">
              {groundSlots.length === 0 ? (
                <p className="col-span-3 text-gray-500 p-2">No slots available</p>
              ) : (
                groundSlots.map((slot) => (
                  <div
                    key={slot.SlotID}
                    className="border p-2 rounded text-sm"
                  >
                    {slot.Day}: {slot.StartTime}:00-{slot.EndTime}:00
                  </div>
                ))
              )}
            </div>

            <div className="space-y-2 border-t pt-4">
              <h4 className="font-medium">Add New Slot</h4>
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={newSlot.Day}
                  onChange={(e) => setNewSlot({...newSlot, Day: e.target.value})}
                  className="border p-2 rounded"
                >
                  {["Mon","Tue","Wed","Thu","Fri","Sat"].map((day) => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
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