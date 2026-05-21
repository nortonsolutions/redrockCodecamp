// Detects requests originating from approved third-party referrers
// (e.g. EthicalAds) and lets those visitors browse anonymously without
// being redirected to /signin.
//
// To allow additional domains, add a regex matching the *hostname* (not
// the full URL) to ALLOWED_REFERRER_PATTERNS below.

const ALLOWED_REFERRER_PATTERNS = [
  /(^|\.)ethicalads\.io$/i
];

// Where to send an anonymous visitor when we have no record of a previously
// visited lesson in their session.
export const DEFAULT_ANONYMOUS_LANDING =
  '/en/challenges/bootstrap-4/introduction-to-the-bootstrap-challenges';

function isAllowedReferrer(referer) {
  if (!referer) { return false; }
  try {
    // Use the WHATWG URL parser available in modern Node.
    const parsed = new URL(referer);
    return ALLOWED_REFERRER_PATTERNS.some(re => re.test(parsed.hostname));
  } catch (e) {
    return false;
  }
}

export { isAllowedReferrer };

export default function anonymousReferrerMiddleware() {
  return function anonymousReferrer(req, res, next) {
    if (!req.session) { return next(); }

    // Sticky flag: once an approved referrer is seen for this session,
    // keep allowing anonymous browsing for the life of the session even if
    // later requests no longer carry the Referer header.
    if (!req.session.allowAnonymous &&
        isAllowedReferrer(req.get('Referer'))) {
      req.session.allowAnonymous = true;
    }

    // Track the most recent lesson URL the visitor has been on so we can
    // resume them there on subsequent visits within the same session.
    if (req.method === 'GET' &&
        typeof req.path === 'string' &&
        /^\/(?:[a-z]{2}\/)?challenges\/[^/]+\/[^/]+\/?$/i.test(req.path)) {
      req.session.lastVisitedChallenge = req.originalUrl;
    }

    return next();
  };
}
