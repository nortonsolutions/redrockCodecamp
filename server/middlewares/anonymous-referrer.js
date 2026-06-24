// Detects requests that should be allowed to browse the site anonymously
// (without being redirected to /signin). Two independent signals trigger
// this:
//
//   1. Referer header points to an approved third-party domain
//      (e.g. a click coming back from EthicalAds).
//
//   2. User-Agent matches a known crawler / ad-network reviewer bot.
//      Required because EthicalAds qualification crawlers, Google's
//      AdSense crawler, and search engine spiders all hit URLs directly
//      with no Referer header — they identify themselves only by UA.
//
// To allow additional domains, add a regex matching the *hostname* (not
// the full URL) to ALLOWED_REFERRER_PATTERNS.
// To allow additional bots, add a regex (matched against the raw UA
// string, case-insensitive) to ALLOWED_BOT_USER_AGENTS.

const ALLOWED_REFERRER_PATTERNS = [
  /(^|\.)ethicalads\.io$/i,
  /(^|\.)localhost$/i
];

// Conservative allow-list — only bots we explicitly want crawling the
// site anonymously. Order doesn't matter; first match wins.
const ALLOWED_BOT_USER_AGENTS = [
  // EthicalAds review / qualification crawler (UA not formally published;
  // these are common patterns they identify themselves with).
  /ethicalads/i,
  /readthedocs/i,

  // Google AdSense / Ads landing-page review crawlers.
  /Mediapartners-Google/i,
  /AdsBot-Google/i,

  // Major search engine crawlers.
  /Googlebot/i,
  /Bingbot/i,
  /Slurp/i,            // Yahoo
  /DuckDuckBot/i,
  /Baiduspider/i,
  /YandexBot/i,
  /Applebot/i,

  // Social / link-preview crawlers (so shared lesson links generate cards).
  /facebookexternalhit/i,
  /Twitterbot/i,
  /LinkedInBot/i,
  /Slackbot/i,
  /Discordbot/i
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

function isAllowedBot(userAgent) {
  if (!userAgent) { return false; }
  return ALLOWED_BOT_USER_AGENTS.some(re => re.test(userAgent));
}

export { isAllowedReferrer, isAllowedBot };

export default function anonymousReferrerMiddleware() {
  return function anonymousReferrer(req, res, next) {
    if (!req.session) { return next(); }

    // Per-request flag: bots typically don't accept cookies, so we
    // re-evaluate the UA every request. Available as req.allowAnonymous
    // for downstream handlers that prefer a non-session check.
    const botMatched = isAllowedBot(req.get('User-Agent'));
    const refererMatched = isAllowedReferrer(req.get('Referer'));

    if (botMatched || refererMatched) {
      req.allowAnonymous = true;
    }

    // Sticky session flag: once an approved referrer (or bot, though
    // unusual) is seen, keep allowing anonymous browsing for the life of
    // the session even if later requests no longer carry the Referer
    // header. This benefits human visitors arriving from EthicalAds links.
    if (!req.session.allowAnonymous && (botMatched || refererMatched)) {
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
