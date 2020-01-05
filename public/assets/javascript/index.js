$(document).ready(function() {
    // setting ref to article container div where dynamic content will go
    // adding event listneres to any dynamically generated "save article"
    // and "scrape new article" buttons
    var articleContainer = $(".article-container");
    $(document).on("click", ".btn-save", handleArticleSave);
    $(document).on("click", ".scrape-new", handleArticleScrape);

    // once page is ready, run init page function to kick things off
    initPage();

    function initPage() {
        // empty the article container, run ajax request for any unsaved headlines
        articleContainer.empty();
        $.get("/api/headlines?saved=false")
        .then(function(data) {
            console.log("test" + data)
            // if we have headlines, render themto page
            if (data && data.length) {
                renderArticles(data);
            }
            else {
                // otherwise render a message saying we have no articles
                renderEmpty();
            }
        });
    }

    function renderArticles(articles) {
        // this func handles appending html containing our article data to the page
        // we are passed an array (object?) of json containing all available articles in our db
        var articlePanels = [];
        // we pass each article json obj to the createPanel function which returns a bootstrap
        // panel with our article data inside
        for (var i = 0; i < articles.length; i++) {
            articlePanels.push(createPanel(articles[i]));
        }
        // once we have all of the html for articles stored in our articlePanels array,
        // append them to the articlePanels container
        articleContainer.append(articlePanels);
    }

    function createPanel(article) {
        // this func takes in a single json obj for an article/headline
        // it constructs a jquery element containing all of the formatted html for the
        // article panel
        var panel = 
        $(["<div class='panel panel-default'>",
        "<div class='panel-heading'>",
        "<h4>",
        article.headline,
        "<a class='btn btn-secondary btn-save'>",
        "Save Article",
        "</a>",
        "</h4>",
        "</div>",
        "<div class='panel-body'>",
        article.summary,
        "</div>",
        "</div>",
        ].join(""));
        // we attach the articles id to the jquery element
        // we will use this when trying to figure out which article the user wants to save
        panel.data("_id", article._id);
        // we return the constructed panel jquery element
        return panel;
    }

    function renderEmpty() {
        // this func renders some html to the page explainig we don't have any articles to view
        // using a joined array of html string data because it's easier to read/change than a 
        // concat'd string
        var emptyAlert = 
        $(["<div class='alert alert-warning text-center'>",
        "<h5>Uh oh, looks like we don't have any new articles.</h5>",
        "</div>",
        "<div class='panel panel-default'>",
        "<div class='panel-heading text-center'>",
        "<h4>What would you like to do?</h4>",
        "</div>",
        "<div class='panel-body text-center'>",
        "<h5><a class='scrape-new'>Try Scraping New Articles</a></h5>",
        "<h5><a href='/saved'>Go to Saved Articles</a></h5>",
        "</div>",
        "</div>"
    ].join(""));
    // appending this data to the page
    articleContainer.append(emptyAlert);
    }

    function handleArticleSave() {
        // this func is triggered when a user wants to save an article
        // when we renered the article initially, we attached a js obj containing the headlineid
        // to the element using the .data method. here we retrieve that
        var articleToSave = $(this).parents(".panel").data();
        articleToSave.saved = true;
        // using a patch method to be semantic since this is an update to an existing record in our collection
        $.ajax({
            method: "PATCH",
            url: "/api/headlines",
            data: articleToSave
        })
        .then(function(data) {
            // if successful, mongoose will send back an obj containing a key of ok with the value of 1
            // which casts to true
            if (data.ok) {
                // run the initPage func again. this will reload the entire list of articles
                initPage();
            }
        });
    }

    function handleArticleScrape() {
        // ths func handles the user clicking any "scrape new article" buttons
        $.get("/api/fetch")
        .then(function(data) {
            // if we are able to successfuly scrape the page, and compare articles to those 
            // already in our collection, re-render the articles on the page
            // and let the user know how many unique articles we were able to save
            initPage();
            // bootbox.alert("<h4 class='text-center m-top-80'>" + data.message + "<h4>")
        });
    }
});