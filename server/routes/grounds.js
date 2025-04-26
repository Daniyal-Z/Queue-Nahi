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
    res.status(500).json({ message: error.message });
  }
});

// Get available grounds
router.get('/available', async (req, res) => { 
  try { 
    const pool = await poolPromise; 
    const result = await pool.request()
      .query('SELECT * FROM Grounds WHERE G_Status = \'Available\''); 
    res.status(200).json(result.recordset);
  } catch (error) { 
    res.status(500).json({ message: 'Server error' }); 
  } 
});

// Get ground by ID
router.get('/:id', async (req, res) => {
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
    res.status(500).json({ message: error.message });
  }
});

// Add new ground
router.post('/', async (req, res) => {
  const { ground_type } = req.body;
  
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('TypeService', sql.VarChar, 'Ground')
      .query(`
        SELECT TOP 1 ma.Mgr_ID
        FROM Manager_Access ma
        JOIN Type_Service ts ON ma.Type_Service_ID = ts.Type_Service_ID
        WHERE ts.Type_Service = @TypeService
      `);

    if (result.recordset.length === 0) {
      return res.status(400).json({ message: 'No Ground Manager found.' });
    }

    const mgrId = result.recordset[0].Mgr_ID;

    await pool.request()
      .input('GroundType', sql.VarChar, ground_type)
      .input('MgrID', sql.Int, mgrId)
      .input('Status', sql.VarChar, 'Available')
      .query(`
        INSERT INTO Grounds (Ground_Type, Mgr_ID, G_Status)
        VALUES (@GroundType, @MgrID, @Status)
      `);

    res.status(201).json({ message: 'Ground added successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error while adding ground.' });
  }
});

// Update ground
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
    res.status(500).json({ message: error.message });
  }
});

// Update ground status
router.patch('/:id/status', async (req, res) => {
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
    res.status(500).json({ message: error.message });
  }
});

// Delete ground
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

// Get available slots for a ground
router.get('/:id/slots', async (req, res) => {
  try {
    
    const { id } = req.params;
    const pool = await poolPromise;
     let result = await pool.request().query('SELECT * FROM dbo.Slots')
    const timingsResult = await pool.request()
      .input('TypeService', sql.VarChar, 'Ground')
      .query(`
        SELECT Opening_Time, Closing_Time 
        FROM Operational_Timings ot
        JOIN Type_Service ts ON ot.Type_Service_ID = ts.Type_Service_ID
        WHERE ts.Type_Service = @TypeService
      `);
    
    if (timingsResult.recordset.length === 0) {
      return res.status(400).json({ message: 'No operational timings found' });
    }
    
    const slotsResult = await pool.request()
      .query('SELECT * FROM Slots');
    
    const bookedResult = await pool.request()
      .input('gid', sql.Int, id)
      .query(`
        SELECT SlotID FROM Booking 
        WHERE G_ID = @gid AND B_Time >= CAST(GETDATE() AS DATE)
      `);
    
    const bookedSlots = bookedResult.recordset.map(b => b.SlotID);
    const availableSlots = slotsResult.recordset.filter(slot => 
      !bookedSlots.includes(slot.SlotID)
    );
    
    res.json(availableSlots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Add new slot
router.post('/:id/slots', async (req, res) => {
    try {
      const { id } = req.params;
      const { Day, StartTime, EndTime } = req.body;
      
      // Validate inputs
      if (!Day || !StartTime || !EndTime) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      
      if (StartTime >= EndTime) {
        return res.status(400).json({ message: 'End time must be after start time' });
      }
  
      const pool = await poolPromise;
      const result = await pool.request()
        .input('Day', sql.VarChar, Day)
        .input('StartTime', sql.Int, StartTime)
        .input('EndTime', sql.Int, EndTime)
        .input('G_ID', sql.Int, id)
        .query(`
          INSERT INTO Slots (Day, StartTime, EndTime, G_ID, Status)
          VALUES (@Day, @StartTime, @EndTime, @G_ID, 'Available')
          SELECT SCOPE_IDENTITY() AS SlotID
        `);
      
      res.status(201).json({ 
        message: 'Slot added successfully',
        slotId: result.recordset[0].SlotID
      });
    } catch (error) {
      console.error('Error adding slot:', error);
      res.status(500).json({ 
        message: 'Failed to add slot',
        error: error.message 
      });
    }
  });
// Book a ground
router.post('/:id/book', async (req, res) => {
  const transaction = new sql.Transaction(await poolPromise);
  
  try {
    const { id } = req.params;
    const { roll_no, slot_id, date } = req.body;
    
    await transaction.begin();
    const request = new sql.Request(transaction);

    // 1. Check ground availability
    const groundResult = await request
      .input('id', sql.Int, id)
      .query('SELECT G_Status FROM Grounds WHERE G_ID = @id');
    
    if (groundResult.recordset.length === 0) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Ground not found' });
    }
    
    if (groundResult.recordset[0].G_Status !== 'Available') {
      await transaction.rollback();
      return res.status(400).json({ message: 'Ground not available' });
    }

    // 2. Create booking
    await request
      .input('roll_no', sql.Int, roll_no)
      .input('g_id', sql.Int, id)
      .input('b_time', sql.DateTime, new Date(date))
      .input('slot_id', sql.Int, slot_id)
      .query(`
        INSERT INTO Booking (Roll_No, G_ID, B_Time, SlotID)
        VALUES (@roll_no, @g_id, @b_time, @slot_id)
      `);

    // 3. Update ground status
    await request
      .input('id', sql.Int, id)
      .input('status', sql.VarChar, 'Booked')
      .query('UPDATE Grounds SET G_Status = @status WHERE G_ID = @id');

    // 4. Create payment record
    const typeServiceResult = await request
      .input('TypeService', sql.VarChar, 'Ground')
      .query(`
        SELECT Type_Service_ID FROM Type_Service 
        WHERE Type_Service = @TypeService
      `);
    
    const bookingIdResult = await request.query('SELECT IDENT_CURRENT("Booking") as Booking_ID');
    
    await request
      .input('TypeServiceID', sql.Int, typeServiceResult.recordset[0].Type_Service_ID)
      .input('OrderID', sql.Int, bookingIdResult.recordset[0].Booking_ID)
      .input('RollNo', sql.Int, roll_no)
      .input('Amount', sql.Decimal(10,2), 0)
      .input('PaymentType', sql.VarChar, 'Cash')
      .input('Status', sql.VarChar, 'Paid')
      .query(`
        INSERT INTO Payments 
        (Type_Service_ID, Order_ID, Roll_No, Amount_Total, Payment_Type, Status)
        VALUES (@TypeServiceID, @OrderID, @RollNo, @Amount, @PaymentType, @Status)
      `);

    await transaction.commit();
    res.status(201).json({ message: 'Ground booked successfully' });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;