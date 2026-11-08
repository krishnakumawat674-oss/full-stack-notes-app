const mongoose = require('mongoose')

const noteSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true
    },
    content : {
        type : String,
        default : ""
    },
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    isPinned : {
        type : Boolean,
        default : false
    }
},{timestamps : true})


const Note = mongoose.model("Note", noteSchema);

module.exports = Note;