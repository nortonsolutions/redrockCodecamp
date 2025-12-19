/*
* Norton 2021
*
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

var currentThreadId;
var currentThreadId2;
var currentReplyId;


suite('Functional Tests', function() {

  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST', function() {

      test('POST to /api/threads/:board', (done) => {
        chai.request(server)
        .post('/api/threads/test')
        .send({text: 'Sample text', delete_password: 'asdf'})
        .end((req, res) => {
          assert.equal(res.status, 200);
          assert.isTrue(/\/b\/test/.test(res.redirects[0]));
          done();
        })
      });

      test('POST to /api/threads/:board - second', (done) => {
        chai.request(server)
        .post('/api/threads/test')
        .send({text: 'Sample text 2', delete_password: 'asdf'})
        .end((req, res) => {
          assert.equal(res.status, 200);
          assert.isTrue(/\/b\/test/.test(res.redirects[0]));
          done();
        })
      });


    });
    
    suite('GET', function() {
      test('GET to /api/threads/:board', (done) => {
        chai.request(server)
        .get('/api/threads/test')
        .end((req, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body[0].board,'test');
          assert.equal(res.body[0].text,'Sample text 2');
          assert.isNotTrue(res.body.length > 10);
          currentThreadId = res.body[0]._id;
          currentThreadId2 = res.body[1]._id;
          done();
        })
      })
      
    });
    
    suite('PUT', function() {
      test('PUT to /api/threads/:board', (done) => {
        chai.request(server)
        .put('/api/threads/test')
        .send({ report_id: currentThreadId })
        .end((req, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          done();
        })
      })      
    });

    suite('DELETE', function() {

      test('DELETE to /api/threads/:board - wrong password', (done) => {
        chai.request(server)
        .delete('/api/threads/test')
        .send({thread_id: currentThreadId, delete_password: 'ddd'})
        .end((req, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'incorrect password');
          done();
        })
      });  

      test('DELETE to /api/threads/:board', (done) => {
        chai.request(server)
        .delete('/api/threads/test')
        .send({thread_id: currentThreadId, delete_password: 'asdf'})
        .end((req, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          done();
        })
      });

    });

  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST', function() {
      test('POST to /api/replies/:board', (done) => {
        chai.request(server)
        .post('/api/replies/test')
        .send({text: 'Sample reply', delete_password: 'asdf', thread_id: currentThreadId2})
        .end((req, res) => {
          assert.equal(res.status, 200);
          assert.isTrue(/\/b\/test/.test(res.redirects[0]));
          done();
        })
      })      
    });
    
    suite('GET', function() {
      test('GET to /api/replies/:board', (done) => {
        chai.request(server)
        .get('/api/replies/test')
        .query({ thread_id: currentThreadId2 })
        .end((req, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body._id, currentThreadId2);
          currentReplyId = res.body.replies[0]._id;
          done();
        })
      })          
    });
    
    suite('PUT', function() {
      test('PUT to /api/replies/:board', (done) => {
        chai.request(server)
        .put('/api/replies/test')
        .send({ thread_id: currentThreadId2, reply_id: currentReplyId })
        .end((req, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          done();
        })
      })          
    });
    
    suite('DELETE', function() {

      test('DELETE to /api/replies/:board - wrong password', (done) => {
        chai.request(server)
        .delete('/api/replies/test')
        .send({ thread_id: currentThreadId2, reply_id: currentReplyId, delete_password: 'ewre' })
        .end((req, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'incorrect password');
          done();
        })
      });

      test('DELETE to /api/replies/:board', (done) => {
        chai.request(server)
        .delete('/api/replies/test')
        .send({ thread_id: currentThreadId2, reply_id: currentReplyId, delete_password: 'asdf' })
        .end((req, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          done();
        })
      });          
    });

    suite('DELETE', function() {

      test('DELETE to /api/threads/:board - clean up', (done) => {
        chai.request(server)
        .delete('/api/threads/test')
        .send({thread_id: currentThreadId2, delete_password: 'asdf'})
        .end((req, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          done();
        })
      });

    });
    
  });

});
