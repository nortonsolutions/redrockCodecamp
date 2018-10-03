

# User Management mvc

	* HTML, CSS, Javascript
	* Bootstrap
	* DOM Elements
	* DOM Events
	* ES6 Modules
	* JSON
	* Web Storage API (http://codecamp.edu/docs/Javascript/developer.mozilla.org/en-US/docs/Web/API/Storage.html)
	* MVC Pattern
	* Git

	* http://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller
	* http://en.wikipedia.org/wiki/Separation_of_concerns

	* Refactor your code using the MVC Pattern
	* Use a single controller for the page with methods for
		* load
		* new
		* save
		* cancel
		* edit
		* delete
		* The controller should not know anything about the view or its technology ie: DOM and DOM events
	* The data object for the user data does not need to have identity (it does not have to be a prototyped object)
	* Create a Store object that handles all storage responsibilities with the following methods
		* Add(object)
		* Update(object)
		* Remove(id)
	* Add a view object for the following UI areas
		* User Master
		* User Details
		* Messages
	* The controller should communicate to the view what data it should display
	* Add a message box at the top of the screen to communicate the success or failure of changes
		* Use bootstrap alerts for the message box
