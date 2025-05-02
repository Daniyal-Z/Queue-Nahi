const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../dbConn');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticate } = require('../middleware/authnMiddleware'); 
const { authorize } = require('../middleware/authzMiddleware'); 

router.get('/verify', authenticate, (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({
        valid: false,
        message: 'Student access required'
    });
  }
  // If middleware passes, token is valid
  res.status(200).json({ 
    valid: true,
    user: {
      id: req.user.id,
      name: req.user.name,
      role: req.user.role
    }
  });
});

// Student Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body; 

  try {
    const pool = await poolPromise;
    
    // 1. Directly query student by email
    const result = await pool.request()
      .input('Email', sql.VarChar, email)
      .query(`
        SELECT Roll_No, Name, Email, Password, Active 
        FROM Students 
        WHERE Email = @Email
      `);

    const student = result.recordset[0];
    
    if (!student) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (student.Active !== true) {
      return res.status(403).json({ message: 'Your account has not been activated yet.' });
    }

    // 2. Verify password with bcrypt
    const validPassword = await bcrypt.compare(password, student.Password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 3. Generate JWT token
    const token = jwt.sign(
      {
        id: student.Roll_No,
        name: student.Name,
        email: student.Email,
        role: 'student'
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 4. Return sanitized user data + token
    //const { Password, ...userData } = student;
    res.status(201).json({
      id: student.Roll_No,
      name: student.Name,
      email: student.Email,
      token, 
      message: "Login successful"
    });


  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get active (unpaid) food orders for a student using the ActiveFoodOrders view
router.get('/:id/active-orders', authenticate, authorize(['student']), async (req, res) => {
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
router.get('/:id/old-orders', authenticate, authorize(['student']), async (req, res) => {
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
router.get('/:id/active-b_orders', authenticate, authorize(['student']), async (req, res) => {
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
router.get('/:id/old-b_orders', authenticate, authorize(['student']), async (req, res) => {
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
router.get('/:id/active-p_orders', authenticate, authorize(['student']), async (req, res) => {
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
router.get('/:id/old-p_orders', authenticate, authorize(['student']), async (req, res) => {
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

    // 1. First check if email exists (optional extra check)
    const exists = await pool.request()
      .input("Email", sql.VarChar, email)
      .query("SELECT 1 FROM Students WHERE Email = @Email");

    if (exists.recordset.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // 2. Hash password before calling stored procedure
    const hashedPassword = await bcrypt.hash(pass, 10);

    // 3. Call your existing stored procedure with hashed password
    await pool.request()
      .input("Email", sql.VarChar, email)
      .input("Name", sql.VarChar, name)
      .input("Password", sql.VarChar, hashedPassword) // Changed to hashed
      .execute("SignupStudent");

    await pool.request()
      .input("Email", sql.VarChar, email)
      .query("UPDATE Students SET Active = 0 where Email = @Email");

    // 4. Fetch student details (keeping your existing logic)
    const studentResult = await pool.request()
      .input("Email", sql.VarChar, email)
      .query("SELECT Roll_No, Name, Email FROM Students WHERE Email = @Email");

    const student = studentResult.recordset[0];

    // 5. Generate JWT token (new security addition)
    const token = jwt.sign(
      {
        id: student.Roll_No,
        role: 'student',
        email: student.Email,
        name: student.Name
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 6. Return same response format + token
    res.status(201).json({
      id: student.Roll_No,
      name: student.Name,
      email: student.Email,
      token, // New field
      message: "Student registered successfully"
    });

  } catch (error) {
    console.error("Error during signup:", error);

    // Preserve your existing error handling
    if (error.message.includes("Email already registered")) {
      return res.status(400).json({ message: "Email already registered" });
    }

    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
