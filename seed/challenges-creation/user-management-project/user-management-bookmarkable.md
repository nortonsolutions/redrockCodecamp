# User Management Router

* Technology Stack: HTML, CSS, Javascript, DOM, Web API, Bootstrap, Handlebars, JSON
* Additional Technology Stack: ES6 only the following feature: Modules, for of, Template Literals
* Technology Features: DOM Elements, Events, Storage API, History
* Patterns: MVC, consider Event Listener

* Copy your User Management Templates project to a new git repository for the starting point

* Add a Router to your project with the following functions
	* Add(path, handler) - adds a path to the router list with a handler function that takes a request object
		* The request object should have a parameters property with any parameters provided by the path
		* All path parameters will be querystring parameters, i.e. /user.html?userId=4
	* navigateTo(path) - calls the handler method from the router list and passes the request object
		* This function will need to parse out the querystring parameters and build the request object
	* setRouteLinks - finds all the links (anchors) that need to be handled by the router and attaches a method to call navigateTo
		* The HTMLAnchorElement element has a pathname property with the path from the href attribute
* Browse History must be created between different route paths
	* Use the history.pushState() to add new history to the browser on navigateTo include a history State object
	* Use the history.replaceState() to update the history of the first page to set the history State object
	* Add an event listener to the window's popstate event and navigate to the path (event.state has the history State object)
	* Include enough information in the history State object to get a path for navigateTo
	* Do not create history when handling the popstate event
	* Forward and back history should work properly just like other websites
* Use root relative for all paths i.e. /user.html and href="/user.html"
* Set the path of the user management page to /user-management.html
	* Change the edit links to navigate to /user-mangement.html?userId=value
		* This will put the user-management page into edit mode for that user
	* Add a view link that will navigate to a new page to view the individual user at /user.html?userId=value
* Add a home page with a simple welcome message and a link to user management with a path of / and /index.html
	* Use the MVC pattern with a controller and view
* Add a user page to view the user information with no use of form or form controls (strictly view like a profile page)
	* Path the user view page to /user.html?userId=value
* Add a bootstrap navbar at the top of each page with a link to the home and user management page
	* Use a handlebars partial for the navbar
	* Use handlebars to set the bootstrap "active" class on the (li) of current page's link (user.html will not have a link)
* Create static html app start pages for each possible bookmarkable path
	* The html for the page should have only a head, body and links to Handlebars and your single application javascript file (app.js)
* Create an app controller and view to set the head and body html
	* Use an html file to store all the head html
	* Use DOM to create the necessary body changes for the by the app (placeholder div for html changes to the body)
* setRouteLinks will need to be called every time the html in the body changes
	* consider a base view object that has a standard render method that might raise a render event
	* consider adding the setRouteLinks as an event listener to this event
* Use router.add() in the controllers to add a handler function that will call one of the controller methods
	* i.e. router.add("/", function(request) { homeController.load(); })
* The views should use a DOM call to set the title of the page

### References

* Web Storage API (http://codecamp.edu/docs/phase-i/JavaScript/developer.mozilla.org/en-US/docs/Web/API/Storage.html)
* Web API History (http://codecamp.edu/docs/phase-i/JavaScript/developer.mozilla.org/en-US/docs/Web/API/History_API.html)

### Notes

* How to append a string of HTML to an element
	* Do not use the experimental element.insertAdjacentHTML()
	* Use an HTMLTemplateElement
	* (http://codecamp.edu/docs/phase-i/Javascript/developer.mozilla.org/en-US/docs/Web/API/HTMLTemplateElement.html)
			var template = document.createElement("template");
			template.innerHTML = html;
			element.appendChild(template.content);