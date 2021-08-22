var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

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
    ThreadIdsAnswered: [Number],
    ThreadIdsPosted: [Number],
    
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);