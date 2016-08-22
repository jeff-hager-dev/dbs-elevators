var mongoose = require('mongoose');

var teamSchema = mongoose.Schema({
    teamName: String,
    teamPassword: String,
    teamMembers: String
});

var Team = module.exports = mongoose.model('Team', teamSchema);
