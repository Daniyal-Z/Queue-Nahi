const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../dbConn');
const { authenticate, authenticateManager  } = require('../middleware/authnMiddleware'); 
const { authorize } = require('../middleware/authzMiddleware'); 

// Get all menu items
router.get('/menu', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Menu');
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a specific menu item by ID
router.get('/menu/:id', authenticate, authorize(['manager', 'student']), async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM Menu WHERE Item_ID = @id');
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Menu item not found' });
        }
        res.json(result.recordset[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Add a new menu item
router.post('/menu', authenticate, authorize(['manager']), authenticateManager('Restaurant'), async (req, res) => {
    try {
        const { Item_Name, Item_Amount, Restaurant_ID, Description, Stock } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('Item_Name', sql.VarChar, Item_Name)
            .input('Item_Amount', sql.Decimal, Item_Amount)
            .input('Restaurant_ID', sql.Int, Restaurant_ID)
            .input('Description', sql.NVarChar, Description)
            .input('Stock', sql.Int, Stock)
            .query('INSERT INTO Menu (Item_Name, Item_Amount, Restaurant_ID, Description, Stock) VALUES (@Item_Name, @Item_Amount, @Restaurant_ID, @Description, @Stock)');
        
        res.status(201).json({ message: 'Menu item added successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update an existing menu item
router.put('/:id', authenticate, authorize(['manager']), authenticateManager('Restaurant'), async (req, res) => {
    try {
        const { id } = req.params;
        const { Item_Name, Item_Amount, Restaurant_ID, Description, Stock } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)       // for now writtent to be like but can be updated for a single element asw
            .input('Item_Name', sql.VarChar, Item_Name)
            .input('Item_Amount', sql.Decimal, Item_Amount)
            .input('Restaurant_ID', sql.Int, Restaurant_ID)
            .input('Description', sql.NVarChar, Description)
            .input('Stock', sql.Int, Stock)
            .query('UPDATE Menu SET Item_Name = @Item_Name, Item_Amount = @Item_Amount Description = @Description, Stock = @Stock WHERE Item_ID = @id AND Restaurant_ID = @Restaurant_ID');
        
        res.json({ message: 'Menu item updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a menu item
router.delete('/:rid/:id', authenticate, authorize(['manager']), authenticateManager('Restaurant'), async (req, res) => {
    try {
        const { rid, id } = req.params;
        const pool = await poolPromise;
        
        await pool.request()
            .input('id', sql.Int, id)
            .input('rid', sql.Int, rid)
            .query('DELETE FROM Menu WHERE Item_ID = @id AND Restaurant_ID = @rid');
        
        res.json({ message: 'Menu item deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;