const debug = require('debug')('rrcc:bot-blocker');

// Patterns that indicate bot/scraper activity - focused on the immediate problem
const BLOCKED_PATTERNS = [
  /^\/en\/docs\//i,  // Block MDN-style documentation paths
  /developer\.mozilla\.org/i,
];

module.exports = function(options = {}) {
  return function botBlockerMiddleware(req, res, next) {
    const { url } = req;

    // Check for suspicious patterns in URL
    const isSuspiciousUrl = BLOCKED_PATTERNS.some(pattern => pattern.test(url));

    // Block suspicious requests
    if (isSuspiciousUrl) {
      debug(`Blocked suspicious URL: ${url}`);
      res.status(404).end('Not Found');
      return;
    }

    next();
  };
};