
require('dotenv').config();
const { brandingConfigs, exposedHostname, NS } = require('../config.json');
var branding = {};

if (NS && typeof window !== 'undefined' && window[NS] && window[NS].branding) {
  branding = window[NS].branding;
} else if (brandingConfigs) {
  var BASE_URL = exposedHostname || 'redrockcode.com'
  window[NS].branding = branding = brandingConfigs[BASE_URL] || {}
} else {
  console.warn(
    'No brandingConfigs found in server config.json; using defaults'
  );
}

exports.getBranding = function() {
  return branding;
}