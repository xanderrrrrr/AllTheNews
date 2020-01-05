module.exports = function(router) {
    // this routes to the homepage
    router.get("/", function(req, res) {
        res.render("home");
    });
    // this routes to saved handlebars page
    router.get("/saved", function(req, res) {
        res.render("saved");
    }) ;
}