const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const roomHandler = require("./rooms");

const port = 8080;
const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

const reset = "\x1b[0m";
const blue = "\x1b[34m";
const green = " \x1b[33m";
const red = "\x1b[31m";
const hidden = "\x1b[8m";

app.get("/", (req, res) => {
    res.send("hello");
});

io.on("connection", (socket) => {
    roomHandler(socket);

    console.log(`${green}[status]:user is connected.${reset}`);

    socket.on("disconnect", () => {
        console.log(`${red} [status]:user is disconnected.${reset}`);
    });
});

server.listen(port, () => {
    console.log(`${hidden}   ${reset}`);
    console.log(`${blue}Server running on port:${port}`, reset);
});
