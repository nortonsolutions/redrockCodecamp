
# User Management Templates

* HTML, CSS, Javascript
* Bootstrap
* DOM Elements, Events
* ES6 Modules, for of, Template Literals
* JSON
* Web Storage API (http://brickhousecodecamp.org/docs/phase-i/JavaScript/developer.mozilla.org/en-US/docs/Web/API/Storage.html)
* MVC Pattern
* Git
* Handlebars templates

* Create a handlebars template for the users details view, users master view, and the message box view.
  The views should have two files, a .js file for the javascript code and an .hbs file for the handlebars template.
* Add placeholders in the html file for where the template generated html will be added.
* Use the XMLHttpRequest object to get (asynchronously) the handlebars file from the webserver.
* Compile the content of the handlebars files only one time (Handlebars.compile) and use the returned function repeatedly as the data for the view changes.
* If your controller has been properly separated, there should be no or minimal changes (for initialization) to the controller.
* If your model has been properly separated there should be no changes to the model.
* Create handlebar helpers for handling the setting of check boxes, radio buttons and any other help needed with data binding.
* The data from the user save should be taken completely from the form data (HTMLFormElement.elements).
* Apart from setting the template generated html, listening to events and getting the form element, there should not be any other use of the DOM.