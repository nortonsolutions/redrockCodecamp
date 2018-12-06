

# User Management MVC

* HTML, CSS, Javascript ES5
* Bootstrap
* DOM Elements, Events
* These features of ES6 should be used: Modules
* These features of ES6 may be used: for of, and Template Literals
* JSON
* Web Storage API (http://brickhousecodecamp.org/docs/phase-i/JavaScript/developer.mozilla.org/en-US/docs/Web/API/Storage.html)
* MVC Pattern
* Git

* http://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller
* http://en.wikipedia.org/wiki/Separation_of_concerns

* Store your project in Git
* Refactor your code using the MVC Pattern
* Hide read only fields when creating a new user
* Use a <form> element and a <button type=submit> to allow for HTML5 form validation (require all form elements).  Listen to the submit event and prevent the default.
* For keeping track of the current unique id when editing a user use a hidden input field.
* Use a single controller for the page with methods for
	* load
	* new
	* save
	* cancel
	* edit
	* delete
	* The controller should not know anything about the technology used in the view. i.e. DOM and DOM events
* The data object for the user data does not need to have identity (it does not have to be a prototyped object)
* Create a User's Store object that handles all storage responsibilities with the following methods
	* add(object)
	* get(id)
	* getAll() (returns an array of users)
	* update(object)
	* remove(id)
* Add a view object for the following UI areas
	* User Master
	* User Details
	* Messages ()
* The controller should communicate to the view what data it should display
* Add a message box at the top of the screen to communicate the success or failure of changes
	* Use bootstrap alerts for the message box, use success and danger.
	* Add a global error handler for the window error event.
* Your views, controller, and store object do not need to be prototyped objects because they can be singletons.