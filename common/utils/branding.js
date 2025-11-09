
require('dotenv').config();
const { brandingConfigs, exposedHostname, NS } = require('../config.json');
var branding = {};

if (brandingConfigs) {
  var BASE_URL = exposedHostname || 'redrockcode.com'
  branding = brandingConfigs[BASE_URL] || {}
} else {
  console.warn(
    'No brandingConfigs found in server config.json; using defaults'
  );
}

exports.getBranding = function() {
  return branding;
}