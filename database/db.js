const mysql = require("mysql2");
require("dotenv").config();
// Creating pool, so when we run many query they not open new connection, but using the same pool
console.log(
    process.env.HOST,
    process.env.USER,
    process.env.PASSWORD,
    process.env.DATABASE
);
const pool = mysql
    .createPool({
        host: process.env.HOST,
        user: process.env.USER,
        password: process.env.PASSWORD,
        database: process.env.DATABASE,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
    })
    .promise();

module.exports = pool;
