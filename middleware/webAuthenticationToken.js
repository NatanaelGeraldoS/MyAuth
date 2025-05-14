const jwt = require("jsonwebtoken");

function webAuthenticationToken(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect("/");
    }
    try {
        const account = jwt.verify(token, process.env.JWT_SECRET);
        req.account = account;
        next();
    } catch (err) {
        res.clearCookie("token");
        return res.redirect("/");
    }
}

module.exports = webAuthenticationToken;
