
var webAppViewRenderer = require("../../webAppViewRenderer");

var usersController = {};

usersController.getUsers = function(req, res) {

	var model = {
		title: "User John Doe",
		users: [
			{
				"userId": 1,
				"name": "John Smith",
				"email": "johnsmith@yahoo.com",
				"gender": "male",
				"age": 36,
				"role": "administrator",
				"verified": true,
				"createdDate": "2018-08-10T13:50:30.633Z",
				"updatedDate": "2018-10-10T13:50:30.633Z"
			},
			{
				"userId": 2,
				"name": "Jane Doe",
				"email": "janedoe@outlook.com",
				"gender": "female",
				"age": 54,
				"role": "user",
				"verified": false,
				"createdDate": "2018-09-10T13:50:30.633Z",
				"updatedDate": "2018-09-10T13:50:30.633Z"
			},
			{
				"userId": 3,
				"name": "John Doe",
				"email": "johndoe@gmail.com",
				"gender": "male",
				"age": 23,
				"role": "contributor",
				"verified": true,
				"createdDate": "2018-07-10T13:50:30.633Z",
				"updatedDate": "2018-12-10T13:50:30.633Z"
			}
		]
	};

	webAppViewRenderer.render(res, "administration/users/users.master", model);
}

usersController.getUser = function(req, res) {

	var model = {
		"userId": 3,
		"name": "John Doe",
		"email": "johndoe@gmail.com",
		"gender": "male",
		"age": 23,
		"role": "contributor",
		"verified": true,
		"createdDate": "2018-07-10T13:50:30.633Z",
		"updatedDate": "2018-12-10T13:50:30.633Z"
	};

	webAppViewRenderer.render(res, "administration/users/users.details", model);
}


module.exports = usersController;