var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');


const Notification = new Schema({
    threadID:{
        type: mongoose.Schema.Types.ObjectId,
    },
    Reply:{
        type: String,
    },
    UserWhoReplied: {
        type: String,
    },
    ThreadTitle: {
        type: String
    }
}, {
    timestamps: true
});

var User = new Schema({
    // username: {
    //     type: String,
    //     required: true,
    //     unique: true
    // },
    // password: {
    //     type: String,
    //     required: true
    // }
    ThreadIdsAnswered: [mongoose.Schema.Types.ObjectId],
    ThreadIdsPosted: [mongoose.Schema.Types.ObjectId],
    NotificationNumber: Number,
    Notifications: [Notification]
});






User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);