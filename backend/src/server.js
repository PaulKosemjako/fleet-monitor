const express = require("express");
const cors = require("cors");

const http = require("http");
const { WebSocketServer } = require("ws");
const { initRobotWebSocket } = require("./websocket/robotsWs");

const authRoutes= require("./routes/auth");
const robotRoutes = require("./routes/robots");

const authMiddleware = require("./middleware/authMiddleware");
const {startSimulation} = require("./simulation/robotSimulation");

//const {robotsStreamHandler} = require("./sse/robotStream");

const app = express();
const PORT = process.env.PORT || 4000;

//app.get("/robots/stream", robotsStreamHandler);

//MIddleware
app.use(cors());
app.use(express.json());

//Routes
app.use("/auth", authRoutes);
app.use("/robots", authMiddleware, robotRoutes);

app.get("/health", (req, res) => {
    res.json({status: "ok"});
});


const server = http.createServer(app);

const wss = new WebSocketServer({
    server,
    path: "/ws/robots"
});

initRobotWebSocket(wss);


server.listen(PORT, () => {
    console.log(`API-Server läuft auf Port ${PORT}`);
    startSimulation(2000);
});