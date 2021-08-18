var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Post = new Schema({
    dummyData: {
        type: String,
    }
});

//added some stuff

module.exports = mongoose.model('Post', Post);