/**
 * Final error handler - prevents unhandled errors from crashing the app
 * This should be the LAST error middleware registered
 */

module.exports = function finalErrorHandler() {
  return function(err, req, res, next) {
    // Log error details
    console.error('[FINAL-ERROR-HANDLER]', {
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      ip: req.ip || req.connection.remoteAddress,
      timestamp: new Date().toISOString()
    });

    // If headers already sent, delegate to default Express error handler
    if (res.headersSent) {
      return next(err);
    }

    // Send generic error response
    const statusCode = err.statusCode || err.status || 500;
    const message = process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message;

    res.status(statusCode).json({
      error: message,
      timestamp: new Date().toISOString()
    });
  };
};
