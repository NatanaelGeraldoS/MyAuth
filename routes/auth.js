const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../database/db");
const authenticationToken = require("../middleware/authenticationToken");

router.post("/register", async (req, res) => {
    const { name, email, password, DoB, Gender } = req.body;
    console.log(name, email, password, DoB, Gender);
    try {
        // Check if email exists
        const [emailResult] = await db.query(
            "SELECT * FROM user WHERE Email = ?",
            [email]
        );
        if (emailResult.length > 0) {
            return res.status(400).json({ error: "Email is already in use" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert User account
        await db.query(
            "INSERT INTO user (Name, Email, Password, DoB, Gender) VALUES (?, ?, ?, ?, ?)",
            [name, email, hashedPassword, DoB, Gender]
        );
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Registration failed:", error.message);
        res.status(500).json({
            error: "Internal server error. Please try again later.",
        });
    }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        // Check if email exists
        const [emailResult] = await db.query(
            "SELECT * FROM user WHERE Email = ? LIMIT 1",
            [email]
        );
        if (emailResult.length <= 0) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const account = emailResult[0];

        const isPasswordMatch = await bcrypt.compare(
            password,
            account.Password
        );
        if (!isPasswordMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: account.id, Name: account.Name, Email: account.Email },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h",
            }
        );
        res.json({ token });
    } catch (error) {
        console.error("Login error:", error.message);
        res.status(500).json({
            error: "Internal server error. Please try again later.",
        });
    }
});

router.get("/me", authenticationToken, (req, res) => {
    res.json(req.account);
});

// app.get('/profile', authenticateToken, (req, res) => {
//     res.json({ message: `Welcome, ${req.user.username}` });
// });

// // Middleware to verify JWT
// function authenticateToken(req, res, next) {
//     const authHeader = req.headers['authorization'];
//     const token = authHeader && authHeader.split(' ')[1];

//     if (!token) return res.sendStatus(401);

//     jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//         if (err) return res.sendStatus(403);
//         req.user = user;
//         next();
//     });
// }

module.exports = router;
