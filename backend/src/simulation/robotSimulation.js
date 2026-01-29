const db = require("../config/db");
const {broadcastRobotsWS} = require("../websocket/robotsWs");

//const { broadcastRobots } = require("../sse/robotStream");



async function moveRobotsStep() {
  try {
    //IDs und Positionen laden
    const result = await db.query(
      "SELECT id, lat, lon FROM robots"
    );

    const robots = result.rows;

    //Jeden Roboter bewegen
    for (const robot of robots) {
      const deltaLat = (Math.random() - 0.5) * 0.005;
      const deltaLon = (Math.random() - 0.5) * 0.005;

      const newLat = robot.lat + deltaLat;
      const newLon = robot.lon + deltaLon;

      await db.query(
        `UPDATE robots
         SET lat = $1,
             lon = $2,
             status = 'moving',
             updated_at = NOW()
         WHERE id = $3`,
        [newLat, newLon, robot.id]
      );
    }

    //Neue Liste holen (alle Daten)
    const updatedResult = await db.query(
      "SELECT id, name, status, lat, lon, updated_at FROM robots ORDER BY id"
    );

    const updatedRobots = updatedResult.rows;

    //Live an Frontend senden
    //broadcastRobots(updatedRobots);

    broadcastRobotsWS(updatedRobots);

    console.log("[SIM] Update broadcasted at", new Date().toISOString());
  } catch (err) {
    console.error("[SIM] Error while moving robots:", err);
  }
}

function startSimulation(intervalMs = 2000) {
  console.log("[SIM] Starting robot simulation with interval", intervalMs, "ms");
  setInterval(moveRobotsStep, intervalMs);
}

module.exports = {
  startSimulation,
};
