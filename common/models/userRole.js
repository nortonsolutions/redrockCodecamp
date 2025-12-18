const mongoose = require('mongoose');

/**
 * UserRole Schema - Many-to-many relationship between Users and Roles
 * Supports both User (social media) and Membership (main platform) models
 */
const userRoleSchema = new mongoose.Schema({
  // Reference to User (can be from User model or Membership model)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
    // Will reference either 'User' or 'Membership' depending on userType
  },
  userType: {
    type: String,
    required: true,
    enum: ['User', 'Membership'],
    default: 'User'
    // 'User' for social media app, 'Membership' for main platform
  },
  // Reference to Role
  roleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true,
    index: true
  },
  // Optional: role can be scoped to specific context
  context: {
    type: String,
    enum: ['global', 'social-media', 'property-management', 'admin'],
    default: 'global'
  },
  // Optional: role can be time-limited
  expiresAt: {
    type: Date,
    default: null
  },
  grantedBy: {
    type: mongoose.Schema.Types.ObjectId,
    // Who granted this role (admin user ID)
  },
  grantedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

// Compound index to ensure a user can't have the same role twice in the same context
userRoleSchema.index({ userId: 1, roleId: 1, context: 1 }, { unique: true });

// Index for efficient queries
userRoleSchema.index({ userId: 1, userType: 1, isActive: 1 });

// Virtual to check if role is expired
userRoleSchema.virtual('isExpired').get(function() {
  if (!this.expiresAt) return false;
  return this.expiresAt < new Date();
});

// Virtual to check if role is currently valid
userRoleSchema.virtual('isValid').get(function() {
  return this.isActive && !this.isExpired;
});

userRoleSchema.set('toJSON', { virtuals: true });
userRoleSchema.set('toObject', { virtuals: true });

const UserRole = mongoose.model('UserRole', userRoleSchema);

module.exports = UserRole;
