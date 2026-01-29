const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const router = express.Router();

const JWT_SECRET = "super-secret-fleet-monitor-key";

//Test
router.post("/login", async (req, res) => {
    const {email, password} = req.body;

    if (!email || !password) {
        return res
            .status(400)
            .json({message: "E-Mail und Password werden benötigt"});
    }

    try {
        //1. User aus DB
        const result = await db.query(
            "SELECT id, email, password_hash FROM users WHERE email = $1", [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({message: "Ungültige Zugangsdaten"});
        }

        const user = result.rows[0];

        //2. Passwort prüfen
        const isValid = await bcrypt.compare(password, user.password_hash);

        if (!isValid) {
            return res.status(401).json({message: "Ungültige Zugangsdaten!"});
        }

        //3. JWT erzeugen
        const token = jwt.sign(
            {userId: user.id, email: user.email},
            JWT_SECRET,
            {expiresIn: "1h"}
        );

        //4. Token und User zurückgeben
        return res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
            },
        });
    } catch (err) {
        console.error("Login error!:", err);
        return res.status(500).json({message: "Internal server error!"});
    }
});

module.exports = router;