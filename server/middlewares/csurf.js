import csurf from 'csurf';

// Paths that arrive as third-party POSTs and therefore cannot carry a CSRF
// token from us. Apple's Sign-in callback is the canonical example: when we
// request scope=name+email, Apple uses response_mode=form_post and POSTs the
// id_token + user object to our callback URL. Any other OAuth provider that
// uses form_post (or webhooks from external systems) belongs here too.
const CSRF_EXEMPT_PATHS = [
  '/auth/apple/callback',
  '/link/apple/callback'
];

export default function() {
  const protection = csurf({ cookie: true });
  return function csrf(req, res, next) {
    const path = req.path.split('/')[1];
    // Skip CSRF for direct /api routes and /portfolio/api routes
    if (/api/.test(path) || req.path.includes('/portfolio/api/') || req.path.includes('/en/portfolio/api/')) {
      return next();
    }
    if (CSRF_EXEMPT_PATHS.indexOf(req.path) !== -1) {
      return next();
    }
    return protection(req, res, next);
  };
}
