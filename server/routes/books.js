const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../dbConn');

// Get all books
router.get('/books', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Books');
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a specific book by ID
router.get('/books/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM Books WHERE Book_ID = @id');
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.json(result.recordset[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// // Add a new book
// router.post('/books', async (req, res) => {
//     try {
//         const { Book_Name, Book_Amount, Stock } = req.body;
        
//         const pool = await poolPromise;
//         await pool.request()
//             .input('Book_Name', sql.VarChar, Book_Name)
//             .input('Book_Amount', sql.Decimal, Book_Amount)
//             .query('INSERT INTO Books (Book_Name, Book_Amount) VALUES (@Book_Name, @Book_Amount)');
        
//         res.status(201).json({ message: 'Book added successfully' });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// Add a new book
router.post('/catalogue', async (req, res) => {
    const { Book_Name, Book_Amount, Stock } = req.body; // Get product data from the request body

    try {
        const pool = await poolPromise;
        await pool.request()
            .input('Book_Name', sql.VarChar, Book_Name)
            .input('Book_Amount', sql.Decimal, Book_Amount)
            .input('Stock', sql.Decimal, Stock)
            .query('INSERT INTO Books (Book_Name, Book_Amount, Stock) VALUES (@Book_Name, @Book_Amount, @Stock)');

        res.status(201).json({ message: 'Book added successfully' });
    } catch (error) {
        console.error('Error adding book:', error);
        res.status(500).json({ message: 'Failed to add book' });
    }
});

// new book order
router.post('/catalogue/order', async (req, res) => {
    const { roll_no, order_time, total_amount, books } = req.body;

    // Prepare books for table-valued parameter (TVP)
    const tvpBooks = new sql.Table();
    tvpBooks.columns.add("Book_ID", sql.Int);
    tvpBooks.columns.add("Quantity", sql.Int);

    // Add books to the table-valued parameter
    books.forEach(book => {
        tvpBooks.rows.add(book.Book_ID, book.Quantity);
    });

    try {
      const pool = await poolPromise;  // Use poolPromise as in other routes

       // Call the stored procedure for placing the book order
        await pool.request()
        .input("Roll_No", sql.Int, roll_no)
        .input("Order_Time", sql.DateTime, order_time)
        .input("Total_Amount", sql.Decimal(10, 2), total_amount)
        .input("Books", tvpBooks)  // Pass TVP as input
        .execute("PlaceBookOrder");  // Call the stored procedure

      res.status(200).json({ message: 'Order placed successfully!' });
    } catch (error) {
      console.error('Error placing order:', error);
      res.status(500).json({ message: 'Failed to place order.' });
    }
});

// Get all book orders (with roll number and book details)
router.get('/orders', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query(`
                SELECT 
                    bo.BOrder_ID,
                    bo.Amount_Total,
                    bo.Order_Time,
                    bo.Photocopier_ID,
                    p.Roll_No,
                    boi.Book_ID,
                    b.Book_Name,
                    boi.Quantity,
                    py.Status
                FROM Book_Orders bo
                JOIN Photocopier p ON bo.Photocopier_ID = p.Photocopier_ID
                JOIN Book_Order_Items boi ON bo.BOrder_ID = boi.BOrder_ID
                JOIN Books b ON boi.Book_ID = b.Book_ID
                JOIN Payments py on p.Photocopier_ID = py.Order_ID
                ORDER BY bo.Order_Time DESC
            `);

        // Group by BOrder_ID
        const groupedOrders = result.recordset.reduce((acc, row) => {
            if (!acc[row.BOrder_ID]) {
                acc[row.BOrder_ID] = {
                    BOrder_ID: row.BOrder_ID,
                    Roll_No: row.Roll_No,
                    Photocopier_ID: row.Photocopier_ID,
                    Order_Time: row.Order_Time,
                    Amount_Total: row.Amount_Total,
                    Payment_Status: row.Status,
                    Items: []
                };
            }
            acc[row.BOrder_ID].Items.push({
                Book_ID: row.Book_ID,
                Book_Name: row.Book_Name,
                Quantity: row.Quantity
            });
            return acc;
        }, {});

        res.json(Object.values(groupedOrders));
    } catch (error) {
        console.error("Error fetching book orders:", error);
        res.status(500).json({ error: error.message });
    }
});



// Get books
router.get('/catalogue', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query('SELECT * FROM Books');

        res.status(200).json(result.recordset);
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ message: 'Failed to fetch books' });
    }
});


// Update an existing book
router.put('/catalogue/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { Book_Name, Book_Amount, Stock } = req.body;
        
        //console.log("Hello");
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .input('Book_Name', sql.VarChar, Book_Name)
            .input('Book_Amount', sql.Decimal, Book_Amount)
            .input('Stock', sql.Decimal, Stock)
            .query('UPDATE Books SET Book_Name = @Book_Name, Book_Amount = @Book_Amount, Stock = @Stock WHERE Book_ID = @id');
        
        res.json({ message: 'Book updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//update order status
router.put('/orders/:id', async (req, res) => {
    const { id } = req.params;
    const { Payment_Status } = req.body;

    try {
        const pool = await poolPromise;
        
        // Update Payments
        const paymentRequest = pool.request(); 
        await paymentRequest
            .input('id', sql.Int, id)
            .input('Payment_Status', sql.VarChar, Payment_Status)
            .query(`
                UPDATE Payments
                SET Status = @Payment_Status
                WHERE Order_ID = (Select Photocopier_ID from Book_Orders bo where bo.BOrder_ID = @id) AND Type_Service_ID = (Select Type_Service_ID from Type_Service ts where Type_Service = 'Photocopier');
            `);
            //console.log("Hello 2");
        res.json({ message: 'Order status updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a book
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Books WHERE Book_ID = @id');
        
        res.json({ message: 'Book deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/bookOrderStatus", async (req, res) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query("SELECT * FROM Book_Order_Status");
      res.status(200).json(result.recordset);
    } catch (error) {
      console.error("Error fetching book order status:", error);
      res.status(500).json({ message: "Server error" });
    }
  });



module.exports = router;