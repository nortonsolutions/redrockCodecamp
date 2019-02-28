
var path = require("path");
var webAppRootPath = path.resolve("server/webApp");
var directoryWalkerSync = require("../../common/core/fs/directoryWalkerSync");

function boot(app) {

	directoryWalkerSync.walkDirectory(webAppRootPath, null, null, function(filePathName, stats) {

		if (filePathName.endsWith(".routes.js")) {

			var routes = require(filePathName);

			if (routes && routes.initialize) {
				
  				var router = app.loopback.Router();

				routes.initialize(router);
				app.use(router);
			}
		}
	});
};

module.exports = boot;