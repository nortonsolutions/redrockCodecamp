// First attempt at an Express/Mongo app; sidecar for FreeCodeCamp
// @author Dave Norton

var express = require('express');
var app = express();
var port = process.env.PORT || 8088
var mongoose = require('mongoose');
var User = require('./cua/models/user');
var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded( { extended: true }));

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