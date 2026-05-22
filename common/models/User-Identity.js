import { Observable } from 'rx';
// import debug from 'debug';
import dedent from 'dedent';
import uuid from 'uuid';

import {
  getSocialProvider,
  getUsernameFromProvider,
  createUserUpdatesFromProfile
} from '../../server/utils/auth';
import { observeMethod, observeQuery } from '../../server/utils/rx';
import { wrapHandledError } from '../../server/utils/create-handled-error.js';

// const log = debug('rrcc:models:userIdent');

// Pull a usable email out of whatever shape the passport profile arrived in.
// Different strategies populate different fields:
//   - passport-google-oauth20 / our patched oauth2: profile.emails[0].value
//   - passport-github: profile.emails[0].value (when 'user:email' scope granted)
//     OR profile._json.email (older payloads)
//   - passport-apple: profile.email at the top level on first auth only
//   - passport-facebook: profile.emails[0].value when granted
function extractProfileEmail(profile) {
  if (!profile) return null;
  if (Array.isArray(profile.emails) && profile.emails.length) {
    const first = profile.emails.find(e => e && e.value) || profile.emails[0];
    if (first && first.value) return String(first.value).toLowerCase();
  }
  if (profile.email) return String(profile.email).toLowerCase();
  if (profile._json) {
    if (profile._json.email) return String(profile._json.email).toLowerCase();
  }
  return null;
}

export default function(UserIdent) {
  UserIdent.on('dataSourceAttached', () => {
    UserIdent.findOne$ = observeMethod(UserIdent, 'findOne');
  });
  // original source
  // github.com/strongloop/loopback-component-passport
  // find identity if it exist
  // if not, look up an existing user by the SSO-provided email and
  //   silently link this provider to that user (no /signup detour). When no
  //   matching user exists, auto-create one from the profile and link in the
  //   same request so SSO completes in a single round-trip with no user
  //   prompts. See the createIdentityAndLogin helper below.
  // if yes and github
  //   update profile
  //   update username
  //   update picture
  UserIdent.login = function(
    _provider,
    authScheme,
    profile,
    credentials,
    options,
    cb
  ) {
    const User = UserIdent.app.models.User;
    const AccessToken = UserIdent.app.models.AccessToken;
    const provider = getSocialProvider(_provider);
    options = options || {};
    if (typeof options === 'function' && !cb) {
      cb = options;
      options = {};
    }
    profile.id = profile.id || profile.openid;

    // Issues an AccessToken for a user and invokes the passport callback.
    // Used by both the "identity already exists" path and the new
    // "link or create on the fly" path below.
    const finishLogin = (user, identity) =>
      observeQuery(
        AccessToken,
        'create',
        {
          userId: user.id,
          created: new Date(),
          ttl: user.constructor.settings.ttl
        }
      ).map(token => ({ user, identity, token }));

    // Create a userIdentity row tying this SSO provider/externalId to an
    // existing user, then complete the login. This is what runs when the
    // SSO flow finds either (a) a matching user-by-email or (b) a freshly
    // created user.
    const createIdentityAndLogin = user =>
      observeQuery(
        UserIdent,
        'create',
        {
          provider: provider,
          externalId: profile.id,
          authScheme: authScheme,
          profile: null,
          credentials: credentials,
          userId: user.id,
          created: new Date(),
          modified: new Date()
        }
      ).flatMap(identity => {
        // Fold any profile-derived fields (avatar, github bio, etc.) into
        // the user record so the freshly linked account looks complete on
        // first login.
        const userUpdates = createUserUpdatesFromProfile(provider, profile);
        const updateUser = userUpdates && Object.keys(userUpdates).length
          ? User.update$({ id: user.id }, userUpdates).map(() => user)
          : Observable.of(user);
        return updateUser.flatMap(u => finishLogin(u, identity));
      });

    // Auto-create a user from the SSO profile when no account exists for
    // the provided email. We mark emailVerified=true because the SSO
    // provider has already attested to the email; this lets the user skip
    // the verification step on first login.
    //
    // Username generation mirrors what user.js's beforeRemote('create')
    // does for password sign-ups: 'fcc' + uuid.v4(). For github we'd
    // ideally prefer the github username, but uniqueness is enforced at
    // the schema level — collision-safe random is the simplest path that
    // never blocks the login. The user can change their username later in
    // /settings.
    const createUserAndLogin = (email, profileForUser) => {
      const userPayload = {
        email: email,
        username: 'fcc' + uuid.v4(),
        emailVerified: true,
        // bcrypt-hashable random password; the user will never use it
        // (they sign in via SSO) but loopback's User model requires a
        // non-empty password field on create.
        password: uuid.v4() + uuid.v4(),
        // Fold any provider-specific profile fields in up front so we
        // don't need a second update round-trip.
        ...createUserUpdatesFromProfile(provider, profileForUser)
      };
      // Re-set username AFTER spread — github's createUserUpdatesFromProfile
      // sets `username` to the github handle, which can collide with an
      // existing account. Force our uuid-based username to keep create
      // atomic; the user can rename in /settings.
      userPayload.username = 'fcc' + uuid.v4();

      return observeQuery(User, 'create', userPayload)
        .flatMap(newUser => createIdentityAndLogin(newUser));
    };

    const query = {
      where: {
        provider: provider,
        externalId: profile.id
      },
      include: 'user'
    };
    return UserIdent.findOne$(query)
      .flatMap(identity => {
        if (!identity) {
          // No identity row for this (provider, externalId). Try to link
          // to an existing account by email; failing that, auto-create.
          const email = extractProfileEmail(profile);
          if (!email) {
            // No email from the provider (rare — Apple users who hide
            // email won't supply one on subsequent logins, and github
            // users who marked their email private may not either).
            // Fall back to the original signup-redirect behavior so the
            // user can finish account creation manually.
            throw wrapHandledError(
              new Error('user identity account not found'),
              {
                message: dedent`
                  We could not get an email address from ${provider}.
                  Please create an account below to continue.
                `,
                type: 'info',
                redirectTo: '/signup'
              }
            );
          }
          return Observable.fromPromise(
            User.findOne({ where: { email: email } })
          ).flatMap(existingUser => {
            if (existingUser) {
              // Existing email-based (or other-provider) account: silently
              // bind this SSO provider to it and log in. The user goes
              // straight to '/' with no prompts and no delay.
              return createIdentityAndLogin(existingUser);
            }
            // Brand new user: create the account from the SSO profile,
            // link the identity, and log in — all in this one request.
            return createUserAndLogin(email, profile);
          });
        }
        const modified = new Date();
        const user = identity.user();
        if (!user) {
          // Identity row exists but its user was deleted. Re-create a
          // user from the (still valid) SSO profile and rebind this
          // identity row to it, then log in.
          const email = extractProfileEmail(profile);
          if (!email) {
            // No email available to rebuild the account — fall back to
            // the legacy orphan-redirect behavior.
            const username = getUsernameFromProvider(provider, profile);
            return observeQuery(
              identity,
              'updateAttributes',
              { isOrphaned: username || true }
            ).do(() => {
              throw wrapHandledError(
                new Error('user identity is not associated with a user'),
                {
                  type: 'info',
                  redirectTo: '/signup',
                  message: dedent`
  The user account associated with the ${provider} user ${username || 'Anon'}
  no longer exists.
                  `
                }
              );
            });
          }
          // Try to find another user by email (e.g. the user re-signed up
          // via a different provider after their original account was
          // deleted), otherwise create one. Then re-point this identity
          // row at the resurrected user.
          return Observable.fromPromise(
            User.findOne({ where: { email: email } })
          ).flatMap(found => {
            const ensureUser = found
              ? Observable.of(found)
              : observeQuery(User, 'create', {
                  email: email,
                  username: 'fcc' + uuid.v4(),
                  emailVerified: true,
                  password: uuid.v4() + uuid.v4()
                });
            return ensureUser.flatMap(resurrectedUser =>
              observeQuery(identity, 'updateAttributes', {
                userId: resurrectedUser.id,
                credentials: credentials,
                profile: null,
                modified
              }).flatMap(updatedIdentity =>
                finishLogin(resurrectedUser, updatedIdentity)
              )
            );
          });
        }
        const updateUser = User.update$(
          { id: user.id },
          createUserUpdatesFromProfile(provider, profile)
        ).map(() => user);
        // identity already exists
        // find user and log them in
        identity.credentials = credentials;
        const attributes = {
          // we no longer want to keep the profile
          // this is information we do not need or use
          profile: null,
          credentials: credentials,
          modified
        };
        const updateIdentity = observeQuery(
          identity,
          'updateAttributes',
          attributes
        );
        const createToken = observeQuery(
          AccessToken,
          'create',
          {
            userId: user.id,
            created: new Date(),
            ttl: user.constructor.settings.ttl
          }
        );
        return Observable.combineLatest(
          updateUser,
          updateIdentity,
          createToken,
          (user, identity, token) => ({ user, identity, token })
        );
      })
      .subscribe(
        ({ user, identity, token }) => cb(null, user, identity, token),
        cb
      );
  };
}
