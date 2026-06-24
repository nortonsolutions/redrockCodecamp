/**
 * Serves the Silver Medal static site (the salvaged silvermedal.net/public
 * assets: about.html, donate.html, health.html, styles.css, images, etc.)
 * from a dedicated directory so it can fully replace the retired standalone
 * silvermedal.net Express server.
 *
 * It lives in its own folder (NOT merged into ../../public) to avoid
 * clobbering the many same-named codecamp assets (icon_*.png, logo.png,
 * room_*.png, testimonial_*.jpg, ...). The mount is scoped to landing-portal
 * hosts (silvermedal.net + the ?portal=silvermedal dev override) so these
 * pages never leak onto redrockcode.com / codebasecamp.* and is checked
 * after the codecamp static assets, so codecamp always wins on any overlap.
 *
 * Performance: although boot scripts run alphabetically (so this `app.use`
 * registers ahead of the other boot routes), it deliberately does NO disk
 * work for dynamic requests. It only hands a request to express.static when
 * it is a GET/HEAD for a path that actually looks like a file (has an
 * extension) and is not under /api. So /signin, /challenges/*, /api/* etc.
 * fall straight through with a cheap regex test and never hit the filesystem.
 *
 * Move the assets into place with:
 *   git mv silvermedal.net/server/public public-silvermedal
 * (or copy them) then the standalone silvermedal.net server can be removed.
 */
import path from 'path';
import fs from 'fs';

// A request only warrants a filesystem lookup if it targets a concrete asset:
// a trailing ".<ext>" and not the API namespace.
const ASSET_PATH = /\.[a-zA-Z0-9]+$/;

module.exports = function(app) {
  const dir = path.resolve(__dirname, '../../public-silvermedal');

  if (!fs.existsSync(dir)) {
    return;
  }

  const serveStatic = app.loopback.static(dir, { index: false });

  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return next();
    }
    const branding = res.locals && res.locals.branding;
    if (!branding || !branding.isLandingPortal) {
      return next();
    }
    // Skip the disk stat for anything that isn't an obvious static asset.
    if (req.path.indexOf('/api/') === 0 || !ASSET_PATH.test(req.path)) {
      return next();
    }
    return serveStatic(req, res, next);
  });
};
