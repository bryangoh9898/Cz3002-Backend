const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SampleSchema = new Schema({
    Attribute1: {
        type: String
    },
    Attribute2:{
        type: Number,
        required: true
    }
},{
    timestamps: true
});



var Samples = mongoose.model('Sample' , SampleSchema);

module.exports = Samples;