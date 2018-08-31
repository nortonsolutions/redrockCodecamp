
import { adminRoot } from '../utils/constantStrings.json';
import debug from 'debug';
import { ifNoUser401 } from '../utils/middleware';

const log = debug('fcc:boot:admin');

module.exports = function (app) {

	const router = app.loopback.Router();
	const api = app.loopback.Router();
	const User = app.models.User;


	router.get('/' + adminRoot + '/create-account',
			(req, res) => {
						
				if (!req.user) {      
					return res.redirect('/signin');
				}

				res.render('admin/create-account', {
					title: 'Create a new CodeCamp Workbench account'
				})
			}
	);

	api.post('/' + adminRoot + '/create-account',
		ifNoUser401,
		(req, res) => {

			const { body: {email, username, name, password, confirmPassword } } = req;
		
			if (password && password !== confirmPassword) {
			  return res.status(403).json({
				message: `Passwords do not match.`
			  });
			}


			return User.createAccount(email, username, name, password)
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
					
			if (!req.user) {      
				return res.redirect('/signin');
			}

			res.render('admin/update-account', {
				title: 'Update account information'
			})
		}
	);

	api.post('/' + adminRoot + '/update-account',
		ifNoUser401,
		(req, res) => {

			const { body: {email, newEmail, username, name, password, confirmPassword} } = req;
		
			if (password && password !== confirmPassword) {
			  return res.status(403).json({
				message: `Passwords do not match.`
			  });
			}

			return User.changeAccount(email, newEmail, username, name, password)
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