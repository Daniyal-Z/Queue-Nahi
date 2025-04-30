import { useEffect, useState } from "react";

const MgrPrintCafe = () => {
  
  const [showPricing, setShowPricing] = useState(false);
  const [showAddType, setShowAddType] = useState(false);
  const [showPrintJobs, setShowPrintJobs] = useState(false);
  const [pricingData, setPricingData] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editFeedback, setEditFeedback] = useState("");
  const [printOrders, setPrintOrders] = useState([]);
  const [oldprintOrders, setOldPrintOrders] = useState([]);
  const [showPrintOrdersModal, setShowPrintOrdersModal] = useState(false);
  const [showOldPrintOrdersModal, setShowOldPrintOrdersModal] = useState(false);


  const [typeName, setTypeName] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

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
    if (showPricing) {
      authorizedFetch("http://localhost:3001/print/printPricing")
        .then((res) => res.json())
        .then((data) => setPricingData(data))
        .catch((err) => console.error("Error fetching pricing:", err));
    }
  }, [showPricing]);

  const handleOpenPrintOrdersModal = async () => {
    try {
      const res = await authorizedFetch("http://localhost:3001/print/orders");
      const data = await res.json();
      const currentOrders = data.filter((order) => order.Status !== "Paid");
      setPrintOrders(currentOrders);
      setShowPrintOrdersModal(true);
    } catch (err) {
      console.error("Error loading print orders:", err);
      alert("Failed to load print orders.");
    }
  };  
  
  const handleOpenOldPrintOrdersModal = async () => {
    try {
      const res = await authorizedFetch("http://localhost:3001/print/orders");
      const data = await res.json();
      const currentOrders = data.filter((order) => order.Status === "Paid");
      setOldPrintOrders(currentOrders);
      setShowOldPrintOrdersModal(true);
    } catch (err) {
      console.error("Error loading print orders:", err);
      alert("Failed to load print orders.");
    }
  };  

  const handleMarkCompleted = async (pid) => {
    try {
      const res = await authorizedFetch(`http://localhost:3001/print/orders/${pid}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ Payment_Status: "Paid" }),
      });
  
      if (res.ok) {
        // Remove the completed order from the list
        const updated = await authorizedFetch("http://localhost:3001/print/orders");
        const data = await updated.json();
        const currentOrders = data.filter((order) => order.Status !== "Paid");
        setPrintOrders(currentOrders);
      } else {
        const err = await res.json();
        alert("❌ Failed to mark completed: " + err.message);
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert("❌ An error occurred while marking as completed.");
    }
  };
  
  
  const handleUpdateType = async (e) => {
    e.preventDefault();
    setLoading(true);
    setEditFeedback("");
  
    try {
      const response = await authorizedFetch(`http://localhost:3001/print/types/${editItem.Type_ID}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Type_Name: editName,
          Price_Per_Page: parseFloat(editPrice),
        }),
      });
  
      if (response.ok) {
        setEditFeedback("✅ Print type updated!");
        // Refresh pricing data
        const res = await authorizedFetch("http://localhost:3001/print/printPricing");
        const data = await res.json();
        setPricingData(data);
      } else {
        const err = await response.json();
        setEditFeedback("❌ Failed: " + err.message);
      }
    } catch (err) {
      console.error("Update error:", err);
      setEditFeedback("❌ Something went wrong.");
    }
  
    setLoading(false);
  };
  

  const handleAddType = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback("");
  
    try {
      const response = await authorizedFetch("http://localhost:3001/print/types", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Type_Name: typeName,
          Price_Per_Page: parseFloat(price),
        }),
      });
  
      if (response.ok) {
        setFeedback("✅ Print type added successfully!");
        setTypeName("");
        setPrice("");
      } else {
        const errorData = await response.json();
        setFeedback("❌ Failed to add print type: " + errorData.message);
      }
    } catch (error) {
      console.error("Error adding print type:", error);
      setFeedback("❌ Something went wrong.");
    }
  
    setLoading(false);
  };
  

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Panel */}
      <div className="bg-white p-6 rounded-xl shadow-lg max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">🖨️ Print Cafe - Manager Panel</h1>

        <div className="mt-6 space-y-4">
          <button
            onClick={() => setShowPricing(true)}
            className="w-full bg-purple-500 text-white px-4 py-3 rounded hover:bg-purple-600 text-lg font-medium"
          >
            🔍 View Pricing
          </button>

          <button
            onClick={() => setShowAddType(true)}
            className="w-full bg-yellow-500 text-white px-4 py-3 rounded hover:bg-yellow-600 text-lg font-medium"
          >
            ➕ Add Print Type
          </button>

          <button
            onClick={handleOpenPrintOrdersModal}
            className="w-full bg-blue-500 text-white px-4 py-3 rounded hover:bg-blue-600 text-lg font-medium"
          >
            📄 View Print Jobs
          </button>

          <button
            onClick={handleOpenOldPrintOrdersModal}
            className="w-full bg-blue-500 text-white px-4 py-3 rounded hover:bg-blue-600 text-lg font-medium"
          >
            📄 View Old Print Jobs
          </button>
        </div>
      </div>

      {/* Add Print Type Modal */}
      {showAddType && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg relative">
            <h2 className="text-xl font-semibold mb-4">➕ Add New Print Type</h2>

            <form className="space-y-4" onSubmit={handleAddType}>
              <input
                type="text"
                placeholder="Type Name (e.g., Colored A4)"
                className="w-full border border-gray-300 rounded px-4 py-2"
                value={typeName}
                onChange={(e) => setTypeName(e.target.value)}
                required
              />
              <input
                type="number"
                step="0.01"
                placeholder="Price per page"
                className="w-full border border-gray-300 rounded px-4 py-2"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
              <button
                type="submit"
                className={`bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 ${
                  loading && "opacity-60 cursor-not-allowed"
                }`}
                disabled={loading}
              >
                {loading ? "Adding..." : "Add Type"}
              </button>

              {feedback && <p className="text-sm mt-2">{feedback}</p>}
            </form>

            <button
              onClick={() => {
                setShowAddType(false);
                setFeedback("");
              }}
              className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-xl"
            >
              ✖
            </button>
          </div>
        </div>
      )}

      {/* Pricing Modals*/}
      {showPricing && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg relative">
            <h2 className="text-xl font-semibold mb-4">📋 Print Type Pricing</h2>

            {pricingData.length === 0 ? (
                <p>Loading pricing data...</p>
            ) : (
                <ul className="space-y-2">
                {pricingData.map((item) => (
                    <li key={item.Type_ID} className="border-b py-2 flex justify-between items-center">
                    <span>
                        <span className="font-medium">{item.Type_Name}</span> - Rs.{" "}
                        {item.Price_Per_Page.toFixed(2)}/page
                    </span>
                    <button
                        onClick={() => {
                        setEditItem(item);
                        setEditName(item.Type_Name);
                        setEditPrice(item.Price_Per_Page.toFixed(2));
                        setShowEditModal(true);
                        }}
                        className="ml-4 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                        ✏️ Update
                    </button>
                    </li>
                ))}
                </ul>
            )}

            <button
                onClick={() => setShowPricing(false)}
                className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-xl"
            >
                ✖
            </button>
            </div>
        </div>
        )}


    {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg relative">
            <h2 className="text-xl font-semibold mb-4">✏️ Update Print Type</h2>

            <form onSubmit={handleUpdateType} className="space-y-4">
                <input
                type="text"
                className="w-full border border-gray-300 rounded px-4 py-2"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                />
                <input
                type="number"
                step="0.01"
                className="w-full border border-gray-300 rounded px-4 py-2"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                required
                />
                <button
                type="submit"
                className={`bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 ${
                    loading && "opacity-60 cursor-not-allowed"
                }`}
                disabled={loading}
                >
                {loading ? "Updating..." : "Update"}
                </button>
                {editFeedback && <p className="text-sm mt-2">{editFeedback}</p>}
            </form>

            <button
                onClick={() => {
                setShowEditModal(false);
                setEditFeedback("");
                }}
                className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-xl"
            >
                ✖
            </button>
            </div>
        </div>
    )}

    {showPrintOrdersModal && (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-3xl relative">
        <h2 className="text-xl font-semibold mb-4">🧾 Current Print Orders</h2>

        {printOrders.length === 0 ? (
            <p>No unpaid print orders found.</p>
        ) : (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            {printOrders.map((order) => (
                <div key={order.Print_Job_ID} className="border p-4 rounded-md shadow-sm">
                <p><strong>Roll No:</strong> {order.Roll_No}</p>
                <p><strong>Doc Info:</strong> <a className="text-blue-600 underline" href={order.Doc_Info} target="_blank" rel="noopener noreferrer">{order.Doc_Info}</a></p>
                <p><strong>Pages:</strong> {order.No_Pages}</p>
                <p><strong>Type:</strong> {order.Type_Name}</p>
                <p><strong>Amount:</strong> Rs. {order.Total_Amount.toFixed(2)}</p>
                <p><strong>Status:</strong> {order.Status}</p>
                <button
                onClick={() => handleMarkCompleted(order.Print_Job_ID)}
                className="mt-3 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                ✅ Mark Completed
                </button>

                </div>
            ))}
            </div>
        )}

        <button
            onClick={() => setShowPrintOrdersModal(false)}
            className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-xl"
        >
            ✖
        </button>
        </div>
    </div>
    )}

{showOldPrintOrdersModal && (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-3xl relative">
        <h2 className="text-xl font-semibold mb-4">🧾 Old Print Orders</h2>

        {oldprintOrders.length === 0 ? (
            <p>No paid print orders found.</p>
        ) : (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            {oldprintOrders.map((order) => (
                <div key={order.Print_Job_ID} className="border p-4 rounded-md shadow-sm">
                <p><strong>Roll No:</strong> {order.Roll_No}</p>
                <p><strong>Doc Info:</strong> <a className="text-blue-600 underline" href={order.Doc_Info} target="_blank" rel="noopener noreferrer">{order.Doc_Info}</a></p>
                <p><strong>Pages:</strong> {order.No_Pages}</p>
                <p><strong>Type:</strong> {order.Type_Name}</p>
                <p><strong>Amount:</strong> Rs. {order.Total_Amount.toFixed(2)}</p>
                <p><strong>Status:</strong> {order.Status}</p>
                </div>
            ))}
            </div>
        )}

        <button
            onClick={() => setShowOldPrintOrdersModal(false)}
            className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-xl"
        >
            ✖
        </button>
        </div>
    </div>
    )}


    </div>
  );
};

export default MgrPrintCafe;
