const { getRows, runQuery } = require("./DBUtil");

async function createDB() {
    await runQuery(`
                CREATE TABLE IF NOT EXISTS user (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    Name TEXT NOT NULL,
                    Email TEXT NOT NULL UNIQUE,
                    Password TEXT NOT NULL,
                    DoB DATE NOT NULL,
                    Gender TEXT CHECK(Gender IN ('Male', 'Female')) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

    await runQuery(`
                CREATE TABLE IF NOT EXISTS password_reset (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    token TEXT NOT NULL,
                    used INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
                )
            `);

    console.log("User table created successfully");
}

createDB().catch((error) => {
    console.error("Error creating the database:", error.message);
});
