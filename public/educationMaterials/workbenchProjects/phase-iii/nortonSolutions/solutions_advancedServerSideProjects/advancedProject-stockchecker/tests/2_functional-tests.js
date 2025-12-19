/*
* Norton 2021
*
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    
    var currentLikes;
    suite('GET /api/stock-prices => stockData object', function() {
      
      test('1 stock', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog'})
        .end(function(err, res){
          
          assert.equal(res.status,200);
          assert.isObject(res.body);
          assert.isObject(res.body.stockData);
          assert.equal(res.body.stockData.stock,'goog');
          done();
        });
      });
      
      test('1 stock with like', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog', like: true})
        .end((err, res) => {
          assert.equal(res.status,200);
          assert.isObject(res.body);
          assert.isObject(res.body.stockData);
          assert.equal(res.body.stockData.stock,'goog');
          assert.isNumber(res.body.stockData.likes);
          currentLikes = res.body.stockData.likes;
          done();
        })
      });
      
      test('1 stock with like again (ensure likes arent double counted)', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog', like: true})
        .end((err, res) => {
          assert.equal(res.status,200);
          assert.isObject(res.body);
          assert.isObject(res.body.stockData);
          assert.equal(res.body.stockData.stock,'goog');
          assert.isNumber(res.body.stockData.likes);
          assert.equal(res.body.stockData.likes,currentLikes);
          done();
        })
      });
      
      test('2 stocks', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['goog', 'msft']})
        .end((err, res) => {
          assert.equal(res.status,200);
          assert.isObject(res.body);
          assert.isArray(res.body.stockData);
          assert.equal(res.body.stockData[0].stock,'goog');
          assert.equal(res.body.stockData[1].stock,'msft');
          done();
        })        
      });
      
      test('2 stocks with like', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['goog', 'msft'], like: true})
        .end((err, res) => {
          assert.equal(res.status,200);
          assert.isObject(res.body);
          assert.isArray(res.body.stockData);
          assert.equal(res.body.stockData[0].stock,'goog');
          assert.equal(res.body.stockData[1].stock,'msft');
          assert.isNumber(res.body.stockData[0].rel_likes);
          assert.isNumber(res.body.stockData[1].rel_likes);
          assert.equal(res.body.stockData[0].rel_likes,-1);
          assert.equal(res.body.stockData[1].rel_likes,1);
          done();
        })            
      });
      
    });

});
