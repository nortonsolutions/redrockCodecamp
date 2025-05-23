var secrets = require('../config/secrets');

module.exports = {
  db: {
    connector: 'mongodb',
    connectionTimeout: 10000,
    url: secrets.db
  },
  mail: {
    connector: 'mail',
    transport: {
      type: 'ses',
      accessKeyId: process.env.SES_ID,
      secretAccessKey: process.env.SES_SECRET
    }
  }
};
