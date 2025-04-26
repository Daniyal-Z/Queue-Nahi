const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../dbConn');


router.get("/printPricing", async (req, res) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query("SELECT * FROM PrintPricingView");
      res.status(200).json(result.recordset);
    } catch (error) {
      console.error("Error fetching print pricing:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

router.post("/types", async (req, res) => {
  const { Type_Name, Price_Per_Page } = req.body;

  try {
    const pool = await poolPromise;

    await pool.request()
      .input("Type_Name", sql.VarChar(50), Type_Name)
      .input("Price_Per_Page", sql.Decimal(10, 2), Price_Per_Page)
      .execute("AddPrintTypeWithPricing");

    res.status(201).json({ message: "Print type and pricing added successfully." });

  } catch (error) {
    console.error("Error adding print type with pricing:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Update an existing type
router.put('/types/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { Type_Name, Price_Per_Page } = req.body;

        //console.log("Hello1");
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .input('Type_Name', sql.VarChar, Type_Name)
            .query('UPDATE Print_Types SET Type_Name = @Type_Name WHERE Type_ID = @id');
        
        //console.log("Hello2");
        const pool2 = await poolPromise;
        await pool2.request()
            .input('id', sql.Int, id)
            .input('Price_Per_Page', sql.Decimal, Price_Per_Page)
            .query('Update Print_Type_Pricing SET Price_Per_Page = @Price_Per_Page WHERE Type_ID = @id')
        
        //console.log("Hello3");
        res.json({ message: 'Type updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Place new print job
router.post("/print-job", async (req, res) => {
  const { roll_no, type_id, doc_info, total_amount, no_pages } = req.body;

  try {
    const pool = await poolPromise;

    await pool.request()
      .input("Roll_No", sql.Int, roll_no)
      .input("Type_ID", sql.Int, type_id)
      .input("Doc_Info", sql.NVarChar(sql.MAX), doc_info)
      .input("Total_Amount", sql.Decimal(10, 2), total_amount)
      .input("No_Pages", sql.Int, no_pages)
      .execute("PlacePrintJob");

    res.status(200).json({ message: "Print job placed successfully!" });
  } catch (error) {
    console.error("Error placing print job:", error);
    res.status(500).json({ message: "Failed to place print job." });
  }
});

// Get all print orders for manager view
router.get('/orders', async (req, res) => {
  try {
      const pool = await poolPromise;
      const result = await pool.request().query(`
          SELECT 
              pj.Print_Job_ID,
              pj.Doc_Info,
              pj.No_Pages,
              pt.Type_Name,
              p.Photocopier_ID,
              p.Roll_No,
              p.Total_Amount,
              py.Status
          FROM Print_Jobs pj
          JOIN Print_Types pt ON pj.Type_ID = pt.Type_ID
          JOIN Photocopier p ON pj.Photocopier_ID = p.Photocopier_ID
          JOIN Payments py ON py.Order_ID = p.Photocopier_ID
          WHERE p.Service_Type = 'Print'
		  GROUP BY pj.Print_Job_ID, pj.Doc_Info,
              pj.No_Pages,
              pt.Type_Name,
              p.Photocopier_ID,
              p.Roll_No,
              p.Total_Amount,
              py.Status
          ORDER BY pj.Print_Job_ID DESC;
      `);

      res.json(result.recordset);
  } catch (error) {
      console.error("Error fetching print orders:", error);
      res.status(500).json({ error: error.message });
  }
});

//update order status
router.put('/orders/:pid', async (req, res) => {
    const { pid } = req.params;
    const { Payment_Status } = req.body;

    try {
        const pool = await poolPromise;
      
        // Update Payments
        const paymentRequest = pool.request(); 
        await paymentRequest
            .input('pid', sql.Int, pid)
            .input('Payment_Status', sql.VarChar, Payment_Status)
            .query(`
                UPDATE Payments
                SET Status = @Payment_Status
                WHERE Order_ID = (Select Photocopier_ID from Print_Jobs pj where pj.Print_Job_ID = @pid) AND Type_Service_ID = (Select Type_Service_ID from Type_Service ts where Type_Service = 'Photocopier');
            `);
            //console.log("Hello 2");
        res.json({ message: 'Order status updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;
