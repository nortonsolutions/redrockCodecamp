
# Virtual Life Plan Builder

* Languages: Javascript ES5
* Tools: VS Code, Live Server extension, Git
* Libraries: animate-world.js

### Feature Specification

* Create a world plan builder
* The builder will create a string in the same format as world.toString()
* The world will be initialized with the world plan

### Code Design

* Create a world builder object in an world-builder.js script
* Add a worldBuilder.buildWorldPlan() method that returns world plan string
* Create a world object with the following methods
	* toString() - Will output a string that displays the current state of the world
			######
			# p# #
			# # a#
			# pa #
			# #p #
			######
		* The string must have a new line "\n" at the end of each row.
		* A string example of the above world
				"######\n# p# #\n# # a#\n# pa #\n# #p #######"
	* turn() - Will advance the world by one turn
* During a turn
	* Each plant and animal should get a random chance to live or die
	* Each plant and animal, if it lives, should get a random chance to reproduce
		* If it reproduces it should be to an immediately nearby cell
	* Each animal, if it lives, should get a random chance to move
		* If it moves it should be to an immediately nearby cell
* Use the animate-world.js library to animate your world object
* The animate-world.js library creates a single global function name animateWorld() that takes a world object
* Create an index.html page to link in animate-world.js library
* Create a link to your world.js script
* Create a script element in the index.html and call animateWorld()
		<body>
			<script src="http://brickhousecodecamp.org/educationMaterials/workbenchProjects/phase-i/virtual-life-01-app/animate-world.js"></script>
			<script src="world.js"></script>
			<script>
				animateWorld(world)
			</script>
		</body>

### References

* How to define an object
		var world = {};

* How to define a function for an object
		world.turn = function() {
			console.log("Taking a turn");
		}