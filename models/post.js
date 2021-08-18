var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Post = new Schema({
    dummyData: {
        type: String,
    }
});

module.exports = mongoose.model('Post', Post);