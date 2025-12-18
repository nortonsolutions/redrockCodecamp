
require('dotenv').config();
const { brandingConfigs, NS, exposedHostname } = require('../config.json');

exports.getBranding = function(hostname = exposedHostname) {

  if (typeof window === 'undefined') {
    return brandingConfigs[hostname] || brandingConfigs['localhost'] || {};
  }
  
  if (NS && window[NS] && window[NS].branding) {
    return window[NS].branding;
  }

  if (window.__redrockcode__ && window.__redrockcode__.branding) {
    return window.__redrockcode__.branding;
  }

  var brand =  brandingConfigs[hostname] || brandingConfigs['localhost'] || {};
  window[NS].branding = brand;
  return brand;
};