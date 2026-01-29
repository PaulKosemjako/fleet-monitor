const jwt = require("jsonwebtoken");

const JWT_SECRET = "super-secret-fleet-monitor-key";

let clients = [];

function robotsStreamHandler(req, res) {
    const {token} = req.query;

    if (!token) {
        return res.status(401).end();
    }

    try {
        //Token prüfen
        jwt.verify(token, JWT_SECRET);
    } catch (err) {
        console.error("SSE token verify error!:", err.message);
        return res.status(401).end();
    }

    //SSE Header setzen
    res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
    });

    res.write("\n"); // Verbindung öffnen

    const client = {res};
    clients.push(client);

    console.log("[SSE] Client disconnected, total:", clients.length);

    //Wenn Verbindung geschlossen wird, aus der Liste entfernen
    req.on("close", () => {
        clients = clients.filter((c) => c != client);
        console.log("[SSE] Client disconnected, total:", clients.length);
    });
}

//Wird von der Simulation aufgerufen um neue Daten an alle zu schicken
function broadcastRobots(robots) {
    const data = JSON.stringify(robots);
    clients.forEach((client) => {
        client.res.write(`data: ${data}\n\n`);
    });
}

module.exports = {robotsStreamHandler, broadcastRobots};