
const { adminRoot } = require('../utils/constantStrings.json');
const debug = require('debug');
const { ifNoAdminUser401 } = require('../utils/middleware');
// Example in your Express route


const log = debug('rrcc:boot:admin');
const businessAppName = process.env.BUSINESS_NAME + " " + process.env.APP_NAME;
const isAdminUnrestricted = process.env.IS_ADMIN_UNRESTRICTED === 'true';

module.exports = function (app) {

	const router = app.loopback.Router();
	const api = app.loopback.Router();
	const User = app.models.User;


	router.get('/' + adminRoot,
			(req, res) => {
						
				if (!isAdminUnrestricted && !req.user) {      
					return res.redirect('/signin');
				}

				res.render('admin/admin-home', {
					title: `Admin Home`,
					adminRoot: adminRoot
				})
			}
	);

	router.get('/create-account',
			(req, res) => {
						
				if (!isAdminUnrestricted && !req.user) {      
					return res.redirect('/signin');
				}

				res.render('admin/create-account', {
					title: `Create a new ${businessAppName} account`
				})
			}
	);

	api.post('/create-account',
		ifNoAdminUser401,
		(req, res) => {

			const { body: {email, username, name, location, password, confirmPassword } } = req;
		
			if (password && password !== confirmPassword) {
			  return res.status(403).json({
				message: `Passwords do not match.`
			  });
			}


			return User.createAccount(email, username, name, location, password)
				.then((result) => {
					return res.json({
						message: result.message
					})
				})
				.catch(err => {
					debug(err);
					return res.status(403).json({
					  message: err.message
					});
				});
		}
	);


	router.get('/' + adminRoot + '/update-account',
		(req, res) => {
					
			if (!isAdminUnrestricted && !req.user) {
				return res.redirect('/signin');
			}

			res.render('admin/update-account', {
				title: 'Update account information',
				adminRoot: adminRoot
			})
		}
	);

	api.get('/' + adminRoot + '/get-user',
		ifNoAdminUser401,
		(req, res) => {
			const { query: { email } } = req;
			
			if (!email) {
				return res.status(400).json({
					message: 'Email is required'
				});
			}

			return User.findOne({ where: { email } })
				.then(user => {
					if (!user) {
						return res.status(404).json({
							message: `No user found with email: ${email}`
						});
					}

					return res.json({
						email: user.email,
						username: user.username,
						name: user.name,
						location: user.location,
						isRespWebDesignCert: !!user.isRespWebDesignCert,
						isJsAlgoDataStructCert: !!user.isJsAlgoDataStructCert,
						isFrontEndCert: !!user.isFrontEndCert,
						isFrontEndLibsCert: !!user.isFrontEndLibsCert,
						isDataVisCert: !!user.isDataVisCert,
						isApisMicroservicesCert: !!user.isApisMicroservicesCert,
						isInfosecQaCert: !!user.isInfosecQaCert,
						isBackEndCert: !!user.isBackEndCert,
						isFullStackCert: !!user.isFullStackCert
					});
				})
				.catch(err => {
					debug(err);
					return res.status(500).json({
						message: 'Error retrieving user information'
					});
				});
		}
	);

	api.post('/' + adminRoot + '/update-account',
		ifNoAdminUser401,
		(req, res) => {

			const { body: {email, newEmail, username, name, location, password, confirmPassword, certifications } } = req;
		
			if (password && password !== confirmPassword) {
			  return res.status(403).json({
				message: `Passwords do not match.`
			  });
			}

			// Extract certification values from the certifications object
			const certs = certifications || {};

			return User.changeAccount(
				email, 
				newEmail, 
				username, 
				name, 
				location, 
				password, 
				certs.isRespWebDesignCert,
				certs.isJsAlgoDataStructCert,
				certs.isFrontEndCert,
				certs.isFrontEndLibsCert,
				certs.isDataVisCert,
				certs.isApisMicroservicesCert,
				certs.isInfosecQaCert,
				certs.isBackEndCert,
				certs.isFullStackCert
			)
				.then(() => {
					return res.json({						
						message: `Account updated for: '${email}'`
					})
				})
				.catch(err => {
					debug(err);
					return res.status(403).json({
					  message: err.message
					});
				});

		}
	);


	app.use(router);
	app.use(api);
};