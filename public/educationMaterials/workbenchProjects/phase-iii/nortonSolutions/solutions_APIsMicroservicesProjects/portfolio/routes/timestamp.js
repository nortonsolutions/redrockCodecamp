/**
 * Timestamp Microservice Routes
 * Extracted from serverSideProject1_timestamp
 */

const express = require('express');
const router = express.Router();

// Main timestamp endpoint
router.get('/', (req, res) => {
  res.json({
    "unix": Date.now(),
    "utc": new Date().toUTCString()
  });
});

// Date string parameter endpoint
router.get('/:date_string', (req, res) => {
  const dateString = req.params.date_string;
  let date;
  
  // Check if the date string is a number (unix timestamp)
  if (!isNaN(dateString)) {
    date = new Date(parseInt(dateString));
  } else {
    date = new Date(dateString);
  }
  
  // Check if date is valid
  if (date.toString() === 'Invalid Date') {
    res.json({
      "error": "Invalid Date"
    });
  } else {
    res.json({
      "unix": date.getTime(),
      "utc": date.toUTCString()
    });
  }
});

module.exports = router;