
require('dotenv').config();
const { brandingConfigs, exposedHostname, NS } = require('../config.json');
var branding = {};

if (NS && typeof window !== 'undefined' && window[NS] && window[NS].branding) {
  branding = window[NS].branding;
} else if (brandingConfigs) {
  var BASE_URL = exposedHostname || 'redrockcode.com'
  branding = brandingConfigs[BASE_URL] || {}
  if (typeof window !== 'undefined') window[NS].branding = branding;
} else {
  console.warn(
    'No brandingConfigs found in server config.json; using defaults'
  );
}

exports.getBranding = function() {
  return branding;
}