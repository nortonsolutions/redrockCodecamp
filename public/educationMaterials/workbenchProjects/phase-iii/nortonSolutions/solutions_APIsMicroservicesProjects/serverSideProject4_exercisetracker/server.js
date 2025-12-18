const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const cors = require('cors')

const mongoose = require('mongoose')
mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/exercise-track', {useMongoClient: true})

// Mongoose setup:
const schemaUser = mongoose.Schema({
  username: { type: String, required: true, unique: true },
  exercises: [{
     description: String,
     duration: Number,
     date: Date
  }]
})

var UserModel = mongoose.model('User',schemaUser);

app.use(cors());

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/exercise/new-user', (req,resp) => {
  let userName = req.body.username;

  if (userName == 0 || ! userName.match(/^\w+$/)) resp.send('Invalid username.')
  let newUser = new UserModel({username: userName})
  newUser.save((err,data) => {
    if (err) {
      resp.send(err.message);
    } else {
      resp.json({username: data.username, _id: data._id})
    }
  })

})

app.get('/api/exercise/users', (req,resp) => {

  UserModel.find({}).select('username _id').exec((err,data) => {
    if (err) {
      resp.send(err.message);
    } else {
      resp.json(data);
    }

  })
})

app.post('/api/exercise/add', (req, resp) => {

  if (req.body.username == '' || ! /^\d+$/.test(req.body.duration) || req.body.description == '') {
    resp.send("Username, description, and duration (in minutes) must be set.")
  } else if (req.body.date != '' && ! /^\d{4}-\d{1,2}-\d{1,2}$/.test(req.body.date)) {
    resp.send("Date must be in yyyy-mm-dd format.")
  } else {
    var date;
    if (req.body.date.length == 0) {
      date = new Date();
    } else {
      date = new Date(req.body.date);
    }
  
    let newExercise = {
      description: req.body.description,
      duration: req.body.duration,
      date: date
    }
  
    UserModel
    .findOne({username: req.body.userId}, (err,person) => {
      if (err) {
        resp.send("User was not found.")
      } else {
        person.exercises = [...person.exercises, newExercise];
        person.save((err,person) => {
          if (err) {
            resp.send(err.message);
          } else {
            resp.json({_id: person._id, username: person.username, exercises: person.exercises});
          }
        });
      }
    })
  
  }

})

app.get('/api/exercise/log', (req,resp) => {

  UserModel
  .findOne({username: req.query.userId}, (err,person) => {
    if (! person || err) {
       resp.send("User was not found: " + err)
    } else {

      let exercises = person.exercises;
      if (req.query.from) {
        exercises = exercises.filter(exercise => exercise.date >= new Date(req.query.from));
      }

      if (req.query.to) {
        exercises = exercises.filter(exercise => exercise.date <= new Date(req.query.to));
      }

      if (req.query.limit) {
        exercises = exercises.slice(0,req.query.limit);
      }

      resp.json({_id: person._id, username: person.username, exercises: exercises});
    }
  })
})


// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
