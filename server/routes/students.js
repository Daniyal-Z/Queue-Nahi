const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../dbConn');



// Student Login
router.post('/login', async (req, res) => {
  const { rollNumber, password } = req.body;

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('Email', sql.VarChar, rollNumber)
      .input('Password', sql.VarChar, password)
      .execute('StudentLogin');

    const student = result.recordset[0];
    
    if (!student) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.status(200).json({
      id: student.Roll_No,
      name: student.Name,
      email: student.Email
    });
    

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all students
router.get('/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Students');
    res.status(200).json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get student by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Students WHERE ID = @id');
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(200).json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get active (unpaid) food orders for a student using the ActiveFoodOrders view
router.get('/:id/active-orders', async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('roll_no', sql.Int, id)
      .query(`
        SELECT *
        FROM ActiveFoodOrders
        WHERE Roll_No = @roll_no
        ORDER BY Pickup_Time DESC
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'No active unpaid orders found for this student.' });
    }

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error("Error retrieving orders:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get inactive (paid) food orders for a student using the ActiveFoodOrders view
router.get('/:id/old-orders', async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('roll_no', sql.Int, id)
      .query(`
        SELECT *
        FROM OldFoodOrders
        WHERE Roll_No = @roll_no
        ORDER BY Pickup_Time DESC
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'No inactive paid orders found for this student.' });
    }

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error("Error retrieving orders:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get active (unpaid) book orders for a student using the ActiveBookOrders view
router.get('/:id/active-b_orders', async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('roll_no', sql.Int, id)
      .query(`
        SELECT *
        FROM ActiveBookOrders
        WHERE Roll_No = @roll_no
        ORDER BY Order_Time DESC
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'No active unpaid book orders found for this student.' });
    }

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error("Error retrieving book orders:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get active (unpaid) book orders for a student using the ActiveBookOrders view
router.get('/:id/old-b_orders', async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('roll_no', sql.Int, id)
      .query(`
        SELECT *
        FROM OldBookOrders
        WHERE Roll_No = @roll_no
        ORDER BY Order_Time DESC
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'No inactive paid book orders found for this student.' });
    }

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error("Error retrieving book orders:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get active (unpaid) print jobs for a student using the ActiveBookOrders view
router.get('/:id/active-p_orders', async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('roll_no', sql.Int, id)
      .query(`
        SELECT *
        FROM ActivePrintOrders
        WHERE Roll_No = @roll_no
        ORDER BY Print_Job_ID DESC
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'No active unpaid print jobs found for this student.' });
    }

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error("Error retrieving print jobs:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get inactive (paid) print jobs for a student using the ActiveBookOrders view
router.get('/:id/old-p_orders', async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('roll_no', sql.Int, id)
      .query(`
        SELECT *
        FROM OldPrintOrders
        WHERE Roll_No = @roll_no
        ORDER BY Print_Job_ID DESC
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'No inactive paid print jobs found for this student.' });
    }

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error("Error retrieving print jobs:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// Add a new student
router.post('/signup', async (req, res) => {
  try {
    const { email, name, pass } = req.body;

    const pool = await poolPromise;

    await pool.request()
      .input("Email", sql.VarChar, email)
      .input("Name", sql.VarChar, name)
      .input("Password", sql.VarChar, pass)
      .execute("SignupStudent");

      const student = result.recordset[0];

      res.status(200).json({
        id: student.Roll_No,
        name: student.Name,
        email: student.Email,
      });

    res.status(201).json({ message: "Student registered successfully" });
  } catch (error) {
    console.error("Error during signup:", error);

    // Check for duplicate email
    if (error.message.includes("Email already registered")) {
      return res.status(400).json({ message: "Email already registered" });
    }

    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update a student
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, rollNumber, department } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .input('name', sql.NVarChar, name)
      .input('rollNumber', sql.NVarChar, rollNumber)
      .input('department', sql.NVarChar, department)
      .query('UPDATE Students SET Name = @name, RollNumber = @rollNumber, Department = @department WHERE ID = @id');
    
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(200).json({ message: 'Student updated successfully' });
  } catch (err) 
  {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete a student
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Students WHERE ID = @id');
    
    if (result.rowsAffected[0] === 0) 
    {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(200).json({ message: 'Student deleted successfully' });
  } catch (err) 
  {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get("/studentBookings", async (req, res) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query("SELECT * FROM Student_Bookings");
      res.status(200).json(result.recordset);
    } catch (error) {
      console.error("Error fetching student bookings:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
router.get("/studentFoodOrders", async (req, res) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query("SELECT * FROM Student_Food_Orders");
      res.status(200).json(result.recordset);
    } catch (error) {
      console.error("Error fetching student food orders:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
router.get("/studentPrintJobs", async (req, res) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query("SELECT * FROM Student_Print_Jobs");
      res.status(200).json(result.recordset);
    } catch (error) {
      console.error("Error fetching student print jobs:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
router.get("/studentBookOrders", async (req, res) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query("SELECT * FROM Student_Book_Orders");
      res.status(200).json(result.recordset);
    } catch (error) {
      console.error("Error fetching student book orders:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

module.exports = router;
