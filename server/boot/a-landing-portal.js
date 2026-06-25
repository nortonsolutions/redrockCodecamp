/**
 * Silver Medal landing portal — additive integration layer.
 * --------------------------------------------------------------------------
 * Renders the branded entryway (server/views/silvermedal-landing.jade) at the
 * site ROOT for hosts whose branding config sets `isLandingPortal: true`
 * (resolved by middlewares/domain-branding.js). Everything else — /signin,
 * /challenges, /:lang/*, the language-aware redirects — is left to the
 * baseline routers, untouched.
 *
 * Why a dedicated boot file (instead of branching inside home.js):
 *   - Keeps per-brand portal behavior OUT of the core home controller so the
 *     baseline codebase stays unmodified; this is the same additive pattern as
 *     a-silvermedal-static.js and a-workshops.js.
 *   - Scopes the takeover to the EXACT root path '/'. The previous version
 *     branched in home.js index(), which is also mounted at '/:lang', so it
 *     swallowed single-segment paths like '/signin' and rendered the landing
 *     page instead of letting z-lang-redirect rewrite them to '/en/signin'.
 *
 * Boot order: the 'a-' prefix makes this load before home.js, so this '/'
 * handler is registered first and wins for the root path. Non-portal hosts
 * fall straight through to home.js via next().
 */
export default function landingPortal(app) {
  app.get('/', function renderLandingPortal(req, res, next) {
    const branding = res.locals.branding || {};
    if (!branding.isLandingPortal) {
      return next();
    }
    // req.lang is set by middlewares/add-lang.js (URL > user.languageTag > en)
    // so the entryway links keep the locale the academy expects.
    const lang = req.lang || res.locals.lang || 'en';
    return res.render('silvermedal-landing', {
      title: branding.businessAppName,
      branding: branding,
      user: req.user,
      continueUrl: req.user ?
        `/${lang}/challenges/current-challenge` : `/${lang}/signin`
    });
  });
}
