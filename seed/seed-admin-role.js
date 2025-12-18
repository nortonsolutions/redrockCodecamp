#!/usr/bin/env node
/**
 * Seed script to create admin role and assign it to a user
 * Usage: node seed/seed-admin-role.js <username_or_email>
 */

require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;

// MongoDB connection string from environment or default
const MONGODB_URI = process.env.MONGOHQ_URL

function seedAdminRole(callback) {
  MongoClient.connect(MONGODB_URI, function(err, db) {
    if (err) {
      console.error('✗ Failed to connect to MongoDB:', err.message);
      return callback(err);
    }
    
    console.log('✓ Connected to MongoDB');

    const rolesCollection = db.collection('roles');
    const userRolesCollection = db.collection('userroles');
    const usersCollection = db.collection('user');

    // Step 1: Create or update admin role
    rolesCollection.findOne({ name: 'admin' }, function(err, adminRole) {
      if (err) {
        console.error('✗ Error finding admin role:', err.message);
        db.close();
        return callback(err);
      }

      const adminRoleDoc = {
        name: 'admin',
        displayName: 'Administrator',
        description: 'Full system access with all permissions',
        permissions: ['*'], // Wildcard permission
        priority: 100,
        isSystem: true,
        isActive: true,
        updatedAt: new Date()
      };

      if (!adminRole) {
        // Create new admin role
        rolesCollection.insertOne(adminRoleDoc, function(err, result) {
            if (err) {
                console.error('✗ Error creating admin role:', err.message);
                db.close();
                return callback(err);
            }
            console.log('✓ Admin role created');
            processUser(db, result.ops[0], usersCollection, userRolesCollection, callback);
        }
        );
        }
        else {
            console.log(`✓ Admin role already exists, aborting...`);
            db.close();
            return callback(null);
        }   
    });
  });
}

function processUser(db, adminRole, usersCollection, userRolesCollection, callback) {
  const userIdentifier = process.argv[2];
  
  if (!userIdentifier) {
    console.log('\n✓ Admin role created/updated');
    console.log('To assign admin role to a user, run:');
    console.log('  node seed/seed-admin-role.js <username_or_email>');
    db.close();
    return callback(null);
  }

  // Step 2: Find user by username or email
  usersCollection.findOne({
    $or: [
      { username: userIdentifier.toLowerCase() },
      { email: userIdentifier.toLowerCase() }
    ]
  }, function(err, user) {
    if (err) {
      console.error('✗ Error finding user:', err.message);
      db.close();
      return callback(err);
    }

    if (!user) {
      console.error(`✗ User not found: ${userIdentifier}`);
      console.log('Available users:');
      usersCollection.find({}, { username: 1, email: 1 }).limit(10).toArray(function(err, users) {
        if (!err && users) {
          users.forEach(u => console.log(`  - ${u.username} (${u.email})`));
        }
        db.close();
        callback(new Error('User not found'));
      });
      return;
    }

    console.log(`✓ Found user: ${user.username} (${user.email})`);

    // Check if user already has admin role
    userRolesCollection.findOne({
      userId: user._id,
      roleId: adminRole._id
    }, function(err, existingUserRole) {
      if (err) {
        console.error('✗ Error checking existing role assignment:', err.message);
        db.close();
        return callback(err);
      }

      if (existingUserRole) {
        // Update to ensure it's active
        userRolesCollection.updateOne(
          { _id: existingUserRole._id },
          { 
            $set: { 
              isActive: true,
              expiresAt: null
            }
          },
          function(err) {
            if (err) {
              console.error('✗ Error updating role assignment:', err.message);
              db.close();
              return callback(err);
            }
            console.log('✓ Updated existing admin role assignment');
            console.log('\n✓✓✓ SUCCESS ✓✓✓');
            console.log(`User ${user.username} now has admin privileges`);
            db.close();
            callback(null);
          }
        );
      } else {
        // Create new role assignment
        const userRoleDoc = {
          userId: user._id,
          userType: 'User',
          roleId: adminRole._id,
          context: 'global',
          isActive: true,
          grantedAt: new Date()
        };

        userRolesCollection.insertOne(userRoleDoc, function(err) {
          if (err) {
            console.error('✗ Error assigning admin role:', err.message);
            db.close();
            return callback(err);
          }
          console.log('✓ Assigned admin role to user');
          console.log('\n✓✓✓ SUCCESS ✓✓✓');
          console.log(`User ${user.username} now has admin privileges`);
          db.close();
          callback(null);
        });
      }
    });
  });
}

// Run the seed script
seedAdminRole(function(err) {
  if (err) {
    console.error('✗ Seed script failed');
    process.exit(1);
  } else {
    console.log('✓ Database connection closed');
    process.exit(0);
  }
});
