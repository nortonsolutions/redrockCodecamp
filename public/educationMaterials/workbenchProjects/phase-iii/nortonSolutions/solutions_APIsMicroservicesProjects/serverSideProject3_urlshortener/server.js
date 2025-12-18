/**
 * URL Shortener - Norton 2021
 */


'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser')
var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
mongoose.connect(process.env.MONGOLAB_URI, {useMongoClient: true});

let sampleEntry = {
  url: "http://www.testing.com",
  short_url: 1
}

var urlSchema = new mongoose.Schema({ 
  url: String,
  short_url: Number
});

const UrlModel = mongoose.model('UrlEntry', urlSchema);

// Seed initial entry if needed:

UrlModel.find({ url: /.+/ })
.then(data => {
  if (data.length == 0) {
    let newEntry = new UrlModel(sampleEntry);
    newEntry.save(err => {
      if (err) console.log(err);
    })
  } else {
    console.log("Database has already been seeded.")
  }
}).catch(err => {
  console.log(err);
})


app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

// create application/json parser
var jsonParser = bodyParser.json()

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.post('/api/shorturl/new', urlencodedParser, (req,res) => {

  var url = req.body.url;
  var urlTest = /https?:\/\/\w+\.\w+\.\w+(\/.+)?/.exec(url);

  if (urlTest) {
    
    var maxCallback = ( max, cur ) => Math.max( max, cur );

    // Find all
    UrlModel.find({ url: /.+/ })
    .then(data => {

      // What is the next short_url number?
      var newId = data.map(el => el.short_url).reduce(maxCallback, -Infinity) + 1;
      
      let newEntry = new UrlModel({url: url, short_url: newId});
      newEntry.save((err,data) => {
        if (err) console.log(err);
        res.json({original_url:data.url,"short_url":data.short_url}
        );
      })

    }).catch(err => {
      console.log(err);
    })
  } else {
    res.json({error:"invalid URL"});
  }

})

app.use('/api/shorturl/:shorturl', (req,resp) => {
  
  var shortUrl = req.params.shorturl;
  var routes = req.path;

  UrlModel.findOne({short_url: shortUrl}, (err,data) => {
    if (err) resp.send(err.message);
    if (data) {
      resp.redirect(data.url + routes)
    } else {
      resp.send("No redirect found.")
    }
  })
    
})

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});