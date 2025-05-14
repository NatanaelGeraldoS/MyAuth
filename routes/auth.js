const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const apiAuthenticationToken = require("../middleware/apiAuthenticationToken");
const sendResetEmail = require("../util/mailer");
const { getRows, runQuery } = require("../DBUtil");

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
        const emailResult = await getRows(
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
        await runQuery(
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
        const emailResult = await getRows(
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
        const userResult = await getRows(
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

router.post("/forgotPassword", async (req, res) => {
    const { email } = req.body;
    try {
        // Check if email exists
        const emailResult = await getRows(
            "SELECT * FROM user WHERE Email = ? LIMIT 1",
            [email]
        );
        if (emailResult.length <= 0) {
            return res.status(401).json({
                message: "Invalid email! Email not registered on our system.",
            });
        }

        const account = emailResult[0];

        const token = jwt.sign(
            { id: account.id, Name: account.Name, Email: account.Email },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h",
            }
        );

        await runQuery(
            "INSERT INTO password_reset (user_id, token) VALUES (?, ?)",
            [account.id, token]
        );

        const resetLink = `${process.env.WEB_DOMAIN}/resetPassword?q=${token}`;
        const to = account.Email;
        const subject = "Reset Your Password";
        const html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Reset Password</title>
                </head>
                <body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
                    <div style="padding: 20px;">
                        <h2 style="color: #444;">Reset Password</h2>
                        <p>Hello ${account.Name},</p>
                        <p>Click the link below to reset your password:</p>
                        <p>
                            <a href="${resetLink}" style="background-color: #4285f4; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
                        </p>
                        <p>Or copy and paste this URL into your browser:</p>
                        <p style="word-break: break-all;">${resetLink}</p>
                        <p>This link will expire in 24 hours.</p>
                        <p>If you didn't request a password reset, please ignore this email.</p>
                        <br>
                        <p>Thank you,<br>MyAuth Application</p>
                    </div>
                </body>
                </html>
            `;
        sendResetEmail(to, subject, html);

        res.status(200).json({ message: "Email successfully sent" });
    } catch (error) {
        console.error("Login error:", error.message);
        res.status(500).json({
            message: "Internal server error. Please try again later.",
        });
    }
});

router.post("/resetPassword", async (req, res) => {
    const { token, password } = req.body;
    try {
        const account = jwt.verify(token, process.env.JWT_SECRET);

        const passwordResetResult = await getRows(
            "SELECT * FROM password_reset WHERE token = ? AND used = FALSE LIMIT 1",
            [token]
        );
        if (passwordResetResult.length <= 0) {
            return res.status(400).json({
                message: "Invalid or expired token",
            });
        }

        // Check if email exists
        const [emailResult] = await getRows(
            "SELECT * FROM user WHERE Email = ? LIMIT 1",
            [account.Email]
        );
        if (emailResult.length <= 0) {
            return res.status(401).json({
                message: "Invalid email! Email not registered on our system.",
            });
        }
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert User account
        await runQuery("UPDATE user SET password = ? WHERE id = ?", [
            hashedPassword,
            account.id,
        ]);

        await runQuery("UPDATE password_reset SET used = TRUE WHERE id = ?", [
            passwordResetResult[0].id,
        ]);

        res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
        console.error("Login error:", error.message);
        res.status(400).json({ message: "Invalid or expired token" });
    }
});

module.exports = router;
