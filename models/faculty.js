var mongoose = require('mongoose');
var Schema = mongoose.Schema;


const FacultySchema = new Schema({
    FacultyName:{
        type: String,
        required: true,
        unique: true
    },
    CourseCode: [String]
});

module.exports = mongoose.model('Faculty', FacultySchema);
