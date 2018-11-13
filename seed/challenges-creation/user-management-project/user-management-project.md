

# User Management Page

* HTML, CSS, Javascript ES5
* Bootstrap, Font Awesome
* DOM Elements, Events
* These features of ES6 should be used: Modules
* These features of ES6 may be used: for of, and Template Literals
* JSON
* Web Storage API (http://codecamp.edu/docs/phase-i/JavaScript/developer.mozilla.org/en-US/docs/Web/API/Storage.html)

* 1 Page with half for User Details and half for Users Master (all users)
* Use bootstrap for look and feel, forms, grids, buttons and layout (see the docs)
* Make a nice looking page with minimal use of custom CSS
* Do not use the <form> element, and do not do any data validation
* User has the following properties
	* unique id (generated read only number, guarantee uniqueness) [span]
	* name [text input]
	* email [email input]
	* gender (male or female) [radio buttons]
	* age (number) [number input]
	* role (administrator, contributor, user) [dropdown list (html select element with options)]
	* verified (checked is verified, unchecked is not verified) [checkbox]
	* created date (generated read only) (format as: month as name of month, day as number, year as number) [span]
	* updated date (generated read only) (format as: month as name of month, day as number, year as number) [span]
* User Details view should use left side labels and right side form elements and have the following buttons at the bottom
	* new (clear the form)
	* save
	* cancel (cancel the edit and reload the same user or clear the form if the user was new)
* Each row of Users Master should display the following user properties
	* unique id
	* name
	* email
	* gender (use font awesome icons)
	and have the following action links
	* edit (use font awesome icons)
	* delete (use font awesome icons)
* All users should be stored in local storage