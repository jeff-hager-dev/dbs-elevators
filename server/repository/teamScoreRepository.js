var mongoose = require('mongoose'),
    TeamScore = mongoose.model('TeamScore'),
    BlueBirdPromise = require('bluebird'),
    logger = require('../logging/logger');

BlueBirdPromise.promisifyAll(mongoose);

var teamScoreRepository = function () {
    var getScores = function () {
        return new BlueBirdPromise(function (resolve, reject) {
            try {
                TeamScore.find()
                    .then(function (scores) {
                        resolve(scores);
                    })
                    .catch(function (error) {
                        logger.error(error);
                        reject(error);
                    });
            }
            catch (error) {
                logger.error(error);
                reject(error);
            }
        });
    };

    var insert = function (team, numberOfStops, averageWaitTime, challengeId) {
        return new BlueBirdPromise(function (resolve, reject) {
            try {
                var score = new TeamScore();

                score.team = team;
                score.challengeId = challengeId;
                score.avgWaitTime = averageWaitTime;
                score.timeSubmitted = new Date().toLocaleString();
                score.numberOfStops = numberOfStops;

                score.save(function () {
                    logger.info(team.concat(' scored avg wait of ', averageWaitTime));
                    resolve(score);
                });
            }
            catch (error) {
                logger.error(error);
                reject(error);
            }
        });
    };

    return {
        getScores: getScores,
        insert: insert
    };
};

module.exports = teamScoreRepository;