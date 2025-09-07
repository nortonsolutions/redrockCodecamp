// this ensures node understands the future
require('babel-register');
const _ = require('lodash');
const createDebugger = require('debug');
const fs = require('fs');
const http = require('http');

// read .env via dotenv
const dotenv = require('dotenv').config();

var hostname = process.env.HOST || 'localhost';
var port = process.env.PORT || '3030';

const log = createDebugger('fcc:server:production-start');
const startTime = Date.now();
// force logger to always output
// this may be brittle
log.enabled = true;
// this is where server starts booting up
const app = require('./server');

app.set('trust proxy', true);

// // Load SSL certificate and private key
// const sslOptions = {
//     key: fs.readFileSync('/etc/letsencrypt/live/silvermedal_multi_domain/privkey.pem'),
//     cert: fs.readFileSync('/etc/letsencrypt/live/silvermedal_multi_domain/fullchain.pem'),
    //   ca: fs.readFileSync('/path/to/your/ca_bundle.crt') // Optional, if your certificate requires a CA bundle
//      // Important: Set this to support ALL domains
//     SNICallback: (servername, cb) => {
//       console.log(`SNI request for: ${servername}`);
//      // Use the same cert for all domains
//       cb(null, tls.createSecureContext(sslOptions));
//   }
// };

let timeoutHandler;
let killTime = 15;

const onConnect = _.once(() => {
  log('db connected in: %s', Date.now() - startTime);
  if (timeoutHandler) {
    clearTimeout(timeoutHandler);
  }
  app.start();

//  // Start the HTTPS server
//  const server = http.createServer(app);
//  server.keepAliveTimeout = 60000;
//  server.headersTimeout = 65000;
//  
//  server.listen(port, hostname, () => {
//    log('Server is running on https://' + hostname + ":" + port);
//  }).on('error', (err) => {
//    console.error(err);
//  });

//  server.on('tlsClientError', (err, socket) => {
//	  console.error('TLS error:', err);
//  });
});

timeoutHandler = setTimeout(() => {
  const message = `db did not connect after ${killTime}s -- crashing hard`;
  // purposely shutdown server
  // pm2 should restart this in production
  throw new Error(message);
}, killTime * 1000);

app.dataSources.db.on('connected', onConnect);
