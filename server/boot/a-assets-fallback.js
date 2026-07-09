/**
 * /assets trickle-down fallback — additive integration layer.
 * --------------------------------------------------------------------------
 * The primary static handler (server/middleware.json -> initial:before ->
 * loopback#static -> "$!../public") resolves `/assets/...` against
 * `redrockCodecamp/public/assets`. When a file is NOT found there, serve-static
 * calls next() and the request continues down the phase chain.
 *
 * This boot script adds a SECOND static root that catches `/assets/...` misses
 * and resolves them against the Silver Medal site tree
 * (`silvermedal.net/server/public`, whose sibling `.../public` is a symlink to
 * it). So:
 *
 *   request /assets/foo  ->  public/assets/foo                       (wins if present)
 *                        ->  silvermedal .../public/assets/foo       (fallback)
 *
 * IMPORTANT: we serve from the silvermedal *public root* (not the /assets
 * subfolder) and match the full `/assets/...` path, exactly like the proven
 * a-silvermedal-static.js handler. The earlier `app.middleware('initial',
 * '/assets', serve)` path-mount form did NOT reliably strip the `/assets`
 * prefix from req.url in this LoopBack version, so the static root never lined
 * up with the request and every solution file 404'd.
 *
 * Phase: registered in 'routes:before' (NOT a bare app.use(), which lands in
 * the 'routes' phase where z-lang-redirect.js's `app.all('*')` catch-all can
 * rewrite `/assets/...` -> `/en/assets/...` first). 'routes:before' runs after
 * the initial:before primary static, preserving the /public-first ordering.
 *
 * It also adds a small, path-safe directory index for `/assets/solutions/**`
 * so the Java source-code solution folders (CS106A / CS108) are browsable in a
 * web browser (serve-static with `index:false` does not list directories).
 */
import path from 'path';
import fs from 'fs';

const SILVERMEDAL_PUBLIC = path.resolve(__dirname, '../../silvermedal.net/server/public');
const SOLUTIONS_ROOT = path.join(SILVERMEDAL_PUBLIC, 'assets', 'solutions');
const ASSETS_PREFIX = '/assets';
const SOLUTIONS_PREFIX = '/assets/solutions';

export default function assetsFallback(app) {
  const serve = app.loopback.static(SILVERMEDAL_PUBLIC, { index: false });

  // Boot-time visibility: confirm the resolved fallback root actually exists.
  console.log(
    '[assets-fallback] silvermedal public root:',
    SILVERMEDAL_PUBLIC,
    fs.existsSync(SILVERMEDAL_PUBLIC) ? '(exists)' : '(MISSING)'
  );
  console.log(
    '[assets-fallback] solutions root:',
    SOLUTIONS_ROOT,
    fs.existsSync(SOLUTIONS_ROOT) ? '(exists)' : '(MISSING)'
  );

  app.middleware('routes:before', function assetsFallbackGuard(req, res, next) {
    // Only act on /assets and /assets/* — everything else passes straight
    // through so codecamp routing is completely unaffected.
    if (req.path !== ASSETS_PREFIX && !req.path.startsWith(ASSETS_PREFIX + '/')) {
      return next();
    }

    // Terminal 404 for asset misses: if neither the primary static root nor
    // this fallback has the file, do NOT continue down the chain —
    // z-lang-redirect's app.all('*') would rewrite /assets/foo.zip to
    // /en/assets/foo.zip, producing a confusing redirect loop instead of an
    // honest "file not found". Assets are files; they never need lang prefixes.
    function terminal404() {
      res.status(404).type('txt').send('Not found: ' + req.path);
    }

    // Browsable directory index for the solution source trees. If the target
    // is a real file (or not a solutions path), this falls through to `serve`.
    if (req.path === SOLUTIONS_PREFIX || req.path.startsWith(SOLUTIONS_PREFIX + '/')) {
      return solutionsIndex(req, res, function listingFallthrough() {
        return serve(req, res, terminal404);
      });
    }

    return serve(req, res, terminal404);
  });
}

// Directory index + file server for /assets/solutions/**. Receives the FULL
// request path (no mount-stripping); resolves it against SOLUTIONS_ROOT.
// Directories render a browsable listing; real files (including those reached
// through symlinks in the tree) are streamed directly. Calls next() only for
// genuine misses / unsupported methods so the static handler can still try.
function solutionsIndex(req, res, next) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return next();
  }

  let rel;
  try {
    rel = decodeURIComponent(req.path.slice(SOLUTIONS_PREFIX.length)) || '/';
  } catch (err) {
    return next();
  }

  const abs = path.join(SOLUTIONS_ROOT, rel);

  // Containment guard — never resolve outside the solutions root.
  if (abs !== SOLUTIONS_ROOT && !abs.startsWith(SOLUTIONS_ROOT + path.sep)) {
    return next();
  }

  let stat;
  try {
    stat = fs.statSync(abs);
  } catch (err) {
    return next();
  }
  if (!stat.isDirectory()) {
    // Serve the file OURSELVES rather than falling through to loopback.static.
    // Parts of the solutions tree are symlinks (e.g. `eloquentJavascript` ->
    // the sibling real folder). serve-static/send can reject a symlinked path
    // with a 403-style error; because that arrives as `next(err)`, the prod
    // error handler (middlewares/error-handlers.js) turns it into a redirect
    // to '/' with an "Oops! Something went wrong" flash instead of delivering
    // the file. Resolving the real path up front and streaming it directly
    // follows the symlink transparently and never errors out.
    let real;
    try {
      real = fs.realpathSync(abs);
    } catch (err) {
      return next();
    }
    // Containment: the resolved target must stay inside the Silver Medal public
    // tree (symlinks may point at siblings within it, but never outside it).
    if (real !== SILVERMEDAL_PUBLIC && !real.startsWith(SILVERMEDAL_PUBLIC + path.sep)) {
      return next();
    }
    return res.sendFile(real, function afterSend(err) {
      if (err) {
        next(err);
      }
    });
  }

  // Canonicalise: directories are listed only with a trailing slash so that
  // relative links in the generated listing resolve correctly.
  if (!req.path.endsWith('/')) {
    const qIdx = req.originalUrl.indexOf('?');
    const base = qIdx === -1 ? req.originalUrl : req.originalUrl.slice(0, qIdx);
    const query = qIdx === -1 ? '' : req.originalUrl.slice(qIdx);
    return res.redirect(301, base + '/' + query);
  }

  let entries;
  try {
    entries = fs.readdirSync(abs, { withFileTypes: true });
  } catch (err) {
    return next();
  }

  const dirs = [];
  const files = [];
  for (const entry of entries) {
    if (entry.name.startsWith('.')) {
      continue;
    }
    if (entry.isDirectory()) {
      dirs.push(entry.name);
    } else {
      files.push(entry.name);
    }
  }
  dirs.sort((a, b) => a.localeCompare(b));
  files.sort((a, b) => a.localeCompare(b));

  res.type('html').send(renderListing(rel, dirs, files));
}


function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}

function renderListing(rel, dirs, files) {
  const here = '/assets/solutions' + (rel === '/' ? '' : rel);
  const rows = [];

  if (rel !== '/' && rel !== '') {
    rows.push('<li class="dir"><a href="../">../</a></li>');
  }
  for (const name of dirs) {
    const href = encodeURIComponent(name) + '/';
    rows.push(`<li class="dir"><a href="${href}">${escapeHtml(name)}/</a></li>`);
  }
  for (const name of files) {
    const href = encodeURIComponent(name);
    rows.push(`<li class="file"><a href="${href}">${escapeHtml(name)}</a></li>`);
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Index of ${escapeHtml(here)}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
         background: #0f172a; color: #e2e8f0; margin: 0; padding: 2.5rem 1.5rem; }
  .wrap { max-width: 820px; margin: 0 auto; }
  h1 { font-size: 1.1rem; font-weight: 600; color: #93c5fd; word-break: break-all; }
  ul { list-style: none; padding: 0; margin: 1.5rem 0 0;
       border: 1px solid #1e293b; border-radius: 12px; overflow: hidden; }
  li { border-top: 1px solid #1e293b; }
  li:first-child { border-top: none; }
  li a { display: block; padding: 0.7rem 1rem; text-decoration: none; color: #e2e8f0; }
  li a:hover { background: #1e293b; }
  li.dir a { color: #7dd3fc; font-weight: 500; }
  .crumb a { color: #64748b; text-decoration: none; }
</style>
</head>
<body>
  <div class="wrap">
    <h1>Index of ${escapeHtml(here)}</h1>
    <ul>${rows.join('\n')}</ul>
  </div>
</body>
</html>`;
}
