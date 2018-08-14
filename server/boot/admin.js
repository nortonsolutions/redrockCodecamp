
import { adminRoot } from '../utils/constantStrings.json';
import debug from 'debug';

const log = debug('fcc:boot:admin');

module.exports = function (app) {

	const router = app.loopback.Router();
	const api = app.loopback.Router();
	const User = app.models.User;


	router.get('/' + adminRoot + '/create-account',
		(req, res) => res.render('admin/create-account', {
			title: 'Create a new CodeCamp Workbench account.'
		})
	);

	api.post('/' + adminRoot + '/create-account',
		(req, res) => {

			return User.requestNewAccount(req.body.email)
				.then(msg => {
					const email = req.body.email;
					req.flashMessage = `Account created: ${email}`;
					return getAdminCreateAccount(req, res);
				})
				.catch(err => {
					log(err);
					return res.status(200).send({ message: defaultErrorMsg });
				});
		}
	);


	router.get('/' + adminRoot + '/set-password',
		(req, res) => res.render('admin/set-password', {
			title: 'Set password for an account.'
		})
	);

	api.post('/' + adminRoot + '/set-password',
		(req, res) => {

			const { body: {email, password, confirmpassword } } = req;
		
			if (password !== confirmpassword) {
			  return res.status(403).json({
				message: `Passwords do not match.`
			  });
			}

			return User.changePassword(email, password)
				.then(() => {
					return res.json({
						message: `Password set for: ${email}`
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