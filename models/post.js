var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Post = new Schema({
    dummyData: {
        type: String,
    }
});
//deleting branch test
module.exports = mongoose.model('Post', Post);