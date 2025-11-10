require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;

// Configuration - UPDATE THESE VALUES
const USERNAME = 'norton@whatever.com';  // your username or email
const SUBSCRIPTION_ID = 'sub_1SQIWSBG2eTjBlvlK4Uk5CBy';
const TIER = 'copper-top';  // 'silver-hat' or 'gold-star'

// Get MongoDB URL from environment
const MONGO_URL = process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://localhost:27017/redrockCodecamp';

console.log('Connecting to MongoDB...');

MongoClient.connect(MONGO_URL, function(err, client) {
  if (err) {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  }

  console.log('Connected to MongoDB');
  
  const db = client;
  const now = new Date();
  const nextCharge = new Date(now);
  nextCharge.setMonth(now.getMonth() + 1);

  const membershipUpdate = {
    tier: TIER,
    level: TIER === 'gold-star' ? 2 : 1,
    status: 'cancelled',
    recurrence: 'monthly',
    startDate: now,
    lastChargedAt: now,
    nextChargeAt: nextCharge,
    provider: 'stripe',
    subscriptionId: SUBSCRIPTION_ID
  };

  console.log('Searching for user:', USERNAME);

  // Try to find by email first, then by username
  db.collection('user').findOne(
    { $or: [{ email: USERNAME }, { username: USERNAME }] },
    function(findErr, user) {
      if (findErr) {
        console.error('Error finding user:', findErr);
        client.close();
        process.exit(1);
      }

      if (!user) {
        console.error('User not found:', USERNAME);
        console.log('Tried searching by email and username');
        client.close();
        process.exit(1);
      }

      console.log('Found user:', user.username, '(' + user.email + ')');
      console.log('Updating membership...');

      db.collection('user').updateOne(
        { _id: user._id },
        { $set: { membership: membershipUpdate } },
        function(updateErr, result) {
          if (updateErr) {
            console.error('Update failed:', updateErr);
            client.close();
            process.exit(1);
          }

          if (result.modifiedCount === 0) {
            console.warn('⚠ No documents were modified (maybe already set?)');
          } else {
            console.log('✓ Successfully updated membership for', user.username);
          }

          console.log('\nNew membership:');
          console.log(JSON.stringify(membershipUpdate, null, 2));

          client.close(function() {
            console.log('\nMongoDB connection closed');
            process.exit(0);
          });
        }
      );
    }
  );
});
