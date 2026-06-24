/**
 * Workshops API — calendar groundwork for the Silver Medal landing page.
 * --------------------------------------------------------------------------
 * Exposes GET /api/workshops[?category=writing|health|coding] returning a
 * normalized list of upcoming workshop events for writing, health, and
 * coding tracks.
 *
 * This is the single server-side integration point for the workshop
 * calendar. Source priority:
 *   1. Google Calendar (two-way) when GOOGLE_CALENDAR_SERVICE_KEY_PATH and
 *      GOOGLE_CALENDAR_IDS are set — read for display, write via POST.
 *   2. Facebook / Meta Graph API (read-only mirror) when FB_PAGE_ID and
 *      FB_PAGE_ACCESS_TOKEN are set. NOTE: Meta removed event *write* via the
 *      Graph API, so this source is display-only.
 *   3. A curated seed list, so the UI always has something to render.
 *
 * All credentials stay server-side; the browser only ever sees normalized
 * event JSON from /api/workshops.
 */
import https from 'https';
import * as googleCalendar from '../utils/google-calendar';
import { ifNoAdminUser401 } from '../utils/middleware';

const GRAPH_VERSION = process.env.FB_GRAPH_VERSION || 'v19.0';
const FB_PAGE_ID = process.env.FB_PAGE_ID;
const FB_PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;
const CACHE_TTL_MS = 5 * 60 * 1000;
const DEFAULT_TIMEZONE = process.env.GOOGLE_CALENDAR_TIMEZONE || 'America/Denver';

// Comma-separated calendar IDs; the first is the write target for new events.
const GOOGLE_CALENDAR_IDS = (process.env.GOOGLE_CALENDAR_IDS || '')
  .split(',')
  .map(id => id.trim())
  .filter(Boolean);

const VALID_CATEGORIES = ['writing', 'health', 'coding'];

// Keyword heuristics used to bucket free-form Meta events into our three
// workshop tracks. Extend these lists as the program grows.
const CATEGORY_KEYWORDS = {
  writing: ['writ', 'author', 'poet', 'story', 'novel', 'editor', 'publish', 'guild'],
  health: ['health', 'wellness', 'nutrition', 'fitness', 'mindful', 'yoga', 'science of', 'holistic'],
  coding: ['cod', 'javascript', 'web', 'developer', 'program', 'react', 'game', 'software', 'data']
};

let cache = { at: 0, events: null };

function daysFromNow(days, hour = 18, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function plusHours(iso, hours) {
  return new Date(new Date(iso).getTime() + hours * 3600 * 1000).toISOString();
}

// Curated fallback / seed data. These mirror the normalized shape returned
// for live Meta events so the front-end never needs to branch on source.
function seedEvents() {
  const start1 = daysFromNow(5, 18, 0);
  const start2 = daysFromNow(9, 12, 0);
  const start3 = daysFromNow(14, 17, 30);
  const start4 = daysFromNow(21, 10, 0);
  const start5 = daysFromNow(26, 19, 0);
  return [
    {
      id: 'seed-writing-1',
      title: 'Writers Guild: Worldbuilding Workshop',
      category: 'writing',
      start: start1,
      end: plusHours(start1, 1.5),
      location: 'Online · Writers Guild Online',
      description: 'Craft believable settings and lore with the Writers Guild. Bring a work in progress.',
      url: 'https://writersguild.online',
      source: 'seed'
    },
    {
      id: 'seed-health-1',
      title: 'Life Science Balance: Holistic Wellness Q&A',
      category: 'health',
      start: start2,
      end: plusHours(start2, 1),
      location: 'Online · Life Science Balance',
      description: 'A live session combining science and holistic approaches to everyday wellness.',
      url: 'https://lifesciencebalance.co',
      source: 'seed'
    },
    {
      id: 'seed-coding-1',
      title: 'Red Rock Code: Intro to Interactive Web',
      category: 'coding',
      start: start3,
      end: plusHours(start3, 2),
      location: 'Online · Red Rock Code Academy',
      description: 'Hands-on beginner session building your first interactive page. No experience needed.',
      url: 'https://redrockcode.com',
      source: 'seed'
    },
    {
      id: 'seed-coding-2',
      title: 'Game Dev Lab: Platform Game Extensions',
      category: 'coding',
      start: start4,
      end: plusHours(start4, 2),
      location: 'Online · Red Rock Code Academy',
      description: 'Extend a platform game using the Haverbeke methodology. Intermediate friendly.',
      url: '/en/challenges/beginning-web-development-projects/platform-game-extensions',
      source: 'seed'
    },
    {
      id: 'seed-writing-2',
      title: 'Writers Guild: Publishing House Open Studio',
      category: 'writing',
      start: start5,
      end: plusHours(start5, 1.5),
      location: 'Online · Writers Guild Online',
      description: 'Meet the publishing house team and learn how guild submissions become published work.',
      url: 'https://writersguild.online',
      source: 'seed'
    }
  ];
}

function inferCategory(text) {
  const haystack = String(text || '').toLowerCase();
  for (const category of VALID_CATEGORIES) {
    if (CATEGORY_KEYWORDS[category].some(kw => haystack.indexOf(kw) > -1)) {
      return category;
    }
  }
  return 'coding';
}

// Normalize a raw Meta Graph API event into our shape.
function normalizeMetaEvent(raw) {
  const place = raw.place && raw.place.name ? raw.place.name : 'Online';
  return {
    id: 'meta-' + raw.id,
    title: raw.name || 'Untitled workshop',
    category: inferCategory(raw.name + ' ' + (raw.description || '')),
    start: raw.start_time ? new Date(raw.start_time).toISOString() : null,
    end: raw.end_time ? new Date(raw.end_time).toISOString() : null,
    location: place,
    description: raw.description || '',
    url: 'https://www.facebook.com/events/' + raw.id,
    source: 'meta'
  };
}

// Normalize a raw Google Calendar v3 event into our shape. Category is taken
// from a private extended property when present (set on write for round-trip
// fidelity), otherwise inferred from the text.
function normalizeGoogleEvent(raw) {
  const start = raw.start && (raw.start.dateTime || raw.start.date);
  const end = raw.end && (raw.end.dateTime || raw.end.date);
  const tagged = raw.extendedProperties &&
    raw.extendedProperties.private &&
    raw.extendedProperties.private.category;
  const category = VALID_CATEGORIES.indexOf(tagged) > -1 ?
    tagged : inferCategory((raw.summary || '') + ' ' + (raw.description || ''));
  return {
    id: 'gcal-' + raw.id,
    title: raw.summary || 'Untitled workshop',
    category: category,
    start: start ? new Date(start).toISOString() : null,
    end: end ? new Date(end).toISOString() : null,
    location: raw.location || 'Online',
    description: raw.description || '',
    url: raw.htmlLink || '',
    source: 'google'
  };
}

// Read upcoming events from every configured Google calendar.
function fetchGoogleEvents() {
  const timeMin = new Date().toISOString();
  return Promise.all(
    GOOGLE_CALENDAR_IDS.map(id =>
      googleCalendar.listEvents(id, { timeMin, maxResults: 50 })
        .catch(() => [])
    )
  ).then(lists =>
    lists
      .reduce((all, items) => all.concat(items), [])
      .map(normalizeGoogleEvent)
      .filter(ev => ev.start)
  );
}

// Fetch upcoming events from the Meta Graph API. Resolves to an array of
// normalized events, or rejects on any transport/parse error so the caller
// can fall back to seed data.
function fetchMetaEvents() {
  return new Promise((resolve, reject) => {
    const fields = encodeURIComponent('name,description,start_time,end_time,place');
    const path = `/${GRAPH_VERSION}/${encodeURIComponent(FB_PAGE_ID)}/events` +
      `?fields=${fields}&time_filter=upcoming&access_token=${encodeURIComponent(FB_PAGE_ACCESS_TOKEN)}`;

    const req = https.get(
      { hostname: 'graph.facebook.com', path, headers: { Accept: 'application/json' } },
      res => {
        let body = '';
        res.on('data', chunk => { body += chunk; });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            if (parsed.error) {
              return reject(new Error(parsed.error.message || 'Graph API error'));
            }
            const events = (parsed.data || [])
              .map(normalizeMetaEvent)
              .filter(ev => ev.start);
            return resolve(events);
          } catch (err) {
            return reject(err);
          }
        });
      }
    );
    req.on('error', reject);
    req.setTimeout(5000, () => req.destroy(new Error('Graph API timeout')));
  });
}

function getEvents() {
  const now = Date.now();
  if (cache.events && now - cache.at < CACHE_TTL_MS) {
    return Promise.resolve(cache.events);
  }

  let source;
  if (googleCalendar.isConfigured()) {
    source = fetchGoogleEvents();
  } else if (FB_PAGE_ID && FB_PAGE_ACCESS_TOKEN) {
    source = fetchMetaEvents();
  } else {
    source = Promise.resolve(null);
  }

  return source
    // Degrade gracefully to seed data when a live source is empty or fails.
    .then(live => (live && live.length) ? live : seedEvents())
    .catch(() => seedEvents())
    .then(events => {
      // Only surface upcoming events, soonest first.
      const nowIso = new Date().toISOString();
      const upcoming = events
        .filter(ev => ev.start && ev.start >= nowIso)
        .sort((a, b) => new Date(a.start) - new Date(b.start));
      cache = { at: now, events: upcoming };
      return upcoming;
    });
}

// Build a Google Calendar event resource from a validated request body.
function toGoogleEvent(input) {
  const start = new Date(input.start);
  if (isNaN(start.getTime())) {
    throw new Error('Invalid start date');
  }
  // Default to a 1-hour slot when no end is supplied.
  const end = input.end ? new Date(input.end) : new Date(start.getTime() + 3600 * 1000);
  if (isNaN(end.getTime())) {
    throw new Error('Invalid end date');
  }
  return {
    summary: input.title,
    description: input.description || '',
    location: input.location || 'Online',
    start: { dateTime: start.toISOString(), timeZone: DEFAULT_TIMEZONE },
    end: { dateTime: end.toISOString(), timeZone: DEFAULT_TIMEZONE },
    extendedProperties: { private: { category: input.category } }
  };
}

module.exports = function(app) {
  const router = app.loopback.Router();

  router.get('/api/workshops', (req, res) => {
    getEvents()
      .then(events => {
        const category = (req.query.category || '').toLowerCase();
        if (VALID_CATEGORIES.indexOf(category) > -1) {
          events = events.filter(ev => ev.category === category);
        }
        res.set('Cache-Control', 'public, max-age=300');
        return res.json({ events, count: events.length });
      })
      .catch(() =>
        res.status(500).json({ events: [], error: 'Unable to load workshops' })
      );
  });

  // Two-way sync: create a workshop on the (first) configured Google calendar.
  // Admin-only — never expose calendar writes to anonymous visitors.
  router.post('/api/workshops', ifNoAdminUser401, (req, res) => {
    if (!googleCalendar.isConfigured()) {
      return res.status(503).json({ error: 'Google Calendar is not configured' });
    }
    const body = req.body || {};
    if (!body.title || !body.start) {
      return res.status(400).json({ error: 'title and start are required' });
    }
    if (VALID_CATEGORIES.indexOf(body.category) === -1) {
      return res.status(400).json({
        error: 'category must be one of: ' + VALID_CATEGORIES.join(', ')
      });
    }
    let resource;
    try {
      resource = toGoogleEvent(body);
    } catch (err) {
      // Invalid start/end date — client error.
      return res.status(400).json({ error: err.message });
    }
    return googleCalendar.insertEvent(GOOGLE_CALENDAR_IDS[0], resource)
      .then(created => {
        cache = { at: 0, events: null }; // invalidate so the new event surfaces
        return res.status(201).json({ event: normalizeGoogleEvent(created) });
      })
      .catch(err =>
        res.status(502).json({
          error: (err && err.message) || 'Unable to create workshop'
        })
      );
  });

  app.use(router);
};
