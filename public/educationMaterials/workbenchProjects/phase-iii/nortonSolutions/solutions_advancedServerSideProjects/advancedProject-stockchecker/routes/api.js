/*
* Norton 2021
*
*/

'use strict';

var assert = require('chai').assert;
var expect = require('chai').expect;
// var MongoClient = require('mongodb');
// var mongoose = require('mongoose');

module.exports = function (app) {

  // Using in-memory database instead of MongoDB
  // Original DB code commented out for reference:
  /*
  const CONNECTION_STRING = process.env.DB; 

  const stockDataSchema = mongoose.Schema({
    stock: { type: String, required: true },
    price: { type: String, required: true },
    likes: [String]
  });

  const StockDataModel = mongoose.model('StockData', stockDataSchema);

  mongoose.connect(CONNECTION_STRING, { useMongoClient: true }, (err => {
    if (err) {
      console.log(err);
    }
  }))
  */

  // Use in-memory data store (Map-based)
  const db = app.locals.db || new Map();

  app.route('/api/stock-prices')
    
    .post((req,res) => {

      let stock = req.body.stock;
      let price = req.body.price;
      let stockPrice = new StockDataModel({stock: stock, price: price});
      stockPrice.save((err,doc) => {
        if (err) {
          res.send(err.message);
        } else {
          res.json(doc);
        }
      })
    })
  
    .get(function (req, res){

      let stock = req.query.stock;
      let like = req.query.like;
      let sourceIp = req.ip;
      
      // Handle comparison
      if (Array.isArray(stock)) {

        StockDataModel
        .find({})
        .where('stock').in([stock[0],stock[1]])
        .select('stock price likes').exec((err, docs) => {
          if (err) {
            res.send(err.message);
          } else {
            if (like && !docs[0].likes.includes(sourceIp)) {
              docs[0].likes = [...docs[0].likes, sourceIp];
            } 
            docs[0].save((err) => {
              if (like && !docs[1].likes.includes(sourceIp)) {
                docs[1].likes = [...docs[1].likes, sourceIp];
              }
              docs[1].save((err) => {
                docs[0].rel_likes = docs[0].likes.length - docs[1].likes.length;
                docs[1].rel_likes = docs[1].likes.length - docs[0].likes.length;
                
                let responseJson = [];
  
                docs.forEach(doc => {
                  let stockData = {
                    stock: doc.stock,
                    price: doc.price,
                    rel_likes: doc.rel_likes
                  }
                  responseJson.push(stockData);
                })
      
                res.json({
                  stockData: responseJson
                });
              }); 

            });
          }
        })

      // Handle single stock
      } else {

        let process = (doc) => {
          
          let numberOfLikes;
          if (! doc.likes) {
            numberOfLikes = 0;
          } else {
            numberOfLikes = doc.likes.length;
          }

          let stockData = {
            stock: doc.stock,
            price: doc.price,
            likes: numberOfLikes
          }
          res.json({
            stockData: stockData
          });
        }

        StockDataModel.findOne({ stock: stock }, 'stock price likes', (err, doc) => {
          if (err) {
            res.send(err.message);
          } else {

            if (like && !doc.likes.includes(sourceIp)) {
              doc.likes = [...doc.likes, sourceIp];
              doc.save((err,doc) => {
                if (err) {
                  res.send(err.message);
                } else {
                  process(doc);
                }
              })
            } else {
              process(doc);
            }
          }
        })
      }
    });
    
};
