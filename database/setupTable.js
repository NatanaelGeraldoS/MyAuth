const db = require("./db");

async function setupTables() {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS user (
                id INT AUTO_INCREMENT PRIMARY KEY,
                Name VARCHAR(100) NOT NULL UNIQUE,
                Email VARCHAR(100) NOT NULL UNIQUE,
                Password VARCHAR(255) NOT NULL,
                DoB DATE NOT NULL,
                Gender ENUM('Male', 'Female') NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log("User table created successfully");
    } catch (error) {
        console.error("ERROR: Failed to create user table:", error.message);
    }
}

module.exports = setupTables;
