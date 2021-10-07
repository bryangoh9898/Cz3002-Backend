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
    ThreadIdsAnswered: [mongoose.Schema.Types.ObjectId],
    ThreadIdsPosted: [mongoose.Schema.Types.ObjectId],
    
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);