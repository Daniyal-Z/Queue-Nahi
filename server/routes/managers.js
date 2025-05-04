const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../dbConn');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticate, authenticateManager } = require('../middleware/authnMiddleware'); 
const { authorize } = require('../middleware/authzMiddleware'); 

router.get('/verify', authenticate, (req, res) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ valid: false, message: 'Manager access required' });
  }
  res.status(200).json({ 
    valid: true,
    user: req.user
  });
});

// Manager Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const pool = await poolPromise;
    
    // 1. Get manager by email
    const managerResult = await pool.request()
      .input('Email', sql.VarChar, email)
      .query(`
        SELECT Mgr_ID, Name, Email, Password 
        FROM Managers 
        WHERE Email = @Email
      `);

    const manager = managerResult.recordset[0];
    
    if (!manager) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 2. Verify password
    const validPassword = await bcrypt.compare(password, manager.Password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 3. Get manager type from Type_Service
    const typeResult = await pool.request()
      .input('Mgr_ID', sql.Int, manager.Mgr_ID)
      .query(`
        SELECT ts.Type_Service
        FROM Manager_Access ma
        JOIN Type_Service ts ON ma.Type_Service_ID = ts.Type_Service_ID
        WHERE ma.Mgr_ID = @Mgr_ID
      `);

    const managerType = typeResult.recordset[0]?.Type_Service;
    if (!managerType) {
      console.log({ message: 'No assigned service type' });
    }

    // 4. Generate JWT token with role and type
    const token = jwt.sign(
      {
        id: manager.Mgr_ID,
        name: manager.Name,
        email: manager.Email,
        role: 'manager',
        managerType // 'Restaurant', 'Ground', or 'Photocopier'
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 5. Return response
    //const { Password, ...safeManagerData } = manager;
    res.status(201).json({
      id: manager.Mgr_ID,
      name: manager.Name,
      email: manager.Email,
      type: managerType,
      role: 'manager',
      token, // Send token to frontend
      message: "Login successful"
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a new manager
router.post('/signup', async (req, res) => {
  try {
    const { email, name, pass } = req.body;
    const pool = await poolPromise;

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(pass, 10);

    await pool.request()
      .input("Email", sql.VarChar, email)
      .input("Name", sql.VarChar, name)
      .input("Password", sql.VarChar, hashedPassword)
      .execute("SignupManager");

    // Fetch created manager
    const managerResult = await pool.request()
      .input("Email", sql.VarChar, email)
      .query("SELECT Mgr_ID, Name, Email FROM Managers WHERE Email = @Email");

    const manager = managerResult.recordset[0];

    // Generate JWT token
    const token = jwt.sign(
      {
        id: manager.Mgr_ID,
        name: manager.Name,
        email: manager.Email,
        role: 'manager'
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({
      id: manager.Mgr_ID,
      name: manager.Name,
      email: manager.Email,
      role: 'manager',
      token, // Send token to frontend
      message: "Manager registered successfully"
    });

  } catch (error) {
    console.error("Error during signup:", error);

    if (error.message.includes("Email already registered")) {
      return res.status(400).json({ message: "Email already registered" });
    }

    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get all managers
router.get('/', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Managers');
        res.status(200).json(result.recordset);
    } catch (error) {
        console.error('Error fetching managers:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update manager info
router.put('/:id', authenticate, authorize(['manager']), async (req, res) => {       // so here when changing the password you would also need to hash it
    try {
        const { id } = req.params;
        const { email, name, pass } = req.body;
        const pool = await poolPromise;

        await pool.request()
            .input('id', sql.Int, id)
            .input('email', sql.VarChar, email)
            .input('name', sql.VarChar, name)
            .input('pass', sql.VarChar, pass)
            .query('UPDATE Managers SET Email = @email, Name = @name, Password = @pass WHERE Manager_ID = @id');

        res.status(200).json({ message: 'Manager updated successfully' });
    } catch (error) {
        console.error('Error updating manager:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a manager
router.delete('/:id', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;

        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Managers WHERE Manager_ID = @id');

        res.status(200).json({ message: 'Manager deleted successfully' });
    } catch (error) {
        console.error('Error deleting manager:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Manager Verify
router.post('/verify/identity', async (req, res) => {
  const { email, password } = req.body;

  try {
    const pool = await poolPromise;
    
    // 1. Get manager by email
    const managerResult = await pool.request()
      .input('Email', sql.VarChar, email)
      .query(`
        SELECT Password 
        FROM Managers
        WHERE Email = @Email
      `);

    const manager = managerResult.recordset[0];
    
    if (!manager) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 2. Verify password
    const validPassword = await bcrypt.compare(password, manager.Password);
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
