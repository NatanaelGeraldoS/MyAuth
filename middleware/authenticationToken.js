const jwt = require("jsonwebtoken");

function authenticationToken(req, res, next) {
    const authenticationHeader = req.headers["authorization"];
    const token = authenticationHeader && authenticationHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Access token missing" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, account) => {
        if (err) return res.status(403).json({ error: "Invalid token" });
        req.account = account;
        next();
    });
}

module.exports = authenticationToken;
