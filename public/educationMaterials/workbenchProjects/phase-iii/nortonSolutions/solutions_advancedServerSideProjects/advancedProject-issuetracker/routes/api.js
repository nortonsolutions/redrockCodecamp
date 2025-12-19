/*
* Norton 2021
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;
const mongoose = require('mongoose');

module.exports = function (app) {

  const CONNECTION_STRING = process.env.DB;
  // MongoClient.connect(CONNECTION_STRING, function(err, db) {
  mongoose.connect(CONNECTION_STRING, {useMongoClient: true}, (err) => {
      if (err) {
        console.log('Database error: ' + err);
      }
  });

  const schemaProject = mongoose.Schema({
    project: String,
    issue_title: { type: String, required: true },
    issue_text: { type: String, required: true },
    created_by: { type: String, required: true },
    assigned_to: String,
    status_text: String,
    created_on: Date,
    updated_on: Date,
    open: Boolean
  })  

  var ProjectModel = mongoose.model('Project',schemaProject);


  app.route('/api/issues/:project')
    
      .get(function (req, res){

        var filtersObject = { project: req.params.project };

        Object.keys(req.query).forEach(filter => {
          filtersObject[filter] = req.query[filter];
        })

        ProjectModel.find(filtersObject, (err,projects) => {
          if (err) {
            res.send('error finding project ' + req.params.project);
          } else {
            res.send(projects);
          }
        })
      })
      
      .post(function (req, res){

        let date = new Date();

        var newIssue = {
          project: req.params.project,
          issue_title: req.body.issue_title,
          issue_text: req.body.issue_text,
          created_by: req.body.created_by,
          assigned_to: req.body.assigned_to,
          status_text: req.body.status_text,
          created_on: date,
          updated_on: date,
          open: true
        }

        let newProject = new ProjectModel(newIssue);
        newProject.save((err, project) => {
          if (err) {
            res.send(err.message);
          } else {
            res.json(project)
          }
        })

      })
      
      .put(function (req, res){

        if (Object.keys(req.body).length == 0) {
          res.send('no updated field sent');
          res.done();
        }
        ProjectModel.findById(req.body._id,(err,project) => {
            Object.keys(req.body).forEach(key => {
              project[key] = req.body[key];
            });
            project.save((err,project) => {
              if (err) {
                "could not update " + req.body._id;
              } else {
                res.send("successfully updated");
              }
            });
        })
      })
      
      .delete(function (req, res){
        if (! req.body._id) {
          res.send('_id error');
          res.done();
        } else {
          ProjectModel.findOneAndRemove({ _id: req.body._id }, (err,doc) => {
            if (err) {
              res.send('could not delete ' + req.body._id);
              res.done();
            } else {
              res.send('deleted ' + req.body._id);
            }
          })
        }
      });
}
