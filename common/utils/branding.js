const serverConfig = require('../config.global');

/**
 * Client-side utility to access branding configuration from window.__redrockcode__.branding
 * This provides consistent access with fallbacks for client components.
 */

export default function getBranding() {
    // Get branding data from window state set by express-state
    let branding;
    if (typeof window !== 'undefined' && window.__redrockcode__) {
        const state = window.__redrockcode__ || {};
        branding = state && state.branding || {};
    } else if (serverConfig && serverConfig.brandingConfigs) {
        // eslint-disable-next-line global-require
        branding = serverConfig.brandingConfigs;
    } else branding = {
        businessAppName: 'RedRock Portal [changeme]',
        businessName: 'RedRock Portal [changeme]',
        logoPath: '/images/logos/logo-landscape.png',
        brandColor: '#2ecc71',
        homeUrl: 'http://localhost:3000'
    };
    return branding;
    
}
