import helmet from 'helmet';
import dotenv from 'dotenv';
dotenv.config();

let trusted = [
  "'self'"
];

const host = process.env.HOST || 'localhost';
const port = process.env.SYNC_PORT || '3000';

if (process.env.NODE_ENV !== 'production') {
  trusted = trusted.concat([
    `ws://${host}:${port}`,
    'https://search.freecodecamp.org'
  ]);
}

// Origins allowed to embed RRCC in an iframe.
// Set ALLOWED_EMBED_ORIGINS in .env as a comma-separated list, e.g.:
//   ALLOWED_EMBED_ORIGINS=https://lifesciencebalance.com,http://localhost:3040
const embedOrigins = (process.env.ALLOWED_EMBED_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

// frame-ancestors value: always include 'self', plus any configured embed origins.
// This overrides X-Frame-Options in all modern browsers (Chrome 40+, Firefox 33+, Safari 10+).
const frameAncestors = ["'self'", ...embedOrigins];

export default function csp() {
  const cspMiddleware = helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: trusted.concat([
        'https://*.cloudflare.com',
        '*.cloudflare.com',
        'https://*.optimizely.com'
      ]),
      connectSrc: trusted.concat([
        'https://glitch.com',
        'https://*.glitch.com',
        'https://*.glitch.me',
        'https://*.cloudflare.com'
      ]),
      scriptSrc: [
        "'unsafe-eval'",
        "'unsafe-inline'",
        '*.google-analytics.com',
        '*.gstatic.com',
        'https://*.cloudflare.com',
        '*.cloudflare.com',
        'https://*.gitter.im',
        'https://*.cdnjs.com',
        '*.cdnjs.com',
        'https://*.jsdelivr.com',
        '*.jsdelivr.com',
        '*.twimg.com',
        'https://*.twimg.com',
        '*.youtube.com',
        '*.ytimg.com',
        'https://*.optimizely.com'
      ].concat(trusted),
      styleSrc: [
        "'unsafe-inline'",
        '*.gstatic.com',
        '*.googleapis.com',
        '*.bootstrapcdn.com',
        'https://*.bootstrapcdn.com',
        '*.cloudflare.com',
        'https://*.cloudflare.com',
        'https://*.optimizely.com'
      ].concat(trusted),
      fontSrc: [
        '*.cloudflare.com',
        'https://*.cloudflare.com',
        '*.bootstrapcdn.com',
        '*.googleapis.com',
        '*.gstatic.com',
        'https://*.bootstrapcdn.com',
        'https://*.optimizely.com'
      ].concat(trusted),
      imgSrc: [
        // allow all input since we have user submitted images for
        // public profile
        '*',
        'data:'
      ],
      mediaSrc: [
        '*.bitly.com',
        '*.amazonaws.com',
        '*.twitter.com'
      ].concat(trusted),
      frameSrc: [
        '*.gitter.im',
        '*.gitter.im https:',
        '*.youtube.com',
        '*.twitter.com',
        '*.ghbtns.com',
        '*.freecatphotoapp.com',
        'freecodecamp.github.io'
      ].concat(trusted),
      // frame-ancestors controls which origins may embed THIS site in an iframe.
      // It supersedes X-Frame-Options in modern browsers.
      frameAncestors
    },
    // set to true if you only want to report errors
    reportOnly: false,
    // set to true if you want to set all headers
    setAllHeaders: false,
    // set to true if you want to force buggy CSP in Safari 5
    safari5: false
  });

  // Strip the legacy X-Frame-Options header for requests coming from an
  // allowed embed origin so that old-CSP browsers don't block the iframe.
  // (Modern browsers already use frame-ancestors above.)
  const stripFrameOptions = (req, res, next) => {
    if (embedOrigins.length === 0) return next();
    const origin = req.headers.origin || req.headers.referer || '';
    const allowed = embedOrigins.some(o => origin.startsWith(o));
    if (allowed) {
      res.removeHeader('X-Frame-Options');
    }
    next();
  };

  // Return a combined middleware so callers just do app.use(csp())
  return (req, res, next) => {
    stripFrameOptions(req, res, () => cspMiddleware(req, res, next));
  };
}
