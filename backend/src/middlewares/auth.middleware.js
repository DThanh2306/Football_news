const jwt = require("jsonwebtoken");
const JSend = require("../jsend");

function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json(JSend.fail("Thiếu hoặc sai token"));
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json(JSend.fail("Token không hợp lệ hoặc đã hết hạn"));
    }
}

module.exports = {
    verifyToken
};
