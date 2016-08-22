var mongoose = require('mongoose');

var teamScoreSchema = mongoose.Schema({
    team: String,
    challengeId: String,
    timeSubmitted: Date,
    avgWaitTime: Number,
    numberOfStops: Number
});

var TeamScore = module.exports = mongoose.model('TeamScore', teamScoreSchema);
