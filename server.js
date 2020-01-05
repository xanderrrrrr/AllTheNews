// requring our dependencies
var express = require("express");

// set up our port for host designation or 3000
var PORT = process.env.PORT || 3000;

// init express app
var app = express();

// set up express router
var router = express.Router();

// our public folder is the static direcory
app.use(express.static(__dirname + "/public"));

// have every request go through our router middleman
app.use(router);

// listen on the port
app.listen(PORT, function() {
    console.log("Listening on port:" + PORT);
});