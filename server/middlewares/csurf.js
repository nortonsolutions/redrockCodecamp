import csurf from 'csurf';

export default function() {
  const protection = csurf({ cookie: true });
  return function csrf(req, res, next) {
    const path = req.path.split('/')[1];
    // Skip CSRF for direct /api routes and /portfolio/api routes
    if (/api/.test(path) || req.path.includes('/portfolio/api/') || req.path.includes('/en/portfolio/api/')) {
      return next();
    }
    return protection(req, res, next);
  };
}
