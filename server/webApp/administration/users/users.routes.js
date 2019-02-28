
var usersController = require("./users.controller");

function initialize(router) {

	router.get("/account/users", usersController.getUsers);
	router.get("/account/user", usersController.getUser);
}


module.exports.initialize = initialize;