// The path where to mount the REST API app
exports.restApiRoot = '/api';
//
// The URL where the browser client can access the REST API is available
// Replace with a full url (including hostname) if your client is being
// served from a different server than your REST API.
exports.restApiUrl = exports.restApiRoot;

exports.brandingConfigs = {
    'redrockcode.com': {
        logoPath: '/images/logos/logo-landscape.png',
        businessName: 'Red Rock Code Camp',
        businessAppName: 'RedRockCode Academy',
        brandColor: '#3498db',
        homeUrl: 'https://redrockcode.com'
    },
    'codebasecamp.org': {
        logoPath: '/images/logos/logo-landscape.png',
        businessName: 'Code Base Camp',
        businessAppName: 'CodeBaseCamp Academy',
        brandColor: '#e74c3c',
        homeUrl: 'https://codebasecamp.org'
    },
    'localhost': { 
        logoPath: '/images/logos/logo-landscape.png',
        businessName: 'RedRockCode Local',
        businessAppName: 'Dev Platform',
        brandColor: '#2ecc71',
        homeUrl: 'http://localhost:3000'
    }
};

exports.settings = {
    "isSignUpDisabled": false,
    "directorName": "Spirit in the Sky"
}