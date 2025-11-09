module.exports = {
  host: '127.0.0.1',
  port: 3030,
  sessionSecret: process.env.SESSION_SECRET,
  github: {
    clientID: process.env.GITHUB_ID,
    clientSecret: process.env.GITHUB_SECRET
  }
};