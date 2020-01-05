// global bootboxx
$(document).ready(function() {
    // getting ref to the article container div we will be rendering all articles inside of
    var articleContainer = $(".article-container");
    // adding event listeners for dynamically generated buttons for deleting articles,
    // pulling up article notes, saving artilc enotes, and deleting article notes
    $(document).on("click", ".btn-delete", handleArticleDelete);
    $(document).on("click", ".btn.notes", handleArticleNotes);
    $(document).on("click", ".btn-save", handleNoteSave);
    $(document).on("click", ".btn-note-delete", handleNoteDelete);

    // initPage kicks everything off when teh page is loaded
    initPage();

    function initPage() {
        // empty teh article container, run an ajax req for any saved headlines
        articleContainer.empty();
        $.get("/api/headlines?saved=true").then(function(data) {
            // if we have headlines, render them to the page
            if (data && data.length) {
                renderArticles(data);
            } else {
                // otherwise render a message saying we have no articles
                renderEmpty();
            }
        });
    }

    function renderArticles(articles) {
        // this func handles appending the html containing our article data to the page
        // we are passed an array of json containing all available articles in our db
        var articlePanels = [];
        // we pass each article json obj to the createpanel func which returns a boostrap
        // panel with our article data inside
        for (var i = 0; i < articles.length; i++) {
            articlePanels.push(createPanel(articles[i]));
        }
        // once we have all of the html for the articles stored in our articlePanels array,
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
        "<h3>",
        article.headline,
        "<a class='btn btn-danger delete'>",
        "Delete from Saved",
        "</a>",
        "< a class='btn btn-info notes'>Article Notes</a>",
        "</h3>",
        "</div>",
        "</div class='panel-body'>",
        article.summary,
        "</div>",
        "</div>"
        ].join(""));
        // we attach the articles id to the jquery element
        // we will use this when trying to figure out which article hte user wants to remove or open notes for
        panel.data("_id", article._id);
        // we return the constructed jquery element
        return panel;
    }

    function renderEmpty() {
        // this func renders some html to the page explaining we don't hve any articles to view
        // using a joined array of html string data becuase it's easier to read/change than a concat'd string
        var emptyAlert = 
        $(["<div class='alert alert-warning text-center'>",
        "<h4>Uh Oh. looks like we don't have any saved articles.</h4>",
        "</div>",
        "<div class='panel panel-default'>",
        "<div class='panel-heading text-center'>",
        "<h3>Would you like to browse available articles?</h3>",
        "</div>",
        "<div class='panel-body text-center'>",
        "<h4><a href='/'>Browse Articles</a></h4>",
        "</div>",
        "</div>"
        ].join(""));
        // appending this data to teh page
        articleContainer.append(emptyAlert);
    }

    function renderNotesList(data) {
        // this func handles rendering note list items to our notes modal
        // setting up an array of notes to render after finished
        // also setting up a currentNote variable to temporarily store each note
        var notesToRender = [];
        var currentNote;
        if (!data.notes.length) {
            // if we have no notes, just display a message explaining htis
            currentNote = [
                "<li class='list-group-item'>",
                "No notes for this article yet.",
                "</li>"
            ].join("");
            notesToRender.push(currentNote);
        }
        else {
            // if we do not have notes, go through each one
            for (var i = 0; i < data.notes.length; i++) {
                // constructs an li element to contain our noteText and a delete button
                currentNote = $([
                    "<li class='list-group-item note'>",
                    data.notes[i].noteText,
                    "<button class='btn btn-danger note-delete'>x</button>",
                    "</li>"
                ].join(""));
                // store the note id on the delete button or easy access when trying to delete
                currentNote.children("button").data("_id", data.notes[i]._id);
                // adding our currentNote to the notesToRender array
                notesToRender.push(currentNote);
            }
        }
        // now append the notesToRender to the note-container inside the modal
        $(".note-container").append(notesToRender);
    }

    function handleArticleDelete() {
        // this func handles deleting articles/headlines
        // we grab the id of the article to delete from teh panel ement the delete button sits inside
        var articleToDelete = $(this).parents(".panel").data();
        // using a delete method here just to be semantic since we are deleting an article/headline
        $.ajax({
            method: "DELETE",
            url: "/api/headlines/" + articleToDelete._id
        }).then(function(data) {
            // if this works out, run initPage again which will render our list of saved articles
            if (data.ok) {
                initPage();
            }
        });
    }

    function handleArticleNotes() {
        // this func handles appending the notes modal and displayingn our notes
        // we grab the id of the article to get the notes for from the panel elemetn the delete button sits inside
        var currentArticle = $(this).parents(".panel").data();
        // grab any notes with this headline/article id
        $.get("/api/notes/" + currentArticle._id).then(function(data) {
            // construcitng our inital html to add to the ntoes modal
            var modalText = [
                "<div class='container-fluid text-center>",
                "<h4>Notes For Article: ",
                currentArticle._id,
                "</h4>",
                "<hr />",
                "<ul class='list-group note-container'>",
                "</ul>",
                "<textarea placeholder='New Note' rows='4' cols='60'></textarea>",
                "<button class='btn btn-success save'>Save Note</button>",
                "</div>"
            ].join("");
            // adding the formatted html to the note modal
            bootbox.dialog({
                message: modalText,
                closeButton: true
            });
            var noteData = {
                _id: currentArticle._id,
                notes: data || []
            };
            // adding some info about the article and article notes to the save button for easy access
            // when trying ot add new note
            $(".btn-save").data("article", noteData);
            // renderNotesList will populate the actual html inside of the modal we just created/opened
            renderNotesList(noteData);
        });
    }

    function handleNoteSave() {
        // this func handles what happens when a user tries to asve a new note for an article
        // setting a variable to hold some formatted data bout our note,
        // grabbing the note typed into teh input box
        var noteData;
        var newNote = $(".bootbox-body textarea").val().trim();
        // if we actually have data typed into the note input field, format it
        // and post it to the "/api/notes" route and send the formatted noteData as well
        if (newNote) {
            noteData = {
                _id: $(this).data("article")._id,
                noteText: newNote
            };
            $.post("/api/notes", noteData).then(function() {
                // when complete, close the modal
                bootbox.hideAall();
            });
        }
    }

    function handleNoteDelete() {
        // this func handles the deletion of notes
        // first we gab the id of the note we want to delete
        // we stored this data on the delete button when we created it
        var noteToDelete = $(this).data("_id");
        // perform a DELETE request to "/api/notes" with teh id of the note we're deleting as a param
        $.ajax({
            url: "/api/notes" + noteToDelete,
            method: "DELETE"
        }).then(function() {
            // when done, hide the modal
            bootbox.hideAall();
        });
    }

})