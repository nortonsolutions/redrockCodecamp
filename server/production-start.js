// this ensures node understands the future
require('babel-register');
const _ = require('lodash');
const createDebugger = require('debug');
const https = require('https');
const fs = require('fs');

// read .env via dotenv
const dotenv = require('dotenv');

var hostname = process.env.HOSTNAME || 'localhost';

const log = createDebugger('fcc:server:production-start');
const startTime = Date.now();
// force logger to always output
// this may be brittle
log.enabled = true;
// this is where server starts booting up
const app = require('./server');

// Load SSL certificate and private key
const sslOptions = {
  key: fs.readFileSync('/home/dave/.ssh/ca_private.pem'),
  cert: fs.readFileSync('/home/dave/.ssh/ca_x509_wildcard.crt'),
//   ca: fs.readFileSync('/path/to/your/ca_bundle.crt') // Optional, if your certificate requires a CA bundle
};

let timeoutHandler;
let killTime = 15;

const onConnect = _.once(() => {
  log('db connected in: %s', Date.now() - startTime);
  if (timeoutHandler) {
    clearTimeout(timeoutHandler);
  }
  //   app.start();

  // Start the HTTPS server
  https.createServer(sslOptions, app).listen({port: 443, hostname: hostname, }, () => {
    log('Server is running on https://localhost');
  }).on('error', (err) => {
    console.error(err);
  });
});

timeoutHandler = setTimeout(() => {
  const message = `db did not connect after ${killTime}s -- crashing hard`;
  // purposely shutdown server
  // pm2 should restart this in production
  throw new Error(message);
}, killTime * 1000);

app.dataSources.db.on('connected', onConnect);
