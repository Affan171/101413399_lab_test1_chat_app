const express = require('express');
const GroupMessage = require('../models/GroupMessage');
const PrivateMessage = require('../models/PrivateMessage');

const router = express.Router();

// Get all messages for a specific room
router.get('/room/:roomName', async (req, res) => {
    try {
        const messages = await GroupMessage.find({ room: req.params.roomName });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Send a new message to a group
router.post('/room/:roomName', async (req, res) => {
    try {
        const { from_user, message } = req.body;

        const newMessage = new GroupMessage({
            from_user,
            room: req.params.roomName,
            message
        });

        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Send a private message
router.post('/private', async (req, res) => {
    try {
        const { from_user, to_user, message } = req.body;

        const newMessage = new PrivateMessage({ from_user, to_user, message });
        await newMessage.save();

        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
