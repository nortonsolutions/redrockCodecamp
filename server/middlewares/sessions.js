import session from 'express-session';
import connectMongo from 'connect-mongo';

const MongoStore = connectMongo.default || connectMongo;
const sessionSecret = process.env.SESSION_SECRET;
const mongoUrl = process.env.MONGODB || process.env.MONGOHQ_URL;

export default function sessionsMiddleware() {
  return session({
    // 900 day session cookie
    cookie: { maxAge: 900 * 24 * 60 * 60 * 1000 },
    resave: true,
    saveUninitialized: true,
    secret: sessionSecret,
    store: new MongoStore({ 
      mongoUrl,
      mongoOptions: {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    })
  });
}
