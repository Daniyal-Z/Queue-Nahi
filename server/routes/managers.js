const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../dbConn');


// Manager Login
router.post('/login', async (req, res) => {
  const { rollNumber, password } = req.body;

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('Email', sql.VarChar, rollNumber)
      .input('Password', sql.VarChar, password)
      .execute('ManagerLogin');

    const manager = result.recordset[0];

    if (!manager) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Now get their Type_Service
    const typeResult = await pool
      .request()
      .input('Mgr_ID', sql.Int, manager.Mgr_ID)
      .query(`
        SELECT ts.Type_Service
        FROM Manager_Access ma
        JOIN Type_Service ts ON ma.Type_Service_ID = ts.Type_Service_ID
        WHERE ma.Mgr_ID = @Mgr_ID
      `);

    const type = typeResult.recordset[0]?.Type_Service;

    res.status(200).json({
      id: manager.Mgr_ID,
      name: manager.Name,
      email: manager.Email,
      type: type
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Add a new manager
router.post('/signup', async (req, res) => {
  try {
    const { email, name, pass } = req.body;

    const pool = await poolPromise;

    await pool.request()
      .input("Email", sql.VarChar, email)
      .input("Name", sql.VarChar, name)
      .input("Password", sql.VarChar, pass)
      .execute("SignupManager");

    // Then fetch the newly created manager
    const managerResult = await pool.request()
      .input("Email", sql.VarChar, email)
      .query("SELECT Mgr_ID, Name, Email FROM Managers WHERE Email = @Email");

    const manager = managerResult.recordset[0];

    res.status(201).json({
      id: manager.Mgr_ID,
      name: manager.Name,
      email: manager.Email,
      type: "manager",  // Explicitly setting the type
      message: "Manager registered successfully"
    });
  } catch (error) {
    console.error("Error during signup:", error);

    // Check for duplicate email
    if (error.message.includes("Email already registered")) {
      return res.status(400).json({ message: "Email already registered" });
    }

    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Add a new manager
// router.post('/', async (req, res) => {
//     try {
//         const { email, name, pass } = req.body;
//         const pool = await poolPromise;

//         await pool.request()
//             .input('email', sql.VarChar, email)
//             .input('name', sql.VarChar, name)
//             .input('pass', sql.VarChar, pass)
//             .query('INSERT INTO Managers (Email, Name, Password) VALUES (@email, @name, @pass)');

//         res.status(201).json({ message: 'Manager added successfully' });
//     } catch (error) {
//         console.error('Error inserting Manager:', error);
//         res.status(500).json({ message: 'Server error' });
//     }
// });

// Get all managers
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Managers');
        res.status(200).json(result.recordset);
    } catch (error) {
        console.error('Error fetching managers:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get manager by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM Managers WHERE Manager_ID = @id');

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Manager not found' });
        }
        res.status(200).json(result.recordset[0]);
    } catch (error) {
        console.error('Error fetching manager:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update manager info
router.put('/:id', async (req, res) => {
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
router.delete('/:id', async (req, res) => {
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

module.exports = router;
