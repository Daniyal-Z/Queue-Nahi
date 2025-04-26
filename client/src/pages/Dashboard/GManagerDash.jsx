import { useEffect, useState } from "react";
//helloworld
const GManagerDashboard = () => {
  const [manager, setManager] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [groundName, setGroundName] = useState("");
  const [grounds, setGrounds] = useState([]);
  const [editingGround, setEditingGround] = useState(null); // holds ground object
  const [editName, setEditName] = useState("");
  const [editStatus, setEditStatus] = useState("Available");

  useEffect(() => {
    const stored = localStorage.getItem("manager");
    if (!stored) {
      window.location.href = "/manager/login";
    } else {
      setManager(JSON.parse(stored));
    }
  }, []);

  const handleAddGround = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:3001/grounds", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ground_type: groundName }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Ground added successfully!");
        setShowAddModal(false);
        setGroundName("");
        fetchGrounds(); // Refresh list
      } else {
        alert(data.message || "Failed to add ground.");
      }
    } catch (error) {
      console.error("Error adding ground:", error);
      alert("Server error");
    }
  };

  const fetchGrounds = async () => {
    try {
      const res = await fetch("http://localhost:3001/grounds");
      const data = await res.json();
      if (res.ok) {
        setGrounds(data);
        setShowViewModal(true);
      } else {
        alert("Failed to fetch grounds.");
      }
    } catch (error) {
      console.error("Error fetching grounds:", error);
      alert("Server error");
    }
  };

  const handleUpdate = (ground) => {
    setEditingGround(ground);
    setEditName(ground.Ground_Type);
    setEditStatus(ground.G_Status);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:3001/grounds/${editingGround.G_ID}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Ground_Type: editName,
          G_Status: editStatus,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Ground updated successfully!");
        setEditingGround(null);
        fetchGrounds(); // Refresh list
      } else {
        alert(data.message || "Failed to update ground.");
      }
    } catch (error) {
      console.error("Error updating ground:", error);
      alert("Server error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-6 rounded-xl shadow-lg max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Welcome, {manager?.name}!</h1>

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
                name="ground_type"
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
            <h2 className="text-xl font-semibold mb-4">Available Grounds</h2>
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
                    <button
                      className="bg-yellow-400 px-3 py-1 rounded text-white text-xs hover:bg-yellow-500"
                      onClick={() => handleUpdate(g)}
                    >
                      Update
                    </button>
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

      {/* Update Modal */}
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
    </div>
  );
};

export default GManagerDashboard;
