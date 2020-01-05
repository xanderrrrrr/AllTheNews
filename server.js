// requring our dependencies
var express = require("express");
var mongoose = require("mongoose");
var expressHandlebars = require("express-handlebars");
var bodyParser = require("body-parser");


// set up our port for host designation or 3000
var PORT = process.env.PORT || 3000;

// init express app
var app = express();

// set up express router
var router = express.Router();

// our public folder is the static direcory
app.use(express.static(__dirname + "/public"));

// connect handlebars to express app
app.engine("handlebars", expressHandlebars({
    defaultLayout: "main"
}));
app.set("view engine", "handlebars");

// using body parser (replace with axios?)
app.use(bodyParser.urlencoded({
    extended: false
}));

// have every request go through our router middleman
app.use(router);

// if deployed, use that db; otherwise use local mongoHeadlines db
var db = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// connect mongoose to our db
mongoose.connect(db, function(error) {
    if (error) {
        console.log(error);
    }
    else {
        console.log("mongoose connection is successsful");
    }
});

// listen on the port
app.listen(PORT, function() {
    console.log("Listening on port:" + PORT);
});