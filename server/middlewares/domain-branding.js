import { brandingConfigs, NS } from '../../common/config.json';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Dev-only: `?portal=silvermedal` (or any host alias) previews another brand
// for THIS request only on localhost. It is intentionally NOT sticky — there
// is no cookie — so simply dropping the query param returns you to the real
// host's branding. That keeps /signin and the rest of the academy behaving
// normally instead of being trapped on the landing portal. To browse a brand
// across many pages locally, point its hostname at 127.0.0.1 in /etc/hosts
// instead. Disabled in production.
function resolveDevPortal(req) {
  if (IS_PRODUCTION) {
    return null;
  }
  const choice = req.query && req.query.portal;
  if (!choice) {
    return null;
  }
  // Match a branding config by full hostkey or its leading label
  // (e.g. "silvermedal" -> "silvermedal.net").
  const match = Object.keys(brandingConfigs).find(key => {
    const cfg = brandingConfigs[key];
    return cfg && typeof cfg === 'object' && cfg.hostkey &&
      (key === choice || key.split('.')[0] === choice);
  });
  return match || null;
}

function domainBranding() {
    return function domainBrandingMiddleware(req, res, next) {
        const hostname = resolveDevPortal(req) || req.hostname || req.get('host');

        // Find matching configuration
        const brandingConfig = brandingConfigs[hostname] || brandingConfigs['localhost'];

        // Add branding configuration to res.locals
        res.locals.branding = brandingConfig;
        
        // Expose branding to client-side (makes it available in window.__redrockcode__.brand)
        res.expose(brandingConfig, 'branding', { isJSON: true, namespace: NS });
        
        next();
    };
}

    export default domainBranding;