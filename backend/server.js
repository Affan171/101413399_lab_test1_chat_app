require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Routes
app.use("/auth", authRoutes);
app.use("/chat", chatRoutes);

// Store online users (Socket ID → Username)
const users = {};

// 📌 Socket.io Logic
io.on("connection", (socket) => {
    console.log(`✅ User connected: ${socket.id}`);

    // Default username (until updated)
    users[socket.id] = `User_${socket.id.substring(0, 5)}`;

    // 📌 Send the updated user list to all clients
    io.emit("updateUserList", users);
    console.log("📢 User List Updated:", users);

    // 📌 Handle user updating their username
    socket.on("setUsername", (username) => {
        if (username) {
            users[socket.id] = username;
            io.emit("updateUserList", users);
            console.log(`📝 User ${socket.id} updated username to: ${username}`);
        }
    });

    // 📌 Handle joining a room
    socket.on("joinRoom", (room) => {
        socket.join(room);
        console.log(`🚪 ${users[socket.id]} joined room: ${room}`);
        socket.to(room).emit("chatMessage", {
            from: "System",
            message: `${users[socket.id]} joined.`,
        });
    });

    // 📌 Handle leaving a room
    socket.on("leaveRoom", (room) => {
        socket.leave(room);
        console.log(`🚪 ${users[socket.id]} left room: ${room}`);
        socket.to(room).emit("chatMessage", {
            from: "System",
            message: `${users[socket.id]} left.`,
        });
    });

    // 📌 Handle public messages in a room
    socket.on("chatMessage", (data) => {
        console.log(`💬 Message in ${data.room} from ${users[socket.id]}: ${data.message}`);
        io.to(data.room).emit("chatMessage", {
            from: users[socket.id],
            message: data.message,
        });
    });

    // 📌 Handle private messages
    socket.on("privateMessage", (data) => {
        const { to, message } = data;
        
        // Find socket ID by username
        const recipientSocket = Object.keys(users).find(socketId => users[socketId] === to);

        if (recipientSocket) {
            console.log(`📩 Private message from ${users[socket.id]} to ${to}: ${message}`);
            io.to(recipientSocket).emit("privateMessage", {
                from: users[socket.id],
                message,
            });
        } else {
            console.log(`❌ Private message failed. User not found: ${to}`);
        }
    });

    // 📌 Handle typing indicator
    socket.on("typing", (room) => {
        socket.to(room).emit("typing");
    });

    // 📌 Handle user disconnecting
    socket.on("disconnect", () => {
        console.log(`❌ User disconnected: ${socket.id}`);
        delete users[socket.id]; // Remove user from list
        io.emit("updateUserList", users); // Update the user list
        console.log("📢 User List Updated:", users);
    });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
    console.log(`🚀 Server running on port ${PORT}`)
);
