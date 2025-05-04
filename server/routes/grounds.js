const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../dbConn');
const { authenticate, authenticateManager } = require('../middleware/authnMiddleware'); 
const { authorize } = require('../middleware/authzMiddleware'); 

// Get all bookings
router.get('/bookings/all', authenticate, authorize(['manager', 'student']), async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query(`SELECT B.Booking_ID, B.Roll_No, 
        B.Day, B.G_ID, G.Ground_Type, S.StartTime, 
        S.EndTime, B.B_Time FROM Booking B 
        INNER JOIN Grounds G
        ON B.G_ID = G.G_ID
        INNER JOIN Slots S
        ON B.SlotID = S.SlotID
        ORDER BY B_Time DESC`);
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all grounds
router.get('/', authenticate, authorize(['manager', 'admin']), async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Grounds');
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get available grounds
router.get('/available', authenticate, authorize(['manager', 'student']), async (req, res) => { 
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
router.get('/:id', authenticate, authorize(['manager', 'student']), async (req, res) => {
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
router.post('/', authenticate, authorize(['manager']), authenticateManager('Ground'), async (req, res) => {
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
router.put('/:id', authenticate, authorize(['manager']), authenticateManager('Ground'), async (req, res) => {
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
router.patch('/:id/status', authenticate, authorize(['manager']), authenticateManager('Ground'), async (req, res) => {
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

router.patch('/slots/:id/status', authenticate, authorize(['manager']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, id)
      .input('status', sql.VarChar, status)
      .query('UPDATE Slots SET Status = @status WHERE SlotID = @id');

    res.json({ message: 'Slot status updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete ground
router.delete('/:id', authenticate, authorize(['manager', 'admin']), async (req, res) => {
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



// Get bookings for a specific ground
router.get('/:gid/bookings', authenticate, authorize(['manager']), authenticateManager('Ground'), async (req, res) => {
  try {
    const { gid } = req.params;
    
    // Validate ground ID is a number
    if (isNaN(gid)) {
      return res.status(400).json({ error: 'Invalid ground ID' });
    }

    const pool = await poolPromise;
    const result = await pool.request()
      .input('groundId', sql.Int, gid)
      .query(`
        SELECT 
          B.Booking_ID,
          B.Roll_No,
          G.Ground_Type, 
          B.Day, 
          S.StartTime, 
          S.EndTime,
          G.G_Status AS Ground_Status, 
          B.B_Time
        FROM Booking B
        INNER JOIN Slots S ON B.SlotID = S.SlotID
        INNER JOIN Grounds G ON B.G_ID = G.G_ID
        WHERE G.G_ID = @groundId
        ORDER BY B.B_Time DESC
      `);

    return res.status(200).json(result.recordset);

  } catch (error) {
    console.error('Error fetching bookings:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch bookings',
      details: error.message 
    });
  }
});

// Get all slots
router.get('/slots/all', authenticate, authorize(['manager', 'student']), async (req, res) => {
  console.log("Hello");
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query('SELECT * FROM Slots');

    res.status(200).json(result.recordset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get available slots for a ground
router.post('/:id/slots', authenticate, authorize(['manager', 'student']), async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.body;
    
    const pool = await poolPromise;
    const result = await pool.request()
    .input('gid', sql.Int, id)
    .input('date', sql.Date, date)
    .query(`
      SELECT s.* FROM Slots s 
      WHERE NOT EXISTS 
      (SELECT 1 FROM Booking b 
      WHERE b.G_ID = @gid
      AND b.Day = @date
      AND b.SlotID = s.SlotID)`)


    return res.status(200).json(result.recordset);
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//delete slot from grounds (ground manager)
// This route deletes a slot from the database. It first checks if there are any bookings associated with the slot.

router.delete('/slots/:slotId', authenticate, authorize(['manager']), authenticateManager('Ground'), async (req, res) => {
  try {
    const { slotId } = req.params;

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

// delete booking
router.delete('/bookings/:bookingId', authenticate, authorize(['manager']), authenticateManager('Ground'), async (req, res) => {
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
router.post('/slots', authenticate, authorize(['manager']), authenticateManager('Ground'), async (req, res) => {
  try {
    const { startTime, endTime } = req.body;

    // Validation
    if (startTime === undefined || startTime === null)
      return res.status(400).json({ message: 'Start time is required' });
    if (endTime === undefined || endTime === null)
      return res.status(400).json({ message: 'End time is required' });
    if (startTime >= endTime)
      return res.status(400).json({ message: 'End time must be after start time' });

    const pool = await poolPromise;

    // Check if this exact slot already exists
    const checkResult = await pool.request()
      .input('StartTime', sql.Int, startTime)
      .input('EndTime', sql.Int, endTime)
      .query('SELECT SlotID FROM Slots WHERE StartTime = @StartTime AND EndTime = @EndTime');

    if (checkResult.recordset.length > 0) {
      return res.status(409).json({ message: 'Slot with same start or end time already exists' });
    }

    // Insert if not exists
    await pool.request()
      .input('StartTime', sql.Int, startTime)
      .input('EndTime', sql.Int, endTime)
      .query('INSERT INTO Slots (StartTime, EndTime) VALUES (@StartTime, @EndTime)');

    res.status(201).json({ message: 'Slot added successfully' });

  } catch (error) {
    console.error('Error adding slot:', error);
    res.status(500).json({ 
      message: 'Failed to add slot',
      error: error.message 
    });
  }
});

// Book a ground
router.post('/book', authenticate, authorize(['student']), async (req, res) => {
  const transaction = new sql.Transaction(await poolPromise);
  
  try {
    const { roll_no, slot_id, date, g_id } = req.body;
    
    await transaction.begin();
    const request = new sql.Request(transaction);

    // 2. Create booking
    await request
      .input('roll_no', sql.Int, roll_no)
      .input('g_id', sql.Int, g_id)
      .input('b_time', sql.DateTime, new Date(date))
      .input('date', sql.Date, date)
      .input('slot_id_booking', sql.Int, slot_id)  // Changed parameter name
      .query(`
        INSERT INTO Booking (Roll_No, G_ID, B_Time, SlotID, Day)
        VALUES (@roll_no, @g_id, @b_time, @slot_id_booking, @date)
      `);

    await transaction.commit();
    res.status(201).json({ message: 'Ground booked successfully' });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;