const express = require("express");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const path = require("path");

const authRoutes = require("./routes/auth");
const webAuthenticationToken = require("./middleware/webAuthenticationToken");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.get("/dashboard", webAuthenticationToken, (req, res) => {
    res.render("dashboard", {
        title: "Dashboard",
        scripts: ["./js/dashboard.js"],
        account: req.account,
    });
});

app.get("/logout", (req, res) => {
    res.clearCookie("token");
    return res.redirect("/");
});

app.get("/", (req, res) => {
    const token = req.cookies.token;
    if (token) {
        return res.redirect("/dashboard");
    }
    res.render("login", {
        title: "Login",
        scripts: ["./js/login.js"],
    });
});

app.get("/register", (req, res) => {
    const token = req.cookies.token;
    if (token) {
        return res.redirect("/dashboard");
    }
    res.render("register", {
        title: "Register",
        scripts: ["./js/register.js"],
    });
});

app.get("/forgotPassword", (req, res) => {
    const token = req.cookies.token;
    if (token) {
        return res.redirect("/dashboard");
    }
    res.render("forgotPassword", {
        title: "Forgot Password",
        scripts: ["./js/forgotPassword.js"],
    });
});

app.get("/resetPassword", (req, res) => {
    const token = req.cookies.token;
    if (token) {
        return res.redirect("/dashboard");
    }

    const resetToken = req.query.q;
    try {
        res.render("resetPassword", {
            title: "Reset Password",
            scripts: ["./js/resetPassword.js"],
            token: resetToken,
        });
    } catch (err) {
        console.log(err);
        return res.redirect("/?reset=expired");
    }
});

app.use("/api/auth", authRoutes);

app.use(express.static("public_html"));

app.listen(PORT, () =>
    console.log(`Server is running: http://localhost:${PORT}`)
);
