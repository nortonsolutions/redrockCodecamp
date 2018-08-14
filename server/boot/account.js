
module.exports = function (app) {

	const router = app.loopback.Router();
	const api = app.loopback.Router();


	router.get('/update-password',
		(req, res) => res.render('account/update-password', {
			title: 'Change account password.'
		})
	);


	app.use('/:lang', router);
	app.use(api);
};