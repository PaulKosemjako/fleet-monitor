const { json } = require("express");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "super-secret-fleet-monitor-key";

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({message: "Kein Token vorhanden!"});
    }

    const parts = authHeader.split(" ");

    if (parts.length != 2 || parts[0] !== "Bearer") {
        return res.status(401).json({message: "Ungültiges Authrization Format!"});
    }

    const token = parts[1];

    try {
        // Token prüfen
        const decoded = jwt.verify(token, JWT_SECRET);

        //User sichern
        req.user = {
            id: decoded.userId,
            email: decoded.email,
        };

        return next();
    } catch (err) {
        console.error("JWT verify error!:", err.message);
        return res.status(401).json({message: "Ungültiges oder abgelaufenes Token!"});
    }
}

module.exports = authMiddleware;