const brandingConfigs = require('../../common/config.global').brandingConfigs;

export default function domainBranding() {
    return function domainBrandingMiddleware(req, res, next) {
        const hostname = req.hostname || req.get('host');

        // Find matching configuration
        const brandingConfig = brandingConfigs[hostname] || brandingConfigs['localhost'];

        // Add branding configuration to res.locals
        res.locals.branding = brandingConfig;
        
        // Also expose branding to client-side React app
        res.expose(res.locals.branding, 'branding');

        next();
    };
}
