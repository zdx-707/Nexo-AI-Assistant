require('dotenv').config();
const express = require('express');
const { requestLogger } = require('./logger');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON bodies
app.use(express.json());

// Log every request
app.use(requestLogger);

// Mount routes
app.use('/', routes);

// 404 handler — unknown routes
app.use((req, res) => {
  res.status(404).json({ error: 'المسار غير موجود', path: req.path });
});

// Global error handler — prevents server crash on unexpected errors
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${new Date().toISOString()} — ${err.message}`);
  res.status(err.status || 500).json({
    error: 'خطأ داخلي في السيرفر',
    message: err.message,
  });
});

app.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] السيرفر يعمل على المنفذ ${PORT}`);
});
