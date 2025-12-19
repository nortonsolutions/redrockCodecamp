/*
*
*
* Norton 2021
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var mongoose = require('mongoose');

const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  mongoose.connect(MONGODB_CONNECTION_STRING, { useMongoClient: true }, (err => {
    if (err) {
      console.log(err);
    }
  }))

  const bookSchema = mongoose.Schema({
    title: { type: String, required: true },
    comments: [String]
  });
  
  const BookModel = mongoose.model('Book', bookSchema);


  app.route('/api/books')
    .get(function (req, res){

      BookModel.find({}, (err,docs) => {
        if (err) {
          res.send(err.message);
        } else {
          var responseJson = [];
          docs.forEach(doc => {
            responseJson.push({
              _id: doc._id,
              title: doc.title,
              commentcount: doc.comments.length
            })
          })
          res.json(responseJson);
        }
      })
    })
    
    .post(function (req, res){  

      var title = req.body.title;
      let newBook = new BookModel({ title: title });
      newBook.save((err,doc) => {
        if (err) {
          res.send(err.message);
        } else {
          res.json(doc);
        }
      })
    })
    
    .delete(function(req, res){
      BookModel.remove({}, (err) => {
        if (err) {
          res.send(err.message);
        } else {
          res.send("complete delete successful");
        }
      })
    });


  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      BookModel.findOne({ _id: bookid }, 'title _id comments', (err,doc) => {
        if (err) {
          res.send(err.message);
        } else {
          res.json(doc);
        }
      })

    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      //json res format same as .get
      BookModel.findOne({ _id: bookid }, 'title _id comments', (err,doc) => {
        if (err) {
          res.send(err.message);
        } else {
          doc.comments = [...doc.comments, comment];
          doc.save((err,doc) => {
            if (err) {
              res.send(err.message);
            } else {
              res.json(doc);
            }
          })
        }
      })
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      BookModel.remove({ _id: bookid }, (err) => {
        if (err) {
          res.send(err.message);
        } else {
          res.send("delete successful");
        }
      })
    });
  
};
