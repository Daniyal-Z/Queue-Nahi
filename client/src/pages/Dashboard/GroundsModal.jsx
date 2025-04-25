import { useEffect, useState } from "react";

const GroundsModal = ({ onClose }) => {
  const [grounds, setGrounds] = useState([]);

  const fetchGrounds = async () => {
    try {
      const res = await fetch("http://localhost:3001/grounds");
      const data = await res.json();
      if (res.ok) {
        setGrounds(data);
      } else {
        alert("Failed to fetch grounds.");
      }
    } catch (error) {
      console.error("Error fetching grounds:", error);
      alert("Server error");
    }
  };

  useEffect(() => {
    fetchGrounds();
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Available Grounds</h2>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {grounds.length === 0 ? (
            <p>No grounds available.</p>
          ) : (
            grounds.map((g, idx) => (
              <div
                key={idx}
                className="flex justify-between border-b pb-2 text-sm"
              >
                <span className="font-medium">{g.Ground_Type}</span>
                <span className="text-gray-600">{g.G_Status}</span>
              </div>
            ))
          )}
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroundsModal;
