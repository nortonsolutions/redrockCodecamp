
# Virtual Life ES6 Modules

* Languages: Javascript ES5
* Languages Additional: Javascript ES6 Modules
* Tools: VS Code, Live Server extension, Git
* Libraries: animate-world.js

### Feature Specification

* Same features as Virtual Life Plan Builder project

### Code Design

* Convert all js files to ES6 modules using import and export
* Create an app object in an app.js script file
* Add the following methods to the app object
	* load() - starting point for the application
		* Use the world plan, world and animateworld here to initialize and start the world
* Export the app, world plan builder, world item factory, world item, world and any other shared objects
* In the index.html file only link to the animate world file
* In the index.html use a script of type module to import the app object and call load()
		<body>
			<script src="http://brickhousecodecamp.org/educationMaterials/workbenchProjects/phase-i/virtual-life-01-app/animate-world.js"></script>
			<script type="module">

				import { app } from "./app.js";

				app.load();

			</script>
		</body>

### References

* How to use ES6 Modules for the browser
	* Set scripts in the html to type module
			<script type="module"></script>

	* Use the export key word to export any variables
			export { app }

	* Use the import key word to import any variables
		* The from must use a path to the js file that is relative to the module
		* Paths must use ./ or ../ at the beginning
		* Paths must use the .js file extension after the module name
				import { app } from "./app.js";