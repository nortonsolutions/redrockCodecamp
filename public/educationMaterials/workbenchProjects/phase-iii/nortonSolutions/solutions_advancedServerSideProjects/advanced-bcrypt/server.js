'use strict';
const express     = require('express');
const bodyParser  = require('body-parser');
const fccTesting  = require('./freeCodeCamp/fcctesting.js');
// bcryptjs: pure-JS, API-compatible drop-in for the native `bcrypt` addon.
const bcrypt = require('bcryptjs');

const app         = express();




// Added to allow cross-origin request from workbench.redrockcodecamp.org
app.use((req,resp,next)=> {
    resp.setHeader("Access-Control-Allow-Origin", ["http://workbench.redrockcodecamp.org"]);
    next();
})

fccTesting(app); //For FCC testing purposes

const saltRounds = 12;
const myPlaintextPassword = 'sUperpassw0rd!';
const someOtherPlaintextPassword = 'pass123';


//START_ASYNC -do not remove notes, place code between correct pair of notes.



//END_ASYNC
bcrypt.hash(myPlaintextPassword, saltRounds, () => {}, (err, hash) => { 
    console.log(hash);/*Store hash in your db*/ 
});
//START_SYNC



//END_SYNC


app.listen(process.env.PORT || 3000, () => {});
