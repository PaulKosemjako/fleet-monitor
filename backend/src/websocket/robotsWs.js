const jwt = require("jsonwebtoken");

const JWT_SECRET = "super-secret-fleet-monitor-key";

//Alle verbundenen WebSocket-Clients merken
let clients = [];

//Wird im server.js aufgerufen, um WebSocket-Server zu konfigurieren
function initRobotWebSocket(wss) {
  wss.on("connection", (ws, req) => {
    try {
      //Token aus der URL lesen
      const url = new URL(req.url, "http://localhost");
      const token = url.searchParams.get("token");

      if (!token) {
        console.log("[WS] Verbindung ohne Token, wird geschlossen");
        ws.close(1008, "No token");
        return;
      }

      jwt.verify(token, JWT_SECRET);

      clients.push(ws);
      console.log("[WS] Neuer Client verbunden, total:", clients.length);

      ws.on("close", () => {
        clients = clients.filter((c) => c !== ws);
        console.log("[WS] Client getrennt, total:", clients.length);
      });
    } catch (err) {
      console.error("[WS] Token-Fehler:", err.message);
      ws.close(1008, "Invalid token");
    }
  });
}

//Daten an alle Clients schicken
function broadcastRobotsWS(robots) {
  const payload = JSON.stringify(robots);

  clients.forEach((ws) => {
    if (ws.readyState === 1) {
      ws.send(payload);
    }
  });
}

module.exports = { initRobotWebSocket, broadcastRobotsWS };