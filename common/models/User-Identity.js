import dedent from 'dedent';
import uuid from 'uuid';

import {
  getSocialProvider,
  createUserUpdatesFromProfile
} from '../../server/utils/auth';
import { observeMethod } from '../../server/utils/rx';
import { wrapHandledError } from '../../server/utils/create-handled-error.js';

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
    // Prefer a verified email when the provider supplies that flag
    // (Google/GitHub do). Otherwise take the first usable value.
    const verified = profile.emails.find(e => e && e.value && e.verified);
    if (verified) return String(verified.value).toLowerCase();
    const first = profile.emails.find(e => e && e.value) || profile.emails[0];
    if (first && first.value) return String(first.value).toLowerCase();
  }
  if (profile.email) return String(profile.email).toLowerCase();
  if (profile._json) {
    if (profile._json.email) {
      return String(profile._json.email).toLowerCase();
    }
  }
  return null;
}

// Synthesize a stable placeholder email for SSO accounts whose provider
// either didn't return one or whose user marked it private. This keeps the
// auto-link / auto-create flow working in 100% of cases, so users never see
// the /signup detour after an SSO callback. The synthetic address is unique
// per (provider, externalId), uses a non-routable subdomain, and can be
// changed by the user later from /settings.
//
// Format: <provider>-<externalId>@no-reply.redrockcode.local
function synthesizeProfileEmail(provider, profile) {
  const id = profile && (profile.id || profile.openid);
  if (!id) return null;
  const safeProvider = String(provider).toLowerCase().replace(/[^a-z0-9]/g, '');
  const safeId = String(id).toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${safeProvider}-${safeId}@no-reply.redrockcode.local`;
}

export default function(UserIdent) {
  UserIdent.on('dataSourceAttached', () => {
    UserIdent.findOne$ = observeMethod(UserIdent, 'findOne');
  });

  // ------------------------------------------------------------------
  // Universal SSO login resolver — "magic bullet" upsert.
  // ------------------------------------------------------------------
  // For every SSO callback we run two lookups in parallel and then
  // collapse them into a single (user, identity) pair:
  //
  //   identityByExt = first userIdentity row for (provider, externalId)
  //   userByEmail   = first user whose email matches the SSO-supplied
  //                   email (or a stable synthetic fallback)
  //
  // Target user is chosen by priority:
  //   1. userByEmail (latest SSO email is authoritative — naturally lets
  //      multiple SSO providers / multiple emails resolve to one user)
  //   2. identityByExt.user()  (returning user, no email change)
  //   3. create a fresh user from the profile
  //
  // The identity row is then UPSERTED to point at the target user with
  // refreshed credentials, so:
  //   - repeat logins refresh credentials in place
  //   - users who change their SSO email to one matching another local
  //     account get re-bound to that account silently
  //   - first-time logins create a row
  //
  // No prompts, no /signup detour, no warnings. The whole flow always
  // completes in a single round-trip ending at successRedirect ('/').
  UserIdent.login = function(
    _provider,
    authScheme,
    profile,
    credentials,
    options,
    cb
  ) {
    if (typeof options === 'function' && !cb) {
      cb = options;
      options = {};
    }
    const User = UserIdent.app.models.User;
    const AccessToken = UserIdent.app.models.AccessToken;
    const provider = getSocialProvider(_provider);
    profile = profile || {};
    profile.id = profile.id || profile.openid;

    if (!profile.id) {
      // No stable external id at all — genuinely unrecoverable; the
      // SSO provider returned nothing we can key off of.
      return cb(wrapHandledError(
        new Error('SSO profile missing id'),
        {
          type: 'info',
          redirectTo: '/signup',
          message: dedent`
            We could not get a usable identifier from ${provider}.
            Please create an account below to continue.
          `
        }
      ));
    }

    const profileEmail = extractProfileEmail(profile);
    const lookupEmail = profileEmail
      || synthesizeProfileEmail(provider, profile);

    const createFreshUser = () => {
      const userPayload = {
        email: lookupEmail,
        emailVerified: true,
        password: uuid.v4() + uuid.v4(),
        ...createUserUpdatesFromProfile(provider, profile),
        // Force a uuid username AFTER spread so github's handle (which
        // can collide) doesn't block creation. User can rename in
        // /settings.
        username: 'fcc' + uuid.v4()
      };
      return User.create(userPayload);
    };

    Promise.all([
      UserIdent.findOne({
        where: { provider, externalId: profile.id },
        include: 'user'
      }),
      lookupEmail
        ? User.findOne({ where: { email: lookupEmail } })
        : Promise.resolve(null)
    ])
      .then(([identityByExt, userByEmail]) => {
        const linkedUser = identityByExt
          && typeof identityByExt.user === 'function'
          ? identityByExt.user()
          : null;

        // Pick target user: email-matched > identity-linked > new.
        const pickUser = userByEmail
          ? Promise.resolve(userByEmail)
          : linkedUser
            ? Promise.resolve(linkedUser)
            : createFreshUser();

        return pickUser.then(user => {
          const now = new Date();

          // Upsert identity row → always point at the chosen user with
          // refreshed credentials.
          const upsertIdentity = identityByExt
            ? identityByExt.updateAttributes({
                userId: user.id,
                authScheme,
                credentials,
                profile: null,
                modified: now
              })
            : UserIdent.create({
                provider,
                externalId: profile.id,
                authScheme,
                profile: null,
                credentials,
                userId: user.id,
                created: now,
                modified: now
              });

          return upsertIdentity.then(identity => {
            // Fold provider-derived fields (github bio/avatar, etc.)
            // onto the user. Non-fatal if it fails.
            const userUpdates = createUserUpdatesFromProfile(provider, profile);
            const applyUpdates = userUpdates && Object.keys(userUpdates).length
              ? user.updateAttributes(userUpdates).catch(() => user)
              : Promise.resolve(user);

            return applyUpdates.then(updatedUser => {
              // Synthetic → real email upgrade. Only if (a) the current
              // user email is one of our synthetic placeholders, (b) we
              // now have a real email, and (c) no OTHER user already
              // owns that email.
              const needsRealEmail = profileEmail
                && updatedUser.email
                && updatedUser.email.endsWith(
                  '@no-reply.redrockcode.local'
                )
                && profileEmail !== updatedUser.email;
              const ownerOk = !userByEmail
                || String(userByEmail.id) === String(updatedUser.id);
              const adoptEmail = (needsRealEmail && ownerOk)
                ? updatedUser
                    .updateAttributes({
                      email: profileEmail,
                      emailVerified: true
                    })
                    .catch(() => updatedUser)
                : Promise.resolve(updatedUser);

              return adoptEmail.then(finalUser =>
                AccessToken.create({
                  userId: finalUser.id,
                  created: new Date(),
                  ttl: finalUser.constructor.settings.ttl
                }).then(token => ({
                  user: finalUser,
                  identity,
                  token
                }))
              );
            });
          });
        });
      })
      .then(({ user, identity, token }) => cb(null, user, identity, token))
      .catch(cb);
  };
}
