const path = require('path');

const successRedirect = '/';
const failureRedirect = '/signin';
const linkSuccessRedirect = '/settings';
const linkFailureRedirect = '/settings';

// ----------------------------------------------------------------------------
// passport-google-oauth2 patch
// ----------------------------------------------------------------------------
// The npm package `passport-google-oauth2` (v0.x) hardcodes its userProfile
// fetch against the long-deprecated Google+ People endpoint:
//   https://www.googleapis.com/plus/v1/people/me
// That route is now served by the "Legacy People API", which Google leaves
// disabled-by-default for new projects and intends to retire entirely. The
// symptom is a 403 PERMISSION_DENIED on the *callback* exchange (Google
// authentication itself succeeds, but profile lookup fails), surfaced as:
//   InternalOAuthError: failed to fetch user profile (status: 403 ...
//   Legacy People API has not been used in project ... or it is disabled.
//
// The modern, supported endpoint is the OIDC userinfo endpoint, which works
// against the standard `email profile openid` scopes without requiring ANY
// API to be enabled in the GCP project:
//   https://www.googleapis.com/oauth2/v3/userinfo
//
// Rather than swap to passport-google-oauth20 (an additional dependency that
// would also work), we monkey-patch the existing strategy's userProfile
// method to call the OIDC endpoint and map the OIDC claims onto the same
// passport profile shape the rest of loopback-component-passport expects.
const GoogleStrategy = require('passport-google-oauth2').Strategy;
GoogleStrategy.prototype.userProfile = function userProfile(accessToken, done) {
  this._oauth2.get(
    'https://www.googleapis.com/oauth2/v3/userinfo',
    accessToken,
    function(err, body) {
      if (err) {
        // Surface enough detail to actually diagnose callback failures
        // instead of opaque `failed to fetch user profile: undefined`.
        // err may be a string, an Error, or { statusCode, data } from
        // the oauth lib — log all useful fields.
        console.error('[google sso] userinfo fetch failed:', {
          statusCode: err && err.statusCode,
          data: err && err.data,
          message: err && err.message,
          err: err
        });
        return done(new Error(
          'failed to fetch user profile (status: ' +
          (err && err.statusCode) + '): ' +
          (err && (err.data || err.message || err))
        ));
      }
      try {
        const json = JSON.parse(body);
        const profile = {
          provider: 'google',
          id: json.sub,
          displayName: json.name,
          name: {
            givenName: json.given_name,
            familyName: json.family_name
          },
          emails: json.email
            ? [{ value: json.email, verified: !!json.email_verified }]
            : [],
          photos: json.picture ? [{ value: json.picture }] : [],
          _raw: body,
          _json: json
        };
        return done(null, profile);
      } catch (e) {
        console.error('[google sso] userinfo parse failed:', e, 'body:', body);
        return done(e);
      }
    }
  );
};

// passport-apple is vendored under ./vendor/passport-apple/node_modules so it
// stays isolated from the project's main dependency tree (its transitive deps
// like jsonwebtoken / jwks-rsa are nested inside that vendor folder).
//
// Two things to be careful about when wiring it up:
//   1. The package's main entry is `src/strategy.js` (per its package.json
//      `"main"` field). Earlier we required ".../passport-apple/src" as a
//      directory, but that folder has no index.js, so Node throws
//      `Cannot find module .../src`. Drop the `/src` suffix and let Node
//      resolve via package.json/main.
//   2. loopback-component-passport reads the `module:` field below and does
//      `require(options.module)` from inside its OWN file
//      (node_modules/loopback-component-passport/lib/passport-configurator.js).
//      A path relative to this file would resolve from the wrong place there,
//      so we must hand it an ABSOLUTE path.
const APPLE_MODULE_PATH = path.resolve(
  __dirname,
  '../vendor/passport-apple/node_modules/passport-apple'
);
const AppleStrategy = require(APPLE_MODULE_PATH).Strategy;

// ----------------------------------------------------------------------------
// passport-apple patch — coerce string rejections into Error instances
// ----------------------------------------------------------------------------
// vendor/passport-apple/src/token.js rejects its `generate()` promise with
// PLAIN STRINGS, e.g.
//   reject("AppleAuth Error - Couldn't read your Private Key file: " + err)
//   reject("AppleAuth Error – Error occurred while signing: " + err)
// Apple's strategy.js then forwards that string straight into passport-oauth2:
//   callback(error)  // <-- error is a string
// passport-oauth2 v2+ does `err instanceof InternalOAuthError` etc. inside
// _createOAuthError, but a constructor reference in there is undefined on
// some installed versions, producing the misleading
//   TypeError: Right-hand side of 'instanceof' is not an object
// (which is what we saw in prod: opbeat uuid 06c09c3c-...). That swallows
// the actual cause — almost always "private key file missing/unreadable" or
// "ES256 signing failed" — and surfaces as a 502 with zero useful detail.
//
// Wrap AppleStrategy's getOAuthAccessToken so that:
//   1. Any error reaching its callback is converted to a real Error.
//   2. The original message is preserved AND logged with full context so
//      the next failure tells us exactly what's wrong (missing key file,
//      bad team/key id, wrong client_id, etc.).
const _appleGetTokenInit = function() {
  const proto = AppleStrategy.prototype;
  if (proto.__rrccApplePatched) { return; }
  proto.__rrccApplePatched = true;
  // The original getOAuthAccessToken is assigned per-instance inside the
  // Strategy constructor (on this._oauth2), not on the prototype, so we
  // can't patch it at require-time. Instead, wrap `authenticate` to
  // install a per-instance wrapper the first time it runs.
  const origAuthenticate = proto.authenticate;
  proto.authenticate = function(req, options) {
    if (this._oauth2 && !this._oauth2.__rrccApplePatched) {
      this._oauth2.__rrccApplePatched = true;
      const origGetToken = this._oauth2.getOAuthAccessToken.bind(this._oauth2);
      this._oauth2.getOAuthAccessToken = function(code, params, cb) {
        return origGetToken(code, params, function(err, accessToken, refreshToken, idToken) {
          if (err && !(err instanceof Error)) {
            console.error('[apple sso] token exchange failed:', err);
            return cb(new Error(String(err)));
          }
          if (err) {
            console.error('[apple sso] token exchange failed:', {
              message: err.message,
              statusCode: err.statusCode,
              data: err.data
            });
          }
          return cb(err, accessToken, refreshToken, idToken);
        });
      };
    }
    return origAuthenticate.call(this, req, options);
  };
};
_appleGetTokenInit();

export default {
  local: {
    provider: 'local',
    module: 'passport-local',
    usernameField: 'email',
    passwordField: 'password',
    authPath: '/auth/local',
    successRedirect: successRedirect,
    failureRedirect: '/email-signin',
    session: true,
    failureFlash: true
  },
  'apple-login': {
    provider: 'apple',
    authScheme: 'oauth2',
    // Absolute path so loopback-component-passport's `require(options.module)`
    // (which executes from inside its own lib/ folder) resolves correctly.
    module: APPLE_MODULE_PATH,
    clientID: process.env.APPLE_CLIENT_ID,
    teamID: process.env.APPLE_TEAM_ID,
    keyID: process.env.APPLE_KEY_ID,
    privateKeyLocation: process.env.APPLE_PRIVATE_KEY_PATH,
    authPath: '/auth/apple',
    callbackURL: process.env.APPLE_CALLBACK_URL,
    callbackPath: '/auth/apple/callback',
    // Apple uses response_mode=form_post and POSTs the authorization
    // result (state + code + id_token + optional `user` JSON) to our
    // callbackPath. loopback-component-passport defaults to GET; without
    // this override the callback route is never registered for POST and
    // Apple's redirect lands on Express's default "Cannot POST
    // /auth/apple/callback" 404 handler. This is the same reason the
    // CSRF middleware (./middlewares/csurf.js) exempts this path.
    callbackHTTPMethod: 'post',
    successRedirect: successRedirect,
    failureRedirect: failureRedirect,
    scope: ['email', 'name'],
    failureFlash: true
  },
  'facebook-login': {
    provider: 'facebook',
    module: 'passport-facebook',
    clientID: process.env.FACEBOOK_ID,
    clientSecret: process.env.FACEBOOK_SECRET,
    authPath: '/auth/facebook',
    callbackURL: '/auth/facebook/callback',
    callbackPath: '/auth/facebook/callback',
    successRedirect: successRedirect,
    failureRedirect: failureRedirect,
    scope: ['email'],
    failureFlash: true
  },
  'facebook-link': {
    provider: 'facebook',
    module: 'passport-facebook',
    clientID: process.env.FACEBOOK_ID,
    clientSecret: process.env.FACEBOOK_SECRET,
    authPath: '/link/facebook',
    callbackURL: '/link/facebook/callback',
    callbackPath: '/link/facebook/callback',
    successRedirect: linkSuccessRedirect,
    failureRedirect: linkFailureRedirect,
    scope: ['email', 'user_likes'],
    link: true,
    failureFlash: true
  },
  'google-login': {
    provider: 'google',
    authScheme: 'oauth2',
    module: 'passport-google-oauth2',
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    authPath: '/auth/google',
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    callbackPath: '/auth/google/callback',
    successRedirect: successRedirect,
    failureRedirect: failureRedirect,
    scope: ['email', 'profile'],
    failureFlash: true
  },
  'google-link': {
    provider: 'google',
    authScheme: 'oauth2',
    module: 'passport-google-oauth2',
    // Reuse the same Google OAuth client as google-login. Previously this
    // read GOOGLE_ID/GOOGLE_SECRET (legacy names that no longer exist in
    // .env), which left the link flow silently broken.
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    authPath: '/link/google',
    callbackURL: '/link/google/callback',
    callbackPath: '/link/google/callback',
    successRedirect: linkSuccessRedirect,
    failureRedirect: linkFailureRedirect,
    scope: ['email', 'profile'],
    link: true,
    failureFlash: true
  },
  'twitter-login': {
    provider: 'twitter',
    authScheme: 'oauth',
    module: 'passport-twitter',
    authPath: '/auth/twitter',
    callbackURL: '/auth/twitter/callback',
    callbackPath: '/auth/twitter/callback',
    successRedirect: successRedirect,
    failureRedirect: failureRedirect,
    consumerKey: process.env.TWITTER_KEY,
    consumerSecret: process.env.TWITTER_SECRET,
    failureFlash: true
  },
  'twitter-link': {
    provider: 'twitter',
    authScheme: 'oauth',
    module: 'passport-twitter',
    authPath: '/link/twitter',
    callbackURL: '/link/twitter/callback',
    callbackPath: '/link/twitter/callback',
    successRedirect: linkSuccessRedirect,
    failureRedirect: linkFailureRedirect,
    consumerKey: process.env.TWITTER_KEY,
    consumerSecret: process.env.TWITTER_SECRET,
    link: true,
    failureFlash: true
  },
  'linkedin-login': {
    provider: 'linkedin',
    authScheme: 'oauth2',
    module: 'passport-linkedin-oauth2',
    authPath: '/auth/linkedin',
    callbackURL: '/auth/linkedin/callback',
    callbackPath: '/auth/linkedin/callback',
    successRedirect: successRedirect,
    failureRedirect: failureRedirect,
    clientID: process.env.LINKEDIN_ID,
    clientSecret: process.env.LINKEDIN_SECRET,
    scope: ['r_basicprofile', 'r_emailaddress'],
    authOptions: {
      state: process.env.LINKEDIN_STATE
    },
    failureFlash: true
  },
  'linkedin-link': {
    provider: 'linkedin',
    authScheme: 'oauth2',
    module: 'passport-linkedin-oauth2',
    authPath: '/link/linkedin',
    callbackURL: '/link/linkedin/callback',
    callbackPath: '/link/linkedin/callback',
    successRedirect: linkSuccessRedirect,
    failureRedirect: linkFailureRedirect,
    clientID: process.env.LINKEDIN_ID,
    clientSecret: process.env.LINKEDIN_SECRET,
    scope: ['r_basicprofile', 'r_emailaddress'],
    authOptions: {
      state: process.env.LINKEDIN_STATE
    },
    link: true,
    failureFlash: true
  },
  'github-login': {
    provider: 'github',
    authScheme: 'oauth2',
    module: 'passport-github',
    authPath: '/auth/github',
    callbackURL: process.env.GITHUB_CALLBACK_URL,
    callbackPath: '/auth/github/callback',
    successRedirect: successRedirect,
    failureRedirect: failureRedirect,
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    // Request the user's email so we can silently link/create accounts in
    // common/models/User-Identity.js without bouncing through /signup.
    // Without 'user:email', passport-github returns profile.emails === [].
    scope: ['user:email'],
    failureFlash: true
  },
  'github-link': {
    provider: 'github',
    authScheme: 'oauth2',
    module: 'passport-github',
    authPath: '/link/github',
    callbackURL: '/auth/github/callback/link',
    callbackPath: '/auth/github/callback/link',
    successRedirect: linkSuccessRedirect,
    failureRedirect: linkFailureRedirect,
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    scope: ['user:email'],
    link: true,
    failureFlash: true,
    successFlash: [ 'We\'ve updated your profile based ',
                    'on your your GitHub account.'
                  ].join('')
  }
};
