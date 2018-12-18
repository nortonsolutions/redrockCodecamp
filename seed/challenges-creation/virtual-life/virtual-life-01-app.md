
# Virtual Life App

* Languages: Javascript ES5
* Tools: VS Code, Live Server extension, Git
* Libraries: animate-world.js

### Feature Specification

* Create a simple virtual life simulation with walls, plants and animals
* The world will be a simple 6 by 6 grid of cells with walls on all sides
	* The cells can be occupied by a wall, plant, animal or be empty
* Symbols will be used for each world occupant
	* wall - #
	* plant - p
	* animal - a
	* empty (space character)
* Walls will not move or be destroyed
* Plants will not move and will have a chance to reproduce or die
* Animals will have a chance to move, reproduce or die
	* If an animal moves to a cell with a plant, that plant will die
	* An animal cannot move to a cell occupied by a wall

### Code Design

* Create a world object in an world.js script
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