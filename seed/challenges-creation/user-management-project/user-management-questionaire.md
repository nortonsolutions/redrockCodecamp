
* Was there any window, document or dom code in the controller?
* Was there any window, document or dom code in the model other than local storage?
* In what component of mvc was the creation of the user id?
* In what component of mvc was the creation of the dates?
* Was the details view updated by the controller (for id or date changes) after a save?
* Was there a separate controller for the message box?
* Was the json for the date converted into a Date object?
* Was toLocaleDateString for formating the date string?
* Was there an application module (app.js) for application wide events like errors or load?
* How did the controller know the page was loaded?
* Were any common DOM functions created for making dom work easier?
* Was a hashtable used for the storage of the users?
* Was web local storage and the JSON parsing calls moved into their own module for reuse?
* Was functionality that can be reused in other projects moved into their own modules?
* How many total javascript files were created?
* Go through each bullet point of the two feature specifications and compare them to the application.
  Remember that the second specification overrides the first for some bullet points.
  What percentage of the specification was correctly implemented?