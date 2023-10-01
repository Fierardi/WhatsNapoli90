const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
const fs = require("fs"); // Add this line to import the fs module

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(__dirname + "/public"));

// Store connected users
const users = new Map();

// Define a function to save messages to a file
function saveMessage(message) {
    const filePath = path.join(__dirname, "messages.txt");

    // Append the new message to the file
    fs.appendFile(filePath, message + "\n", (err) => {
        if (err) {
            console.error("Error saving message:", err);
        }
    });
}

// Define a function to load messages from a file
function loadMessages(callback) {
    const filePath = path.join(__dirname, "messages.txt");

    // Read messages from the file
    fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
            console.error("Error loading messages:", err);
            callback([]);
        } else {
            const messages = data.trim().split("\n");
            callback(messages);
        }
    });
}

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("join", (userName) => {
        // Store the user's socket ID along with their name
        users.set(socket.id, userName);

        // Broadcast a user joined message to all connected clients
        io.emit("chat message", `${userName} joined the chat`);

        // Load and send previous messages to the connected user
        loadMessages((messages) => {
            messages.forEach((message) => {
                socket.emit("chat message", message);
            });
        });
    });

    socket.on("chat message", (message) => {
        // Get the user's name from the socket ID
        const userName = users.get(socket.id);

        // Create the complete message with the user's name
        const completeMessage = `${userName}: ${message}`;

        // Save the message to the file
        saveMessage(completeMessage);

        // Broadcast the received message to all connected clients
        io.emit("chat message", completeMessage);
    });

    socket.on("disconnect", () => {
        // Remove the user from the map when they disconnect
        const userName = users.get(socket.id);
        users.delete(socket.id);

        console.log(`${userName} disconnected`);
        io.emit("chat message", `${userName} left the chat`);
    });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
