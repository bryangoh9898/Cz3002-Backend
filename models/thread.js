var mongoose = require('mongoose');
var Schema = mongoose.Schema;


const Answer = new Schema({
    AnsweringUserId:{
        type: Number,
    },
    Answer: {
        type: String,
    },
    Ratings: {
        type: Number
    }
}, {
    timestamps: true
});


var Thread = new Schema({
    CourseNumber: {
        type: String,
    },
    ThreadNumber:{
        type: Number
    },
    Question:{
        type: String,
        required: true
    },
    OriginalUserId:{
        type: String,
        required: true
    },
    OriginalUserName:{
        type: String
    },
    Faculty:{
        type: String
    },
    ThreadUpVotes:{
        type: Number
    },
    ThreadDownVotes:{
        type: Number
    },
    Answers: [Answer]

}, {
    timestamps: true
});





module.exports = mongoose.model('Thread', Thread);