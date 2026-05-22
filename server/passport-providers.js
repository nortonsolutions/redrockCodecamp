const path = require('path');

const successRedirect = '/';
const failureRedirect = '/signin';
const linkSuccessRedirect = '/settings';
const linkFailureRedirect = '/settings';

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
    link: true,
    failureFlash: true,
    successFlash: [ 'We\'ve updated your profile based ',
                    'on your your GitHub account.'
                  ].join('')
  }
};
