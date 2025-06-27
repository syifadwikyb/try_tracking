const express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Konfigurasi EJS dan folder public
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

// Routing
app.get("/", (req, res) => {
    res.render("index");
});

// Event socket ketika client terkoneksi
io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("send-location", (data) => {
        io.emit("receiveLocation", { id: socket.id, ...data });
    });

    socket.on("disconnect", () => {
        io.emit("Client disconnected", socket.id);
        console.log("Client disconnected:", socket.id);
    });
});

// Menjalankan server
server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
