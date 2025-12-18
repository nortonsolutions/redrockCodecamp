/**
 * Norton - Server-Side Node and Express 2021
 * "Basic Node and Express" solutions
 */
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

// --> 7)  Mount the Logger middleware here
app.use((req,resp,next) => {
    console.log(req.method + " " + req.path + " - " + req.ip);  
    next();
})

// --> 11)  Mount the body-parser middleware  here
app.use(bodyParser.urlencoded({ extended: false }));

/** 1) Meet the node console. */
console.log('Hello World')

/** 2) A first working Express Server */
// app.get('/',(req,resp) => {
//     resp.send('Hello Express')
// })

/** 3) Serve an HTML file */
app.get('/',(req,resp) => {
    resp.sendFile(__dirname + '/views/index.html')
})

/** 4) Serve static assets  */
app.use('/', express.static(__dirname + "/public"))

/** 5) serve JSON on a specific route */
app.get('/json', (req,resp) => {

    var respText = "Hello json";
    if (process.env.MESSAGE_STYLE == "uppercase") {
        respText = respText.toUpperCase();
    }
    resp.json({
        "message": respText
    })
})

/** 6) Use the .env file to configure the app */
// "envFile": "${workspaceFolder}/.env" added to launch config
 
/** 7) Root-level Middleware - A logger */
//  place it before all the routes !

/** 8) Chaining middleware. A Time server */
app.get('/now', (req,resp,next) => {
    req.time = new Date().toString();
    next();
}, (req, resp) => {
    resp.json({time: req.time});    
})

/** 9)  Get input from client - Route parameters */
app.get('/:word/echo', (req,resp) => {
    var word = req.params.word;
    resp.json({echo: word})
})

/** 10) Get input from client - Query parameters */
// /name?first=<firstname>&last=<lastname>
app.route('/name')
    
    .get((req,resp) => {
        resp.json({ name: req.query.first + " " + req.query.last })
    })
  
/** 11) Get ready for POST Requests - the `body-parser` */
// place it before all the routes !


/** 12) Get data form POST  */
    .post((req,resp) => {
        resp.json({ name: req.body.first + " " + req.body.last })
    })

// This would be part of the basic setup of an Express app
// but to allow FCC to run tests, the server is already active
/** app.listen(process.env.PORT || 3000 ); */

//---------- DO NOT EDIT BELOW THIS LINE --------------------

 module.exports = app;
