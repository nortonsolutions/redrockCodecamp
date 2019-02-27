
var path = require("path");

var webAppDirectoryPathRoot = path.resolve("server/webApp/");

var webAppViewRenderer = function(req, res, next) {

	if (res.webAppView) {

		var view = res.webAppView;

		res.render(webAppDirectoryPathRoot + view.template, view.model);

	} else {

		next();
	}
}


module.exports = function() {
	return webAppViewRenderer;
};