const path = require('path');

const successRedirect = '/';
const failureRedirect = '/signin';
const linkSuccessRedirect = '/settings';
const linkFailureRedirect = '/settings';

// ----------------------------------------------------------------------------
// passport-google-oauth2 patch
// ----------------------------------------------------------------------------
// passport-google-oauth2 0.x hardcodes the dead Google+ People endpoint
// (`/plus/v1/people/me`) and fails with 403 PERMISSION_DENIED. Point it at
// the OIDC userinfo endpoint, which works against `email profile` scopes
// without any GCP API needing to be enabled.
const GoogleStrategy = require('passport-google-oauth2').Strategy;
GoogleStrategy.prototype.userProfile = function userProfile(accessToken, done) {
  this._oauth2.get(
    'https://www.googleapis.com/oauth2/v3/userinfo',
    accessToken,
    function(err, body) {
      if (err) { return done(err); }
      try {
        const json = JSON.parse(body);
        return done(null, {
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
          _json: json
        });
      } catch (e) { return done(e); }
    }
  );
};

// ----------------------------------------------------------------------------
// passport-apple patch — decode the id_token JWT into a usable profile
// ----------------------------------------------------------------------------
// Apple returns the user identity in the OIDC id_token (a JWT), NOT via a
// /userinfo endpoint, so passport-oauth2's default `userProfile` is a no-op
// (`profile = {}`). With loopback-component-passport's arity-5 verify
// signature, the id_token never reaches our UserIdentity.login at all,
// leaving us with an empty profile -> no `id`, no email -> the auto-create
// path bails with `redirectTo: '/signup'`. Decoding the id_token here
// populates profile.id (= apple sub) and profile.emails so SSO completes
// in a single hop straight to '/'.
const APPLE_MODULE_PATH = path.resolve(
  __dirname,
  '../vendor/passport-apple/node_modules/passport-apple'
);
const AppleStrategy = require(APPLE_MODULE_PATH).Strategy;
const jwt = require(path.resolve(
  __dirname,
  '../vendor/passport-apple/node_modules/jsonwebtoken'
));

// Stash the id_token off the per-instance _oauth2.getOAuthAccessToken
// callback (which is where passport-apple delivers it) so userProfile can
// read it. The wrapper is installed lazily on first authenticate() call
// because _oauth2 is set up in the Strategy constructor, not the prototype.
const origAppleAuthenticate = AppleStrategy.prototype.authenticate;
AppleStrategy.prototype.authenticate = function(req, options) {
  if (this._oauth2 && !this._oauth2.__rrccPatched) {
    this._oauth2.__rrccPatched = true;
    const origGetToken = this._oauth2.getOAuthAccessToken.bind(this._oauth2);
    const oauth2 = this._oauth2;
    this._oauth2.getOAuthAccessToken = function(code, params, cb) {
      return origGetToken(code, params, function(err, at, rt, idToken) {
        if (!err) { oauth2.__lastIdToken = idToken; }
        cb(err, at, rt, idToken);
      });
    };
  }
  return origAppleAuthenticate.call(this, req, options);
};

AppleStrategy.prototype.userProfile = function userProfile(_at, done) {
  const idToken = this._oauth2 && this._oauth2.__lastIdToken;
  if (!idToken) { return done(null, { provider: 'apple' }); }
  const claims = jwt.decode(idToken) || {};
  return done(null, {
    provider: 'apple',
    id: claims.sub,
    emails: claims.email
      ? [{
          value: claims.email,
          verified: claims.email_verified === true ||
                    claims.email_verified === 'true'
        }]
      : [],
    _json: claims
  });
};

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
