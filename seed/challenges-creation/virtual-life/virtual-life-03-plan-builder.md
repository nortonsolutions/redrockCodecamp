
# Virtual Life Plan Builder

* Languages: Javascript ES5
* Tools: VS Code, Live Server extension, Git
* Libraries: animate-world.js
* Patterns and Practices: [Separation of concerns](http://brickhousecodecamp.org/wikipedia/separation_of_concerns.html), [Factory method pattern](http://brickhousecodecamp.org/wikipedia/factory_method_pattern.html)

### Feature Specification

* Create a random world plan builder
* The builder will create a string in the same format as world.toString()
* The world will be initialized with the world plan

### Code Design

* Create a world builder object in an world-builder.js script file
* Add the following methods to the world object
	* buildWorldPlan() - Will build and return a random world plan string
		* Takes the number or rows and the number of columns
* Convert the world object into a prototyped object
	* The constructor of the world object takes a world plan string
* Create a link to your world-builder.js script file
* Initialize the world with a random world plan before calling animate world