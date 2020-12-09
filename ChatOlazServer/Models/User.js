const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    ten: {
        type: String,
        required: true
    },
    sdt: {
        type: String,
        required: true,
        unique: true 
    },
    email: {
        type: String,
        required: true,
        unique: true 
    },
    pass: {
        type: String,
        required: true,
        
    },  
    tinhtrang:{
        type:Number, 
        required: true
    },
    admin :{
        type:Number, 
        required: true
    }
});

module.exports = mongoose.model('User',userSchema);
