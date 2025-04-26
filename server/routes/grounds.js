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

// Delete a ground - DELETE /grounds/:id
router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const pool = await poolPromise;
      await pool.request()
        .input('id', sql.Int, id)
        .query('DELETE FROM Grounds WHERE G_ID = @id');
      
      res.json({ message: 'Ground deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});

module.exports = router;


//New code for booking a ground and getting available slots
// Get all available grounds - GET /grounds/available


router.get('/:id/slots', async (req, res) => {
    try {
      const { id } = req.params;
      const pool = await poolPromise;
      
      // Get operational timings for grounds
      const timingsResult = await pool.request()
        .input('TypeService', sql.VarChar, 'Ground')
        .query(`
          SELECT Opening_Time, Closing_Time 
          FROM Operational_Timings ot
          JOIN Type_Service ts ON ot.Type_Service_ID = ts.Type_Service_ID
          WHERE ts.Type_Service = @TypeService
        `);
      
      if (timingsResult.recordset.length === 0) {
        return res.status(400).json({ message: 'No operational timings found for grounds' });
      }
      
      const { Opening_Time, Closing_Time } = timingsResult.recordset[0];
      
      // Get all slots
      const slotsResult = await pool.request()
        .query('SELECT * FROM Slots');
      
      // Get booked slots for this ground
      const bookedResult = await pool.request()
        .input('gid', sql.Int, id)
        .query(`
          SELECT SlotID FROM Booking 
          WHERE G_ID = @gid AND B_Time >= CAST(GETDATE() AS DATE)
        `);
      
      const bookedSlots = bookedResult.recordset.map(b => b.SlotID);
      
      // Filter available slots
      const availableSlots = slotsResult.recordset.filter(slot => 
        !bookedSlots.includes(slot.SlotID)
        // Add additional time validation if needed
        // && slot.StartTime >= Opening_Time && slot.EndTime <= Closing_Time
      );
      
      res.json(availableSlots);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Book a ground - POST /grounds/:id/book
  router.post('/:id/book', async (req, res) => {
    try {
      const { id } = req.params;
      const { roll_no, slot_id, date } = req.body;
      
      const pool = await poolPromise;
      
      // Validate ground exists and is available
      const groundResult = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT G_Status FROM Grounds WHERE G_ID = @id');
      
      if (groundResult.recordset.length === 0) {
        return res.status(404).json({ message: 'Ground not found' });
      }
      
      if (groundResult.recordset[0].G_Status !== 'Available') {
        return res.status(400).json({ message: 'Ground is not available for booking' });
      }
      
      // Validate slot exists
      const slotResult = await pool.request()
        .input('slot_id', sql.Int, slot_id)
        .query('SELECT * FROM Slots WHERE SlotID = @slot_id');
      
      if (slotResult.recordset.length === 0) {
        return res.status(400).json({ message: 'Invalid slot' });
      }
      
      // Create booking datetime
      const bookingDateTime = new Date(date);
      const slot = slotResult.recordset[0];
      
      // Insert booking
      await pool.request()
        .input('roll_no', sql.Int, roll_no)
        .input('g_id', sql.Int, id)
        .input('b_time', sql.DateTime, bookingDateTime)
        .input('slot_id', sql.Int, slot_id)
        .query(`
          INSERT INTO Booking (Roll_No, G_ID, B_Time, SlotID)
          VALUES (@roll_no, @g_id, @b_time, @slot_id)
        `);
      
      // Update ground status
      await pool.request()
        .input('id', sql.Int, id)
        .input('status', sql.VarChar, 'Booked')
        .query('UPDATE Grounds SET G_Status = @status WHERE G_ID = @id');
      
      // Create payment record
      const typeServiceResult = await pool.request()
        .input('TypeService', sql.VarChar, 'Ground')
        .query(`
          SELECT Type_Service_ID FROM Type_Service 
          WHERE Type_Service = @TypeService
        `);
      
      if (typeServiceResult.recordset.length === 0) {
        return res.status(400).json({ message: 'Service type not found' });
      }
      
      const typeServiceId = typeServiceResult.recordset[0].Type_Service_ID;
      
      // Get the latest booking ID
      const bookingIdResult = await pool.request()
        .query('SELECT IDENT_CURRENT("Booking") as Booking_ID');
      
      const bookingId = bookingIdResult.recordset[0].Booking_ID;
      
      await pool.request()
        .input('TypeServiceID', sql.Int, typeServiceId)
        .input('OrderID', sql.Int, bookingId)
        .input('RollNo', sql.Int, roll_no)
        .input('Amount', sql.Decimal(10,2), 0) // Assuming free booking for now
        .input('PaymentType', sql.VarChar, 'Cash') // Default
        .input('Status', sql.VarChar, 'Paid') // Default
        .query(`
          INSERT INTO Payments (Type_Service_ID, Order_ID, Roll_No, Amount_Total, Payment_Type, Status)
          VALUES (@TypeServiceID, @OrderID, @RollNo, @Amount, @PaymentType, @Status)
        `);
      
      res.status(201).json({ message: 'Ground booked successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });