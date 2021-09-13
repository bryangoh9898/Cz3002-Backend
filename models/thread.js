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
    },
    Downvote: {
        type: Number,
    },
    Upvote: {
        type:Number
    }
}, {
    timestamps: true
});

const Votes = new Schema({
    IsUpvoted: {
        type: Boolean
    },
    IsDownVoted: {
        type: Boolean
    },
    userId: {
        type: String
    }
},{
    timestamps:true
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
    UsersWhoUpvoted: [String],
    ThreadUpVotes:{
        type: Number
    },
    ThreadDownVotes:{
        type: Number
    },
    UsersWhoDownVoted: [String],
    Answers: [Answer]
}, {
    timestamps: true
});





module.exports = mongoose.model('Thread', Thread);