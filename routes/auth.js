const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../database/db");
const apiAuthenticationToken = require("../middleware/apiAuthenticationToken");

router.post("/register", async (req, res) => {
    const { name, email, password, dob, gender } = req.body;
    if (!name || name.trim().length < 2) {
        return res
            .status(400)
            .json({ message: "Name must be at least 2 characters." });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
        return res.status(400).json({ message: "Invalid email format." });
    }

    // Date of Birth validation
    const now = new Date();
    const dobDate = new Date(dob);
    if (!dob || dobDate > now) {
        return res
            .status(400)
            .json({ message: "Date of birth must be in the past." });
    }

    // Gender validation
    if (!gender || (gender !== "Male" && gender !== "Female")) {
        return res.status(400).json({ message: "Gender must be selected." });
    }

    // Password confirmation check
    if (!password || password.length < 6) {
        return res
            .status(400)
            .json({ message: "Password must be at least 6 characters." });
    }

    try {
        // Check if email exists
        const [emailResult] = await db.query(
            "SELECT * FROM user WHERE Email = ?",
            [email]
        );
        if (emailResult.length > 0) {
            return res
                .status(400)
                .json({ message: "Email already registered" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert User account
        await db.query(
            "INSERT INTO user (Name, Email, Password, DoB, Gender) VALUES (?, ?, ?, ?, ?)",
            [name, email, hashedPassword, dob, gender]
        );
        res.status(201).json({ message: "Registration successful." });
    } catch (error) {
        console.error("Registration failed:", error.message);
        res.status(500).json({
            message: "Internal server error. Please try again later.",
        });
    }
});

router.post("/login", async (req, res) => {
    const { email, password, rememberMe } = req.body;
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
        // Set the expired if the user select remember me to 14 days else 1 hours
        const expiresIn = rememberMe ? "14d" : "1h";

        const token = jwt.sign(
            { id: account.id, Name: account.Name, Email: account.Email },
            process.env.JWT_SECRET,
            {
                expiresIn: expiresIn,
            }
        );
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "Strict",
            maxAge: 14 * 24 * 60 * 60 * 1000,
        });
        res.json({ token });
    } catch (error) {
        console.error("Login error:", error.message);
        res.status(500).json({
            message: "Internal server error. Please try again later.",
        });
    }
});

router.get("/me", apiAuthenticationToken, (req, res) => {
    res.json(req.account);
});

router.get("/account-information", apiAuthenticationToken, async (req, res) => {
    try {
        const [userResult] = await db.query(
            "SELECT id, Name, Email, DoB, Gender FROM user WHERE id = ? LIMIT 1",
            [req.account.id]
        );
        if (userResult.length <= 0) {
            return res
                .status(404)
                .json({ message: "Account Information not found." });
        }
        res.json(userResult[0]);
    } catch (error) {
        console.error("Get Information Error:", error.message);
        res.status(500).json({
            message: "Internal Server error. Please try again later.",
        });
    }
});

router.get("/me", apiAuthenticationToken, (req, res) => {
    res.json(req.account);
});

module.exports = router;
