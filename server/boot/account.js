require('dotenv').config()

module.exports = function (app) {

	const router = app.loopback.Router();
	const api = app.loopback.Router();
	const stripe = require('stripe')(process.env.STRIPE_SECRET)
	var getTierByKey = require('../../common/models/membership-tiers').get

	router.get('/account/update-password', ensureAuthed,
		(req, res) => {
			res.render('account/update-password', {
				title: 'Change account password'
			})
		}
	);

	router.get('/account/membership-level', ensureAuthed,
		(req, res) => {
			res.locals.tierNames = { 'copper-top': 'Copper-Top (Free)', 'silver-hat': 'Silver-Hat ($9.99/mo)', 'gold-star': 'Gold-Star ($19.99/mo)' };
			res.locals.membershipTier = req.user && req.user.membership && req.user.membership.status !== 'canceled' ? req.user.membership.tier :'copper-top';
			res.render('account/membership-level', {
				title: 'Membership Level'
			})
		}
	);

	api.get('/settings/membership', ensureAuthed, function(req, res) {
		// don't render the template directly but redirect to /account/membership-level
		res.redirect('/account/membership-level');
	});

	function ensureAuthed(req, res, next) {
		if (req.user) return next();
		if (typeof req.isAuthenticated === 'function' && req.isAuthenticated()) return next();
		return res.redirect('/signin');
	}

	// Create Stripe Checkout Session
	api.post('/api/stripe/create-checkout', ensureAuthed, function(req, res) {
		var tier = req.body.tier;
		
		if (!tier || (tier !== 'silver-hat' && tier !== 'gold-star')) {
			return res.status(400).json({ error: 'Invalid tier selection' });
		}

		var priceIds = {
			'silver-hat': process.env.STRIPE_PRICE_ID_SILVER,
			'gold-star': process.env.STRIPE_PRICE_ID_GOLD
		};

		if (!priceIds[tier]) {
			return res.status(500).json({ error: 'Price not configured for ' + tier });
		}

		stripe.checkout.sessions.create({
			payment_method_types: ['card'],
			mode: 'subscription',
			line_items: [{
				price: priceIds[tier],
				quantity: 1
			}],
			success_url: process.env.BASE_URL + '/settings/membership/complete?session_id={CHECKOUT_SESSION_ID}',
			cancel_url: process.env.BASE_URL + '/settings/membership?canceled=true',
			client_reference_id: req.user.id.toString(),
			customer_email: req.user.email,
			metadata: {
				userId: req.user.id.toString(),
				tier: tier,
				siteId: process.env.SITE_ID || 'redrock'
			}
		}).then(function(session) {
			res.json({ url: session.url });
		}).catch(function(err) {
			console.error('Stripe checkout error:', err);
			res.status(500).json({ error: err.message });
		});
	});

	// Verify and complete subscription after Stripe redirect
	api.get('/settings/membership/complete', ensureAuthed, function(req, res) {
		var sessionId = req.query.session_id;

		if (!sessionId) {
			return res.redirect('/settings/membership?error=no_session');
		}

		stripe.checkout.sessions.retrieve(sessionId)
		.then(function(session) {
			
			// Verify payment was successful
			if (session.payment_status !== 'paid') {
				return res.redirect('/settings/membership?error=not_paid');
			}

			// Verify this session belongs to logged-in user
			if (session.client_reference_id !== req.user.id.toString()) {
				return res.redirect('/settings/membership?error=wrong_user');
			}

			// Extract tier and subscription info
			var tier = session.metadata.tier;
			var subscriptionId = session.subscription;
			var tierConfig = getTierByKey(tier);

			var now = new Date();
			var nextCharge = new Date(now);
			nextCharge.setMonth(now.getMonth() + 1);

			// Update user membership
			req.user.membership = {
				tier: tierConfig.key,
				level: tierConfig.level,
				status: 'active',
				recurrence: 'monthly',
				startDate: req.user.membership && req.user.membership.startDate || now,
				lastChargedAt: now,
				nextChargeAt: nextCharge,
				provider: 'stripe',
				subscriptionId: subscriptionId
			};

			req.user.save(function(err) {
				if (err) {
					console.error('Failed to save user membership:', err);
					return res.redirect('/settings/membership?error=save_failed');
				}

				console.log('✓ ' + req.user.username + ' upgraded to ' + tier);
				
				// Success! Redirect with success message
				res.redirect('/settings/membership?success=true&tier=' + tier);
			});
		})
		.catch(function(err) {
			console.error('Stripe verification error:', err);
			res.redirect('/settings/membership?error=stripe_error');
		});
	});

	// Cancel subscription
	api.post('/api/stripe/cancel-subscription', ensureAuthed, function(req, res) {
		var subscriptionId = req.user.membership && req.user.membership.subscriptionId;

		if (!subscriptionId) {
			return res.status(400).json({ error: 'No active subscription found' });
		}

		stripe.subscriptions.del(subscriptionId)
		.then(function(canceledSubscription) {
			req.user.membership.status = 'canceled';
			req.user.membership.endDate = new Date(canceledSubscription.current_period_end * 1000);
			
			req.user.save(function(err) {
				if (err) {
					return res.status(500).json({ error: 'Failed to update user' });
				}
				res.json({ ok: true, message: 'Subscription canceled successfully' });
			});
		}).catch(function(err) {
			console.error('Stripe cancel error:', err);
			res.status(500).json({ error: err.message });
		});
	});

	app.use('/:lang', router);
	app.use(api);
};