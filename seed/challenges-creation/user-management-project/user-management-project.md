

# User Management Page

* HTML, CSS, Javascript
* Bootstrap
* DOM Elements
* DOM Events
* ES6 Modules
* JSON
* Web Storage API (http://codecamp.edu/docs/Javascript/developer.mozilla.org/en-US/docs/Web/API/Storage.html)

* 1 Page with half for User Details and half for Users Master (all users)
* Use bootstrap for forms, grids, buttons and layout (see the docs)
* Do not use the <form> element
* User has the following properties
	* unique id (generated number)
	* name
	* email
	* gender (male or female) [radio buttons]
	* zipcode
	* role (administrator, contributor, user) [dropdown list (html select element)]
	* verified (yes, no) [checkbox]
	* creation date (generated)
	* updated date (generated)
* User Details view should use left side labels and right side form elements and have the following buttons at the bottom
	* new
	* save
	* cancel
* Each row of Users Master should display the following user properties
	* unique id
	* name
	* email
	* gender
	and have the following action links
	* edit
	* delete
* All users should be stored in local storage