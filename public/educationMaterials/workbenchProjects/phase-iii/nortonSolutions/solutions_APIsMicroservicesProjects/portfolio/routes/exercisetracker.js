/**
 * Exercise Tracker Routes
 * Simplified version from serverSideProject4_exercisetracker
 */

const express = require('express');
const router = express.Router();

// In-memory storage (for demo purposes)
let users = [];
let exercises = [];
let userIdCounter = 1;

// Create a new user
router.post('/', (req, res) => {
  const username = req.body.username;
  const userId = userIdCounter++;
  
  const newUser = {
    username: username,
    _id: userId
  };
  
  users.push(newUser);
  res.json(newUser);
});

// Get all users
router.get('/', (req, res) => {
  res.json(users);
});

// Add exercise to user
router.post('/:_id/exercises', (req, res) => {
  const userId = parseInt(req.params._id);
  const { description, duration, date } = req.body;
  
  const user = users.find(u => u._id === userId);
  if (!user) {
    return res.json({ error: 'User not found' });
  }
  
  const exerciseDate = date ? new Date(date) : new Date();
  
  const exercise = {
    userId: userId,
    description: description,
    duration: parseInt(duration),
    date: exerciseDate.toDateString()
  };
  
  exercises.push(exercise);
  
  res.json({
    _id: user._id,
    username: user.username,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date
  });
});

// Get user exercise log
router.get('/:_id/logs', (req, res) => {
  const userId = parseInt(req.params._id);
  const { from, to, limit } = req.query;
  
  const user = users.find(u => u._id === userId);
  if (!user) {
    return res.json({ error: 'User not found' });
  }
  
  let userExercises = exercises.filter(e => e.userId === userId);
  
  // Apply date filters if provided
  if (from) {
    const fromDate = new Date(from);
    userExercises = userExercises.filter(e => new Date(e.date) >= fromDate);
  }
  
  if (to) {
    const toDate = new Date(to);
    userExercises = userExercises.filter(e => new Date(e.date) <= toDate);
  }
  
  // Apply limit if provided
  if (limit) {
    userExercises = userExercises.slice(0, parseInt(limit));
  }
  
  res.json({
    _id: user._id,
    username: user.username,
    count: userExercises.length,
    log: userExercises.map(e => ({
      description: e.description,
      duration: e.duration,
      date: e.date
    }))
  });
});

module.exports = router;