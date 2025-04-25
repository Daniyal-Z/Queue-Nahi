import React, { useState, useEffect } from "react";

const PrintCafeModal = ({ onClose }) => {
  const [showAddDocument, setShowAddDocument] = useState(false);
  const [pricingData, setPricingData] = useState([]);
  const [student, setStudent] = useState();
  const [showCurrentOrders, setShowCurrentOrders] = useState(false);
  const [showOldOrders, setShowOldOrders] = useState(false);
  const [currentOrders, setCurrentOrders] = useState([]);
  const [oldOrders, setOldOrders] = useState([]);


  const [selectedType, setSelectedType] = useState("");
  const [pricePerPage, setPricePerPage] = useState(0);
  const [docInfo, setDocInfo] = useState("");
  const [noPages, setNoPages] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
      const stored = localStorage.getItem("student");
      setStudent(JSON.parse(stored));
    }, []);

  useEffect(() => {
    // Fetch print pricing view
    fetch("http://localhost:3001/print/printPricing")
      .then((res) => res.json())
      .then((data) => setPricingData(data))
      .catch((err) => console.error("Error fetching pricing:", err));
  }, []);

  // Update total whenever type or pages changes
  useEffect(() => {
    if (selectedType && noPages) {
      const typeObj = pricingData.find((item) => item.Type_ID === parseInt(selectedType));
      if (typeObj) {
        setPricePerPage(typeObj.Price_Per_Page);
        setTotalAmount(typeObj.Price_Per_Page * parseInt(noPages));
      }
    }
  }, [selectedType, noPages, pricingData]);

  const fetchCurrentOrders = async () => {
    try {
      const res = await fetch(`http://localhost:3001/students/${student.id}/active-p_orders`);
      const data = await res.json();
      setCurrentOrders(data);
      setShowCurrentOrders(true);
    } catch (error) {
      console.error("Error fetching current orders:", error);
    }
  };
  
  const fetchOldOrders = async () => {
    try {
      const res = await fetch(`http://localhost:3001/students/${student.id}/old-p_orders`);
      const data = await res.json();
      setOldOrders(data);
      setShowOldOrders(true);
    } catch (error) {
      console.error("Error fetching old orders:", error);
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback("");
  
    try {
      const roll_no = localStorage.getItem("roll_no"); // assuming roll_no is stored after login
  
      const response = await fetch("http://localhost:3001/print/print-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roll_no: student.id,
          type_id: parseInt(selectedType),
          doc_info: docInfo,
          total_amount: parseFloat(totalAmount.toFixed(2)),
          no_pages: parseInt(noPages),
        }),
      });
  
      if (response.ok) {
        setFeedback("✅ Document sent for printing successfully!");
        setDocInfo("");
        setNoPages("");
        setSelectedType("");
        setTotalAmount(0);
      } else {
        const err = await response.json();
        setFeedback("❌ Failed: " + err.message);
      }
    } catch (error) {
      console.error("Error submitting job:", error);
      setFeedback("❌ Error sending print job.");
    }
  };
  

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg relative">
        <h2 className="text-xl font-semibold mb-4">🖨️ Print Café</h2>

        <div className="space-y-3">
        <button
            onClick={() => setShowAddDocument(true)}
            className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
            ➕ Add Document for Printing
        </button>

        <button
            onClick={fetchCurrentOrders}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
            📄 View Current Orders
        </button>

        <button
            onClick={fetchOldOrders}
            className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
            📁 View Old Orders
        </button>
        </div>


        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-xl"
        >
          ✖
        </button>

        {/* Add Document Modal */}
        {showAddDocument && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md relative">
              <h3 className="text-lg font-semibold mb-4">📝 Upload Document</h3>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <input
                  type="text"
                  placeholder="Document Link"
                  className="w-full border border-gray-300 px-4 py-2 rounded"
                  value={docInfo}
                  onChange={(e) => setDocInfo(e.target.value)}
                  required
                />
                <input
                  type="number"
                  placeholder="Number of Pages"
                  className="w-full border border-gray-300 px-4 py-2 rounded"
                  value={noPages}
                  onChange={(e) => setNoPages(e.target.value)}
                  required
                />

                <select
                  className="w-full border border-gray-300 px-4 py-2 rounded"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  required
                >
                  <option value="">Select Type</option>
                  {pricingData.map((type) => (
                    <option key={type.Type_ID} value={type.Type_ID}>
                      {type.Type_Name} - Rs. {type.Price_Per_Page.toFixed(2)} / page
                    </option>
                  ))}
                </select>

                <div className="text-right font-medium text-gray-700">
                  Total Amount: Rs. {totalAmount.toFixed(2)}
                </div>

                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Send Print Job
                </button>
              </form>

              {feedback && <p className="text-sm mt-2">{feedback}</p>}

              <button
                onClick={() => setShowAddDocument(false)}
                className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-xl"
              >
                ✖
              </button>
            </div>
          </div>
        )}

        {/* Current Orders Modal */}
        {showCurrentOrders && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg relative">
            <h3 className="text-lg font-semibold mb-4">📄 Current Print Orders</h3>
            {currentOrders.length > 0 ? (
                <ul className="space-y-2 max-h-64 overflow-y-auto">
                {currentOrders.map((order, index) => (
                    <li key={index} className="border p-2 rounded">
                    {/* <p><strong>Doc:</strong> {order.Doc_Info}</p> */}
                    <p><strong>Print Job ID:</strong> {order.Print_Job_ID}</p>
                    <p><strong>Details:</strong> {order.Job_Details}</p>
                    <p><strong>Total:</strong> Rs. {order.Total_Amount}</p>
                    {/* <p><strong>Status:</strong> {order.Status}</p> */}
                    </li>
                ))}
                </ul>
            ) : (
                <p>No current orders found.</p>
            )}

            <button
                onClick={() => setShowCurrentOrders(false)}
                className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-xl"
            >
                ✖
            </button>
            </div>
        </div>
        )}

        {/* Old Orders Modal */}
        {showOldOrders && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg relative">
            <h3 className="text-lg font-semibold mb-4">📁 Old Print Orders</h3>
            {oldOrders.length > 0 ? (
                <ul className="space-y-2 max-h-64 overflow-y-auto">
                {oldOrders.map((order, index) => (
                    <li key={index} className="border p-2 rounded">
                    <p><strong>Print Job ID:</strong> {order.Print_Job_ID}</p>
                    <p><strong>Details:</strong> {order.Job_Details}</p>
                    <p><strong>Total:</strong> Rs. {order.Total_Amount}</p>
                    </li>
                ))}
                </ul>
            ) : (
                <p>No old orders found.</p>
            )}

            <button
                onClick={() => setShowOldOrders(false)}
                className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-xl"
            >
                ✖
            </button>
            </div>
        </div>
        )}

      </div>
    </div>
  );
};

export default PrintCafeModal;
