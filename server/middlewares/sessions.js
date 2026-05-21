import session from 'express-session';
import MongoStoreFactory from 'connect-mongo';

const MongoStore = MongoStoreFactory(session);
const sessionSecret = process.env.SESSION_SECRET;
const url = process.env.MONGODB || process.env.MONGOHQ_URL;

// 56 days - long-lived sessions for returning users
const SESSION_MAX_AGE_DAYS = 56;
const SESSION_MAX_AGE_MS = SESSION_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
const SESSION_TTL_SECONDS = SESSION_MAX_AGE_DAYS * 24 * 60 * 60;

export default function sessionsMiddleware() {
  return session({
    cookie: { maxAge: SESSION_MAX_AGE_MS },
    resave: true,
    saveUninitialized: true,
    secret: sessionSecret,
    store: new MongoStore({
      ttl: SESSION_TTL_SECONDS, 
      url: url,
      touchAfter: 24 * 3600, // time period in seconds, here it's 24 hours
      autoRemove: 'native' // Let MongoDB handle expired session cleanup,
    })

    // If you want to specify a custom TTL (time to live) for the session, you can use the `ttl` option:
    // store: new MongoStore({ 
    //   url,
    //   ttl: 14 * 24 * 60 * 60 // 14 days in seconds
    // })
    //
    // To clean up expired sessions, you can set up a periodic task to remove them from the database. For example, you can use the following command to delete sessions that have expired more than 30 days ago:
    // mongo[sh] redrockCodecamp --eval "db.sessions.deleteMany({ expires: { \$lt: new Date(Date.now() - 30*24*60*60*1000) } })"
    //
    // Or, clean up all but the most recent 100 sessions:
    // mongo[sh] redrockCodecamp --eval "db.sessions.deleteMany({ _id: { \$nin: db.sessions.find().sort({ expires: -1 }).limit(100).map(s => s._id) } })"
    //
    // mongosh redrockCodecamp --eval "
    // var keepIds = db.sessions.find({}, {_id: 1})
    //   .sort({expires: -1})
    //   .limit(100)
    //   .toArray()
    //   .map(doc => doc._id);
    // print('Would delete: ' + db.sessions.countDocuments({_id: {\$nin: keepIds}}) + ' sessions');
    // print('Would keep: ' + keepIds.length + ' sessions');
    // 
    // Uncomment the following lines to actually delete the sessions, but be careful as this will permanently remove data:
    // var result = db.sessions.deleteMany({_id: {\$nin: keepIds}});
    // print('Deleted ' + result.deletedCount + ' sessions, kept 100');
    // "
    //
    // To drop the entire sessions collection (be cautious as this will remove all session data):
    // mongo[sh] redrockCodecamp --eval "db.sessions.drop()"
    //
    // Or:
    // mongo[sh] redrockCodecamp --eval "db.runCommand({drop: 'sessions'})"

  });
}
