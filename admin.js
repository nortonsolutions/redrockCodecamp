// First attempt at an Express/Mongo app; sidecar for FreeCodeCamp
// @author Dave Norton

/*
  Use the /newuser page to create new users for CodeCamp Workbench

  Use the /sass page to submit JSON-formatted SASS/SCSS and get a response.
  Expected post format is like this (JSON format):

    {"source":"$test-color: red; test { color: $test-color; }"}

  Expected response:

    {
      "source": "$test-color: red; test { color: $test-color; }",
      "result": "test { color: red; } "
    }
*/

var express = require('express');
var app = express();
var port = process.env.PORT || 8088
var mongoose = require('mongoose');
var User = require('./cua/models/user');
var bodyParser = require('body-parser');
const sass = require('node-sass');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded( { extended: true }));

app.use((req, res, next) => {
  res.header({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-type',
  });
  next();
});

app.use((req, res, next) => {
  req.headers['content-type'] = 'application/json';
  next();
});

// parse application/json
app.use(bodyParser.json());

app.get('/sass', (req, res) => res.json(true));

app.post('/sass', (req, res) => {
  const source = req.body.source;
  sass.render(
    {
      data: source,
    },
    (error, result) => {
      if (error) {
        return res.json({
          error,
          source,
        });
      }

      return res.json({
        source,
        result: result.css.toString(),
      });
    }
  );
});

mongoose.connect('mongodb://localhost/freecodecamp', { useMongoClient: true }, function(err) {
  if (err) {
    console.log('Not connected to the database: ' + err);
  } else {
    console.log('Successfully connected to MongoDB')
  }
});

app.get('/newuser', function(req, res) {
  res.send('<!DOCTYPE html><html><body><form action="/newuser" method="post">Username: ' +
    '<input type="text" name="username" />Email:    <input type="email" name="email" /> ' +
    '<input type="submit" /></form></body></html>');
});

app.post('/newuser', function(req, res) {
     
    var user = new User();
    user.email = req.body.email;
    user.username = req.body.username;
    user.save();

    res.send('New user ' + req.body.username + ' created.');
  });

app.listen(port, function() {
  console.log('Running the server on port ' + port);
});