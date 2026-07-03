/**
 * Course Resources page — /courses (and /en/courses).
 * --------------------------------------------------------------------------
 * Public landing page that surfaces two bodies of learning material:
 *
 *   (a) Eloquent JavaScript — Haverbeke's original book (served from
 *       /public/haverbeke) plus per-chapter solutions (served via the
 *       /assets trickle-down in a-assets-fallback.js from
 *       silvermedal.net/public/assets/solutions/eloquentJavascript).
 *
 *   (b) CS 106A / CS 108 (Java) — Stanford Programming Methodology handouts,
 *       lecture transcripts and downloads (/public/assets/ProgrammingMethodology)
 *       plus per-assignment sample solutions (/assets/solutions/CS106A and
 *       /assets/solutions/CS108).
 *
 * Directory contents are read once at boot and cached, so the page stays in
 * sync with whatever files actually exist without hand-maintained lists.
 */
const path = require('path');
const fs = require('fs');

const PUBLIC_ROOT = path.join(__dirname, '../../public');
// Read the solutions listing from the REAL Silver Medal public tree
// (`silvermedal.net/server/public`), NOT the sibling `silvermedal.net/public`
// symlink alias. The alias is not guaranteed to exist on every deployment
// (symlinks are frequently dropped by rsync/git checkouts), and when it is
// missing `fs.readdirSync` throws -> safeReaddir returns [] -> the page shows
// no Eloquent/CS106A/CS108/download resources on that host. Pointing at the
// real directory (the same root a-assets-fallback.js serves from) keeps the
// read path and the serve path in sync. See repo memory: "trust server/public".
const SILVER_SOLUTIONS = path.join(__dirname, '../../silvermedal.net/server/public/assets/solutions');

const ICSP_DIR = path.join(PUBLIC_ROOT, 'assets/ProgrammingMethodology/materials/icspmcs106a');
const ICSP_URL = '/assets/ProgrammingMethodology/materials/icspmcs106a';

module.exports = function(app) {
  const data = buildCourseData();

  const router = app.loopback.Router();
  router.get('/', (req, res) => {
    res.render('courses', Object.assign({ title: 'Course Resources' }, data));
  });

  app.use('/courses', router);
  app.use('/en/courses', router);

  console.log(
    `[courses] handouts:${data.handouts.length} lectures:${data.lectures.length} ` +
    `eloquent:${data.eloquent.length} cs106a:${data.cs106a.length} cs108:${data.cs108.length}`
  );
};

// ---------------------------------------------------------------------------

function buildCourseData() {
  const icspFiles = safeReaddir(ICSP_DIR);

  const handouts = icspFiles
    .filter(f => f.toLowerCase().endsWith('.pdf'))
    .sort(numericLeadSort)
    .map(f => ({
      number: leadingNumber(f),
      name: prettifyHandout(f),
      url: `${ICSP_URL}/${encodeURIComponent(f)}`
    }));

  const zips = icspFiles
    .filter(f => f.toLowerCase().endsWith('.zip'))
    .sort((a, b) => a.localeCompare(b))
    .map(f => ({ name: f, url: `${ICSP_URL}/${encodeURIComponent(f)}` }));

  // Lecture transcripts: pair each Lecture NN .html + .pdf.
  const transFiles = safeReaddir(path.join(ICSP_DIR, 'transcripts'));
  const lectureMap = {};
  transFiles.forEach(f => {
    const m = f.match(/Lecture(\d+)\.(html|pdf)$/i);
    if (!m) {
      return;
    }
    const n = parseInt(m[1], 10);
    lectureMap[n] = lectureMap[n] || { number: n };
    lectureMap[n][m[2].toLowerCase()] = `${ICSP_URL}/transcripts/${encodeURIComponent(f)}`;
  });
  const lectures = Object.keys(lectureMap)
    .map(k => lectureMap[k])
    .sort((a, b) => a.number - b.number);

  // Eloquent JavaScript per-chapter solutions.
  const eloquent = safeReaddir(path.join(SILVER_SOLUTIONS, 'eloquentJavascript'))
    .filter(f => f.toLowerCase().endsWith('.html'))
    .sort(numericLeadSort)
    .map(f => ({
      name: prettifyEloquent(f),
      url: `/assets/solutions/eloquentJavascript/${encodeURIComponent(f)}`
    }));

  const cs106a = listSolutionFolders('CS106A');
  const cs108 = listSolutionFolders('CS108');

  // Top-level bundled downloads (whole-course zips).
  const downloads = safeReaddir(SILVER_SOLUTIONS)
    .filter(f => f.toLowerCase().endsWith('.zip'))
    .sort((a, b) => a.localeCompare(b))
    .map(f => ({ name: f, url: `/assets/solutions/${encodeURIComponent(f)}` }));

  return {
    haverbekeBook: '/haverbeke/eloquentjavascript.net/index.html',
    haverbekePdf: '/haverbeke/Eloquent_JavaScript.pdf',
    eloquent,
    handouts,
    zips,
    lectures,
    cs106a,
    cs108,
    downloads
  };
}

function listSolutionFolders(course) {
  const dir = path.join(SILVER_SOLUTIONS, course);
  return safeReaddir(dir)
    .filter(name => !name.startsWith('.'))
    .filter(name => isDirectory(path.join(dir, name)))
    .sort((a, b) => a.localeCompare(b))
    .map(name => ({ name, url: `/assets/solutions/${course}/${encodeURIComponent(name)}/` }));
}

function safeReaddir(dir) {
  try {
    return fs.readdirSync(dir);
  } catch (err) {
    return [];
  }
}

function isDirectory(p) {
  try {
    return fs.statSync(p).isDirectory();
  } catch (err) {
    return false;
  }
}

function leadingNumber(name) {
  const m = name.match(/^(\d+)/);
  return m ? m[1] : '';
}

function numericLeadSort(a, b) {
  const na = parseInt((a.match(/(\d+)/) || [])[1], 10);
  const nb = parseInt((b.match(/(\d+)/) || [])[1], 10);
  if (!isNaN(na) && !isNaN(nb) && na !== nb) {
    return na - nb;
  }
  return a.localeCompare(b);
}

function prettifyHandout(file) {
  const base = file.replace(/\.pdf$/i, '').replace(/^\d+[a-z]?-/i, '');
  const words = base.replace(/[-_]+/g, ' ').trim();
  return words.replace(/\b\w/g, c => c.toUpperCase());
}

function prettifyEloquent(file) {
  const base = file.replace(/\.html$/i, '').replace(/^norton_eloquent_testing_/i, '');
  const parts = base.split('_');
  const chapter = parts.shift();
  const suffix = parts.join(' ').trim();
  return suffix ? `Chapter ${chapter} — ${suffix}` : `Chapter ${chapter}`;
}
