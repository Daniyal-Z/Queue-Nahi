const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../dbConn');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticate } = require('../middleware/auth'); 

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


module.exports = router;