const sql = require('mssql');

//the server and login info needed to connect with sql server
const config = {
    user: "sa",
    password: "1729314",
    server: "DESKTOP-72HCC7I",
    database: "QNahiDB",
    options: {
        trustServerCertificate: true,
        trustedConnection: false,
        enableArithAbort: true,
        instancename: "SQL_DB"
    },
    port: 1433   //for now is 1433 but if TCP port is changed in config of IAPII then here asw
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log("Connected to SQL Server");
    return pool;
  })
  .catch((err) => {
    console.error("Database connection failed: ", err);
  });

module.exports = {
  sql,
  poolPromise
};
