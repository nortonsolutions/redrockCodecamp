require('dotenv').config()

const { MembershipFactory } = require('../../common/models/membership.js');

module.exports = function (app) {

	const router = app.loopback.Router();
	const stripe = require('stripe')(process.env.STRIPE_SECRET)

	const api = app.loopback.Router();
	api.post('/stripe/create-checkout', ensureAndHydrateUser, function(req, res) {
		var tier = req.body.tier;
		
		if (!tier || (tier !== 'silver-hat' && tier !== 'gold-star')) {
			return res.status(400).json({ error: 'Invalid tier selection' });
		}

		var priceIds = {
			'silver-hat': process.env.STRIPE_PRICE_ID_SILVER,
			'gold-star': process.env.STRIPE_PRICE_ID_GOLD,
			'platinum-sponsor': process.env.STRIPE_PRICE_ID_PLATINUM
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
			console.log(`✓ Created Stripe checkout session for user ${req.user.username} (${req.user.id}) for tier ${tier} with session: ${session.url}`);
			res.json({ url: session.url });
		}).catch(function(err) {
			console.error('Stripe checkout error:', err);
			res.status(500).json({ error: err.message });
		});
	});

	api.post('/stripe/cancel-subscription', ensureAndHydrateUser, function(req, res) {
		var subscriptionId = req.user.membership && req.user.membership.subscriptionId;

		if (!subscriptionId) {
			return res.status(400).json({ error: 'No active subscription found' });
		}

		var ms = JSON.parse(JSON.stringify(req.user.membership))
		ms.status = 'canceled';
		ms.meta = { ...(ms.meta || {}), canceledAt: new Date() };
		req.user.membership = ms;	
		
		stripe.subscriptions.del(subscriptionId)
		.then(function(canceledSubscription) {
			console.log(`✓ Previous subscription ${subscriptionId} canceled successfully for user ${req.user.username}: `, canceledSubscription);
			req.user.save(function(err, savedUser) {
				if (err) {
					return res.json({ error: `Failure during user.save();Failed to update user - ${err.message} for ${req.user.username} with membership ${JSON.stringify(req.user.membership)}` });					
				} else {
					return res.json({ ok: true, message: 'Subscription canceled successfully ', membership: savedUser.membership });
				}
			});
		}).catch(function(err) {
			if (err.type === 'StripeInvalidRequestError' && err.message.includes('No such subscription')) {
				req.user.save(function(saveErr, savedUser) {
					if (saveErr) {
						return res.json({ error: 'Failure during user.save() after missing subscription; ' + saveErr.message });
					} else {
						return res.json({ ok: true, message: 'Subscription not found in Stripe; marked as canceled in user profile', membership: savedUser.membership });
					}
				});
			} else {
				console.error('Stripe cancel error:', err);
				res.json({ error: err.message });
			}
		});
	});

	app.use('/api', api);
	
	router.get('/account/update-password', ensureAndHydrateUser, function(req, res) {
		res.render('account/update-password', {
			title: 'Change account password'
		})
	});

	router.get('/account/membership-level', ensureAndHydrateUser, function(req, res) {
		res.render('account/membership-level', {
			title: 'Membership Level',
			MEMBERSHIP_TIERS: MembershipFactory.GetAllMembershipTiers(),
			tierNames: MembershipFactory.GetTierMap(),
			membershipTier: req.user && req.user.membership && req.user.membership.status !== 'canceled' ? req.user.membership.tier : 'copper-top'
		})
	});

	router.get('/settings/membership', ensureAndHydrateUser, function(req, res) {
		// gather query params -- error or warning; pass to template
		var error = req.query.error;
		var success = req.query.success;
		var warning = req.query.warning;
		var canceled = req.query.canceled;
		res.render('account/membership-level', {
			title: 'Membership Level',
			MEMBERSHIP_TIERS: MembershipFactory.GetAllMembershipTiers(),
			tierNames: MembershipFactory.GetTierMap(),
			membershipTier: req.user && req.user.membership && req.user.membership.status !== 'canceled' ? req.user.membership.tier : 'copper-top',
			error: error,
			success: success,
			warning: warning,
			canceled: canceled
		})
	});
	
	function ensureAndHydrateUser(req, res, next) {
		if (typeof req.isAuthenticated === 'function' && req.isAuthenticated() && req.user) {
			var User = app.models.User

			User.findById(req.user.id)
			.then(function(user) {
				if (user) req.user = user;
				next();
			}).catch(function(err) {
				console.error('Error fetching user in ensureAuthed:', err);
				res.redirect('/login' + '?returnTo=' + encodeURIComponent(req.originalUrl));
			})
		}
	}

	// Verify and complete subscription after Stripe redirect
	router.get('/settings/membership/complete', ensureAndHydrateUser, function(req, res) {
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
					return res.redirect('/settings/membership?error=user_save_failed');
				}
				
				console.log('✓ ' + req.user.username + ' changed to ' + tier + ' membership via Stripe; subscription ID ' + subscriptionId);

				if ((previousMembership.subscriptionId && previousMembership.subscriptionId !== subscriptionId) &&
					(req.user.membership.status === 'active' && previousMembership.status === 'active')) {

					var pms = JSON.parse(JSON.stringify(req.user.membership.previousMembership))
					pms.status = 'canceled';
					pms.meta = { ...(pms.meta || {}), canceledAt: new Date() };
					req.user.membership = { ...req.user.membership, previousMembership: pms };	
					
					stripe.subscriptions.del(previousMembership.subscriptionId)
					.then(function(canceledSubscription) {
						console.log(`✓ Previous subscription ${previousMembership.subscriptionId} canceled successfully for user ${req.user.username}: `, canceledSubscription);
						req.user.save(function(err, savedUser) {
							if (err) res.redirect('/settings/membership?success=true&tier=' + tier + '&warning=previous_cancel_save_failed');
							res.redirect('/settings/membership?success=true&tier=' + tier);
						});
					}).catch(function(err) {
						if (err.type === 'StripeInvalidRequestError' && err.message.includes('No such subscription')) {
							req.user.save(function(saveErr, savedUser) {
								if (saveErr) return res.redirect('/settings/membership?success=true&tier=' + tier + '&warning=previous_cancel_save_failed');
								return res.redirect('/settings/membership?success=true&tier=' + tier);
							});
						} else {
							console.error('Despite registering successfully, failure in subsequent Stripe cancel for previous active membership:', err);
							res.redirect('/settings/membership?success=true&tier=' + tier + '&warning=previous_cancel_failed');
						}
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