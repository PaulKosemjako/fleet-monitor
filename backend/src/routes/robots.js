const express = require("express");
const router = express.Router();
const db = require("../config/db");

let robots = [
    {id: 1, name: "Alpha", status: "idle", lat: 52.52, lon: 13.405, updated_at: new Date()},
    {id: 2, name: "Beta", status: "moving", lat: 52.521, lon: 13.39, updated_at: new Date()},
];

// GET /robots
router.get("/", async (req, res) => {
    try {
        const result = await db.query(
            "SELECT id, name, status, lat, lon, updated_at FROM robots ORDER BY id"
        );
        res.json(result.rows);
    } catch (err) {
        console.error("Loading error!:", err);
        res.status(500).json({message: "Internal server error"})
    } 
    
});

// POST /robots/:id/move
router.post("/:id/move", async (req, res) => {
    const id = parseInt(req.params.id, 10);

    if (Number.isNaN(id)) {
        return res.status(400).json({message: "Invalid robot id!"})
    }

    try {
        // 1. Aktuellen Roboter aus DB abrufen
        const robotResult = await db.query(
            "SELECT id, name, status, lat, lon, updated_at FROM robots WHERE id = $1", [id]
        );

        if (robotResult.rows.length === 0) {
            return res.status(404).json({message: "Robot not found!"});
        }

        const robot = robotResult.rows[0];

        //2. Neue zufällige Position berechnen
        const deltaLat = (Math.random() - 0.5) * 0.01;
        const deltaLon = (Math.random() - 0.5) * 0.01;

        const newLat = robot.lat + deltaLat;
        const newLon = robot.lon + deltaLon;

        //3. Roboter in der DB updaten
        const updateResult = await db.query(
            `UPDATE robots
            SET lat = $1,
                lon = $2,
                status = 'moving',
                updated_at = NOW()
            WHERE id = $3
            RETURNING id, name, status, lat, lon, updated_at`,
            [newLat, newLon, id]
        );

        const updatedRobot = updateResult.rows[0];

        //4. Aktualisierten Roboter zurückgeben
        return res.json(updatedRobot);
    } catch (err) {
        console.error("Error by moving robot!:", err);
        return res.status(500).json({message: "Internal server error!"});
    }
});

module.exports = router;