/**
 * File Metadata Routes
 * Simplified version from serverSideProject5_filemetadata
 */

const express = require('express');
const multer = require('multer');
const router = express.Router();

// Configure multer for file upload
const upload = multer({ 
  limits: { fileSize: 10000000 }, // 10MB limit
  storage: multer.memoryStorage()
});

// File upload endpoint
router.post('/', upload.single('upfile'), (req, res) => {
  if (!req.file) {
    return res.json({ error: 'No file uploaded' });
  }
  
  res.json({
    name: req.file.originalname,
    type: req.file.mimetype,
    size: req.file.size
  });
});

module.exports = router;