
import { validationResult } from 'express-validator/check';
import { createValidatorErrorFormatter } from './create-handled-error.js';

const isAdminUnrestricted = process.env.IS_ADMIN_UNRESTRICTED === 'true';

/**
 * Middleware to check if user has a specific role
 * @param {string} roleName - Name of the role to check (e.g., 'admin')
 * @param {Object} options - Options for handling unauthorized access
 * @param {boolean} options.sendJson - If true, send JSON 401; if false, redirect to /signin
 * @returns {Function} Express middleware function
 */
export function checkUserByRole(roleName, options = {}) {
  const { sendJson = false } = options;
  
  return async function(req, res, next) {
    // Allow unrestricted admin access if env var is set
    if (isAdminUnrestricted) {
      return next();
    }

    // Check if user is logged in
    if (!req.user) {
      if (sendJson) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      return res.redirect('/signin');
    }

    try {
      // Get MongoDB native driver connection from Loopback datasource
      const app = req.app;
      const db = app.datasources.db;
      const mongodb = db.connector.db;
      const ObjectId = db.connector.getDefaultIdType();

      // Get native MongoDB collections (Note: collection names are usually lowercase)
      const rolesCollection = mongodb.collection('roles');
      const userRolesCollection = mongodb.collection('userroles');

      console.log(`[DEBUG] Checking role '${roleName}' for user:`, req.user.id);

      // 1. Look up the role by name to get its _id
      const role = await new Promise((resolve, reject) => {
        rolesCollection.findOne(
          { 
            name: roleName.toLowerCase(),
            isActive: true 
          },
          (err, result) => {
            if (err) {
              console.log('[DEBUG] Role lookup error:', err);
              reject(err);
            } else {
              console.log('[DEBUG] Role lookup result:', result);
              resolve(result);
            }
          }
        );
      });

      if (!role) {
        console.error(`[DEBUG] Role "${roleName}" not found in database`);
        if (sendJson) {
          return res.status(403).json({ message: 'Access denied' });
        }
        return res.redirect('/signin');
      }

      // 2. Check if user has this role assigned
      const userId = typeof req.user.id === 'string' ? ObjectId(req.user.id) : req.user.id;
      const roleId = typeof role._id === 'string' ? ObjectId(role._id) : role._id;
      
      console.log(`[DEBUG] Looking for user role - userId: ${userId}, roleId: ${roleId}`);

      const userRole = await new Promise((resolve, reject) => {
        userRolesCollection.findOne(
          {
            userId: userId,
            roleId: roleId,
            isActive: true,
            $or: [
              { expiresAt: null },
              { expiresAt: { $gt: new Date() } }
            ]
          },
          (err, result) => {
            if (err) {
              console.log('[DEBUG] UserRole lookup error:', err);
              reject(err);
            } else {
              console.log('[DEBUG] UserRole lookup result:', result);
              resolve(result);
            }
          }
        );
      });

      if (!userRole) {
        console.error(`[DEBUG] User ${req.user.id} does not have role ${roleName}`);
        if (sendJson) {
          return res.status(403).json({ message: 'Access denied - insufficient permissions' });
        }
        return res.redirect('/signin');
      }

      // 3. User has valid role, proceed
      console.log(`[DEBUG] User ${req.user.id} has valid role ${roleName}, proceeding`);
      return next();

    } catch (err) {
      console.error('Error checking user role:', err);
      if (sendJson) {
        return res.status(500).json({ message: 'Internal server error' });
      }
      return next(err);
    }
  };
}

export function ifNoUserRedirectTo(url, message, type = 'errors') {
  return function(req, res, next) {
    const { path } = req;
    if (req.user) {
      return next();
    }

    req.flash(type, {
      msg: message || `You must be signed in to access ${path}`
    });

    return res.redirect(url);
  };
}

export function ifNoUserSend(sendThis) {
  return function(req, res, next) {
    if (req.user) {
      return next();
    }
    return res.status(200).send(sendThis);
  };
}

export function ifNoUser401(req, res, next) {
  if (req.user) {
    return next();
  }
  return res.status(401).end();
}

export function ifNoAdminUser401(req, res, next) {
  if (isAdminUnrestricted || req.user) {
    return next();
  }
  return res.status(401).end();
}

export function ifNotVerifiedRedirectToSettings(req, res, next) {
  const { user } = req;
  if (!user) {
    return next();
  }
  if (!user.emailVerified) {
    req.flash('error', {
      msg: 'We do not have your verified email address on record, '
      + 'please add it in the settings to continue with your request.'
    });
    return res.redirect('/settings');
  }
  return next();
}

export function ifUserRedirectTo(path = '/', status) {
  status = status === 302 ? 302 : 301;
  return (req, res, next) => {
    if (req.user) {
      return res.status(status).redirect(path);
    }
    return next();
  };
}

// for use with express-validator error formatter
export const createValidatorErrorHandler = (...args) => (req, res, next) => {
  const validation = validationResult(req)
    .formatWith(createValidatorErrorFormatter(...args));

  if (!validation.isEmpty()) {
    const errors = validation.array();
    return next(errors.pop());
  }

  return next();
};