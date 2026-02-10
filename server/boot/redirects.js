module.exports = function(app) {
  var router = app.loopback.Router();

  // IP Blocklist management
  const ipBlocklist = new Set([
    // Add known bad IPs here manually if needed
    // '192.168.1.100',
    // '10.0.0.5'
  ]);

  // Auto-block IPs that make too many suspicious requests
  const ipRequestCount = new Map();
  const AUTO_BLOCK_THRESHOLD = 50; // Block after 50 suspicious requests
  const RESET_INTERVAL = 3600000; // Reset counts every hour

  // Reset request counts periodically
  setInterval(() => {
    ipRequestCount.clear();
    console.log('[IP-BLOCKER] Request counts reset');
  }, RESET_INTERVAL);

  // IP blocking middleware - check before all other routes
  router.use(function(req, res, next) {
    const clientIP = req.ip || 
                     req.connection.remoteAddress || 
                     req.socket.remoteAddress ||
                     (req.connection.socket ? req.connection.socket.remoteAddress :
                     req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0].trim() :
                     'unknown');

    if (ipBlocklist.has(clientIP)) {
      console.log(`[IP-BLOCKED] ${new Date().toISOString()} - Blocked IP: ${clientIP} - Path: ${req.path}`);
      return res.status(404).end('Not Found');
    }

    next();
  });

  // Stats tracking for blocked requests
  const blockedStats = {
    totalBlocked: 0,
    uniqueIPs: new Set(),
    recentRequests: [],
    blockedIPs: ipBlocklist
  };

  // Block suspicious bot requests
  router.get('/en/docs/*', function(req, res) {
    const clientIP = req.ip || 
                     req.connection.remoteAddress || 
                     req.socket.remoteAddress ||
                     (req.connection.socket ? req.connection.socket.remoteAddress :
                     req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0].trim() :
                     'unknown');
    
    const userAgent = req.get('User-Agent') || 'unknown';
    const timestamp = new Date().toISOString();
    const path = req.path;

    // Update stats
    blockedStats.totalBlocked++;
    blockedStats.uniqueIPs.add(clientIP);
    
    // Track request count for auto-blocking
    const currentCount = ipRequestCount.get(clientIP) || 0;
    ipRequestCount.set(clientIP, currentCount + 1);
    
    // Auto-block if threshold reached
    if (currentCount + 1 >= AUTO_BLOCK_THRESHOLD) {
      ipBlocklist.add(clientIP);
      console.log(`[AUTO-BLOCKED] IP ${clientIP} auto-blocked after ${currentCount + 1} suspicious requests`);
    }
    
    // Keep last 100 requests for analysis
    blockedStats.recentRequests.push({
      ip: clientIP,
      path: path,
      userAgent: userAgent,
      timestamp: timestamp,
      requestCount: currentCount + 1
    });
    
    if (blockedStats.recentRequests.length > 100) {
      blockedStats.recentRequests.shift();
    }

    console.log(`[BLOCKED] ${timestamp} - IP: ${clientIP} (${currentCount + 1} requests) - Path: ${path} - UA: ${userAgent}`);
    console.log(`[STATS] Total blocked: ${blockedStats.totalBlocked}, Unique IPs: ${blockedStats.uniqueIPs.size}`);
    
    res.status(404).end('Not Found');
  });

  // Admin endpoint for managing IP blocklist
  router.get('/admin/blocked-stats', function(req, res) {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    res.json({
      totalBlocked: blockedStats.totalBlocked,
      uniqueIPCount: blockedStats.uniqueIPs.size,
      uniqueIPs: Array.from(blockedStats.uniqueIPs),
      recentRequests: blockedStats.recentRequests,
      blockedIPs: Array.from(ipBlocklist),
      autoBlockThreshold: AUTO_BLOCK_THRESHOLD,
      currentRequestCounts: Object.fromEntries(ipRequestCount)
    });
  });

  // Admin endpoint to manually block an IP
  router.post('/admin/block-ip', function(req, res) {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { ip } = req.body;
    if (!ip) {
      return res.status(400).json({ error: 'IP address required' });
    }
    
    ipBlocklist.add(ip);
    console.log(`[MANUAL-BLOCK] Admin manually blocked IP: ${ip}`);
    res.json({ success: true, message: `IP ${ip} blocked`, blockedIPs: Array.from(ipBlocklist) });
  });

  // Admin endpoint to unblock an IP
  router.post('/admin/unblock-ip', function(req, res) {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { ip } = req.body;
    if (!ip) {
      return res.status(400).json({ error: 'IP address required' });
    }
    
    ipBlocklist.delete(ip);
    console.log(`[MANUAL-UNBLOCK] Admin manually unblocked IP: ${ip}`);
    res.json({ success: true, message: `IP ${ip} unblocked`, blockedIPs: Array.from(ipBlocklist) });
  });

  router.get('/nonprofit-project-instructions', function(req, res) {
    res.redirect(
      301,
      'http://forum.freecodecamp.org/t/'
      + 'how-free-code-camps-nonprofits-projects-work/19547'
    );
  });

  router.get('/agile', function(req, res) {
    res.redirect(301, '/pmi-acp-agile-project-managers');
  });

  router.get('/privacy', function(req, res) {
    res.redirect(
      301,
      'http://forum.freecodecamp.org/t/free-code-camp-privacy-policy/19545'
    );
  });

  router.get('/learn-to-code', function(req, res) {
    res.redirect(301, '/map');
  });

  router.get('/field-guide/*', function(req, res) {
    res.redirect(302, 'http://forum.freecodecamp.org');
  });

  app.use(router);
};
