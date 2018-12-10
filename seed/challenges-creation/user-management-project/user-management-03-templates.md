
# User Management Templates

* Languages: HTML, CSS, Javascript ES5, JSON
* Languages Additional: ES6, only the following feature: Modules, for of, Template Literals
* Libraries: Bootstrap, Font Awesome, Handlebars
* API Features: DOM Elements, Events, Web Storage API, XMLHttpRequest
* Tools: VS Code, Live Server extension, Git
* Patterns and Practices: Master Details, MVC, Separation of Concerns

* Copy your User Management MVC project to a new git repository for the starting point

### Feature Specification

* Same features as User Management MVC project

### Code Design

* Handlebars templates should be used to generate the majority of HTML all other HTML should be in the index.html file
* Create a handlebars template in separate .hbs files for the users details view, users master view, and the message box view
    The views should have two files, a .js file for the javascript code and an .hbs file for the handlebars template
* Add placeholders in the index.html file for where the template generated html will be added using placeholderElement.innerHTML =
* Use the XMLHttpRequest object to get (asynchronously) the handlebars file .hbs from the webserver (VS Code Live Server)
* Compile the content of the handlebars files only one time (Handlebars.compile)
    and use the returned function repeatedly as the data for the view changes
* If your controller has been properly separated, there should be no or minimal changes (for initialization) to the controller
* If your model has been properly separated there should be no changes to the model
* Create handlebar helpers for setting the check boxes, radio buttons and any other help needed with data binding
* Use the HTMLFormElement.elements property for collecting all form data on user save (each form element must have a name= attribute)
* Apart from setting the template generated html, listening to events and getting the form element, there should not be any other use of the DOM

### References

* XMLHttpRequest (http://brickhousecodecamp.org/docs/phase-i/JavaScript/developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest.html)