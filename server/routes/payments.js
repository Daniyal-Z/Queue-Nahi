const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../dbConn');


router.get("/pendingPayments", async (req, res) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query("SELECT * FROM Pending_Payments");
      res.status(200).json(result.recordset);
    } catch (error) {
      console.error("Error fetching pending payments:", error);
      res.status(500).json({ message: "Server error" });
    }
  });


module.exports = router;
