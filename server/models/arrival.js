var mongoose = require('mongoose');

var arrivalSchema = mongoose.Schema({
    callId: Number,
    callTime: Number,
    startFloor: Number,
    endFloor: Number
});

var Arrival = module.exports = mongoose.model('Arrival', arrivalSchema);