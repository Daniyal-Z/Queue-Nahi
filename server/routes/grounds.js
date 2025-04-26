const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../dbConn');

// Get all grounds
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Grounds');
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/", async (req, res) => {
    const { ground_type } = req.body;
  
    try {
      const pool = await poolPromise;
  
      // 1. Get the Ground Manager ID from Manager_Access
      const result = await pool.request()
        .input("TypeService", sql.VarChar, "Ground")
        .query(`
          SELECT TOP 1 ma.Mgr_ID
          FROM Manager_Access ma
          JOIN Type_Service ts ON ma.Type_Service_ID = ts.Type_Service_ID
          WHERE ts.Type_Service = @TypeService
        `);
  
      if (result.recordset.length === 0) {
        return res.status(400).json({ message: "No Ground Manager found." });
      }
  
      const mgrId = result.recordset[0].Mgr_ID;
  
      // 2. Insert new ground with default status = 'Available'
      await pool.request()
        .input("GroundType", sql.VarChar, ground_type)
        .input("MgrID", sql.Int, mgrId)
        .input("Status", sql.VarChar, "Available")
        .query(`
          INSERT INTO Grounds (Ground_Type, Mgr_ID, G_Status)
          VALUES (@GroundType, @MgrID, @Status)
        `);
  
      res.status(201).json({ message: "Ground added successfully." });
  
    } catch (err) {
      console.error("Error adding ground:", err);
      res.status(500).json({ message: "Server error while adding ground." });
    }
  });

// Get Available Grounds 
router.get("/grounds/available", async (req, res) => { 
    try { 
      const pool = await poolPromise; 
      const result = await pool.request()
      .query("SELECT * FROM Available_Grounds"); 
      res.status(200).json(result.recordset);
     } catch (error) { 
      console.error("Error fetching available grounds:", error); 
      res.status(500).json({ message: "Server error" }); 
    } 
  });

// Get a specific ground by ID
router.get('/grounds/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM Grounds WHERE G_ID = @id');
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Ground not found' });
        }
        res.json(result.recordset[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add a new ground
router.post('/grounds', async (req, res) => {
    try {
        const { Ground_Type, Mgr_ID, G_Status } = req.body;
        
        const pool = await poolPromise;


        await pool.request()
            .input('Ground_Type', sql.VarChar, Ground_Type)
            .input('Mgr_ID', sql.Int, Mgr_ID)
            .input('G_Status', sql.VarChar, G_Status || 'Available')
            .query('INSERT INTO Grounds (Ground_Type, Mgr_ID, G_Status) VALUES (@Ground_Type, @Mgr_ID, @G_Status)');
        
        res.status(201).json({ message: 'Ground added successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update an existing ground
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { Ground_Type, G_Status } = req.body;

        const pool = await poolPromise;

        await pool.request()
            .input('id', sql.Int, id)
            .input('Ground_Type', sql.VarChar, Ground_Type) 
            .input('G_Status', sql.VarChar, G_Status)
            .query('UPDATE Grounds SET Ground_Type = @Ground_Type, G_Status = @G_Status WHERE G_ID = @id');

        res.json({ message: 'Ground updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});




// Update ground status
router.patch('/grounds/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { G_Status } = req.body;
        
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .input('G_Status', sql.VarChar, G_Status)
            .query('UPDATE Grounds SET G_Status = @G_Status WHERE G_ID = @id');
        
        res.json({ message: 'Ground status updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a ground
router.delete('/grounds/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Grounds WHERE G_ID = @id');
        
        res.json({ message: 'Ground deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
