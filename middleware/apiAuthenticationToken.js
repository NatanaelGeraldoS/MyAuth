const jwt = require("jsonwebtoken");

function apiAuthenticationToken(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "Access token missing" });
    }
    try {
        const account = jwt.verify(token, process.env.JWT_SECRET);
        req.account = account;
        next();
    } catch (err) {
        res.clearCookie("token");
        return res.status(403).json({ message: "Invalid or expired token" });
    }
}

module.exports = apiAuthenticationToken;
