
# Virtual Life Inheritance

* Languages: Javascript ES5
* Languages Additional: Javascript ES6 Modules
* Tools: VS Code, Live Server extension, Git
* Libraries: animate-world.js
* Patterns and Practices: [Separation of concerns](http://brickhousecodecamp.org/wikipedia/separation_of_concerns.html), [Factory method pattern](http://brickhousecodecamp.org/wikipedia/factory_method_pattern.html), [Inheritance](http://brickhousecodecamp.org/wikipedia/inheritance_oop.html)

### Feature Specification

* Same features as Virtual Life ES6 Modules project

### Code Design

* Use object inheritance with a object of world item and derived objects for plant and animal world items
* Create a world item prototyped object
	* This object should have an act method that is overridden in the derived objects
	* This object should contain any of the general data for all world item type objects i.e. location data
	* This object should have any general methods that might be used by derived objects
* Create a plant world item prototyped object that derives from world item
	* Override the act method
* Create an animal world item prototyped object that derives from world item
	* Override the act method
* Change the world item factory to build the correct type of world item object for plants and animals

### Notes

* How to derive from an object
	* Invoke the parent objects constructor in the constructor
			function DerivedObject(data) {
				ParentObject.call(data);
			}

	* Set the derived object's prototype to a copy of the parent's prototype
			DerivedObject.prototype = Object.create(ParentObject.prototype);

### References

* [Inheritance in JavaScript](http://brickhousecodecamp.org/docs/javascript/developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/Inheritance.html)