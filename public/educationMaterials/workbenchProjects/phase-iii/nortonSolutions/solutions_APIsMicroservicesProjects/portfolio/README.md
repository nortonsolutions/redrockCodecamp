# Norton Solutions Portfolio

A consolidated Node.js application showcasing all FreeCodeCamp Backend Development and APIs projects in one convenient portfolio.

## 🚀 Features

- **Timestamp Microservice** - Convert dates to timestamps and vice versa
- **Request Header Parser** - Parse request headers for client information  
- **URL Shortener** - Create and manage short URLs
- **Exercise Tracker** - Track user exercises with logging
- **File Metadata Analyzer** - Analyze uploaded file metadata
- Beautiful, responsive portfolio homepage
- Modern Express.js architecture with modular routes

## 📁 Project Structure

```
portfolio/
├── server.js              # Main Express server
├── package.json           # Dependencies and scripts
├── routes/                # Modular route handlers
│   ├── timestamp.js
│   ├── headerparser.js
│   ├── urlshortener.js
│   ├── exercisetracker.js
│   └── filemetadata.js
├── views/                 # EJS templates
│   ├── index.ejs         # Portfolio homepage
│   ├── 404.ejs           # 404 error page
│   └── error.ejs         # 500 error page
└── public/               # Static assets
```

## 🛠 Installation & Setup

1. **Install Dependencies**
   ```bash
   cd portfolio
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Start Production Server**
   ```bash
   npm start
   ```

## 🌐 API Endpoints

### Timestamp Microservice
- `GET /api/timestamp` - Current timestamp
- `GET /api/timestamp/:date_string` - Convert date string to timestamp

### Request Header Parser  
- `GET /api/whoami` - Get client IP, language, and user agent

### URL Shortener
- `POST /api/shorturl/new` - Create short URL
- `GET /api/shorturl/:short_url` - Redirect to original URL

### Exercise Tracker
- `POST /api/users` - Create new user
- `GET /api/users` - Get all users
- `POST /api/users/:_id/exercises` - Add exercise to user
- `GET /api/users/:_id/logs` - Get user exercise log

### File Metadata
- `POST /api/fileanalyse` - Analyze uploaded file

## 🚢 Deployment

This portfolio is ready to deploy on any of these platforms:

- **Vercel**: `vercel --prod`
- **Railway**: Connect GitHub repo
- **Render**: Connect GitHub repo  
- **Heroku**: `git push heroku main`

## 🔧 Next Steps

To add more projects from your collection:

1. Create new route files in `/routes/`
2. Add route imports and middleware in `server.js`
3. Update the projects array in the main route
4. Copy any specific logic from your original projects

## 📝 Notes

- Uses in-memory storage for demo purposes
- For production, consider adding a database (MongoDB, PostgreSQL)
- All routes are modular and easily extensible
- Security headers and error handling included

---

**Built with Node.js, Express.js & ❤️ by Norton Solutions**