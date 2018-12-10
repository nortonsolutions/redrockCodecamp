
# User Management Bookmarkable

* Languages: HTML, CSS, Javascript ES5, JSON
* Languages Additional: ES6, only the following feature: Modules, for of, Template Literals
* Libraries: Bootstrap, Font Awesome, Handlebars
* API Features: DOM Elements, Events, Web Storage API, XMLHttpRequest, History API, Location
* Tools: VS Code, Live Server extension, Git
* Patterns and Practices: Master Details, MVC, Separation of Concerns, consider Event Listener

* Copy your User Management Router project to a new git repository for the starting point

### Feature Specification

* Make the SPA bookmarkable by having page placeholders for all possible navigation paths
* Add a bootstrap navbar at the top of each page with a link to the home and user management page

### Code Design

* Create an index.html, user.html, and users-management.html html placeholder files
	* Use a valid html page with doctype, html, head, and body tags
	* Add a single script link to the app.js file
	* No other content should be in these pages
* In the app.js initialize base html content need for the SPA
	* Get the head content from an html file for easy editing
	* Add a script link to the handlebars.js file
		* This must be done by creating a script element, setting the src, and appending it to the DOM
		* An event listener must be added to the script element for the load event
		* Add the listener before appending it to the DOM and handle asynchronously the loading of this script before
			the use of any other handlebars dependent scripts
		* Add a placeholder for replacing view content
	* After the SPA is fully initialized, route the view to the window.location
* Use a handlebars partial for the navbar
* Use handlebars to set the bootstrap "active" class on the (li) of current page's link (user.html will not have a link)

### References

* Location (http://brickhousecodecamp.org/docs/phase-i/JavaScript/developer.mozilla.org/en-US/docs/Web/API/Location.html)

### Notes

* How to asynchronously load a JavaScript file after page load
		var script = document.createElement("script");
		script.src = "url to your script";
		script.addEventListener("load", function(){ // script is loaded });
		document.body.appendChild(script);

* How to append a string of HTML to an element
	* Do not use the experimental element.insertAdjacentHTML()
	* Use an HTMLTemplateElement (http://brickhousecodecamp.org/docs/phase-i/Javascript/developer.mozilla.org/en-US/docs/Web/API/HTMLTemplateElement.html)
			var template = document.createElement("template");
			template.innerHTML = html;
			element.appendChild(template.content);