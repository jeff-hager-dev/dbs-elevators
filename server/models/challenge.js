var mongoose = require('mongoose');

var challengeSchema = mongoose.Schema({
    challengeId: Number,
    challengeDesc: String,
    minFloor: Number,
    maxFloor: Number,
    numberOfElevators: Number,
    maxCapacity: Number,
    secondsPerFloor: Number,
    secondsPerFloorOverTenFloors: Number,
    timeToOpenDoor: Number,
    timeToCloseDoor: Number,
    calls: []
});

var Challenge = module.exports = mongoose.model('Challenge', challengeSchema);
