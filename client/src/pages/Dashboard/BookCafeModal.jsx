import React, { useState, useEffect } from "react";

const BookCafeModal = ({ onClose }) => {
  const [view, setView] = useState(""); // '', 'catalogue', 'orders', 'oldOrders'
  const [books, setBooks] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [student, setStudent] = useState();
  const [activeOrders, setActiveOrders] = useState([]); 
  const [oldOrders, setOldOrders] = useState([]); 

  useEffect(() => {
    const stored = localStorage.getItem("student");
    setStudent(JSON.parse(stored));
  }, []);

  const handleViewCatalogue = async () => {
    try {
      const res = await fetch("http://localhost:3001/books/catalogue");
      const data = await res.json();
      setBooks(data);
      setView("catalogue");
    } catch (err) {
      console.error("Failed to load books:", err);
    }
  };

  const handleViewActiveOrders = async () => {
    try {
      const res = await fetch(`http://localhost:3001/students/${student.id}/active-b_orders`);
      if (res.ok) {
        const data = await res.json();
        setActiveOrders(data);
      } else {
        setActiveOrders([]);
      }
      setView("orders");
    } catch (err) {
      console.error("Failed to load active book orders:", err);
      setActiveOrders([]);
      setView("orders");
    }
  };

  //Fetch Old Orders
  const handleViewOldOrders = async () => {
    try {
      const res = await fetch(`http://localhost:3001/students/${student.id}/old-b_orders`);
      if (res.ok) {
        const data = await res.json();
        setOldOrders(data);
      } else {
        setOldOrders([]);
      }
      setView("oldOrders");
    } catch (err) {
      console.error("Failed to load old book orders:", err);
      setOldOrders([]);
      setView("oldOrders");
    }
  };

  const handleQuantityChange = (bookId, value) => {
    setQuantities({ ...quantities, [bookId]: parseInt(value) || 0 });
  };

  const handlePlaceOrder = async () => {
    const selectedBooks = books
      .filter(book => quantities[book.Book_ID] > 0)
      .map(book => ({
        Book_ID: book.Book_ID,
        Quantity: quantities[book.Book_ID],
      }));

    if (selectedBooks.length === 0) {
      alert("Please select at least one book to order.");
      return;
    }

    const totalAmount = selectedBooks.reduce((sum, book) => {
      const bookDetails = books.find(b => b.Book_ID === book.Book_ID);
      return sum + bookDetails.Book_Amount * book.Quantity;
    }, 0);

    const orderData = {
      roll_no: student.id,
      order_time: new Date(),
      total_amount: totalAmount,
      books: selectedBooks,
    };

    try {
      const res = await fetch("http://localhost:3001/books/catalogue/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        alert("Order placed successfully!");
        setView("");
      } else {
        alert("Failed to place order.");
      }
    } catch (err) {
      console.error("Failed to place order:", err);
      alert("An error occurred while placing the order.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-[90%] max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-6 text-center">Book Café</h2>

        {view === "" && (
          <div className="space-y-4">
            <button onClick={handleViewCatalogue} className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              View Catalogue
            </button>

            <button onClick={handleViewActiveOrders} className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              View Orders
            </button>

            <button onClick={handleViewOldOrders} className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
              View Old Orders
            </button>
          </div>
        )}

        {view === "catalogue" && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-center">Book Catalogue</h3>
            {books.length === 0 ? (
              <p>No books found.</p>
            ) : (
              <div className="space-y-4">
                {books.map((book) => (
                  <div
                    key={book.Book_ID}
                    className="border p-3 rounded flex justify-between items-center"
                  >
                    <div>
                      <p className="font-bold">{book.Book_Name}</p>
                      <p className="text-sm text-gray-600">Rs. {book.Book_Amount}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        value={quantities[book.Book_ID] || ""}
                        onChange={(e) =>
                          handleQuantityChange(book.Book_ID, e.target.value)
                        }
                        className="w-16 border rounded px-2 py-1"
                        placeholder="Qty"
                      />
                    </div>
                  </div>
                ))}

                <button
                  className="mt-4 w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  onClick={handlePlaceOrder}  // Trigger the place order logic
                >
                  Place Order
                </button>
              </div>
            )}

            <button
              onClick={() => setView("")}
              className="mt-4 w-full px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Back
            </button>
          </div>
        )}



        {view === "orders" && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-center">Active Book Orders</h3>
            {activeOrders.length === 0 ? (
              <p className="text-center text-gray-600">No active unpaid orders found.</p>
            ) : (
              <div className="space-y-4">
                {activeOrders.map((order) => (
                  <div key={order.Book_Order_ID} className="border p-3 rounded bg-gray-50">
                    <p><strong>Order ID:</strong> {order.Book_Order_ID}</p>
                    <p><strong>Books:</strong> {order.Book_Details}</p>
                    <p><strong>Total:</strong> Rs. {order.Total_Amount.toFixed(2)}</p>
                    <p><strong>Order Time:</strong> {new Date(order.Order_Time).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}

            <button onClick={() => setView("")} className="mt-4 w-full px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">
              Back
            </button>
          </div>
        )}

        {/* OLD ORDERS DISPLAY */}
        {view === "oldOrders" && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-center">Old Book Orders</h3>
            {oldOrders.length === 0 ? (
              <p className="text-center text-gray-600">No paid orders found.</p>
            ) : (
              <div className="space-y-4">
                {oldOrders.map((order) => (
                  <div key={order.Book_Order_ID} className="border p-3 rounded bg-gray-100">
                    <p><strong>Order ID:</strong> {order.Book_Order_ID}</p>
                    <p><strong>Books:</strong> {order.Book_Details}</p>
                    <p><strong>Total:</strong> Rs. {order.Total_Amount.toFixed(2)}</p>
                    <p><strong>Order Time:</strong> {new Date(order.Order_Time).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setView("")} className="mt-4 w-full px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">
              Back
            </button>
          </div>
        )}

        <button onClick={onClose} className="mt-6 w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
          Close
        </button>
      </div>
    </div>
  );
};

export default BookCafeModal;
