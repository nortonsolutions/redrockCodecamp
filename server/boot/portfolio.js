/**
 * Norton Solutions Portfolio Boot Integration
 * Provides unified portfolio access with authentication via loopback boot
 */

import path from 'path';
import express from 'express';
import { parse as parseUrl } from 'url';
import { ifNoUserRedirectTo } from '../utils/middleware';

module.exports = function(app) {
  const router = app.loopback.Router();
  const apiRouter = app.loopback.Router();
  
  // Authentication middleware
  const portfolioAuth = ifNoUserRedirectTo('/signin', 'You must be signed in to access the project portfolio.');
  
  // Base path to all solutions
  const solutionsPath = path.join(__dirname, '../../public/educationMaterials/workbenchProjects/phase-iii/nortonSolutions');
  
  // Setup static file serving for all portfolio projects
  setupStaticRoutes(app, portfolioAuth, solutionsPath);
  
  // Portfolio homepage
  router.get('/', (req, res) => {
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
            { name: 'Issue Tracker', path: '/portfolio/advanced/issues', description: 'Project issue tracking system' },
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
  router.get('/apis', (req, res) => {
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
  router.get('/api/timestamp', (req, res) => {
    res.redirect('/portfolio/api/serverSideProject1_timestamp/views/index.html');
  });
  
  router.get('/api/whoami-demo', (req, res) => {
    res.redirect('/portfolio/api/serverSideProject2_headerParser/views/index.html');
  });
  
  router.get('/api/exercise', (req, res) => {
    res.redirect('/portfolio/api/serverSideProject4_exercisetracker/views/index.html');
  });

  router.get('/api/shorturl', (req, res) => {
    res.redirect('/portfolio/api/serverSideProject3_urlshortener/views/index.html');
  });

  // Public API Endpoints (No Authentication Required)
  
  // Bypass CSRF for all API routes
  apiRouter.use('/api/*', (req, res, next) => {
    req.headers['x-requested-with'] = 'XMLHttpRequest';
    req.csrfToken = () => 'portfolio-api-bypass';
    next();
  });

  apiRouter.get("/api/hello", function (req, res) {
    res.json({greeting: 'hello API'});
  });

  apiRouter.get("/api/timestamp/:date_string", (req, res) => {
    const dateString = req.params.date_string;
    let date;

    try {
      // Handle unix timestamps (all numbers)  
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

  apiRouter.get('/api/whoami', (req, res) => {
    res.json({
      ipaddress: req.ip || req.connection.remoteAddress || req.socket.remoteAddress,
      language: req.headers['accept-language'],
      software: req.headers['user-agent']
    });
  });

  // Body parsing for API routes
  apiRouter.use('/api/*', express.urlencoded({ extended: false }));
  apiRouter.use('/api/*', express.json());
  
  apiRouter.post('/api/exercise/new-user', (req, res) => {
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
    
    // Create new user
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

  apiRouter.post('/api/exercise/add', (req, res) => {
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
    
    // Add exercise to user's exercise log
    user.exercises.push(exercise);
    
    res.json({
      _id: userId,
      username: user.username,
      date: exercise.date,
      duration: exercise.duration,
      description: exercise.description
    });
  });

  apiRouter.get('/api/exercise/log', (req, res) => {
    const { userId, username, from, to, limit } = req.query;
    
    let user = null;
    
    // Find user by userId or username
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
    
    // Apply date filters if provided
    if (from) {
      const fromDate = new Date(from);
      exercises = exercises.filter(ex => new Date(ex.date) >= fromDate);
    }
    
    if (to) {
      const toDate = new Date(to);
      exercises = exercises.filter(ex => new Date(ex.date) <= toDate);
    }
    
    // Apply limit if provided
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

  // In-Memory Storage
  const urlDatabase = new Map(); // URL shortener storage
  let urlCounter = 1;
  
  const exerciseUsers = new Map(); // Exercise tracker storage
  let userCounter = 1;

  apiRouter.post('/api/shorturl/new', (req, res) => {
    const url = req.body.url || req.query.url;
    
    if (!url) {
      return res.json({ error: 'No URL found' });
    }
    
    // Basic URL validation - must include http:// or https://
    const urlPattern = /^https?:\/\/.+/i;
    if (!urlPattern.test(url)) {
      return res.json({ error: 'Invalid URL' });
    }
    
    try {
      // Further validation with url.parse
      const parsed = parseUrl(url);
      if (!parsed.hostname) {
        throw new Error('Invalid hostname');
      }
      
      // Store URL in memory
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

  apiRouter.get('/api/shorturl/:short_url', (req, res) => {
    const shortUrl = parseInt(req.params.short_url);
    const originalUrl = urlDatabase.get(shortUrl);
    
    if (originalUrl) {
      // Force external redirect with 301 status to bypass middleware
      res.writeHead(301, { 'Location': originalUrl });
      res.end();
    } else {
      res.json({ error: 'Short url not found' });
    }
  });

  // Other API Demo Pages (for now just redirect to demos)
  router.get('/api/shorturl*', (req, res) => {
    res.redirect('/portfolio/api/serverSideProject3_urlshortener/views/index.html');
  });

  router.get('/api/fileanalyse*', (req, res) => {
    res.redirect('/portfolio/api/serverSideProject5_filemetadata/views/index.html');
  });

  // Stock Price API endpoints (live demo for advanced portfolio project)
  const stockLikes = new Map(); // In-memory storage for likes: stock -> Set of IP addresses

  apiRouter.get('/api/stock-prices', (req, res) => {
    const stock = req.query.stock;
    const like = req.query.like === 'true';
    const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || '127.0.0.1';

    if (!stock) {
      return res.json({ error: 'stock parameter required' });
    }

    // Handle single or multiple stocks
    const stocks = Array.isArray(stock) ? stock : [stock];
    
    if (stocks.length === 1) {
      // Single stock request
      const stockSymbol = stocks[0].toUpperCase();
      
      // Handle likes
      if (!stockLikes.has(stockSymbol)) {
        stockLikes.set(stockSymbol, new Set());
      }
      
      if (like) {
        stockLikes.get(stockSymbol).add(clientIP);
      }
      
      const likes = stockLikes.get(stockSymbol).size;
      
      // Consistent mock stock prices (using in-memory storage)
      const mockPrices = {
        'GOOG': '2847.25',
        'MSFT': '418.32', 
        'AAPL': '196.85',
        'TSLA': '251.44',
        'AMZN': '178.91',
        'NVDA': '875.30',
        'META': '512.78',
        'NFLX': '489.63',
        'CRM': '287.45',
        'AMD': '142.18'
      };
      
      const price = mockPrices[stockSymbol] || '125.67'; // Default consistent price
      
      res.json({
        stockData: {
          stock: stockSymbol,
          price: price,
          likes: likes
        }
      });
      
    } else if (stocks.length === 2) {
      // Two stock comparison
      const stock1 = stocks[0].toUpperCase();
      const stock2 = stocks[1].toUpperCase();
      
      // Handle likes
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
      
      // Consistent mock prices
      const mockPrices = {
        'GOOG': '2847.25',
        'MSFT': '418.32',
        'AAPL': '196.85', 
        'TSLA': '251.44',
        'AMZN': '178.91',
        'NVDA': '875.30',
        'META': '512.78',
        'NFLX': '489.63',
        'CRM': '287.45',
        'AMD': '142.18'
      };
      
      const price1 = mockPrices[stock1] || '125.67';
      const price2 = mockPrices[stock2] || '125.67';
      
      res.json({
        stockData: [
          {
            stock: stock1,
            price: price1,
            rel_likes: likes1 - likes2
          },
          {
            stock: stock2,
            price: price2,
            rel_likes: likes2 - likes1
          }
        ]
      });
    } else {
      res.json({ error: 'Invalid number of stocks. Please provide 1 or 2 stocks.' });
    }
  });

  console.log('✓ Portfolio APIs configured: timestamp (live), whoami (live), exercise (live), shorturl (live), fileanalyse (demo), stock-prices (live)');

  // Advanced Category Routes
  router.get('/advanced', (req, res) => {
    const advancedProjects = [
      { name: 'Advanced Authentication', path: '/portfolio/advanced/auth', project: 'advanced_advancednode' },
      { name: 'BCrypt Security', path: '/portfolio/advanced/bcrypt', project: 'advanced-bcrypt' },
      { name: 'Information Security', path: '/portfolio/advanced/infosec', project: 'advanced-infosec' },
      { name: 'Mocha & Chai Testing', path: '/portfolio/advanced/testing', project: 'advanced-mochachai' },
      { name: 'Issue Tracker', path: '/portfolio/advanced/issues', project: 'advancedProject-issuetracker' },
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
  router.get('/advanced/auth*', (req, res) => {
    res.writeHead(302, { 'Location': '/educationMaterials/workbenchProjects/phase-iii/nortonSolutions/solutions_advancedServerSideProjects/advanced_advancednode/' });
    res.end();
  });

  router.get('/advanced/bcrypt*', (req, res) => {
    res.writeHead(302, { 'Location': '/educationMaterials/workbenchProjects/phase-iii/nortonSolutions/solutions_advancedServerSideProjects/advanced-bcrypt/' });
    res.end();
  });

  router.get('/advanced/infosec*', (req, res) => {
    res.writeHead(302, { 'Location': '/educationMaterials/workbenchProjects/phase-iii/nortonSolutions/solutions_advancedServerSideProjects/advanced-infosec/' });
    res.end();
  });

  router.get('/advanced/testing*', (req, res) => {
    res.writeHead(302, { 'Location': '/educationMaterials/workbenchProjects/phase-iii/nortonSolutions/solutions_advancedServerSideProjects/advanced-mochachai/' });
    res.end();
  });

  router.get('/advanced/issues*', (req, res) => {
    res.writeHead(302, { 'Location': '/educationMaterials/workbenchProjects/phase-iii/nortonSolutions/solutions_advancedServerSideProjects/advancedProject-issuetracker/' });
    res.end();
  });

  router.get('/advanced/library*', (req, res) => {
    res.writeHead(302, { 'Location': '/educationMaterials/workbenchProjects/phase-iii/nortonSolutions/solutions_advancedServerSideProjects/advancedProject-library/' });
    res.end();
  });

  router.get('/advanced/messageboard*', (req, res) => {
    res.writeHead(302, { 'Location': '/educationMaterials/workbenchProjects/phase-iii/nortonSolutions/solutions_advancedServerSideProjects/advancedProject-messageboard/' });
    res.end();
  });

  router.get('/advanced/converter*', (req, res) => {
    res.writeHead(302, { 'Location': '/educationMaterials/workbenchProjects/phase-iii/nortonSolutions/solutions_advancedServerSideProjects/advancedProject-metricimpconverter/' });
    res.end();
  });

  router.get('/advanced/stocks*', (req, res) => {
    res.redirect('/portfolio/advanced/advancedProject-stockchecker/views/index.html');
  });

  // React Category Routes
  router.get('/react', (req, res) => {
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
  router.get('/react/quotes*', (req, res) => {
    res.redirect('/portfolio/react/reactFrontend1/index.html');
  });

  router.get('/react/markdown*', (req, res) => {
    res.redirect('/portfolio/react/reactFrontend2/index.html');
  });

  router.get('/react/drums*', (req, res) => {
    res.redirect('/portfolio/react/reactFrontend3/index.html');
  });

  router.get('/react/calculator*', (req, res) => {
    res.redirect('/portfolio/react/reactFrontend4/index.html');
  });

  router.get('/react/pomodoro*', (req, res) => {
    res.redirect('/portfolio/react/reactFrontend5/index.html');
  });

  router.get('/react/extra*', (req, res) => {
    res.redirect('/portfolio/react/reactFrontend0/index.html');
  });

  // Basic and MongoDB routes (simplified)
  router.get('/basic*', (req, res) => {
    res.redirect('/portfolio/basic/');
  });

  router.get('/mongo*', (req, res) => {
    res.redirect('/portfolio/mongo/');
  });

  // Mount public API routes FIRST (no authentication)  
  app.use('/portfolio', apiRouter);
  app.use('/en/portfolio', apiRouter);
  
  // Handle direct /api routes when served from portfolio pages
  app.use('/api', apiRouter);
  
  // Mount authenticated portfolio routes AFTER APIs
  app.use('/portfolio', portfolioAuth, router);
  app.use('/en/portfolio', portfolioAuth, router);
};

/**
 * Setup static file serving for all portfolio projects
 */
function setupStaticRoutes(app, portfolioAuth, solutionsPath) {
  const router = app.loopback.Router();
  const User = app.models.User;
  const noLangRouter = app.loopback.Router();
  
  // API Projects - each with views and public directories
  const apiProjects = [
    'serverSideProject1_timestamp',
    'serverSideProject2_headerParser', 
    'serverSideProject3_urlshortener',
    'serverSideProject4_exercisetracker',
    'serverSideProject5_filemetadata'
  ];
  
  apiProjects.forEach(project => {
    const projectPath = path.join(solutionsPath, 'solutions_APIsMicroservicesProjects', project);
    
    // Serve CSS files from public directory when requested from views
    router.get(`/api/${project}/views/style.css`, portfolioAuth, (req, res) => {
      res.sendFile(path.join(projectPath, 'public', 'style.css'));
    });
    router.use(`/api/${project}/views`, portfolioAuth, express.static(path.join(projectPath, 'views')));
    router.use(`/api/${project}/public`, portfolioAuth, express.static(path.join(projectPath, 'public')));
    router.use(`/api/${project}`, portfolioAuth, express.static(projectPath));
    
    // NoLangRouter (for /portfolio paths without /en prefix)
    noLangRouter.get(`/api/${project}/views/style.css`, portfolioAuth, (req, res) => {
      res.sendFile(path.join(projectPath, 'public', 'style.css'));
    });
    noLangRouter.use(`/api/${project}/views`, portfolioAuth, express.static(path.join(projectPath, 'views')));
    noLangRouter.use(`/api/${project}/public`, portfolioAuth, express.static(path.join(projectPath, 'public')));
    noLangRouter.use(`/api/${project}`, portfolioAuth, express.static(projectPath));
  });

  // Advanced Projects
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
    
    router.use(`/advanced/${project}/views`, portfolioAuth, express.static(path.join(projectPath, 'views')));
    router.use(`/advanced/${project}/public`, portfolioAuth, express.static(path.join(projectPath, 'public')));
    router.use(`/advanced/${project}`, portfolioAuth, express.static(projectPath));
    
    noLangRouter.use(`/advanced/${project}/views`, portfolioAuth, express.static(path.join(projectPath, 'views')));
    noLangRouter.use(`/advanced/${project}/public`, portfolioAuth, express.static(path.join(projectPath, 'public')));
    noLangRouter.use(`/advanced/${project}`, portfolioAuth, express.static(projectPath));
  });

  // React Projects
  router.use(`/react`, portfolioAuth, express.static(path.join(solutionsPath, 'solutions_reactFrontendProjects')));
  router.use(`/basic`, portfolioAuth, express.static(path.join(solutionsPath, 'solutions_basicNodeAndExpress')));
  router.use(`/mongo`, portfolioAuth, express.static(path.join(solutionsPath, 'solutions_mongoDBandMongoose')));
  
  noLangRouter.use(`/react`, portfolioAuth, express.static(path.join(solutionsPath, 'solutions_reactFrontendProjects')));
  noLangRouter.use(`/basic`, portfolioAuth, express.static(path.join(solutionsPath, 'solutions_basicNodeAndExpress')));
  noLangRouter.use(`/mongo`, portfolioAuth, express.static(path.join(solutionsPath, 'solutions_mongoDBandMongoose')));
  
  // Mount the routers
  app.use('/en/portfolio', router);
  app.use('/portfolio', noLangRouter);
}
