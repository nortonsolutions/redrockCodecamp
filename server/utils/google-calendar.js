/**
 * Google Calendar — service-account access (dependency-light).
 * --------------------------------------------------------------------------
 * Implements the Google service-account OAuth2 "JWT bearer" flow and a thin
 * wrapper over the Calendar v3 REST API using only Node core modules
 * (https + crypto). This avoids pulling in the heavy `googleapis` package,
 * which targets newer Node versions than this Babel-era app runs on. The
 * REST surface is identical to what `googleapis` calls under the hood.
 *
 * Required env:
 *   GOOGLE_CALENDAR_SERVICE_KEY_PATH  path to the service-account JSON key
 *                                     (relative to repo root or absolute)
 *
 * The service account must be granted access to each target calendar
 * (Calendar settings -> "Share with specific people" -> the service-account
 * email, with "Make changes to events" for two-way sync).
 */
import fs from 'fs';
import path from 'path';
import https from 'https';
import crypto from 'crypto';

const TOKEN_HOST = 'oauth2.googleapis.com';
const TOKEN_PATH = '/token';
const API_HOST = 'www.googleapis.com';
const SCOPE = 'https://www.googleapis.com/auth/calendar';

let cachedKey = null;          // parsed service-account JSON
let tokenCache = { token: null, exp: 0 };

function base64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function loadServiceKey() {
  if (cachedKey) {
    return cachedKey;
  }
  const keyPath = process.env.GOOGLE_CALENDAR_SERVICE_KEY_PATH;
  if (!keyPath) {
    throw new Error('GOOGLE_CALENDAR_SERVICE_KEY_PATH is not set');
  }
  const resolved = path.isAbsolute(keyPath) ?
    keyPath : path.resolve(process.cwd(), keyPath);
  const raw = fs.readFileSync(resolved, 'utf8');
  const parsed = JSON.parse(raw);
  if (!parsed.client_email || !parsed.private_key) {
    throw new Error('Service-account key missing client_email/private_key');
  }
  cachedKey = parsed;
  return parsed;
}

// Low-level JSON-over-HTTPS helper. Resolves with the parsed body for 2xx,
// rejects with an Error carrying the status + message otherwise.
function requestJson(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let parsed = null;
        try { parsed = data ? JSON.parse(data) : {}; } catch (e) { parsed = { raw: data }; }
        if (res.statusCode >= 200 && res.statusCode < 300) {
          return resolve(parsed);
        }
        const msg = (parsed && parsed.error && (parsed.error.message || parsed.error)) ||
          ('HTTP ' + res.statusCode);
        const err = new Error('Google Calendar API error: ' + msg);
        err.statusCode = res.statusCode;
        return reject(err);
      });
    });
    req.on('error', reject);
    req.setTimeout(8000, () => req.destroy(new Error('Google Calendar API timeout')));
    if (body) { req.write(body); }
    req.end();
  });
}

// Mint (and cache) an access token via the service-account JWT bearer grant.
async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  if (tokenCache.token && now < tokenCache.exp - 60) {
    return tokenCache.token;
  }

  const key = loadServiceKey();
  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: key.client_email,
    scope: SCOPE,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600
  };

  const signingInput =
    base64url(JSON.stringify(header)) + '.' + base64url(JSON.stringify(claim));
  const signature = crypto
    .createSign('RSA-SHA256')
    .update(signingInput)
    .sign(key.private_key);
  const assertion = signingInput + '.' + base64url(signature);

  const form =
    'grant_type=' + encodeURIComponent('urn:ietf:params:oauth:grant-type:jwt-bearer') +
    '&assertion=' + encodeURIComponent(assertion);

  const tokenRes = await requestJson({
    hostname: TOKEN_HOST,
    path: TOKEN_PATH,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(form)
    }
  }, form);

  tokenCache = {
    token: tokenRes.access_token,
    exp: now + (tokenRes.expires_in || 3600)
  };
  return tokenCache.token;
}

async function authHeaders() {
  const token = await getAccessToken();
  return { Authorization: 'Bearer ' + token, Accept: 'application/json' };
}

/**
 * List upcoming events on a calendar (recurring events expanded).
 * @param {string} calendarId
 * @param {object} [opts] { timeMin, maxResults }
 * @returns {Promise<Array>} raw Google event resources
 */
export async function listEvents(calendarId, opts = {}) {
  const headers = await authHeaders();
  const params = [
    'singleEvents=true',
    'orderBy=startTime',
    'timeMin=' + encodeURIComponent(opts.timeMin || new Date().toISOString()),
    'maxResults=' + encodeURIComponent(opts.maxResults || 50)
  ].join('&');

  const result = await requestJson({
    hostname: API_HOST,
    path: '/calendar/v3/calendars/' + encodeURIComponent(calendarId) + '/events?' + params,
    method: 'GET',
    headers
  });
  return (result && result.items) || [];
}

/**
 * Insert an event on a calendar (two-way sync write).
 * @param {string} calendarId
 * @param {object} eventResource  Google Calendar event body
 * @returns {Promise<object>} created event resource
 */
export async function insertEvent(calendarId, eventResource) {
  const headers = await authHeaders();
  const body = JSON.stringify(eventResource);
  return requestJson({
    hostname: API_HOST,
    path: '/calendar/v3/calendars/' + encodeURIComponent(calendarId) + '/events',
    method: 'POST',
    headers: Object.assign({}, headers, {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    })
  }, body);
}

export function isConfigured() {
  return !!process.env.GOOGLE_CALENDAR_SERVICE_KEY_PATH &&
    !!process.env.GOOGLE_CALENDAR_IDS;
}
