var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var headlineSchema = new Schema({
    headline: {
        type: String,
        required: true,
        unique: true
    },
    summary: {
        type: String,
        required: true
    },
    date: String,
    saved: {
        type: Boolean,
        default: false
    },
    // `note` is an obj that stores a note id
    // the ref property links the obj id to the note model
    // this allows us to populate the artilce with teh associated note
    // note: {
    //     type: Schema.Types.ObjectId,
    //     ref: "Note"
    // }
});

var Headline = mongoose.model("Headline", headlineSchema);

module.exports = Headline;