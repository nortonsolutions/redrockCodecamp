/*
* Norton 2021
*
*/

'use strict';

var expect = require('chai').expect;
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');


const CONNECTION_STRING = process.env.DB;
if (!CONNECTION_STRING) {
    console.log(`Value of DB environment variable: ${CONNECTION_STRING} from ${process.env.DB}`);
}

module.exports = function (app) {
  


  const replySchema = mongoose.Schema({
    text: { type: String, required: true },
    created_on: Date,
    delete_password: { type: String, required: true },
    reported: { type: Boolean, default: false }
  })

  const ReplyModel = mongoose.model('Reply', replySchema);

  const threadSchema = mongoose.Schema({
    board: { type: String, required: true }, 
    text: { type: String, required: true },
    created_on: Date,
    bumped_on: Date,
    reported: { type: Boolean, default: false },
    delete_password: { type: String, required: true },
    replies: [replySchema]
  })

  const ThreadModel = mongoose.model('Thread', threadSchema);


  mongoose.connect(CONNECTION_STRING, { useMongoClient: true }, (err => {
    if (err) {
      console.log(err);
    }
  }))



  app.route('/api/threads/:board')
    .post((req,res) => {

      let board = req.params.board;
      let text = req.body.text;
      let delete_password = req.body.delete_password;
      let date = new Date();

      bcrypt.hash(delete_password, 12).then(hash => {
        let newThread = {
          board: board,
          text: text,
          created_on: date,
          bumped_on: date,
          reported: false,
          delete_password: hash,
          replies: []
        }
  
        ThreadModel.create(newThread, (err,doc) => {
  
          if (err) {
            res.send(err.message);
          } else {
            // res.send(doc);
            // just reload the current page
            res.redirect(302, '/en/portfolio/api/messageboard/api/threads/' + board);
          }
        })
          
      })
    })
    
    .get((req,res) => {
      let board = req.params.board;

      ThreadModel.find({board: board}).limit(10).sort({ bumped_on: -1 }).select('-reported -delete_password').exec((err, threads) => {
        if (err) {
          res.send(err.message);
        } else {
          threads.forEach(thread => {
            thread.replies = thread.replies.sort((a,b) => {
              return (a.created_on < b.created_on);
            }).slice(0,3);
          })
          res.json(threads);
        }
      })
    })

    .delete((req,res) => {
      let board = req.params.board;
      let thread_id = req.body.thread_id;
      let delete_password = req.body.delete_password;

      ThreadModel.findOne({ _id: thread_id }, (err,doc) => {
        if (err) {
          res.send(err.message);
        } else {
          
          bcrypt.compare(delete_password, doc.delete_password)
          .then(compare => {
            if (!compare) {
              res.send('incorrect password');
            } else {
              doc.remove((err) => {
                res.send('success');
              })
            }
          })
        }
      })
    })

    .put((req,res) => {
      
      let thread_id = req.body.report_id;
      ThreadModel.findOne({ _id: thread_id }, (err,thread) => {
        if (err) {
          res.send(err.message);
        } else {
          thread.reported = true;
          thread.save(err => {
            if (err) {
              res.send(err.message);
            } else {
              res.send('success');
            }
          })
        }
      })

    })

    
  app.route('/api/replies/:board')
  .post((req,res) => {

    let board = req.params.board;
    let text = req.body.text;
    let thread_id = req.body.thread_id;
    let delete_password = req.body.delete_password;

    ThreadModel.findOne({_id: thread_id}, (err,thread) => {

      if (err) {
        res.send(err.message);
      } else {
        bcrypt.hash(delete_password, 12).then(hash => {
          let date = new Date();
          thread.bumped_on = date;
          thread.replies = [...thread.replies, new ReplyModel({
            text: text,
            delete_password: hash,
            created_on: date
          })];
          thread.save((err,doc) => {
            if (err) {
              res.send(err.message);
            } else {
              // res.send(doc);
              res.redirect(302, '/en/portfolio/advanced/messageboard/api/' + board);
            }
          })
        })
      }
    })
  })

  .get((req,res) => {
    let board = req.params.board;
    let thread_id = req.query.thread_id;

    ThreadModel.findOne({board: board, _id: thread_id}).select('-reported -delete_password').exec((err, thread) => {
      if (err) {
        res.send(err.message);
      } else {
        res.json(thread);
      }
    })

  })

  .delete((req,res) => {
    let thread_id = req.body.thread_id;
    let reply_id = req.body.reply_id;
    let delete_password = req.body.delete_password;

    ThreadModel.findOne({ _id: thread_id }, (err,doc) => {
      if (err) {
        res.send(err.message);
      } else {

        let replyIndex = doc.replies.findIndex(el => {
          return el._id == reply_id;
        });

        bcrypt.compare(delete_password, doc.replies[replyIndex].delete_password)
        .then(compare => {
          if (!compare) {
            res.send('incorrect password');
          } else {
            doc.replies[replyIndex].text = '[deleted]';
            doc.save(err => {
              res.send('success');
            })
          }
        })
      }
    })
  })

  .put((req,res) => {
    
    let thread_id = req.body.thread_id;
    let reply_id = req.body.reply_id;
    ThreadModel.findOne({ _id: thread_id }, (err,thread) => {
      if (err) {
        res.send(err.message);
      } else {

        let replyIndex = thread.replies.findIndex(el => {
          return el._id == reply_id;
        });

        thread.replies[replyIndex].reported = true;
        thread.save(err => {
          if (err) {
            res.send(err.message);
          } else {
            res.send('success');
          }
        })
      }
    })

  })

  app.route('/api/:board/')
    .get(function (req, res) {
      res.sendFile('/portfolio/advanced/advancedProject-messageboard/views/board.html'
      );
  })
  app.route('/api/:board/:threadid')
    .get(function (req, res) {
      res.sendFile('/portfolio/advanced/advancedProject-messageboard/views/thread.html');
    });
  
  //Index page (static HTML)
  app.route('/')
    .get(function (req, res) {
      res.sendFile('/portfolio/advanced/advancedProject-messageboard/views/index.html');
    });
};
