const express = require('express');
const router = express.Router();

router.get('/test', (req, res) => {
    res.send('Chat route is working!');
});

module.exports = router; // ✅ Ensure you are exporting `router`
