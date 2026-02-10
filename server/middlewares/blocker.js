const fs = require('fs');
const path = require('path');

// File paths
const IP_BLOCK_FILE = path.join(__dirname, '../config/remote-addr-block.txt');
const URL_BLOCK_FILE = path.join(__dirname, '../config/url-blocklist.txt');

let blockedIPs = new Set();
let blockedUrlPatterns = [];

// Load blocking rules from files (once on startup)
try {
  // Load IP blocks
  const ipContent = fs.readFileSync(IP_BLOCK_FILE, 'utf8');
  blockedIPs = new Set(
    ipContent.split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('//'))
  );
  
  // Load URL pattern blocks
  const urlContent = fs.readFileSync(URL_BLOCK_FILE, 'utf8');
  blockedUrlPatterns = urlContent.split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'))
    .map(pattern => new RegExp(pattern, 'i'));
    
  console.log(`[BLOCKER] Loaded ${blockedIPs.size} blocked IPs and ${blockedUrlPatterns.length} URL patterns`);
} catch (err) {
  console.error('[BLOCKER] Error loading blocking rules:', err.message);
}

module.exports = function blocker() {
  return function(req, res, next) {
    const remoteAddr = req.ip || req.connection.remoteAddress || 'unknown';
    const targetUrl = req.path;
    
    // Check blocked IPs
    if (blockedIPs.has(remoteAddr)) {
      console.log(`[BLOCKER] Blocked IP: ${remoteAddr} - ${targetUrl}`);
      return res.status(404).end();
    }
    
    // Check blocked URL patterns
    const isBlockedUrl = blockedUrlPatterns.some(pattern => pattern.test(targetUrl));
    if (isBlockedUrl) {
      console.log(`[BLOCKER] Blocked URL: ${remoteAddr} - ${targetUrl}`);
      return res.status(404).end();
    }
    
    next();
  };
};