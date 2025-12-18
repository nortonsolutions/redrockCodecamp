const mongoose = require('mongoose');

/**
 * Role Schema - Defines application-wide roles with permissions
 */
const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    // e.g., 'admin', 'property-manager', 'user', 'guest'
  },
  displayName: {
    type: String,
    required: true,
    // e.g., 'Administrator', 'Property Manager', 'User', 'Guest'
  },
  description: {
    type: String,
    default: ''
  },
  permissions: [{
    type: String,
    // e.g., 'properties:read', 'properties:write', 'properties:delete',
    // 'users:manage', 'photos:moderate', 'system:admin'
  }],
  priority: {
    type: Number,
    default: 0,
    // Higher number = higher priority (for determining "highest" role)
  },
  isSystem: {
    type: Boolean,
    default: false,
    // System roles cannot be deleted
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

roleSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to check if role has a specific permission
roleSchema.methods.hasPermission = function(permission) {
  return this.permissions.includes(permission) || this.permissions.includes('*');
};

// Method to check if role has any of the permissions
roleSchema.methods.hasAnyPermission = function(permissionsArray) {
  if (this.permissions.includes('*')) return true;
  return permissionsArray.some(perm => this.permissions.includes(perm));
};

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;
