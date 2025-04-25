
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const MgrRestView = () => {
  const { id } = useParams();

  const [restaurant, setRestaurant] = useState(null);
  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [addProductModalOpen, setAddProductModalOpen] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [editProductModalOpen, setEditProductModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersModalOpen, setOrdersModalOpen] = useState(false);
  const [oldOrdersModalOpen, setOldOrdersModalOpen] = useState(false);
  const [oldOrders, setOldOrders] = useState([]);


  const [newProduct, setNewProduct] = useState({
    name: "",
    amount: "",
    description: "",
    stock: 0,
  });

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const res = await fetch(`http://localhost:3001/restaurants/${id}`);
        const data = await res.json();
        setRestaurant(data);
      } catch (err) {
        console.error("Failed to load restaurant:", err);
      }
    };

    const fetchMenu = async () => {
      try {
        const res = await fetch(`http://localhost:3001/restaurants/${id}/menu`);
        const data = await res.json();
        setMenuItems(data);
      } catch (err) {
        console.error("Failed to load menu items:", err);
      }
    };

    fetchRestaurant();
    fetchMenu();
  }, [id]);

  const handleOpenMenuModal = () => {
    setMenuModalOpen(true);
  };

  const handleCloseMenuModal = () => {
    setMenuModalOpen(false);
  };

  const handleOpenAddProductModal = () => {
    setAddProductModalOpen(true);
  };

  const handleCloseAddProductModal = () => {
    setAddProductModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:3001/restaurants/${id}/menu`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProduct),
      });
      const data = await res.json();
      if (res.ok) {
        setMenuItems((prev) => [...prev, data]);
        setNewProduct({ name: "", amount: "", description: "", stock: 0 });
        setAddProductModalOpen(false);
      } else {
        console.error("Error adding product:", data.message);
      }
    } catch (err) {
      console.error("Failed to add product:", err);
    }
  };

  const handleOpenEditProductModal = (item) => {
    setCurrentProduct(item);
    setEditProductModalOpen(true);
  };

  const handleCloseEditProductModal = () => {
    setEditProductModalOpen(false);
    setCurrentProduct(null);
  };

  const handleOpenOrdersModal = async () => {
    try {
      const res = await fetch(`http://localhost:3001/restaurants/${id}/orders`);
      const data = await res.json();
      const unpaidOrders = data.filter(order => order.Payment_Status !== "Paid");
      setOrders(unpaidOrders);
      setOrdersModalOpen(true);
    } catch (err) {
      console.error("Failed to load orders:", err);
    }
  };
  
  const handleCloseOrdersModal = () => {
    setOrdersModalOpen(false);
  };

  const handleOpenOldOrdersModal = async () => {
    try {
      const res = await fetch(`http://localhost:3001/restaurants/${id}/orders`);
      const data = await res.json();
      const paidOrders = data.filter(order => order.Payment_Status !== "Unpaid");
      setOldOrders(paidOrders);
      setOldOrdersModalOpen(true);
    } catch (err) {
      console.error("Failed to load old orders:", err);
    }
  };
  
  const handleCloseOldOrdersModal = () => {
    setOldOrdersModalOpen(false);
  };

  if (!restaurant) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-2">{restaurant.Restaurant_Name}</h1>
        <p className="mb-2">📍 Location: {restaurant.Location}</p>
        <p className="mb-2">📞 Phone: {restaurant.Phone}</p>
        <p className="mb-4">📧 Email: {restaurant.Email}</p>

        <div className="space-x-4">
          <button onClick={handleOpenMenuModal} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            View Menu
          </button>
          <button onClick={handleOpenAddProductModal} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Add New Product
          </button>
          <button onClick={handleOpenOrdersModal} className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
            View Orders
          </button>
          <button onClick={handleOpenOldOrdersModal} className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800">
            View Old Orders
          </button>
        </div>
      </div>

      {/* Menu Modal */}
      {menuModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-[90%] max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">📋 Restaurant Menu</h2>
            <div className="overflow-y-auto max-h-[60vh]">
              {menuItems.length === 0 ? (
                <p className="text-gray-600">No items found in the menu.</p>
              ) : (
                menuItems.map((item) => (
                  <div key={item.Item_ID} className="border-b py-3">
                    <h3 className="text-lg font-semibold">{item.Item_Name}</h3>
                    <p>💵 Rs. {item.Item_Amount} | Stock: {item.Stock}</p>
                    <button
                      onClick={() => handleOpenEditProductModal(item)}
                      className="mt-2 bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                    >
                      Update
                    </button>
                  </div>
                ))
              )}
            </div>
            <button onClick={handleCloseMenuModal} className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {addProductModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-1/3">
            <h2 className="text-xl font-bold mb-4">Add New Product</h2>
            <form onSubmit={handleAddProduct}>
              <div className="mb-4">
                <label className="block text-sm font-semibold">Product Name</label>
                <input type="text" name="name" value={newProduct.name} onChange={handleInputChange} className="w-full p-2 border rounded" required />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold">Price</label>
                <input type="number" name="amount" value={newProduct.amount} onChange={handleInputChange} className="w-full p-2 border rounded" required />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold">Description</label>
                <textarea name="description" value={newProduct.description} onChange={handleInputChange} className="w-full p-2 border rounded" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold">Stock</label>
                <input type="number" name="stock" value={newProduct.stock} onChange={handleInputChange} className="w-full p-2 border rounded" required />
              </div>
              <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                Add Product
              </button>
            </form>
            <button onClick={handleCloseAddProductModal} className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editProductModalOpen && currentProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-1/3">
            <h2 className="text-xl font-bold mb-4">Edit Product</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const res = await fetch(`http://localhost:3001/restaurants/${id}/menu/${currentProduct.Item_ID}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(currentProduct),
                  });
                  const data = await res.json();
                  if (res.ok) {
                    setMenuItems((prev) =>
                      prev.map((item) => (item.Item_ID === currentProduct.Item_ID ? currentProduct : item))
                    );
                    handleCloseEditProductModal();
                  } else {
                    console.error("Error updating product:", data.message);
                  }
                } catch (err) {
                  console.error("Failed to update product:", err);
                }
              }}
            >
              <div className="mb-4">
                <label className="block text-sm font-semibold">Product Name</label>
                <input
                  type="text"
                  value={currentProduct.Item_Name}
                  onChange={(e) => setCurrentProduct((prev) => ({ ...prev, Item_Name: e.target.value }))}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold">Price</label>
                <input
                  type="number"
                  value={currentProduct.Item_Amount}
                  onChange={(e) => setCurrentProduct((prev) => ({ ...prev, Item_Amount: e.target.value }))}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold">Description</label>
                <textarea
                  value={currentProduct.Description}
                  onChange={(e) => setCurrentProduct((prev) => ({ ...prev, Description: e.target.value }))}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold">Stock</label>
                <input
                  type="number"
                  value={currentProduct.Stock}
                  onChange={(e) => setCurrentProduct((prev) => ({ ...prev, Stock: e.target.value }))}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <button type="submit" className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
                Update Product
              </button>
            </form>
            <button onClick={handleCloseEditProductModal} className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Orders Modal */}
      {ordersModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-[90%] max-w-3xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">📦 Restaurant Orders</h2>
            {orders.length === 0 ? (
              <p>No orders yet.</p>
            ) : (
              orders.map(order => (
                <div key={order.FOrder_ID} className="border-b border-gray-300 mb-4 pb-4">
                  <p><strong>Roll No:</strong> {order.Roll_No}</p>
                  <p><strong>Order Time:</strong> {new Date(order.Order_Time).toLocaleString()}</p>
                  <p><strong>Pickup Time:</strong> {order.Pickup_Time ? new Date(order.Pickup_Time).toLocaleString() : "Not set"}</p>
                  <p><strong>Status:</strong> {order.Food_Status}</p>
                  <p><strong>Total:</strong> Rs. {order.Amount_Total}</p>
                  <p><strong>Payment Status:</strong> {order.Payment_Status}</p>
                  <p><strong>Items:</strong></p>
                  <ul className="list-disc list-inside ml-4">
                    {order.Items.map(item => (
                      <li key={item.Item_ID}>{item.Item_Name} x {item.Quantity}</li>
                    ))}
                  </ul>
                  <div className="mt-3 space-x-2">
                    <button
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                      onClick={async () => {
                        const newStatus = prompt("Enter new status (Pending, Preparing, Ready, Completed):", order.Food_Status);
                        const newPickup = prompt("Enter new pickup time (yyyy-mm-dd hh:mm):", order.Pickup_Time || '');
                        const newP_Status = prompt("Enter new Status (Paid/Unpaid): ", order.Payment_Status);
                        if (newStatus) {
                          try {
                            const res = await fetch(`http://localhost:3001/restaurants/${id}/orders/${order.FOrder_ID}`, {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ Food_Status: newStatus, Pickup_Time: newPickup, Payment_Status: newP_Status}),
                            });
                            const data = await res.json();
                            if (res.ok) {
                              setOrders((prev) =>
                                prev.map(o => o.FOrder_ID === order.FOrder_ID ? { ...o, Food_Status: newStatus, Pickup_Time: newPickup, Payment_Status: newP_Status} : o)
                              );
                            } else {
                              alert("Failed to update order");
                            }
                          } catch (err) {
                            console.error(err);
                          }
                        }
                      }}
                    >
                      Update Status
                    </button>
                  </div>
                </div>
              ))
            )}
            <button onClick={handleCloseOrdersModal} className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
              Close
            </button>
          </div>
        </div>
      )}

      {oldOrdersModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-[90%] max-w-3xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4"> Old Orders</h2>
            {oldOrders.length === 0 ? (
              <p>No orders yet.</p>
            ) : (
              oldOrders.map(order => (
                <div key={order.FOrder_ID} className="border-b border-gray-300 mb-4 pb-4">
                  <p><strong>Roll No:</strong> {order.Roll_No}</p>
                  <p><strong>Order Time:</strong> {new Date(order.Order_Time).toLocaleString()}</p>
                  <p><strong>Pickup Time:</strong> {order.Pickup_Time ? new Date(order.Pickup_Time).toLocaleString() : "Not set"}</p>
                  <p><strong>Status:</strong> {order.Food_Status}</p>
                  <p><strong>Total:</strong> Rs. {order.Amount_Total}</p>
                  <p><strong>Payment Status:</strong> {order.Payment_Status}</p>
                  <p><strong>Items:</strong></p>
                  <ul className="list-disc list-inside ml-4">
                    {order.Items.map(item => (
                      <li key={item.Item_ID}>{item.Item_Name} x {item.Quantity}</li>
                    ))}
                  </ul>
                </div>
              ))
            )}
            <button onClick={handleCloseOldOrdersModal} className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default MgrRestView;
