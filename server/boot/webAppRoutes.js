
var path = require("path");
var directoryWalkerSync = require("../../common/fs/directoryWalkerSync");
var webAppDirectoryPathRoot = path.resolve("server/webApp");

function boot(app) {

	directoryWalkerSync.walkDirectory(webAppDirectoryPathRoot, null, null, function(filePathName, stats) {

		if (filePathName.endsWith(".routes.js")) {

			var routes = require(filePathName);

			if (routes && routes.initialize) {
				
  				var router = app.loopback.Router();

				routes.initialize(app);
				app.use(router);
			}
		}
	});
};

module.exports = boot;