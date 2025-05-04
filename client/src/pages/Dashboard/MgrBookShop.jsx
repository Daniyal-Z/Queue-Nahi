import { useState, useEffect } from "react";

const MgrBookShop = () => {
  const [showAddBook, setShowAddBook] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [showOldOrders, setShowOldOrders] = useState(false);
  const [showCatalogue, setShowCatalogue] = useState(false);
  const [catalogue, setCatalogue] = useState([]);
  const [showUpdateBook, setShowUpdateBook] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [orders, setOrders] = useState([]);
  const [oldOrders, setOldOrders] = useState([]);

  // Form state
  const [bookName, setBookName] = useState("");
  const [bookAmount, setBookAmount] = useState("");
  const [stock, setStock] = useState("");

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
    if (showCatalogue) {
      authorizedFetch("http://localhost:3001/books/catalogue")
        .then((res) => res.json())
        .then((data) => setCatalogue(data))
        .catch((err) => {
          console.error("Error loading catalogue:", err);
          alert("Failed to load catalogue.");
        });
    }
  }, [showCatalogue]);

  const handleOpenOrdersModal = async () => {
    try {
      const res = await authorizedFetch("http://localhost:3001/books/orders");
      const data = await res.json();
      const currentOrders = data.filter((order) => order.Payment_Status !== "Paid");
      setOrders(currentOrders);
      setShowOrders(true);
    } catch (err) {
      console.error("Error loading current orders:", err);
      alert("Failed to load current orders.");
    }
  };
  
  const handleOpenOldOrdersModal = async () => {
    try {
      const res = await authorizedFetch("http://localhost:3001/books/orders");
      const data = await res.json();
      const completedOrders = data.filter((order) => order.Payment_Status === "Paid");
      setOldOrders(completedOrders);
      setShowOldOrders(true);
    } catch (err) {
      console.error("Error loading completed orders:", err);
      alert("Failed to load completed orders.");
    }
  };  
  
  const markOrderAsCompleted = async (orderId) => {
    try {
      const res = await authorizedFetch(`http://localhost:3001/books/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({  Payment_Status: 'Paid' }),
      });
  
      if (res.ok) {
        alert("Order marked as completed.");
        // Refresh current orders list
        const updated = await authorizedFetch("http://localhost:3001/books/orders");
        const data = await updated.json();
        const currentOrders = data.filter((order) => order.Payment_Status !== "Paid");
        setOrders(currentOrders);
      } else {
        alert("Failed to update order status.");
      }
    } catch (error) {
      console.error("Error updating order:", error);
      alert("An error occurred while updating the order.");
    }
  };
  

  const handleAddBook = async (e) => {
    e.preventDefault();

    if (!bookName || !bookAmount || !stock) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const res = await authorizedFetch("http://localhost:3001/books/catalogue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Book_Name: bookName,
          Book_Amount: parseFloat(bookAmount),
          Stock: parseFloat(stock),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Book added successfully!");
        setBookName("");
        setBookAmount("");
        setStock("");
        setShowAddBook(false);
      } else {
        alert(data.message || "Failed to add book.");
      }
    } catch (error) {
      console.error("Error adding book:", error);
      alert("An error occurred while adding the book.");
    }
  };

  const openUpdateForm = (book) => {
    setEditingBook(book);
    setBookName(book.Book_Name);
    setBookAmount(book.Book_Amount);
    setStock(book.Stock);
    setShowUpdateBook(true);
  };
  
  const handleUpdateBook = async (e) => {
    e.preventDefault();
  
    if (!bookName || !bookAmount || !stock) {
      alert("Please fill in all fields.");
      return;
    }
  
    try {
      const res = await authorizedFetch(`http://localhost:3001/books/catalogue/${editingBook.Book_ID}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Book_Name: bookName,
          Book_Amount: parseFloat(bookAmount),
          Stock: parseFloat(stock),
        }),
      });
  
      const data = await res.json();
      if (res.ok) {
        alert("Book updated successfully!");
        setShowUpdateBook(false);
        setEditingBook(null);
        setBookName("");
        setBookAmount("");
        setStock("");
        // Refresh catalogue
        authorizedFetch("http://localhost:3001/books/catalogue")
          .then((res) => res.json())
          .then((data) => setCatalogue(data));
      } else {
        alert(data.message || "Failed to update book.");
      }
    } catch (error) {
      console.error("Error updating book:", error);
      alert("An error occurred while updating the book.");
    }
  };
  

  const closeAll = () => {
    setShowAddBook(false);
    setShowOrders(false);
    setShowOldOrders(false);
    setShowCatalogue(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-6 rounded-xl shadow-lg max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">📚 Book Shop Management</h1>

        <div className="space-y-4">
        <button
            onClick={() => setShowCatalogue(true)}
            className="w-full bg-purple-500 text-white px-4 py-3 rounded hover:bg-purple-600"
            >
            📖 View Catalogue
          </button>

          <button
            onClick={() => setShowAddBook(true)}
            className="w-full bg-blue-500 text-white px-4 py-3 rounded hover:bg-blue-600"
          >
            ➕ Add New Book
          </button>

          <button 
            onClick={handleOpenOrdersModal} 
            className="w-full bg-green-500 text-white px-4 py-3 rounded hover:bg-green-600"
          >
            🛒 View Orders
          </button>

          <button 
            onClick={handleOpenOldOrdersModal}
            className="w-full bg-gray-700 text-white px-4 py-3 rounded hover:bg-gray-800"
          >
            📦 View Old Orders
          </button>
        </div>
      </div>

      {/* Add Book Popup */}
      {showAddBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add a New Book</h2>
            <form onSubmit={handleAddBook} className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                value={bookName}
                onChange={(e) => setBookName(e.target.value)}
                className="w-full border p-2 rounded"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Price"
                value={bookAmount}
                onChange={(e) => setBookAmount(e.target.value)}
                className="w-full border p-2 rounded"
              />
              <input
                type="number"
                step="1"
                placeholder="Stock Quantity"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full border p-2 rounded"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={closeAll}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Orders Popup */}
      {showOrders && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-semibold mb-4">Current Book Orders</h2>
            {orders.length === 0 ? (
            <p>No pending orders found.</p>
            ) : (
            <table className="w-full border text-sm">
                <thead>
                <tr className="bg-gray-100">
                    <th className="p-2 border">Order ID</th>
                    <th className="p-2 border">Student</th>
                    <th className="p-2 border">Books</th>
                    <th className="p-2 border">Total</th>
                    <th className="p-2 border">Actions</th>
                </tr>
                </thead>
                <tbody>
                {orders.map((order) => (
                    <tr key={order.BOrder_ID}>
                    <td className="p-2 border">{order.BOrder_ID}</td>
                    <td className="p-2 border">{order.Student_Name || order.Roll_No}</td>
                    <td className="p-2 border">
                        <ul className="list-disc ml-4">
                        {order.Items.map((item) => (
                            <li key={item.Book_ID}>
                            {item.Book_Name} × {item.Quantity}
                            </li>
                        ))}
                        </ul>
                    </td>
                    <td className="p-2 border">Rs {order.Amount_Total}</td>
                    <td className="p-2 border">
                        <button
                        onClick={() => markOrderAsCompleted(order.BOrder_ID)}
                        className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                        >
                        ✅ Mark Completed
                        </button>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            )}

            <div className="text-right mt-4">
              <button
                onClick={closeAll}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Old Orders Popup */}
      {showOldOrders && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-semibold mb-4">Completed Book Orders</h2>
            {oldOrders.length === 0 ? (
            <p>No completed orders yet.</p>
            ) : (
            <table className="w-full border text-sm">
                <thead>
                <tr className="bg-gray-100">
                    <th className="p-2 border">Order ID</th>
                    <th className="p-2 border">Student</th>
                    <th className="p-2 border">Books</th>
                    <th className="p-2 border">Total</th>
                </tr>
                </thead>
                <tbody>
                {oldOrders.map((order) => (
                    <tr key={order.BOrder_ID}>
                    <td className="p-2 border">{order.BOrder_ID}</td>
                    <td className="p-2 border">{order.Student_Name || order.Roll_No}</td>
                    <td className="p-2 border">
                        <ul className="list-disc ml-4">
                        {order.Items.map((item) => (
                            <li key={item.Book_ID}>
                            {item.Book_Name} × {item.Quantity}
                            </li>
                        ))}
                        </ul>
                    </td>
                    <td className="p-2 border">Rs {order.Amount_Total}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            )}

            <div className="text-right mt-4">
              <button
                onClick={closeAll}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

        {showCatalogue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-semibold mb-4">📚 Book Catalogue</h2>

            {catalogue.length === 0 ? (
                <p>No books found.</p>
            ) : (
                <table className="w-full border text-left text-sm">
                <thead>
                    <tr className="bg-gray-100">
                    <th className="p-2 border">ID</th>
                    <th className="p-2 border">Title</th>
                    <th className="p-2 border">Price</th>
                    <th className="p-2 border">Stock</th>
                    <th className="p-2 border">Actions</th>
                    </tr>
                </thead>
                <tbody>
                {catalogue.map((book) => (
                    <tr key={book.Book_ID}>
                    <td className="p-2 border">{book.Book_ID}</td>
                    <td className="p-2 border">{book.Book_Name}</td>
                    <td className="p-2 border">Rs {book.Book_Amount}</td>
                    <td className="p-2 border">{book.Stock}</td>
                    <td className="p-2 border">
                        <button
                        onClick={() => openUpdateForm(book)}
                        className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                        >
                        ✏️ Update
                        </button>
                    </td>
                    </tr>
                ))}
                </tbody>

                </table>
            )}

            <div className="text-right mt-4">
                <button
                onClick={closeAll}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                Close
                </button>
            </div>
            </div>
        </div>
        )}
    
    {showUpdateBook && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Update Book</h2>
        <form onSubmit={handleUpdateBook} className="space-y-4">
            <input
            type="text"
            placeholder="Title"
            value={bookName}
            onChange={(e) => setBookName(e.target.value)}
            className="w-full border p-2 rounded"
            />
            <input
            type="number"
            step="0.01"
            placeholder="Price"
            value={bookAmount}
            onChange={(e) => setBookAmount(e.target.value)}
            className="w-full border p-2 rounded"
            />
            <input
            type="number"
            step="1"
            placeholder="Stock Quantity"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="w-full border p-2 rounded"
            />
            <div className="flex justify-end space-x-2">
            <button
                type="button"
                onClick={() => setShowUpdateBook(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
                Cancel
            </button>
            <button
                type="submit"
                className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
                Update Book
            </button>
            </div>
        </form>
        </div>
    </div>
    )}


    </div>
  );
};

export default MgrBookShop;
