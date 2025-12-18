/**
 * URL Shortener Routes
 * Simplified version from serverSideProject3_urlshortener
 */

const express = require('express');
const router = express.Router();

// In-memory storage (for demo purposes)
let urlDatabase = {};
let urlCounter = 1;

// POST new URL to shorten
router.post('/new', (req, res) => {
  const originalUrl = req.body.url;
  
  // Basic URL validation
  const urlRegex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
  
  if (!urlRegex.test(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }
  
  const shortUrl = urlCounter++;
  urlDatabase[shortUrl] = originalUrl;
  
  res.json({
    original_url: originalUrl,
    short_url: shortUrl
  });
});

// GET redirect to original URL
router.get('/:short_url', (req, res) => {
  const shortUrl = req.params.short_url;
  const originalUrl = urlDatabase[shortUrl];
  
  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});

module.exports = router;