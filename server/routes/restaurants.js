const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../dbConn');

// routes/restaurant.js
router.get('/by-manager/:mgrId', async (req, res) => {
    const { mgrId } = req.params;
  
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input('Mgr_ID', sql.Int, mgrId)
        .query(`SELECT * FROM Restaurants WHERE Mgr_ID = @Mgr_ID`);
  
      res.json(result.recordset);
    } catch (err) {
      console.error("Failed to fetch restaurants:", err);
      res.status(500).json({ message: "Server error" });
    }
  });

// Function to place the order
// routes/food-orders.js
router.post('/food-orders', async (req, res) => {
    const { roll_no, restaurant_id, order_time, total_amount, items } = req.body;

    // Prepare items for table-valued parameter
    const tvpItems = new sql.Table();
    tvpItems.columns.add('Item_ID', sql.Int);
    tvpItems.columns.add('Quantity', sql.Int);

    // Add items to the table-valued parameter
    items.forEach(item => {
      tvpItems.rows.add(item.item_id, item.quantity);
    });

    try {
      const pool = await poolPromise;  // Use poolPromise as in other routes

      // Call the stored procedure
      await pool.request()
        .input('Roll_No', sql.Int, roll_no)
        .input('Restaurant_ID', sql.Int, restaurant_id)
        .input('Order_Time', sql.DateTime, order_time)
        .input('Total_Amount', sql.Decimal(10, 2), total_amount)
        .input('Items', tvpItems)  // Pass TVP as input
        .execute('PlaceFoodOrder');  // Call the stored procedure

      res.status(200).json({ message: 'Order placed successfully!' });
    } catch (error) {
      console.error('Error placing order:', error);
      res.status(500).json({ message: 'Failed to place order.' });
    }
});


// Get all restaurants
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Restaurants');
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/restaurants/status", async (req, res) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query("SELECT * FROM Restaurant_Status");
      res.status(200).json(result.recordset);
    } catch (error) {
      console.error("Error fetching restaurant status:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

// Get a specific restaurant by ID
router.get('/:id', async (req, res) => {
    //console.log('Received request for restaurant with ID:', req.params.id); // Add this log
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM Restaurants WHERE Restaurant_ID = @id');
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }
        res.json(result.recordset[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add a new menu item (product)
router.post('/:id/menu', async (req, res) => {
    const { id } = req.params; // The restaurant ID
    const { name, amount, description, stock } = req.body; // Get product data from the request body

    try {
        const pool = await poolPromise;
        await pool.request()
            .input('Name', sql.VarChar, name)
            .input('Amount', sql.Decimal, amount)
            .input('Description', sql.NVarChar, description)
            .input('Stock', sql.Int, stock)
            .input('Restaurant_ID', sql.Int, id) // The restaurant ID from the URL
            .query(`
                INSERT INTO Menu (Item_Name, Item_Amount, Description, Stock, Restaurant_ID)
                VALUES (@Name, @Amount, @Description, @Stock, @Restaurant_ID)
            `);

        res.status(201).json({ message: 'Menu item added successfully' });
    } catch (error) {
        console.error('Error adding menu item:', error);
        res.status(500).json({ message: 'Failed to add menu item' });
    }
});

// Get menu items for a specific restaurant
router.get('/:id/menu', async (req, res) => {
    const { id } = req.params;

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Restaurant_ID', sql.Int, id)
            .query('SELECT * FROM Menu WHERE Restaurant_ID = @Restaurant_ID');

        res.status(200).json(result.recordset);
    } catch (error) {
        console.error('Error fetching menu:', error);
        res.status(500).json({ message: 'Failed to fetch menu' });
    }
});



// Add a new restaurant
router.post('/restaurants', async (req, res) => {
    try {
        const { Name, Location, Contact } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('Name', sql.VarChar, Name)
            .input('Location', sql.VarChar, Location)
            .input('Contact', sql.VarChar, Contact)
            .query('INSERT INTO Restaurants (Name, Location, Contact) VALUES (@Name, @Location, @Contact)');
        
        res.status(201).json({ message: 'Restaurant added successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update an existing restaurant
router.put('/restaurants/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { Name, Location, Contact } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .input('Name', sql.VarChar, Name)
            .input('Location', sql.VarChar, Location)
            .input('Contact', sql.VarChar, Contact)
            .query('UPDATE Restaurants SET Name = @Name, Location = @Location, Contact = @Contact WHERE Restaurant_ID = @id');
        
        res.json({ message: 'Restaurant updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update an existing menu item
router.put('/:rid/menu/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { Item_Name, Item_Amount, Description, Stock } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)       // for now writtent to be like but can be updated for a single element asw
            .input('Item_Name', sql.VarChar, Item_Name)
            .input('Item_Amount', sql.Decimal, Item_Amount)
            .input('Description', sql.NVarChar, Description)
            .input('Stock', sql.Int, Stock)
            .query('UPDATE Menu SET Item_Name = @Item_Name, Item_Amount = @Item_Amount, Description = @Description, Stock = @Stock WHERE Item_ID = @id');
        
        res.json({ message: 'Menu item updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//update order status
router.put('/:rid/orders/:id', async (req, res) => {
    const { rid, id } = req.params;
    const { Food_Status, Pickup_Time, Payment_Status } = req.body;

    //console.log(rid);
    //console.log(id);
    try {
        const pool = await poolPromise;
        const request = pool.request();

        //console.log(Pickup_Time);
        // Update Food_Orders
        await request
            .input('id', sql.Int, id)
            .input('Food_Status', sql.VarChar, Food_Status)
            .input('Pickup_Time', sql.DateTime, Pickup_Time)
            .query(`
                UPDATE Food_Orders
                SET Food_Status = @Food_Status, Pickup_Time = @Pickup_Time
                WHERE FOrder_ID = @id;
            `);
        
        //console.log("Hello 1");
        // Update Payments
        const paymentRequest = pool.request(); // create a new request
        await paymentRequest
            .input('id', sql.Int, id)
            .input('rid', sql.Int, rid)
            .input('Payment_Status', sql.VarChar, Payment_Status)
            .query(`
                UPDATE Payments
                SET Status = @Payment_Status
                WHERE Order_ID = @id AND Type_Service_ID = (Select Type_Service_ID from Type_Service ts where ts.Service_PK = @rid AND Type_Service = 'Restaurant');
            `);
            //console.log("Hello 2");
        res.json({ message: 'Order status updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



// Get food orders for a restaurant
router.get('/:rid/orders', async (req, res) => {
    const { rid } = req.params;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('rid', sql.Int, rid)
            .query(`
                SELECT fo.*, foi.Item_ID, m.Item_Name, foi.Quantity, p.Status
                FROM Food_Orders fo
                JOIN Food_Order_Items foi ON fo.FOrder_ID = foi.FOrder_ID
                JOIN Menu m ON foi.Item_ID = m.Item_ID
                JOIN Payments p ON fo.FOrder_ID = p.Order_ID
                WHERE fo.Restaurant_ID = @rid
				GROUP BY  fo.FOrder_ID, fo.Roll_No, fo.Restaurant_ID, fo.Food_Status, fo.Pickup_Time, fo.Order_Time, fo.Amount_Total, foi.Item_ID, m.Item_Name, foi.Quantity, p.Status
                ORDER BY fo.Order_Time DESC;

            `);

        // Group by FOrder_ID
        const groupedOrders = result.recordset.reduce((acc, row) => {
            if (!acc[row.FOrder_ID]) {
                acc[row.FOrder_ID] = {
                    FOrder_ID: row.FOrder_ID,
                    Roll_No: row.Roll_No,
                    Restaurant_ID: row.Restaurant_ID,
                    Food_Status: row.Food_Status,
                    Pickup_Time: row.Pickup_Time,
                    Order_Time: row.Order_Time,
                    Amount_Total: row.Amount_Total,
                    Payment_Status: row.Status,
                    Items: []
                };
            }
            acc[row.FOrder_ID].Items.push({
                Item_ID: row.Item_ID,
                Item_Name: row.Item_Name,
                Quantity: row.Quantity
            });
            return acc;
        }, {});

        res.json(Object.values(groupedOrders));
    } catch (error) {
        console.error("Error fetching food orders:", error);
        res.status(500).json({ error: error.message });
    }
});


// Delete a restaurant
router.delete('/restaurants/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Restaurants WHERE Restaurant_ID = @id');
        
        res.json({ message: 'Restaurant deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/activeFoodOrders", async (req, res) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query("SELECT * FROM Active_Food_Orders");
      res.status(200).json(result.recordset);
    } catch (error) {
      console.error("Error fetching active food orders:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

module.exports = router;
