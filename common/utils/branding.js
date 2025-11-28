
require('dotenv').config();
const { brandingConfigs, exposedHostname, NS } = require('../config.json');
var branding = {};

if (NS && typeof window !== 'undefined') {

  if (window[NS] && window[NS].branding && Object.keys(window[NS].branding).length) {
    branding = window[NS].branding;
  } else {
    window[NS] = {};
    if (brandingConfigs) {
      var BASE_URL = exposedHostname || 'redrockcode.com'
      branding = brandingConfigs[BASE_URL] || {}
      if (Object.keys(branding).length) {
        window[NS].branding = branding;
      } else {
        console.warn(`No branding config found for hostname: ${BASE_URL}; using defaults`);
        branding = window[NS].branding = {};
      }
    } else {
      console.warn('No brandingConfigs found in server config.json; using defaults');
      branding = window[NS].branding = {};
    }
  }
}

exports.getBranding = function() {
  return branding;
}