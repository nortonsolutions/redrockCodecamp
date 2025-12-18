"use strict";
/*
 *  Mongoose Schema for User - aligned with models/user.json
 *  Simplified to support both main platform and social media features
 */
/* jshint node: true */

// Always use the root app's connected mongoose instance
var mongoose = require.main.require('mongoose');
var bcrypt = require('bcryptjs');

// create a schema aligned with common/user.json
var userSchema = new mongoose.Schema({
    // Core identity (aligned with common/user.json)
    email: {
        type: String,
        unique: true,
        sparse: true,
        lowercase: true,
        trim: true
    },
    username: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true
    },
    password: String,          // Hashed password (replaces password_digest)
    passwordSalt: String,      // Optional salt (for migration; bcrypt handles internally)
    
    // Profile fields (aligned with common/user.json)
    name: {type: String, default: ''},        // Replaces first_name + last_name
    bio: {type: String, default: ''},         // Replaces description + occupation
    location: {type: String, default: ''},
    picture: {type: String, default: ''},
    
    // Social/external profiles (from common/user.json)
    website: String,
    linkedin: String,
    twitter: String,
    github: String,
    githubProfile: String,
    
    // Access control
    super: {type: Boolean, default: false},   // Admin/superuser flag
    isLocked: {type: Boolean, default: false},
    isBanned: {type: Boolean, default: false},
    
    // Preferences
    sendNotificationEmail: {type: Boolean, default: true},
    theme: {type: String, default: 'default'},
    
    // Timestamps
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now}
}, { collection: 'user' });

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    if (this.password) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    this.updatedAt = Date.now();
    next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    if (!this.password) return false;
    return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual for backward compatibility with old API expecting first_name/last_name
userSchema.virtual('first_name').get(function() {
    return this.name.split(' ')[0] || '';
});

userSchema.virtual('last_name').get(function() {
    const parts = this.name.split(' ');
    return parts.slice(1).join(' ') || '';
});

userSchema.virtual('login_name').get(function() {
    return this.username;
});

// Ensure virtuals are included in JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

// the schema is useless so far
// we need to create a model using it
var User = mongoose.model('User', userSchema);

// make this available to our users in our Node applications
module.exports = User;
