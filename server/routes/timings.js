const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../dbConn');


 // Operational Timings
 router.get("/operationalTimings", async (req, res) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query("SELECT * FROM OperationalTimings");
      res.status(200).json(result.recordset);
    } catch (error) {
      console.error("Error fetching operational timings:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

module.exports = router;
