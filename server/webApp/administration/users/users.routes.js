
var usersController = require("./users.controller");

function initialize(router) {

	router.get("/account/users", function(req, res, next) {

		usersController.getUsers(function(view) {

			res.webAppView = view;
			next();
		});
	});

	router.get("/account/users-home", function(req, res, next) {

		res.webAppView = usersController.getHome();
		next();
	});
}


module.exports.initialize = initialize;