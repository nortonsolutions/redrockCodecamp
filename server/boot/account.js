require('dotenv').config()

const { MembershipFactory } = require('../../common/models/membership.js');

module.exports = function (app) {

	const router = app.loopback.Router();
	const stripe = require('stripe')(process.env.STRIPE_SECRET)

	const api = app.loopback.Router();
	api.post('/stripe/create-checkout', ensureAuthed, function(req, res) {
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

	api.post('/stripe/cancel-subscription', ensureAuthed, function(req, res) {
		var subscriptionId = req.user.membership && req.user.membership.subscriptionId;

		if (!subscriptionId) {
			return res.status(400).json({ error: 'No active subscription found' });
		}

		stripe.subscriptions.del(subscriptionId)
		.then(function(canceledSubscription) {
			req.user.membership.status = 'canceled';
			req.user.membership.endDate = new Date(canceledSubscription.current_period_end * 1000);
			
			req.user.save(function(err, savedUser) {
				if (err) {
					return res.status(500).json({ error: 'Failed to update user' });					
				}
				res.json({ ok: true, message: 'Subscription canceled successfully ', membership: savedUser.membership });
			});
		}).catch(function(err) {
			if (err.type === 'StripeInvalidRequestError' && err.message.includes('No such subscription')) {
				req.user.membership.status = 'canceled';
				req.user.save(function(saveErr, savedUser) {
					if (saveErr) {
						return res.status(500).json({ error: 'Failed to update user' });
					}
					return res.json({ ok: true, message: 'Subscription not found in Stripe; marked as canceled in user profile', membership: savedUser.membership });
				});
				return;
			}
			console.error('Stripe cancel error:', err);
			res.status(500).json({ error: err.message });
		});
	});

	api.post('/stripe/cancel-previous-subscription', ensureAuthed, function(req, res) {
		var previousSubscriptionId = req.user.membership && req.user.membership.previousSubscriptionId;

		if (!previousSubscriptionId) {
			return res.status(400).json({ error: 'No previous subscription found' });
		}

		stripe.subscriptions.del(previousSubscriptionId)
		.then(function(canceledSubscription) {
			res.json({ ok: true, message: `Previous subscription canceled successfully for ${previousSubscriptionId}, which was ${canceledSubscription.status}` });
		}).catch(function(err) {
			if (err.type === 'StripeInvalidRequestError' && err.message.includes('No such subscription')) {
				req.user.membership.status = 'canceled';
				req.user.save(function(saveErr, savedUser) {
					if (saveErr) {
						return res.status(500).json({ error: 'Failed to update user' });
					}
					return res.json({ ok: true, message: 'Subscription not found in Stripe; marked as canceled in user profile', membership: savedUser.membership });
				});
				return;
			}
			console.error('Stripe cancel previous error:', err);
			res.status(500).json({ error: err.message });
		});
	});

	app.use('/api', api);

	
	router.get('/account/update-password', ensureAuthed, function(req, res) {
		res.render('account/update-password', {
			title: 'Change account password'
		})
	});

	router.get('/account/membership-level', ensureAuthed, function(req, res) {
		res.render('account/membership-level', {
			title: 'Membership Level',
			MEMBERSHIP_TIERS: MembershipFactory.GetAllMembershipTiers(),
			tierNames: MembershipFactory.GetTierMap(),
			membershipTier: req.user && req.user.membership && req.user.membership.status !== 'canceled' ? req.user.membership.tier : 'copper-top'
		})
	});

	router.get('/settings/membership', ensureAuthed, function(req, res) {
		res.render('account/membership-level', {
			title: 'Membership Level',
			MEMBERSHIP_TIERS: MembershipFactory.GetAllMembershipTiers(),
			tierNames: MembershipFactory.GetTierMap(),
			membershipTier: req.user && req.user.membership && req.user.membership.status !== 'canceled' ? req.user.membership.tier : 'copper-top'
		})
	});
	
	function ensureAuthed(req, res, next) {
		if (req.user) return next();
		if (typeof req.isAuthenticated === 'function' && req.isAuthenticated()) return next();
		return res.redirect('/signin');
	}

	// Verify and complete subscription after Stripe redirect
	router.get('/settings/membership/complete', ensureAuthed, function(req, res) {
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
			var tierConfig = MembershipFactory.GetByTier(tier);

			var now = new Date();
			var nextCharge = new Date(now);
			nextCharge.setMonth(now.getMonth() + 1);

			var previousMembership = {};
			if (req.user.membership) {
				previousMembership = JSON.parse(JSON.stringify(req.user.membership));
			}

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
				subscriptionId: subscriptionId,
				previousMembership: previousMembership
			};

			req.user.save(function(err, savedUser) {

				if (err) {
					console.error('Error saving user membership after Stripe checkout:', err);
				}
				
				console.log('✓ ' + req.user.username + ' changed to ' + tier + ' membership via Stripe; subscription ID ' + subscriptionId);

				if ((previousMembership.subscriptionId && previousMembership.subscriptionId !== subscriptionId) &&
					(req.user.membership.status === 'active' && previousMembership.status === 'active')) {
					stripe.subscriptions.del(previousMembership.subscriptionId)
					.then(function(canceledSubscription) {
						console.log(`✓ Previous subscription ${previousMembership.subscriptionId} canceled successfully for user ${req.user.username}: `, canceledSubscription);
						var pms = JSON.parse(JSON.stringify(req.user.membership.previousMembership))
						pms.status = 'canceled';
						pms.meta = { canceledAt: new Date(), canceledSubscription: canceledSubscription };
						
						req.user.membership = new MembershipFactory(req.user.membership.tier, {...req.user.membership, previousMembership: pms }).get();
						req.user.save(function(err, savedUser) {
							if (err) {
								onsole.error(`✗ Error in SECOND user.save() -- after successful membership change (including first user.save()) AND successful previousMembership cancellation for user ${req.user.username}:`, err);
							}
							console.log(`✓ Updated previousMembership status to 'canceled' with subscription ${previousMembership.subscriptionId} for user ${req.user.username}`);
						});
					}).catch(function(err) {
						console.error('Despite registering successfully, failure in subsequent Stripe cancel for previous active membership:', err);
						
					}).finally(() => {
						res.redirect('/settings/membership?success=true&tier=' + tier);
					});
				} else {
					res.redirect('/settings/membership?success=true&tier=' + tier);
				}
			});
		}).catch(function(err) {
			console.error('Error retrieving Stripe checkout session:', err);
			return res.redirect('/settings/membership?error=session_retrieve_failed');
		});
	});

	app.use('/:lang', router);
	app.use('/', router);
};