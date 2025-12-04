import { brandingConfigs } from '../../common/config.json';

function domainBranding() {
    return function domainBrandingMiddleware(req, res, next) {
        const hostname = req.hostname || req.get('host');

        // Find matching configuration
        const brandingConfig = brandingConfigs[hostname] || brandingConfigs['localhost'];

        // Add branding configuration to res.locals
        res.locals.branding = brandingConfig;
        
        // Expose branding to client-side (makes it available in window.__redrockcode__.branding)
        res.expose(brandingConfig, 'brand', { isJSON: true });
        
        next();
    };
}

export default domainBranding;