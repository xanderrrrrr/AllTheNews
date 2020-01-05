// scrape script
// =============

// Require axios and cheerio, making our scrapes possible
var request = require("request");
var cheerio = require("cheerio");

// This function will scrape the NYTimes website
var scrape = function(cb) {
  // Scrape the echojs website
  request("http://www.echojs.com/", function(err, res, body) {
    var $ = cheerio.load(body);
    // console.log("the body of echo is :" + body)
    // Make an empty array to save our article info
    var articles = [];

    // Now, find and loop through each element that has the "theme-summary" class
    // (i.e, the section holding the articles)
    $("h2").each(function(i, element) {
      // In each .theme-summary, we grab the child with the class story-heading

      // Then we grab the inner text of the this element and store it
      // to the head variable. This is the article headline
      var head = $(this)
        .children("a")
        .text()
        .trim();
        console.log("the head is: " + head)

      // Grab the URL of the article
      var url = $(this)
        .children("a")
        .attr("href");

      // Then we grab any children with the class of summary and then grab it's inner text
      // We store this to the sum variable. This is the article summary
      var sum = $(this)
        .children("a")
        .text()
        .trim();

      // So long as our headline and sum and url aren't empty or undefined, do the following
      if (head && sum && url) {
        // This section uses regular expressions and the trim function to tidy our headlines and summaries
        // We're removing extra lines, extra spacing, extra tabs, etc.. to increase to typographical cleanliness.
        // var headNeat = head.replace(/(\r\n|\n|\r|\t|\s+)/gm, " ").trim();
        // var sumNeat = sum.replace(/(\r\n|\n|\r|\t|\s+)/gm, " ").trim();

        // Initialize an object we will push to the articles array

        var dataToAdd = {
          headline: head,
          summary: sum,
          url: url
        };

        articles.push(dataToAdd);
        // console.log("the articles are: " + articles)
      }
    });
     cb(articles);
  });
};

// Export the function, so other files in our backend can use it
module.exports = scrape;