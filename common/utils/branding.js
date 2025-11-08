
require('dotenv').config();
const { brandingConfigs } = require('../config.json');
const { URL } = require('url');
const NS = '__redrockcode__';

var branding = {
  logoPath: "/images/logos/logo-landscape.png",
  businessName: "RedRockCode / Silver Medal NFPO",
  businessAppName:  "Redrock Academy Default App",
  brandColor: "#3498db",
  homeUrl: "https://redrockcode.com",
  hostkey: "redrockcode.com"
};


if (brandingConfigs) {
  var BASE_URL = process.env.BASE_URL || 'http://localhost:3030';
  console.log(`Loading branding for host: ${BASE_URL}`);
  branding = Object.assign({},
    branding,
    brandingConfigs[BASE_URL] || {}
  );
} else {
  console.warn(
    'No brandingConfigs found in server config.json; using defaults'
  );
}

exports.getBranding = function() {
  // Get branding data from window state set by express-state
  
  if (typeof window !== 'undefined' && window[NS]) {
    var state = window[NS] || {};
  }
  
  branding = state && state.branding || branding;
  // debugger;
  return branding;
}