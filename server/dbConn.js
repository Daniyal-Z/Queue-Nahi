const sql = require('mssql');
require('dotenv').config({ path: '../.env' }); // Load environment variables

const config = {
    
    user: process.env.DB_USER, // Fallback to hardcoded value if .env missing
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
      encrypt: process.env.DB_ENCRYPT === 'true', // This controls SSL
      trustServerCertificate: process.env.DB_TRUST_CERT === 'true', // Ignore self-signed cert warning
      enableArithAbort: true,
      instanceName: process.env.DB_INSTANCE 
  },
    port: parseInt(process.env.DB_PORT),
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000
  }
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log("Connected to SQL Server");
    return pool;
  })
  .catch((err) => {
    console.error("Database connection failed: ", err);
    process.exit(1); // Exit process on connection failure
  });

// Test connection on startup
async function testConnection() {
  try {
    const pool = await poolPromise;
    await pool.request().query('SELECT 1');
    console.log('Database connection verified');
  } catch (err) {
    console.error('Database connection test failed:', err);
  }
}

testConnection(); 

module.exports = {
  sql,
  poolPromise
};