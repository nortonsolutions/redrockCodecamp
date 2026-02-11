/**
 * Norton Solutions Portfolio Boot Integration
 * Provides unified portfolio access with authentication via loopback boot
 */

const path = require('path');
const express = require('express');
const { parse: parseUrl } = require('url');
const { ifNoUserRedirectTo } = require('../utils/middleware');

module.exports = function(app) {
  // Authentication middleware
  const portfolioAuth = ifNoUserRedirectTo('/signin', 'You must be signed in to access the project portfolio.');
  
  // Base path to all solutions
  const solutionsPath = path.join(__dirname, '../../public/educationMaterials/workbenchProjects/phase-iii/nortonSolutions');
  
  // Create routers with clear naming
  const authRouter = app.loopback.Router();          // Requires authentication
  
  // Setup static file serving for authenticated routes
  setupStaticRoutes(authRouter, solutionsPath);
  
  // Setup API routes (no authentication required)
  setupPublicAPIRoutes(authRouter);
  
  // Setup Advanced Project API integration
  setupAdvancedProjectAPIs(authRouter, solutionsPath);
  
  // Portfolio homepage
  authRouter.get('/', (req, res) => {
    const portfolioData = {
      title: 'Norton Solutions - FreeCodeCamp Portfolio',
      user: req.user,
      totalProjects: 22,
      projects: [
        {
          id: 'apis',
          name: 'APIs and Microservices',
          description: 'Backend API development and microservices architecture',
          icon: '🚀',
          path: '/portfolio/apis',
          projects: [
            { 
              name: 'Timestamp Microservice', 
              path: '/portfolio/api/timestamp', 
              description: 'Convert dates to timestamps and vice versa',
              demoUrl: '/portfolio/api/timestamp',
              testUrl: '/portfolio/api/timestamp/2015-12-25'
            },
            { 
              name: 'Request Header Parser', 
              path: '/portfolio/api/whoami-demo', 
              description: 'Parse request headers for client info',
              demoUrl: '/portfolio/api/whoami-demo', 
              testUrl: '/portfolio/api/whoami'
            },
            { 
              name: 'URL Shortener', 
              path: '/portfolio/api/shorturl', 
              description: 'Create and manage short URLs',
              demoUrl: '/portfolio/api/shorturl',
              testUrl: '/portfolio/api/shorturl/new'
            },
            { 
              name: 'Exercise Tracker', 
              path: '/portfolio/api/exercise', 
              description: 'Track user exercises and logs',
              demoUrl: '/portfolio/api/exercise',
              testUrl: '/portfolio/api/exercise/log?username=demo_user'
            },
            { 
              name: 'File Metadata Analyzer', 
              path: '/portfolio/api/fileanalyse', 
              description: 'Analyze uploaded file metadata',
              demoUrl: '/portfolio/api/fileanalyse',
              testUrl: '/portfolio/api/fileanalyse'
            }
          ]
        },
        {
          id: 'advanced',
          name: 'Information Security & Quality Assurance', 
          description: 'Advanced authentication, security, and testing practices',
          icon: '🔒',
          path: '/portfolio/advanced',
          projects: [
            { name: 'Advanced Authentication', path: '/portfolio/advanced/auth', description: 'Passport.js authentication with sessions' },
            { name: 'BCrypt Security', path: '/portfolio/advanced/bcrypt', description: 'Password hashing and security' },
            { name: 'Information Security', path: '/portfolio/advanced/infosec', description: 'Security headers and practices' },
            { name: 'Mocha & Chai Testing', path: '/portfolio/advanced/testing', description: 'Unit and functional testing' },
            { name: 'Issue Tracker', path: '/portfolio/advanced/issuetracker', description: 'Project issue tracking system' },
            { name: 'Personal Library', path: '/portfolio/advanced/library', description: 'Book management system' },
            { name: 'Message Board', path: '/portfolio/advanced/messageboard', description: 'Anonymous message posting' },
            { name: 'Metric Converter', path: '/portfolio/advanced/converter', description: 'Imperial/Metric conversion tool' },
            { name: 'Stock Price Checker', path: '/portfolio/advanced/stocks', description: 'Stock price tracking with likes' }
          ]
        },
        {
          id: 'react',
          name: 'React Frontend Projects',
          description: 'Interactive frontend applications with React.js',
          icon: '⚛️',
          path: '/portfolio/react',
          projects: [
            { name: 'Random Quote Machine', path: '/portfolio/react/quotes', description: 'Inspirational quote generator' },
            { name: 'Markdown Previewer', path: '/portfolio/react/markdown', description: 'Live markdown preview editor' },
            { name: 'Drum Machine', path: '/portfolio/react/drums', description: 'Interactive drum pad machine' },
            { name: 'JavaScript Calculator', path: '/portfolio/react/calculator', description: 'Full-featured calculator' },
            { name: 'Pomodoro Clock', path: '/portfolio/react/pomodoro', description: 'Productivity timer application' },
            { name: 'Additional React Project', path: '/portfolio/react/extra', description: 'Bonus React implementation' }
          ]
        },
        {
          id: 'basic',
          name: 'Basic Node and Express',
          description: 'Fundamental Node.js and Express.js concepts',
          icon: '📦',
          path: '/portfolio/basic',
          projects: [
            { name: 'Basic Node & Express', path: '/portfolio/basic', description: 'Fundamental Node.js and Express concepts' }
          ]
        },
        {
          id: 'mongo',
          name: 'MongoDB and Mongoose',
          description: 'Database operations with MongoDB and Mongoose ODM',
          icon: '🍃', 
          path: '/portfolio/mongo',
          projects: [
            { name: 'MongoDB & Mongoose', path: '/portfolio/mongo', description: 'Database CRUD operations and modeling' }
          ]
        }
      ]
    };
    
    res.render('portfolio/index', portfolioData);
  });

  // API Category Routes
  authRouter.get('/apis', (req, res) => {
    const apiProjects = [
      { 
        name: 'Timestamp Microservice', 
        path: '/portfolio/api/timestamp', 
        project: 'serverSideProject1_timestamp',
        demoUrl: '/portfolio/api/timestamp',
        testUrl: '/portfolio/api/timestamp/2015-12-25'
      },
      { 
        name: 'Request Header Parser', 
        path: '/portfolio/api/whoami-demo', 
        project: 'serverSideProject2_headerParser',
        demoUrl: '/portfolio/api/whoami-demo',
        testUrl: '/portfolio/api/whoami'
      },
      { 
        name: 'URL Shortener', 
        path: '/portfolio/api/shorturl', 
        project: 'serverSideProject3_urlshortener',
        demoUrl: '/portfolio/api/shorturl',
        testUrl: '/portfolio/api/shorturl/new'
      },
      { 
        name: 'Exercise Tracker', 
        path: '/portfolio/api/exercise', 
        project: 'serverSideProject4_exercisetracker',
        demoUrl: '/portfolio/api/exercise',
        testUrl: '/portfolio/api/exercise/log?username=demo_user'
      },
      { 
        name: 'File Metadata Analyzer', 
        path: '/portfolio/api/fileanalyse', 
        project: 'serverSideProject5_filemetadata',
        demoUrl: '/portfolio/api/fileanalyse',
        testUrl: '/portfolio/api/fileanalyse'
      }
    ];
    
    res.render('portfolio/category', {
      title: 'APIs and Microservices - Portfolio',
      category: 'APIs and Microservices',
      description: 'Backend development, RESTful APIs, and microservices architecture',
      projects: apiProjects,
      user: req.user
    });
  });

  // Demo Pages (Authenticated)
  authRouter.get('/api/timestamp', (req, res) => {
    res.redirect('/portfolio/api/serverSideProject1_timestamp/views/index.html');
  });
  
  authRouter.get('/api/whoami-demo', (req, res) => {
    res.redirect('/portfolio/api/serverSideProject2_headerParser/views/index.html');
  });
  
  authRouter.get('/api/exercise', (req, res) => {
    res.redirect('/portfolio/api/serverSideProject4_exercisetracker/views/index.html');
  });

  authRouter.get('/api/shorturl', (req, res) => {
    res.redirect('/portfolio/api/serverSideProject3_urlshortener/views/index.html');
  });

  // Advanced Category Routes
  authRouter.get('/advanced', (req, res) => {
    const advancedProjects = [
      { name: 'Advanced Authentication', path: '/portfolio/advanced/auth', project: 'advanced_advancednode' },
      { name: 'BCrypt Security', path: '/portfolio/advanced/bcrypt', project: 'advanced-bcrypt' },
      { name: 'Information Security', path: '/portfolio/advanced/infosec', project: 'advanced-infosec' },
      { name: 'Mocha & Chai Testing', path: '/portfolio/advanced/testing', project: 'advanced-mochachai' },
      { name: 'Issue Tracker', path: '/portfolio/advanced/issuetracker', project: 'advancedProject-issuetracker' },
      { name: 'Personal Library', path: '/portfolio/advanced/library', project: 'advancedProject-library' },
      { name: 'Message Board', path: '/portfolio/advanced/messageboard', project: 'advancedProject-messageboard' },
      { name: 'Metric Converter', path: '/portfolio/advanced/converter', project: 'advancedProject-metricimpconverter' },
      { name: 'Stock Price Checker', path: '/portfolio/advanced/stocks', project: 'advancedProject-stockchecker' }
    ];
    
    res.render('portfolio/category', {
      title: 'Information Security & QA - Portfolio',
      category: 'Information Security & Quality Assurance',
      description: 'Advanced authentication, security headers, and testing practices',
      projects: advancedProjects,
      user: req.user
    });
  });

  // Individual Advanced Project Routes
  authRouter.get('/advanced/auth*', (req, res) => {
    res.writeHead(302, { 'Location': '/educationMaterials/workbenchProjects/phase-iii/nortonSolutions/solutions_advancedServerSideProjects/advanced_advancednode/' });
    res.end();
  });

  authRouter.get('/advanced/bcrypt*', (req, res) => {
    res.writeHead(302, { 'Location': '/educationMaterials/workbenchProjects/phase-iii/nortonSolutions/solutions_advancedServerSideProjects/advanced-bcrypt/' });
    res.end();
  });

  authRouter.get('/advanced/infosec*', (req, res) => {
    res.writeHead(302, { 'Location': '/educationMaterials/workbenchProjects/phase-iii/nortonSolutions/solutions_advancedServerSideProjects/advanced-infosec/' });
    res.end();
  });

  authRouter.get('/advanced/testing*', (req, res) => {
    res.writeHead(302, { 'Location': '/educationMaterials/workbenchProjects/phase-iii/nortonSolutions/solutions_advancedServerSideProjects/advanced-mochachai/' });
    res.end();
  });

  // Live Advanced Project Demos (with integrated APIs)
  authRouter.get('/advanced/issuetracker*', (req, res) => {
    res.redirect('/portfolio/advanced/advancedProject-issuetracker/views/index.html');
  });

  authRouter.get('/advanced/library*', (req, res) => {
    res.redirect('/portfolio/advanced/advancedProject-library/views/index.html');
  });

  authRouter.get('/advanced/messageboard', (req, res) => {
    res.redirect('/portfolio/advanced/advancedProject-messageboard/views/index.html');
  });

  authRouter.get('/advanced/messageboard/api/:board/', (req, res) => {
    res.redirect('/portfolio/advanced/advancedProject-messageboard/views/board.html');
  });

  authRouter.get('/advanced/messageboard/api/:board/:threadid', (req, res) => {
    res.redirect('/portfolio/advanced/advancedProject-messageboard/views/thread.html');
  });



  authRouter.get('/advanced/converter*', (req, res) => {
    res.redirect('/portfolio/advanced/advancedProject-metricimpconverter/views/index.html');
  });

  authRouter.get('/advanced/stocks*', (req, res) => {
    res.redirect('/portfolio/advanced/advancedProject-stockchecker/views/index.html');
  });

  // React Category Routes
  authRouter.get('/react', (req, res) => {
    const reactProjects = [
      { name: 'Random Quote Machine', path: '/portfolio/react/quotes', project: 'reactFrontend0' },
      { name: 'Markdown Previewer', path: '/portfolio/react/markdown', project: 'reactFrontend1' },
      { name: 'Drum Machine', path: '/portfolio/react/drums', project: 'reactFrontend2' },
      { name: 'JavaScript Calculator', path: '/portfolio/react/calculator', project: 'reactFrontend3' },
      { name: 'Pomodoro Clock', path: '/portfolio/react/pomodoro', project: 'reactFrontend4' },
      { name: 'Additional React Project', path: '/portfolio/react/extra', project: 'reactFrontend5' }
    ];
    
    res.render('portfolio/category', {
      title: 'React Frontend Projects - Portfolio',
      category: 'React Frontend Projects',
      description: 'Interactive web applications built with React.js',
      projects: reactProjects,
      user: req.user
    });
  });

  // Individual React Project Routes
  authRouter.get('/react/quotes*', (req, res) => {
    res.redirect('/portfolio/react/reactFrontend1/index.html');
  });

  authRouter.get('/react/markdown*', (req, res) => {
    res.redirect('/portfolio/react/reactFrontend2/index.html');
  });

  authRouter.get('/react/drums*', (req, res) => {
    res.redirect('/portfolio/react/reactFrontend3/index.html');
  });

  authRouter.get('/react/calculator*', (req, res) => {
    res.redirect('/portfolio/react/reactFrontend4/index.html');
  });

  authRouter.get('/react/pomodoro*', (req, res) => {  
    res.redirect('/portfolio/react/reactFrontend5/index.html');
  });

  authRouter.get('/react/extra*', (req, res) => {
    res.redirect('/portfolio/react/reactFrontend0/index.html');
  });

  // Basic and MongoDB routes (simplified)
  authRouter.get('/basic*', (req, res) => {
    res.redirect('/portfolio/basic/');
  });

  authRouter.get('/mongo*', (req, res) => {
    res.redirect('/portfolio/mongo/');
  });

  // Debug middleware for API routes
  app.use('/portfolio/api/*', (req, res, next) => {
    console.log(`[DEBUG] API request: ${req.method} ${req.originalUrl} - User: ${req.user ? 'authenticated' : 'anonymous'}`);
    next();
  });
  
  // Mount authenticated portfolio routes
  app.use('/portfolio', portfolioAuth, authRouter);
  app.use('/en/portfolio', portfolioAuth, authRouter);
};

// /**
//  * Setup public API routes (no authentication required)
//  */
function setupPublicAPIRoutes(authRouter) {
//   // Bypass CSRF for all API routes
//   authRouter.use('/api/*', (req, res, next) => {
//     req.headers['x-requested-with'] = 'XMLHttpRequest';
//     req.csrfToken = () => 'portfolio-api-bypass';
//     next();
//   });

//   // Body parsing for API routes
//   authRouter.use('/api/*', express.urlencoded({ extended: false }));
//   authRouter.use('/api/*', express.json());

  // Hello API
  authRouter.get("/api/hello", (req, res) => {
    res.json({greeting: 'hello API'});
  });

  // Timestamp API
  authRouter.get("/api/timestamp/:date_string", (req, res) => {
    const dateString = req.params.date_string;
    let date;

    try {
      if (/^\d+$/.test(dateString)) {
        date = new Date(parseInt(dateString));
      } else {
        date = new Date(dateString);
      }

      if (isNaN(date.getTime())) {
        res.json({"error": "Invalid Date"});
      } else {
        res.json({"unix": date.getTime(), "utc": date.toUTCString()});
      }
    } catch (error) {
      console.log('Timestamp API Error:', error);
      res.json({"error": "Invalid Date"});
    }
  });

  // Who Am I API
  authRouter.get('/api/whoami', (req, res) => {
    res.json({
      ipaddress: req.ip || req.connection.remoteAddress || req.socket.remoteAddress,
      language: req.headers['accept-language'],
      software: req.headers['user-agent']
    });
  });

  // In-Memory Storage for APIs
  const urlDatabase = new Map();
  const exerciseUsers = new Map();
  const stockLikes = new Map();
  let urlCounter = 1;
  let userCounter = 1;

  // URL Shortener API
  authRouter.post('/api/shorturl/new', (req, res) => {
    const url = req.body.url || req.query.url;
    
    if (!url) {
      return res.json({ error: 'No URL found' });
    }
    
    const urlPattern = /^https?:\/\/.+/i;
    if (!urlPattern.test(url)) {
      return res.json({ error: 'Invalid URL' });
    }
    
    try {
      const parsed = parseUrl(url);
      if (!parsed.hostname) {
        throw new Error('Invalid hostname');
      }
      
      const shortUrl = urlCounter++;
      urlDatabase.set(shortUrl, url);
      
      res.json({
        original_url: url,
        short_url: shortUrl
      });
    } catch (e) {
      console.log('URL validation error:', e.message, 'URL:', url);
      res.json({ error: 'Invalid URL' });
    }
  });

  authRouter.get('/api/shorturl/:short_url', (req, res) => {
    const shortUrl = parseInt(req.params.short_url);
    const originalUrl = urlDatabase.get(shortUrl);
    
    if (originalUrl) {
      res.writeHead(301, { 'Location': originalUrl });
      res.end();
    } else {
      res.json({ error: 'Short url not found' });
    }
  });

  // Exercise Tracker API
  authRouter.post('/api/exercise/new-user', (req, res) => {
    const username = req.body.username;
    if (!username || !username.match(/^\w+$/)) {
      return res.json({ error: 'Invalid username' });
    }
    
    // Check if user already exists
    for (let [id, userData] of exerciseUsers) {
      if (userData.username === username) {
        return res.json({ error: 'Username already exists' });
      }
    }
    
    const userId = 'user_' + userCounter++;
    exerciseUsers.set(userId, {
      username: username,
      _id: userId,
      exercises: []
    });
    
    res.json({
      username: username,
      _id: userId
    });
  });

  authRouter.post('/api/exercise/add', (req, res) => {
    const { userId, description, duration, date } = req.body;
    if (!userId || !description || !duration) {
      return res.json({ error: 'userId, description, and duration are required' });
    }
    
    const user = exerciseUsers.get(userId);
    if (!user) {
      return res.json({ error: 'User not found' });
    }
    
    const exerciseDate = date ? new Date(date) : new Date();
    const exercise = {
      description: description,
      duration: parseInt(duration),
      date: exerciseDate.toDateString()
    };
    
    user.exercises.push(exercise);
    
    res.json({
      _id: userId,
      username: user.username,
      date: exercise.date,
      duration: exercise.duration,
      description: exercise.description
    });
  });

  authRouter.get('/api/exercise/log', (req, res) => {
    const { userId, username, from, to, limit } = req.query;
    
    let user = null;
    
    if (userId) {
      user = exerciseUsers.get(userId);
    } else if (username) {
      for (let [id, userData] of exerciseUsers) {
        if (userData.username === username) {
          user = userData;
          break;
        }
      }
    }
    
    if (!user) {
      return res.json({ error: 'User not found' });
    }
    
    let exercises = [...user.exercises];
    
    if (from) {
      const fromDate = new Date(from);
      exercises = exercises.filter(ex => new Date(ex.date) >= fromDate);
    }
    
    if (to) {
      const toDate = new Date(to);
      exercises = exercises.filter(ex => new Date(ex.date) <= toDate);
    }
    
    if (limit) {
      exercises = exercises.slice(0, parseInt(limit));
    }
    
    res.json({
      _id: user._id,
      username: user.username,
      count: exercises.length,
      log: exercises
    });
  });

  // Stock Price API
  authRouter.get('/api/stock-prices', (req, res) => {
    const stock = req.query.stock;
    const like = req.query.like === 'true';
    const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || '127.0.0.1';

    if (!stock) {
      return res.json({ error: 'stock parameter required' });
    }

    const stocks = Array.isArray(stock) ? stock : [stock];
    
    if (stocks.length === 1) {
      const stockSymbol = stocks[0].toUpperCase();
      
      if (!stockLikes.has(stockSymbol)) {
        stockLikes.set(stockSymbol, new Set());
      }
      
      if (like) {
        stockLikes.get(stockSymbol).add(clientIP);
      }
      
      const likes = stockLikes.get(stockSymbol).size;
      
      const mockPrices = {
        'GOOG': '2847.25', 'MSFT': '418.32', 'AAPL': '196.85',
        'TSLA': '251.44', 'AMZN': '178.91', 'NVDA': '875.30',
        'META': '512.78', 'NFLX': '489.63', 'CRM': '287.45', 'AMD': '142.18'
      };
      
      const price = mockPrices[stockSymbol] || '125.67';
      
      res.json({
        stockData: {
          stock: stockSymbol,
          price: price,
          likes: likes
        }
      });
      
    } else if (stocks.length === 2) {
      const stock1 = stocks[0].toUpperCase();
      const stock2 = stocks[1].toUpperCase();
      
      [stock1, stock2].forEach(s => {
        if (!stockLikes.has(s)) {
          stockLikes.set(s, new Set());
        }
        if (like) {
          stockLikes.get(s).add(clientIP);
        }
      });
      
      const likes1 = stockLikes.get(stock1).size;
      const likes2 = stockLikes.get(stock2).size;
      
      const mockPrices = {
        'GOOG': '2847.25', 'MSFT': '418.32', 'AAPL': '196.85',
        'TSLA': '251.44', 'AMZN': '178.91', 'NVDA': '875.30',
        'META': '512.78', 'NFLX': '489.63', 'CRM': '287.45', 'AMD': '142.18'
      };
      
      const price1 = mockPrices[stock1] || '125.67';
      const price2 = mockPrices[stock2] || '125.67';
      
      res.json({
        stockData: [
          { stock: stock1, price: price1, rel_likes: likes1 - likes2 },
          { stock: stock2, price: price2, rel_likes: likes2 - likes1 }
        ]
      });
    } else {
      res.json({ error: 'Invalid number of stocks. Please provide 1 or 2 stocks.' });
    }
  });

  console.log('✓ Public APIs configured: timestamp, whoami, exercise, shorturl, stock-prices (no authentication required)');
}
function setupStaticRoutes(authRouter, solutionsPath) {
  // API Project static files (demo pages - authenticated)
  const apiProjects = [
    'serverSideProject1_timestamp',
    'serverSideProject2_headerParser', 
    'serverSideProject3_urlshortener',
    'serverSideProject4_exercisetracker',
    'serverSideProject5_filemetadata'
  ];
  
  apiProjects.forEach(project => {
    const projectPath = path.join(solutionsPath, 'solutions_APIsMicroservicesProjects', project);
    authRouter.use(`/api/${project}`, express.static(projectPath));
  });

  // Advanced Project static files
  const advancedProjects = [
    'advanced_advancednode',
    'advanced-bcrypt', 
    'advanced-infosec',
    'advanced-mochachai',
    'advancedProject-issuetracker',
    'advancedProject-library',
    'advancedProject-messageboard', 
    'advancedProject-metricimpconverter',
    'advancedProject-stockchecker'
  ];
  
  advancedProjects.forEach(project => {
    const projectPath = path.join(solutionsPath, 'solutions_advancedServerSideProjects', project);
    authRouter.use(`/advanced/${project}`, express.static(projectPath));
  });

  // Other project categories
  authRouter.use(`/react`, express.static(path.join(solutionsPath, 'solutions_reactFrontendProjects')));
  authRouter.use(`/basic`, express.static(path.join(solutionsPath, 'solutions_basicNodeAndExpress')));
  authRouter.use(`/mongo`, express.static(path.join(solutionsPath, 'solutions_mongoDBandMongoose')));
  
  // Shared assets (CSS, images, etc.)
  authRouter.use(`/shared`, express.static(path.join(solutionsPath, 'shared')));
}

/**
 * Setup Advanced Project API integration - mount projects with in-memory Map database
 */
function setupAdvancedProjectAPIs(authRouter, solutionsPath) {
  const fs = require('fs');
  const advancedPath = path.join(solutionsPath, 'solutions_advancedServerSideProjects');
  
  // In-memory data stores using Maps (ideal for development)
  const projectDataStores = {
    issues: new Map(),     // Issue tracker data
    books: new Map(),      // Library books data  
    threads: new Map(),    // Message board threads
    conversions: []        // Metric converter history (array for this one)
  };
  
  initializeSampleData(projectDataStores);
  console.log('[Portfolio] Sample data initialized successfully');
  
  // Advanced projects to load - simplified structure
  const advancedProjects = [
    {
      name: 'issuetracker', 
      folder: 'advancedProject-issuetracker',
      apiPrefix: '/api/issuetracker',
      dataStore: 'issuetracker'
    },
    {
      name: 'library',
      folder: 'advancedProject-library', 
      apiPrefix: '/api/library',
      dataStore: 'library'
    },
    {
      name: 'messageboard',
      folder: 'advancedProject-messageboard',
      apiPrefix: '/api/messageboard',
      dataStore: 'threads'
    },
    {
      name: 'metricimpconverter',
      folder: 'advancedProject-metricimpconverter',
      apiPrefix: '/api/metricimpconverter',
      dataStore: 'metricimpconverter'
    }
  ];

  for (const project of advancedProjects) {
    // console.log(`[Portfolio] ========== Loading ${project.name.toUpperCase()} ==========`);
    
    try {
      const projectPath = path.join(advancedPath, project.folder);
      const fullApiPath = path.join(projectPath, 'routes', 'api.js');
      
      if (!fs.existsSync(fullApiPath)) {
        console.log(`[Portfolio] API file not found: ${fullApiPath}`);
        continue;
      }

      // Create a dedicated Express router for this project
      const projectRouter = express.Router();
      
      // Set up mock database for this project
      const mockDB = createMockDatabase(projectDataStores[project.dataStore], project.name);
      // console.log(`[Portfolio] Created mock database for ${project.name}`);

      // Add database access to router locals
      projectRouter.locals = { db: mockDB };

      // Clear require cache to ensure fresh load
      delete require.cache[require.resolve(fullApiPath)];

      // console.log(`[Portfolio] Loading ${project.name} API module...`);
      const apiModule = require(fullApiPath);
      
      // Call the API function with the project router directly
      if (typeof apiModule === 'function') {
        apiModule(projectRouter);
      } else {
        console.error(`[Portfolio] ${project.name} API is not a function`);
        continue;
      }

      // Mount the project router under the API prefix
      console.log(`[Portfolio] Mounting ${project.name} router at ${project.apiPrefix}`);
      authRouter.use(project.apiPrefix, projectRouter);

    } catch (error) {
      console.error(`[Portfolio] 🚨 ERROR loading ${project.name}:`, error.message);
      if (error.stack) {
        console.error(error.stack);
      }
    }
  }
}

/**
 * Initialize sample data for testing advanced projects
 */
function initializeSampleData(dataStores) {
  // Issue Tracker sample data
  dataStores.issues.set('test-project', {
    _id: 'test-project',
    name: 'Test Project',
    issues: [
      {
        _id: 'issue-1',
        issue_title: 'Sample Bug Report',
        issue_text: 'This is a sample issue for testing',
        created_by: 'testuser',
        assigned_to: 'developer',
        status_text: 'Open',
        created_on: new Date(),
        updated_on: new Date(),
        open: true
      }
    ]
  });
  
  // Personal Library sample data
  dataStores.books.set('book-1', {
    _id: 'book-1',
    title: 'Sample Book',
    comments: ['Great read!', 'Very informative'],
    commentcount: 2
  });
  
  // Message Board sample data - store as individual thread documents like MongoDB
  const generalThread = {
    _id: 'thread-1',
    board: 'general',
    text: 'Welcome to the message board!',
    created_on: new Date(),
    bumped_on: new Date(),
    reported: false,
    delete_password: 'test123',
    replycount: 1,
    replies: [
      {
        _id: 'reply-1',
        text: 'Thanks for the welcome!',
        created_on: new Date(),
        reported: false,
        delete_password: 'test456'
      }
    ]
  };
  dataStores.threads.set('thread-1', generalThread);
  
  console.log('✓ Sample data initialized for advanced projects');
}

/**
 * Create mock database interface for projects
 */
function createMockDatabase(dataStore, projectName) {
  return {
    collection: (name) => ({
      find: (query = {}) => ({
        toArray: () => {
          if (Object.keys(query).length === 0) {
            return Promise.resolve(Array.from(dataStore.values()));
          }
          // Handle board-specific queries for messageboard
          if (query.board) {
            const results = Array.from(dataStore.values()).filter(doc => doc.board === query.board);
            return Promise.resolve(results);
          }
          const results = Array.from(dataStore.values()).filter(doc => {
            return Object.keys(query).every(key => doc[key] === query[key]);
          });
          return Promise.resolve(results);
        },
        limit: (n) => ({
          toArray: () => {
            if (Object.keys(query).length === 0) {
              return Promise.resolve(Array.from(dataStore.values()).slice(0, n));
            }
            if (query.board) {
              const results = Array.from(dataStore.values())
                .filter(doc => doc.board === query.board)
                .slice(0, n);
              return Promise.resolve(results);
            }
            const results = Array.from(dataStore.values())
              .filter(doc => {
                return Object.keys(query).every(key => doc[key] === query[key]);
              })
              .slice(0, n);
            return Promise.resolve(results);
          }
        }),
        sort: (sortObj) => ({
          select: (projection) => ({
            exec: (callback) => {
              let results;
              if (Object.keys(query).length === 0) {
                results = Array.from(dataStore.values());
              } else if (query.board) {
                results = Array.from(dataStore.values()).filter(doc => doc.board === query.board);
              } else {
                results = Array.from(dataStore.values()).filter(doc => {
                  return Object.keys(query).every(key => doc[key] === query[key]);
                });
              }
              
              // Apply sorting
              if (sortObj.bumped_on === -1) {
                results.sort((a, b) => new Date(b.bumped_on) - new Date(a.bumped_on));
              }
              
              // Apply projection (remove fields)
              if (typeof projection === 'string') {
                const fieldsToRemove = projection.split(' ').filter(f => f.startsWith('-')).map(f => f.substring(1));
                results = results.map(doc => {
                  const newDoc = { ...doc };
                  fieldsToRemove.forEach(field => delete newDoc[field]);
                  return newDoc;
                });
              }
              
              callback(null, results);
            }
          })
        })
      }),
      findOne: (query, callback) => {
        let result = null;
        if (query._id) {
          result = dataStore.get(query._id);
        } else if (query.board && query._id) {
          result = dataStore.get(query._id);
          if (result && result.board !== query.board) {
            result = null;
          }
        } else if (query.board) {
          result = Array.from(dataStore.values()).find(doc => doc.board === query.board);
        } else {
          result = Array.from(dataStore.values()).find(doc => {
            return Object.keys(query).every(key => doc[key] === query[key]);
          });
        }
        
        if (callback) {
          callback(null, result);
        } else {
          return Promise.resolve(result);
        }
      },
      insertOne: (doc) => {
        const id = doc._id || Date.now().toString();
        doc._id = id;
        dataStore.set(id, doc);
        return Promise.resolve({ insertedId: id });
      },
      updateOne: (query, update) => {
        const key = query._id || Object.values(query)[0];
        const doc = dataStore.get(key);
        if (doc) {
          Object.assign(doc, update.$set || update);
          return Promise.resolve({ modifiedCount: 1 });
        }
        return Promise.resolve({ modifiedCount: 0 });
      },
      deleteOne: (query) => {
        const key = query._id || Object.values(query)[0];
        const deleted = dataStore.delete(key);
        return Promise.resolve({ deletedCount: deleted ? 1 : 0 });
      },
      create: (doc, callback) => {
        const id = doc._id || Date.now().toString();
        doc._id = id;
        dataStore.set(id, doc);
        callback(null, doc);
      }
    }),
    close: () => Promise.resolve()
  };
}

/**
 * Create stub API routes for projects that can't load normally
 */
function createStubRoutes(router, project) {
  switch (project.name) {
    case 'issuetracker':
      router.get('/apitest', (req, res) => {
        res.json([{
          _id: 'issue-1',
          issue_title: 'Sample Issue',
          issue_text: 'This is a test issue',
          created_by: 'testuser',
          assigned_to: '',
          status_text: 'Open',
          created_on: new Date().toISOString(),
          updated_on: new Date().toISOString(),
          open: true
        }]);
      });
      router.post('/apitest', (req, res) => {
        res.json({
          _id: Date.now().toString(),
          issue_title: req.body.issue_title || 'New Issue',
          issue_text: req.body.issue_text || '',
          created_by: req.body.created_by || 'anonymous',
          assigned_to: req.body.assigned_to || '',
          status_text: req.body.status_text || 'Open',
          created_on: new Date().toISOString(),
          updated_on: new Date().toISOString(),
          open: true
        });
      });
      break;
      
    case 'library':
      router.get('/', (req, res) => {
        res.json([{
          _id: 'book-1',
          title: 'Sample Book',
          comments: ['Great book!'],
          commentcount: 1
        }]);
      });
      router.post('/', (req, res) => {
        res.json({
          _id: Date.now().toString(),
          title: req.body.title || 'New Book',
          comments: [],
          commentcount: 0
        });
      });
      break;
      
    case 'messageboard':
      router.get('/:board', (req, res) => {
        res.json([{
          _id: 'thread-1',
          text: 'Sample thread',
          created_on: new Date().toISOString(),
          bumped_on: new Date().toISOString(),
          reported: false,
          replies: []
        }]);
      });
      router.post('/:board', (req, res) => {
        res.json({
          _id: Date.now().toString(),
          text: req.body.text || 'New thread',
          created_on: new Date().toISOString(),
          bumped_on: new Date().toISOString(),
          reported: false,
          delete_password: req.body.delete_password,
          replies: []
        });
      });
      break;
      
    case 'metricimpconverter':
      router.get('/', (req, res) => {
        const { input } = req.query;
        res.json({
          initNum: parseFloat(input) || 1,
          initUnit: 'lbs',
          returnNum: parseFloat(input) * 0.453592 || 0.453592,
          returnUnit: 'kg',
          string: `${input || '1'} lbs converts to ${(parseFloat(input) * 0.453592 || 0.453592).toFixed(5)} kg`
        });
      });
      break;
      
    default:
      router.get('/', (req, res) => {
        res.json({ message: `Stub API for ${project.name}`, timestamp: new Date().toISOString() });
      });
  }
  
  console.log(`✓ Stub routes created for ${project.name}`);
}
