require('dotenv').load();
var pm2 = require('pm2');
var nodemailer = require('nodemailer');
var moment = require('moment-timezone');
var _ = require('lodash');

// load environment variables
var PRODUCTION_START_SCRIPT = process.env.PRODUCTION_START_SCRIPT || '/home/dave/projects/redrockCodecamp/server/production-start.js'

var instances = process.env.INSTANCES || 1;
var pm2AppName = process.env.PM2_APP_NAME || 'app';
var maxMemory = process.env.MAX_MEMORY || '390M';

pm2.connect(function() {
  pm2.start({
    name: pm2AppName,
    script: PRODUCTION_START_SCRIPT,
    'exec_mode': 'cluster',
    instances: instances,
    'max_memory_restart': maxMemory,
    'NODE_ENV': 'development',
    'PORT': 3030
  }, function() {
    console.log(
      'pm2 started %s with %s instances at %s max memory',
      pm2AppName,
      instances,
      maxMemory
    );
    pm2.disconnect();
  });
});
