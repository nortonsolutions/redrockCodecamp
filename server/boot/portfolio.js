/**
 * Norton Solutions Portfolio Boot Integration
 * Data-driven portfolio with authentication via loopback boot
 */

const path = require('path');
const express = require('express');
const fs = require('fs');
const { parse: parseUrl } = require('url');
const { ifNoUserRedirectTo } = require('../utils/middleware');

// ============================================================================
// PORTFOLIO CONFIGURATION — single source of truth
// ============================================================================

const EDU_BASE = '/educationMaterials/workbenchProjects/phase-iii/nortonSolutions/solutions_advancedServerSideProjects';

const CATEGORIES = [
  {
    id: 'apis', name: 'APIs and Microservices',
    description: 'Backend API development and microservices architecture',
    icon: '🚀', path: '/portfolio/apis',
    projects: [
      { name: 'Timestamp Microservice',  path: '/portfolio/api/timestamp',   project: 'serverSideProject1_timestamp',    description: 'Convert dates to timestamps and vice versa',  demoUrl: '/portfolio/api/timestamp',   testUrl: '/portfolio/api/timestamp/2015-12-25' },
      { name: 'Request Header Parser',   path: '/portfolio/api/whoami-demo', project: 'serverSideProject2_headerParser',  description: 'Parse request headers for client info',       demoUrl: '/portfolio/api/whoami-demo', testUrl: '/portfolio/api/whoami' },
      { name: 'URL Shortener',           path: '/portfolio/api/shorturl',    project: 'serverSideProject3_urlshortener',  description: 'Create and manage short URLs',                demoUrl: '/portfolio/api/shorturl',    testUrl: '/portfolio/api/shorturl/new' },
      { name: 'Exercise Tracker',        path: '/portfolio/api/exercise',    project: 'serverSideProject4_exercisetracker', description: 'Track user exercises and logs',              demoUrl: '/portfolio/api/exercise',    testUrl: '/portfolio/api/exercise/log?username=demo_user' },
      { name: 'File Metadata Analyzer',  path: '/portfolio/api/fileanalyse', project: 'serverSideProject5_filemetadata',  description: 'Analyze uploaded file metadata',              demoUrl: '/portfolio/api/fileanalyse', testUrl: '/portfolio/api/fileanalyse' }
    ]
  },
  {
    id: 'advanced', name: 'Information Security & Quality Assurance',
    description: 'Advanced authentication, security, and testing practices',
    icon: '🔒', path: '/portfolio/advanced',
    projects: [
      { name: 'Advanced Authentication', path: '/portfolio/advanced/auth',         project: 'advanced_advancednode',                description: 'Passport.js authentication with sessions' },
      { name: 'BCrypt Security',         path: '/portfolio/advanced/bcrypt',       project: 'advanced-bcrypt',                      description: 'Password hashing and security' },
      { name: 'Information Security',    path: '/portfolio/advanced/infosec',      project: 'advanced-infosec',                     description: 'Security headers and practices' },
      { name: 'Mocha & Chai Testing',    path: '/portfolio/advanced/testing',      project: 'advanced-mochachai',                   description: 'Unit and functional testing' },
      { name: 'Issue Tracker',           path: '/portfolio/advanced/issuetracker', project: 'advancedProject-issuetracker',         description: 'Project issue tracking system' },
      { name: 'Personal Library',        path: '/portfolio/advanced/library',      project: 'advancedProject-library',              description: 'Book management system' },
      { name: 'Message Board',           path: '/portfolio/advanced/messageboard', project: 'advancedProject-messageboard',         description: 'Anonymous message posting' },
      { name: 'Metric Converter',        path: '/portfolio/advanced/converter',    project: 'advancedProject-metricimpconverter',   description: 'Imperial/Metric conversion tool' },
      { name: 'Stock Price Checker',     path: '/portfolio/advanced/stocks',       project: 'advancedProject-stockchecker',         description: 'Stock price tracking with likes' }
    ]
  },
  {
    id: 'react', name: 'React Frontend Projects',
    description: 'Interactive frontend applications with React.js',
    icon: '⚛️', path: '/portfolio/react',
    projects: [
      { name: 'Random Quote Machine',     path: '/portfolio/react/quotes',     project: 'reactFrontend0', description: 'Inspirational quote generator' },
      { name: 'Markdown Previewer',       path: '/portfolio/react/markdown',   project: 'reactFrontend1', description: 'Live markdown preview editor' },
      { name: 'Drum Machine',             path: '/portfolio/react/drums',      project: 'reactFrontend2', description: 'Interactive drum pad machine' },
      { name: 'JavaScript Calculator',    path: '/portfolio/react/calculator', project: 'reactFrontend3', description: 'Full-featured calculator' },
      { name: 'Pomodoro Clock',           path: '/portfolio/react/pomodoro',   project: 'reactFrontend4', description: 'Productivity timer application' },
      { name: 'Additional React Project', path: '/portfolio/react/extra',      project: 'reactFrontend5', description: 'Bonus React implementation' }
    ]
  },
  {
    id: 'basic', name: 'Basic Node and Express',
    description: 'Fundamental Node.js and Express.js concepts',
    icon: '📦', path: '/portfolio/basic',
    projects: [
      { name: 'Basic Node & Express', path: '/portfolio/basic', description: 'Fundamental Node.js and Express concepts' }
    ]
  },
  {
    id: 'mongo', name: 'MongoDB and Mongoose',
    description: 'Database operations with MongoDB and Mongoose ODM',
    icon: '🍃', path: '/portfolio/mongo',
    projects: [
      { name: 'MongoDB & Mongoose', path: '/portfolio/mongo', description: 'Database CRUD operations and modeling' }
    ]
  }
];

const CATEGORY_MAP = {};
CATEGORIES.forEach(c => { CATEGORY_MAP[c.id] = c; });

// ============================================================================
// BOOT FUNCTION
// ============================================================================

module.exports = function(app) {
  const portfolioAuth = ifNoUserRedirectTo('/signin', 'You must be signed in to access the project portfolio.');
  const solutionsPath = path.join(__dirname, '../../public/educationMaterials/workbenchProjects/phase-iii/nortonSolutions');

  const authRouter = app.loopback.Router();
  const noAuthRouter = app.loopback.Router();

  // Static file serving
  setupStaticRoutes(authRouter, solutionsPath);

  // Public APIs (no auth)
  setupPublicAPIRoutes(noAuthRouter);

  // Advanced project API integration
  setupAdvancedProjectAPIs(noAuthRouter, solutionsPath);

  // --- Authenticated routes ---

  // Messageboard sub-routes (must precede category handler)
  authRouter.get('/advanced/messageboard/api/:board/:threadid', (req, res) => {
    res.redirect('/portfolio/advanced/advancedProject-messageboard/views/thread.html');
  });
  authRouter.get('/advanced/messageboard/api/:board', (req, res) => {
    res.redirect('/portfolio/advanced/advancedProject-messageboard/views/board.html');
  });

  // Portfolio homepage
  authRouter.get('/', (req, res) => {
    res.render('portfolio/index', {
      title: 'Norton Solutions - FreeCodeCamp Portfolio',
      user: req.user,
      totalProjects: CATEGORIES.reduce((sum, c) => sum + c.projects.length, 0),
      projects: CATEGORIES
    });
  });

  // Category pages — one handler replaces 3 individual routes
  authRouter.get('/:category', (req, res, next) => {
    const cat = CATEGORY_MAP[req.params.category];
    if (!cat) return next();
    res.render('portfolio/category', {
      title: cat.name + ' - Portfolio',
      category: cat.name,
      description: cat.description,
      projects: cat.projects,
      user: req.user
    });
  });

  // Mount: public routes first, then authenticated
  app.use('/portfolio', noAuthRouter);
  app.use('/en/portfolio', noAuthRouter);
  app.use('/portfolio', portfolioAuth, authRouter);
  app.use('/en/portfolio', portfolioAuth, authRouter);

  console.log(`[portfolio] ${CATEGORIES.length} categories, ${CATEGORIES.reduce((sum, c) => sum + c.projects.length, 0)} projects loaded`);
};

// ============================================================================
// STATIC FILE SERVING
// ============================================================================

function setupStaticRoutes(authRouter, solutionsPath) {
  // API project static files
  ['serverSideProject1_timestamp', 'serverSideProject2_headerParser',
   'serverSideProject3_urlshortener', 'serverSideProject4_exercisetracker',
   'serverSideProject5_filemetadata'].forEach(project => {
    authRouter.use(`/api/${project}`, express.static(
      path.join(solutionsPath, 'solutions_APIsMicroservicesProjects', project)
    ));
  });

  // Advanced project static files
  ['advanced_advancednode', 'advanced-bcrypt', 'advanced-infosec', 'advanced-mochachai',
   'advancedProject-issuetracker', 'advancedProject-library', 'advancedProject-messageboard',
   'advancedProject-metricimpconverter', 'advancedProject-stockchecker'].forEach(project => {
    authRouter.use(`/advanced/${project}`, express.static(
      path.join(solutionsPath, 'solutions_advancedServerSideProjects', project)
    ));
  });

  // Category-level static mounts
  authRouter.use('/react', express.static(path.join(solutionsPath, 'solutions_reactFrontendProjects')));
  authRouter.use('/basic', express.static(path.join(solutionsPath, 'solutions_basicNodeAndExpress')));
  authRouter.use('/mongo', express.static(path.join(solutionsPath, 'solutions_mongoDBandMongoose')));
}

// ============================================================================
// PUBLIC API ROUTES (no authentication required)
// ============================================================================

function setupPublicAPIRoutes(noAuthRouter) {
  // Bypass CSRF for API routes
  noAuthRouter.use('/api/*', (req, res, next) => {
    req.headers['x-requested-with'] = 'XMLHttpRequest';
    req.csrfToken = () => 'portfolio-api-bypass';
    next();
  });

  noAuthRouter.use('/api/*', express.urlencoded({ extended: false }));
  noAuthRouter.use('/api/*', express.json());

  // Hello
  noAuthRouter.get('/api/hello', (req, res) => {
    res.json({ greeting: 'hello API' });
  });

  // Timestamp
  noAuthRouter.get('/api/timestamp/:date_string', (req, res) => {
    const dateString = req.params.date_string;
    try {
      const date = /^\d+$/.test(dateString) ? new Date(parseInt(dateString)) : new Date(dateString);
      if (isNaN(date.getTime())) {
        res.json({ 'error': 'Invalid Date' });
      } else {
        res.json({ 'unix': date.getTime(), 'utc': date.toUTCString() });
      }
    } catch (error) {
      res.json({ 'error': 'Invalid Date' });
    }
  });

  // Who Am I
  noAuthRouter.get('/api/whoami', (req, res) => {
    res.json({
      ipaddress: req.ip || req.connection.remoteAddress || req.socket.remoteAddress,
      language: req.headers['accept-language'],
      software: req.headers['user-agent']
    });
  });

  // In-memory storage for APIs
  const urlDatabase = new Map();
  const exerciseUsers = new Map();
  const stockLikes = new Map();
  let urlCounter = 1;
  let userCounter = 1;

  // URL Shortener
  noAuthRouter.post('/api/shorturl/new', (req, res) => {
    const url = req.body.url || req.query.url;
    if (!url) return res.json({ error: 'No URL found' });
    if (!/^https?:\/\/.+/i.test(url)) return res.json({ error: 'Invalid URL' });

    try {
      const parsed = parseUrl(url);
      if (!parsed.hostname) throw new Error('Invalid hostname');
      const shortUrl = urlCounter++;
      urlDatabase.set(shortUrl, url);
      res.json({ original_url: url, short_url: shortUrl });
    } catch (e) {
      res.json({ error: 'Invalid URL' });
    }
  });

  noAuthRouter.get('/api/shorturl/:short_url', (req, res) => {
    const originalUrl = urlDatabase.get(parseInt(req.params.short_url));
    if (originalUrl) {
      res.writeHead(301, { 'Location': originalUrl });
      res.end();
    } else {
      res.json({ error: 'Short url not found' });
    }
  });

  // Exercise Tracker
  noAuthRouter.post('/api/exercise/new-user', (req, res) => {
    const username = req.body.username;
    if (!username || !username.match(/^\w+$/)) return res.json({ error: 'Invalid username' });

    for (let [id, userData] of exerciseUsers) {
      if (userData.username === username) return res.json({ error: 'Username already exists' });
    }

    const userId = 'user_' + userCounter++;
    exerciseUsers.set(userId, { username, _id: userId, exercises: [] });
    res.json({ username, _id: userId });
  });

  noAuthRouter.post('/api/exercise/add', (req, res) => {
    const { userId, description, duration, date } = req.body;
    if (!userId || !description || !duration) return res.json({ error: 'userId, description, and duration are required' });

    const user = exerciseUsers.get(userId);
    if (!user) return res.json({ error: 'User not found' });

    const exerciseDate = date ? new Date(date) : new Date();
    const exercise = { description, duration: parseInt(duration), date: exerciseDate.toDateString() };
    user.exercises.push(exercise);

    res.json({ _id: userId, username: user.username, date: exercise.date, duration: exercise.duration, description: exercise.description });
  });

  noAuthRouter.get('/api/exercise/log', (req, res) => {
    const { userId, username, from, to, limit } = req.query;
    let user = null;

    if (userId) {
      user = exerciseUsers.get(userId);
    } else if (username) {
      for (let [id, userData] of exerciseUsers) {
        if (userData.username === username) { user = userData; break; }
      }
    }

    if (!user) return res.json({ error: 'User not found' });

    let exercises = [...user.exercises];
    if (from) exercises = exercises.filter(ex => new Date(ex.date) >= new Date(from));
    if (to)   exercises = exercises.filter(ex => new Date(ex.date) <= new Date(to));
    if (limit) exercises = exercises.slice(0, parseInt(limit));

    res.json({ _id: user._id, username: user.username, count: exercises.length, log: exercises });
  });

  // Stock Prices
  noAuthRouter.get('/api/stock-prices', (req, res) => {
    const stock = req.query.stock;
    const like = req.query.like === 'true';
    const clientIP = req.ip || '127.0.0.1';

    if (!stock) return res.json({ error: 'stock parameter required' });

    const stocks = Array.isArray(stock) ? stock : [stock];
    const mockPrices = {
      'GOOG': '2847.25', 'MSFT': '418.32', 'AAPL': '196.85', 'TSLA': '251.44',
      'AMZN': '178.91', 'NVDA': '875.30', 'META': '512.78', 'NFLX': '489.63',
      'CRM': '287.45', 'AMD': '142.18'
    };

    if (stocks.length === 1) {
      const sym = stocks[0].toUpperCase();
      if (!stockLikes.has(sym)) stockLikes.set(sym, new Set());
      if (like) stockLikes.get(sym).add(clientIP);
      res.json({ stockData: { stock: sym, price: mockPrices[sym] || '125.67', likes: stockLikes.get(sym).size } });

    } else if (stocks.length === 2) {
      const [s1, s2] = stocks.map(s => s.toUpperCase());
      [s1, s2].forEach(s => {
        if (!stockLikes.has(s)) stockLikes.set(s, new Set());
        if (like) stockLikes.get(s).add(clientIP);
      });
      const l1 = stockLikes.get(s1).size, l2 = stockLikes.get(s2).size;
      res.json({ stockData: [
        { stock: s1, price: mockPrices[s1] || '125.67', rel_likes: l1 - l2 },
        { stock: s2, price: mockPrices[s2] || '125.67', rel_likes: l2 - l1 }
      ]});
    } else {
      res.json({ error: 'Invalid number of stocks. Please provide 1 or 2 stocks.' });
    }
  });
}

// ============================================================================
// ADVANCED PROJECT API INTEGRATION (in-memory mock database)
// ============================================================================

function setupAdvancedProjectAPIs(noAuthRouter, solutionsPath) {
  const advancedPath = path.join(solutionsPath, 'solutions_advancedServerSideProjects');

  const projectDataStores = {
    issues:      new Map(),
    books:       new Map(),
    threads:     new Map(),
    conversions: new Map()
  };

  initializeSampleData(projectDataStores);

  const advancedProjects = [
    { name: 'issuetracker',       folder: 'advancedProject-issuetracker',       apiPrefix: '/api/issuetracker',       dataStore: 'issues' },
    { name: 'library',            folder: 'advancedProject-library',            apiPrefix: '/api/library',            dataStore: 'books' },
    { name: 'messageboard',       folder: 'advancedProject-messageboard',       apiPrefix: '/api/messageboard',       dataStore: 'threads' },
    { name: 'metricimpconverter', folder: 'advancedProject-metricimpconverter', apiPrefix: '/api/metricimpconverter', dataStore: 'conversions' }
  ];

  let loaded = 0;
  for (const project of advancedProjects) {
    try {
      const fullApiPath = path.join(advancedPath, project.folder, 'routes', 'api.js');

      if (!fs.existsSync(fullApiPath)) {
        noAuthRouter.get(`${project.apiPrefix}/*`, (req, res) => {
          res.status(500).json({ error: `${project.name} API not found` });
        });
        continue;
      }

      const projectRouter = express.Router();
      projectRouter.locals = { db: createMockDatabase(projectDataStores[project.dataStore]) };

      delete require.cache[require.resolve(fullApiPath)];
      const apiModule = require(fullApiPath);

      if (typeof apiModule === 'function') {
        apiModule(projectRouter);
        noAuthRouter.use(project.apiPrefix, projectRouter);
        loaded++;
      }
    } catch (error) {
      console.error(`[portfolio] Failed to load ${project.name}: ${error.message}`);
      noAuthRouter.get(`${project.apiPrefix}/*`, (req, res) => {
        res.status(500).json({ error: `${project.name} failed to load`, message: error.message });
      });
    }
  }

  console.log(`[portfolio] ${loaded}/${advancedProjects.length} advanced APIs loaded`);
}

// ============================================================================
// MOCK DATABASE & SAMPLE DATA
// ============================================================================

function initializeSampleData(dataStores) {
  dataStores.issues.set('test-project', {
    _id: 'test-project', name: 'Test Project',
    issues: [{
      _id: 'issue-1', issue_title: 'Sample Bug Report', issue_text: 'This is a sample issue for testing',
      created_by: 'testuser', assigned_to: 'developer', status_text: 'Open',
      created_on: new Date(), updated_on: new Date(), open: true
    }]
  });

  dataStores.books.set('book-1', {
    _id: 'book-1', title: 'Sample Book', comments: ['Great read!', 'Very informative'], commentcount: 2
  });

  dataStores.threads.set('thread-1', {
    _id: 'thread-1', board: 'general', text: 'Welcome to the message board!',
    created_on: new Date(), bumped_on: new Date(), reported: false,
    delete_password: 'test123', replycount: 1,
    replies: [{ _id: 'reply-1', text: 'Thanks for the welcome!', created_on: new Date(), reported: false, delete_password: 'test456' }]
  });
}

function createMockDatabase(dataStore) {
  return {
    collection: (name) => ({
      find: (query = {}) => ({
        toArray: () => {
          const results = Object.keys(query).length === 0
            ? Array.from(dataStore.values())
            : Array.from(dataStore.values()).filter(doc =>
                Object.keys(query).every(key => doc[key] === query[key])
              );
          return Promise.resolve(results);
        },
        limit: (n) => ({
          toArray: () => {
            const results = Object.keys(query).length === 0
              ? Array.from(dataStore.values()).slice(0, n)
              : Array.from(dataStore.values()).filter(doc =>
                  Object.keys(query).every(key => doc[key] === query[key])
                ).slice(0, n);
            return Promise.resolve(results);
          }
        }),
        sort: (sortObj) => ({
          select: (projection) => ({
            exec: (callback) => {
              let results = Object.keys(query).length === 0
                ? Array.from(dataStore.values())
                : Array.from(dataStore.values()).filter(doc =>
                    Object.keys(query).every(key => doc[key] === query[key])
                  );
              if (sortObj.bumped_on === -1) {
                results.sort((a, b) => new Date(b.bumped_on) - new Date(a.bumped_on));
              }
              if (typeof projection === 'string') {
                const remove = projection.split(' ').filter(f => f.startsWith('-')).map(f => f.substring(1));
                results = results.map(doc => { const d = { ...doc }; remove.forEach(f => delete d[f]); return d; });
              }
              callback(null, results);
            }
          })
        })
      }),
      findOne: (query, callback) => {
        const result = query._id
          ? dataStore.get(query._id)
          : Array.from(dataStore.values()).find(doc =>
              Object.keys(query).every(key => doc[key] === query[key])
            ) || null;
        return callback ? callback(null, result) : Promise.resolve(result);
      },
      insertOne: (doc) => {
        const id = doc._id || Date.now().toString();
        doc._id = id;
        dataStore.set(id, doc);
        return Promise.resolve({ insertedId: id });
      },
      updateOne: (query, update) => {
        const doc = dataStore.get(query._id || Object.values(query)[0]);
        if (doc) {
          Object.assign(doc, update.$set || update);
          return Promise.resolve({ modifiedCount: 1 });
        }
        return Promise.resolve({ modifiedCount: 0 });
      },
      deleteOne: (query) => {
        const deleted = dataStore.delete(query._id || Object.values(query)[0]);
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
