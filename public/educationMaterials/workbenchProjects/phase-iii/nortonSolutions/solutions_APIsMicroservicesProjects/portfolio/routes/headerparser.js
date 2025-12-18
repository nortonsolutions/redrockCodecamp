/**
 * Header Parser Microservice Routes
 * Extracted from serverSideProject2_headerParser
 */

const express = require('express');
const router = express.Router();

// Whoami endpoint - parses request headers
router.get('/', (req, res) => {
  const ipaddress = req.headers['x-forwarded-for'] || 
                   req.connection.remoteAddress || 
                   req.socket.remoteAddress ||
                   (req.connection.socket ? req.connection.socket.remoteAddress : null);
  
  const language = req.headers['accept-language'];
  const software = req.headers['user-agent'];
  
  res.json({
    ipaddress: ipaddress,
    language: language,
    software: software
  });
});

module.exports = router;