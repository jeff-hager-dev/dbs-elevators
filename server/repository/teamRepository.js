var mongoose = require('mongoose'),
    Team = mongoose.model('Team'),
    BlueBirdPromise = require('bluebird'),
    logger = require('../logging/logger');

BlueBirdPromise.promisifyAll(mongoose);

var teamRepository = function () {

    var getTeams = function () {
        return new BlueBirdPromise(function (resolve, reject) {

            Team.find()
                .then(function (teams) {
                    resolve(teams);
                })
                .catch(function (error) {
                    reject(error);
                });
        });
    };

    var getTeam = function (teamName, teamPassword) {
        return new BlueBirdPromise(function (resolve, reject) {

            Team.find({'teamName':teamName, 'teamPassword':teamPassword})
                .then(function (team) {
                    resolve(team);
                })
                .catch(function (error) {
                    reject(error);
                });
        });
    };

    var insertTeam = function (teamName, teamPassword, teamMembers) {
        return new BlueBirdPromise(function (resolve, reject) {
            try {
                var team = new Team();
                team.teamName = teamName;
                team.teamPassword = teamPassword;
                team.teamMembers = teamMembers;
                team.save(function () {
                    resolve(team);
                });
            }
            catch (error) {
                logger.error(error);
                reject(error);
            }
        });
    };

    return {
        getTeams: getTeams,
        insertTeam: insertTeam,
        getTeam: getTeam
    };
};

module.exports = teamRepository;
