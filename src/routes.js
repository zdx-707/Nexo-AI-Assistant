const express = require('express');
const router = express.Router();

// GET / — welcome message confirming server is alive
router.get('/', (req, res) => {
  res.json({ message: 'مرحباً! السيرفر حي ويعمل 🚀', status: 'alive' });
});

// GET /health — uptime and current time for health checks
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    time: new Date().toISOString(),
  });
});

module.exports = router;
