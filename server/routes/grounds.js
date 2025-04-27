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

// router.get('/:id/bookings', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const pool = await poolPromise;

//     const bookingsResult = await pool.request()
//       .input('gid', sql.Int, id)
//       .query(`
//         SELECT 
//           B.Booking_ID, B.Roll_No, G.Ground_Type, 
//           S.Day, S.StartTime, S.EndTime, B.B_Time
//         FROM Booking B
//         INNER JOIN Slots S ON B.SlotID = S.SlotID
//         INNER JOIN Grounds G ON S.G_ID = G.G_ID
//         WHERE G.G_ID = @gid
//       `);

//     res.json(bookingsResult.recordset);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });



// Get bookings for a ground
router.get('/:gid/bookings', async (req, res) => {
  try {
    const { gid } = req.params;
    const pool = await poolPromise;
    const result = await pool.request()
    .input('groundId', sql.Int, gid)
    .query(`SELECT B.Booking_ID,B.Roll_No,G.Ground_Type, S.Day, S.StartTime, S.EndTime, S.Status AS Slot_Status, G.G_Status AS Ground_Status, B.B_Time
    FROM 
    Booking B
    INNER JOIN 
    Slots S ON B.SlotID = S.SlotID
    INNER JOIN 
        Grounds G ON S.G_ID = G.G_ID;
      `);
  return res.status(200).json(result.recordset);

  } catch (error) {
    console.error('Error fetching bookings:', error);
    return res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});
// Get available slots for a ground
router.get('/:id/slots', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;

    const slotsResult = await pool.request()
      .input('gid', sql.Int, id)
      .query('SELECT * FROM Slots WHERE G_ID = @gid');

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

//delete slot from grounds (ground manager)
// This route deletes a slot from the database. It first checks if there are any bookings associated with the slot.
router.delete('/:gid/slots/:slotId', async (req, res) => {
  try {
    const { gid, slotId } = req.params;

    const pool = await poolPromise;

    // Directly delete the slot
    await pool.request()
      .input('slotId', sql.Int, slotId)
      .query('DELETE FROM Slots WHERE SlotID = @slotId');

    return res.status(200).json({ 
      message: 'Slot deleted successfully' 
    });

  } catch (error) {
    console.error('Error deleting slot:', error);
    return res.status(500).json({ 
      error: 'Failed to delete slot',
      details: error.message 
    });
  }
});
router.delete('/bookings/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const pool = await poolPromise;

    // Delete the booking
    const result = await pool.request()
      .input('bookingId', sql.Int, bookingId)
      .query('DELETE FROM Booking WHERE Booking_ID = @bookingId');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    return res.status(200).json({ message: 'Booking deleted successfully' });

  } catch (error) {
    console.error('Error deleting booking:', error);
    return res.status(500).json({ 
      error: 'Failed to delete booking',
      details: error.message 
    });
  }
});

// Get bookings for a specific user
router.delete('/bookings/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;

    const pool = await poolPromise;
    await pool.request()
      .input('bookingId', sql.Int, bookingId)
      .query('DELETE FROM Booking WHERE BookingID = @bookingId');

    return res.status(200).json({ message: 'Booking deleted successfully' });

  } catch (error) {
    console.error('Error deleting booking:', error);
    return res.status(500).json({ error: 'Failed to delete booking' });
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
router.post('/book', async (req, res) => {
  const transaction = new sql.Transaction(await poolPromise);
  
  try {
    //const { id } = req.params;
    const { roll_no, slot_id, date, g_id } = req.body;
    
    await transaction.begin();
    const request = new sql.Request(transaction);

    // 1. Check ground availability
    const groundResult = await request
      .input('g_id_param', sql.Int, g_id)
      .query('SELECT G_Status FROM Grounds WHERE G_ID = @g_id_param');
    
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
      .input('g_id', sql.Int, g_id)
      .input('b_time', sql.DateTime, new Date(date))
      .input('slot_id', sql.Int, slot_id)
      .query(`
        INSERT INTO Booking (Roll_No, G_ID, B_Time, SlotID)
        VALUES (@roll_no, @g_id, @b_time, @slot_id)
      `);

    // 3. Update ground status
    await request
      .input('g_id_update', sql.Int, g_id)
      .input('status', sql.VarChar, 'Booked')
      .query('UPDATE Grounds SET G_Status = @status WHERE G_ID = @g_id_update');

    await transaction.commit();
    res.status(201).json({ message: 'Ground booked successfully' });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;