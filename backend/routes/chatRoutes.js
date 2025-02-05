const express = require("express");
const GroupMessage = require("../models/GroupMessage");
const PrivateMessage = require("../models/PrivateMessage");

const router = express.Router();

// 📌 Get all messages for a specific room (Group Chat)
router.get("/room/:roomName", async (req, res) => {
    try {
        const messages = await GroupMessage.find({ room: req.params.roomName }).sort({ timestamp: 1 });
        res.json(messages);
    } catch (error) {
        console.error("Error fetching room messages:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// 📌 Send a new message to a group
router.post("/room/:roomName", async (req, res) => {
    try {
        const { from_user, message } = req.body;

        if (!from_user || !message) {
            return res.status(400).json({ error: "Sender and message cannot be empty" });
        }

        const newMessage = new GroupMessage({
            from_user,
            room: req.params.roomName,
            message,
            timestamp: new Date(),
        });

        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (error) {
        console.error("Error saving group message:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// 📌 Send a private message
router.post("/private", async (req, res) => {
    try {
        const { from_user, to_user, message } = req.body;

        if (!from_user || !to_user || !message) {
            return res.status(400).json({ error: "Sender, receiver, and message cannot be empty" });
        }

        const newMessage = new PrivateMessage({
            from_user,
            to_user,
            message,
            timestamp: new Date(),
        });

        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (error) {
        console.error("Error saving private message:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// 📌 Get private messages between two users
router.get("/private/:fromUser/:toUser", async (req, res) => {
    try {
        const messages = await PrivateMessage.find({
            $or: [
                { from_user: req.params.fromUser, to_user: req.params.toUser },
                { from_user: req.params.toUser, to_user: req.params.fromUser },
            ],
        }).sort({ timestamp: 1 });

        res.json(messages);
    } catch (error) {
        console.error("Error fetching private messages:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
