const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../dbConn');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticate } = require('../middleware/authnMiddleware'); 
const { authorize } = require('../middleware/authzMiddleware'); 

router.get('/verify', authenticate, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
        valid: false,
        message: 'Admin access required'
    });
  }
  res.status(200).json({ 
    valid: true,
    user: req.user
  });
});

// Admin Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const pool = await poolPromise;
    
    // 1. Get manager by email
    const adminResult = await pool.request()
      .input('Email', sql.VarChar, email)
      .query(`
        SELECT Admin_ID, Email, Password 
        FROM Admin
        WHERE Email = @Email
      `);

    const admin = adminResult.recordset[0];
    
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 2. Verify password
    const validPassword = await bcrypt.compare(password, admin.Password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 3. Generate JWT token with role and type
    const token = jwt.sign(
      {
        id: admin.Admin_ID,
        name: 'King',
        email: admin.Email,
        role: 'admin',
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 4. Return response
    res.status(201).json({
      id: admin.Admin_ID,
      name: 'King',
      email: admin.Email,
      role: 'admin',
      token, // Send token to frontend
      message: "Login successful"
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all students
router.get('/students', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT Roll_No, Email, Name, Active FROM Students');
    res.status(200).json(result.recordset);

    
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update a student active status
router.put('/students/status', authenticate, authorize(['admin']), async (req, res) => {
  const { active, rollNum } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('active', sql.Bit, active)
      .input('id', sql.Int, rollNum)
      .query('UPDATE Students SET Active = @active WHERE Roll_No = @id');
    
    if (result.rowsAffected[0] === 0) 
    {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json({ message: 'Student status updated successfully' });
  } catch (err) 
  {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete a student
router.delete('/students/remove', authenticate, authorize(['admin']), async (req, res) => {
  const { id } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Students WHERE Roll_No = @id');
    
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

// Get all managers
router.get('/managers', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT Email, Name, Mgr_ID FROM Managers');
        res.status(200).json(result.recordset);
    } catch (error) {
        console.error('Error fetching managers:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a manager
router.delete('/managers/remove', authenticate, authorize(['admin']), async (req, res) => {
  const { id } = req.body;

  // Prevent deletion of protected manager IDs
  if (id === 1 || id === 2) {
    return res.status(403).json({ message: 'Deletion of this manager is not allowed' });
  }

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Managers WHERE Mgr_ID = @id');
    
    if (result.rowsAffected[0] === 0) 
    {
      return res.status(404).json({ message: 'Manager not found' });
    }
    res.status(200).json({ message: 'Manager deleted successfully' });
  } catch (err) 
  {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Admin Verify
router.post('/verify/identity', async (req, res) => {
  const { email, password } = req.body;

  try {
    const pool = await poolPromise;
    
    // 1. Get manager by email
    const adminResult = await pool.request()
      .input('Email', sql.VarChar, email)
      .query(`
        SELECT Password 
        FROM Admin 
        WHERE Email = @Email
      `);

    const admin = adminResult.recordset[0];
    
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 2. Verify password
    const validPassword = await bcrypt.compare(password, admin.Password);
    if (!validPassword) {
      return res.status(401).json({ message: false });
    }

    res.status(200).json({ message: true });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;