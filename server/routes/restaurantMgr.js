const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../dbConn');
const { authenticate, authenticateManager  } = require('../middleware/authnMiddleware'); 
const { authorize } = require('../middleware/authzMiddleware'); 

router.post('/add-restaurant', authenticate, authorize(['manager']), authenticateManager('Restaurant'), async (req, res) => {
    const { name, email, phone, location, mgrId } = req.body;
  
    if (!name || !email || !phone || !location || !mgrId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
  
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('Restaurant_Name', sql.VarChar(100), name)
        .input('Mgr_ID', sql.Int, mgrId)
        .input('Email', sql.VarChar(255), email)
        .input('Phone', sql.VarChar(20), phone)
        .input('Location', sql.VarChar(255), location)
        .execute('AddRestaurant');
  
      return res.status(201).json({ message: 'Restaurant created successfully' });
    } catch (err) {
      console.error('Error adding restaurant:', err);
      if (err.originalError && err.originalError.info && err.originalError.info.number === 2627) {
        // Unique constraint violation (email already exists)
        return res.status(409).json({ message: 'Email already exists' });
      }
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  module.exports = router;
  