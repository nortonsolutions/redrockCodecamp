/**
 * Silver Medal static pages — additive integration layer.
 * --------------------------------------------------------------------------
 * Serves the standalone Silver Medal property pages (about.html, donate.html,
 * health.html, assets, etc.) from the codecamp app so the retired port-5000
 * Express server is no longer needed. Without this, links like `/about.html`
 * fall through every router to z-lang-redirect.js, whose `app.all('*')`
 * catch-all rewrites unrecognized first segments to `/en/...`.
 *
 * Scope: only hosts whose branding sets `isLandingPortal: true`
 * (middlewares/domain-branding.js) get these files, so codecamp-only hosts are
 * unaffected. `index: false` keeps the landing portal (a-landing-portal.js,
 * which boots first) authoritative for the exact root path '/'.
 *
 * Boot order: the 'a-' prefix loads this before home.js and z-lang-redirect.js,
 * so the static handler gets first crack at `/about.html` & friends.
 *
 * NOTE: the files currently live under `silvermedal.net/public` (the old
 * standalone server's web root). The planned tidy-up is `git mv
 * silvermedal.net/public public-silvermedal`; update STATIC_ROOT below if/when
 * that move happens.
 */
import path from 'path';

const STATIC_ROOT = path.resolve(__dirname, '../../silvermedal.net/public');

export default function silvermedalStatic(app) {
  const serve = app.loopback.static(STATIC_ROOT, { index: false });
  app.use(function silvermedalStaticGuard(req, res, next) {
    const branding = res.locals.branding || {};
    if (!branding.isLandingPortal) {
      return next();
    }
    return serve(req, res, next);
  });
}
