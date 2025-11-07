/** 
  * billing-cron-cleanup.js
  * 
  * Daily sync script to reconcile Stripe subscriptions with local user records.
  * Stripe handles all recurring billing; this just catches any missed updates.
  * 
  * Run via Unix cron:
  * 0 3 * * * cd /Users/norton/projects/redrockCodecamp && /usr/local/bin/node server/billing/billing-cron-cleanup.js >> /var/log/membership-sync.log 2>&1
 */

require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET);
const MongoClient = require('mongodb').MongoClient;

const MONGO_URL = process.env.MONGODB_URI || process.env.MONGOLAB_URI || 'mongodb://localhost:27017/redrockCodecamp';

// Map Stripe price IDs to tier names
const PRICE_TO_TIER = {
  [process.env.STRIPE_PRICE_ID_SILVER]: 'silver-hat',
  [process.env.STRIPE_PRICE_ID_GOLD]: 'gold-star'
};

async function syncMemberships() {
  console.log('[' + new Date().toISOString() + '] Starting membership sync...');
  
  const client = await MongoClient.connect(MONGO_URL, { useUnifiedTopology: true });
  const db = client.db();
  
  let synced = 0;
  let errors = 0;

  try {
    // Get all active Stripe subscriptions (paginate if > 100)
    let hasMore = true;
    let startingAfter = null;

    while (hasMore) {
      const params = { limit: 100, status: 'all' };
      if (startingAfter) params.starting_after = startingAfter;
      
      const subs = await stripe.subscriptions.list(params);

      for (const sub of subs.data) {
        try {
          // Get user ID from subscription metadata or customer metadata
          let userId = sub.metadata && sub.metadata.userId;
          
          if (!userId) {
            // Fallback: check customer metadata
            const customer = await stripe.customers.retrieve(sub.customer);
            userId = customer.metadata && customer.metadata.userId;
          }

          if (!userId) {
            console.log('  ⚠️  Subscription', sub.id, 'has no userId in metadata');
            continue;
          }

          // Find user in MongoDB
          const user = await db.collection('user').findOne({ _id: userId });
          
          if (!user) {
            console.log('  ⚠️  User not found:', userId, '(subscription:', sub.id + ')');
            continue;
          }

          // Determine tier from subscription price
          const priceId = sub.items.data[0] && sub.items.data[0].price && sub.items.data[0].price.id;
          const tier = PRICE_TO_TIER[priceId] || 'silver-hat'; // default fallback
          const level = tier === 'gold-star' ? 2 : 1;

          // Build membership object
          const now = new Date();
          const nextCharge = new Date(sub.current_period_end * 1000);
          const status = sub.status === 'active' ? 'active' : 
                        sub.status === 'canceled' ? 'canceled' : 
                        sub.status === 'past_due' ? 'past_due' : 'active';

          const membership = {
            tier: tier,
            level: level,
            status: status,
            recurrence: 'monthly',
            startDate: user.membership && user.membership.startDate || new Date(sub.created * 1000),
            lastChargedAt: user.membership && user.membership.lastChargedAt || now,
            nextChargeAt: nextCharge,
            provider: 'stripe',
            subscriptionId: sub.id
          };

          // Update if different
          const current = user.membership;
          const needsUpdate = !current || 
                            current.subscriptionId !== sub.id ||
                            current.status !== status ||
                            current.tier !== tier;

          if (needsUpdate) {
            await db.collection('user').updateOne(
              { _id: userId },
              { $set: { membership: membership } }
            );
            console.log('  ✓ Updated', user.username, '→', tier, '(' + status + ')');
            synced++;
          }

        } catch (err) {
          console.error('  ✗ Error processing subscription', sub.id + ':', err.message);
          errors++;
        }
      }

      hasMore = subs.has_more;
      if (hasMore) {
        startingAfter = subs.data[subs.data.length - 1].id;
      }
    }

    // Also check for users with subscriptionId but no matching Stripe subscription (edge case)
    const usersWithSubs = await db.collection('user').find({
      'membership.provider': 'stripe',
      'membership.subscriptionId': { $exists: true, $ne: null }
    }).toArray();

    for (const user of usersWithSubs) {
      try {
        const subId = user.membership.subscriptionId;
        const sub = await stripe.subscriptions.retrieve(subId);
        
        // If subscription is canceled in Stripe but active in DB, update
        if ((sub.status === 'canceled' || sub.status === 'incomplete_expired') && 
            user.membership.status === 'active') {
          
          await db.collection('user').updateOne(
            { _id: user._id },
            { $set: { 
              'membership.status': 'canceled',
              'membership.endDate': new Date(sub.current_period_end * 1000)
            }}
          );
          console.log('  ✓ Marked canceled:', user.username);
          synced++;
        }
      } catch (err) {
        if (err.code === 'resource_missing') {
          // Subscription deleted in Stripe, mark as canceled
          await db.collection('user').updateOne(
            { _id: user._id },
            { $set: { 
              'membership.status': 'canceled',
              'membership.endDate': new Date()
            }}
          );
          console.log('  ✓ Subscription deleted, marked canceled:', user.username);
          synced++;
        } else {
          console.error('  ✗ Error checking user', user.username + ':', err.message);
          errors++;
        }
      }
    }

  } finally {
    await client.close();
  }

  console.log('[' + new Date().toISOString() + '] Sync complete. Updated:', synced, 'Errors:', errors);
  process.exit(errors > 0 ? 1 : 0);
}

syncMemberships().catch(err => {
  console.error('[' + new Date().toISOString() + '] Fatal error:', err);
  process.exit(1);
});