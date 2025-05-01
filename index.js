const express = require("express");
require("dotenv").config();
const path = require("path");

const authRoutes = require("./routes/auth");
const setupTables = require("./database/setupTable");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});

setupTables();
app.use("/api/auth", authRoutes);

app.use(express.static("public_html"));

app.listen(PORT, () =>
    console.log(`Server is running: http://localhost:${PORT}`)
);
