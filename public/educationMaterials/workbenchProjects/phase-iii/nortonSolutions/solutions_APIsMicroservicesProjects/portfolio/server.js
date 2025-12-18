/**
 * Norton Solutions Portfolio Server
 * Consolidated FreeCodeCamp projects in one Express app
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Import route modules
const timestampRoutes = require('./routes/timestamp');
const headerParserRoutes = require('./routes/headerparser');
const urlShortenerRoutes = require('./routes/urlshortener');
const exerciseTrackerRoutes = require('./routes/exercisetracker');
const fileMetadataRoutes = require('./routes/filemetadata');

// Main portfolio homepage
app.get('/', (req, res) => {
  const projects = [
    {
      category: 'APIs and Microservices',
      projects: [
        { name: 'Timestamp Microservice', path: '/api/timestamp', description: 'Convert dates to timestamps and vice versa' },
        { name: 'Request Header Parser', path: '/api/whoami', description: 'Parse request headers for client info' },
        { name: 'URL Shortener', path: '/api/shorturl', description: 'Create short URLs' },
        { name: 'Exercise Tracker', path: '/api/users', description: 'Track user exercises and logs' },
        { name: 'File Metadata', path: '/api/fileanalyse', description: 'Analyze uploaded file metadata' }
      ]
    },
    {
      category: 'Information Security and Quality Assurance',
      projects: [
        { name: 'Advanced Node Authentication', path: '/auth', description: 'Advanced authentication with Passport.js' },
        { name: 'Issue Tracker', path: '/issue-tracker', description: 'Track project issues and bugs' },
        { name: 'Personal Library', path: '/library', description: 'Manage personal book collection' },
        { name: 'Message Board', path: '/message-board', description: 'Anonymous message posting' },
        { name: 'Stock Price Checker', path: '/stock-checker', description: 'Check stock prices and likes' }
      ]
    }
  ];
  
  res.render('index', { 
    title: 'Norton Solutions - FreeCodeCamp Portfolio',
    projects: projects 
  });
});

// API Routes
app.use('/api/timestamp', timestampRoutes);
app.use('/api/whoami', headerParserRoutes);
app.use('/api/shorturl', urlShortenerRoutes);
app.use('/api/users', exerciseTrackerRoutes);
app.use('/api/fileanalyse', fileMetadataRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render('404', { 
    title: '404 - Page Not Found',
    path: req.originalUrl 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { 
    title: '500 - Server Error',
    error: process.env.NODE_ENV === 'production' ? 'Something went wrong!' : err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Norton Solutions Portfolio running on port ${PORT}`);
  console.log(`📁 View all projects at http://localhost:${PORT}`);
});

module.exports = app;