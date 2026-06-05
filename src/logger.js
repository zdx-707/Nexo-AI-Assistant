// Middleware: log every incoming request with timestamp and path
function requestLogger(req, res, next) {
  const time = new Date().toISOString();
  console.log(`[${time}] ${req.method} ${req.path}`);
  next();
}

module.exports = { requestLogger };
