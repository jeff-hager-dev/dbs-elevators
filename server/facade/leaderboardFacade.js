var logger = require('../logging/logger');
var BluebirdPromise = require('bluebird');

var LeaderBoard = require('../dto/leaderboard');
var repositoryFactory = require('../repository/repositoryFactory');

var leaderboardFacade = function () {

    function getTeamIndex(teamName, leaderboardData) {
        for (var i = 0; i < leaderboardData.length; i++) {
            if (leaderboardData[i].team === teamName) {
                return i;
            }
        }

        return -1;
    }

    function addTeamRecord(score, leaderboardData) {
        var teamIndex = getTeamIndex(score.team, leaderboardData);
        if (teamIndex === -1) {

            leaderboardData.push(new LeaderBoard(-1,
                score.team,
                1000000000,
                1000000000,
                1000000000,
                0));

            teamIndex = getTeamIndex(score.team, leaderboardData);
        }

        return teamIndex;
    }

    function setBestScores(score, teamIndex, leaderboardData) {
        switch (parseInt(score.challengeId)) {
            case 1:
                if (score.avgWaitTime < leaderboardData[teamIndex].challengeOneAvg) {
                    leaderboardData[teamIndex].challengeOneAvg = score.avgWaitTime;
                }
                break;
            case 2:
                if (score.avgWaitTime < leaderboardData[teamIndex].challengeTwoAvg) {
                    leaderboardData[teamIndex].challengeTwoAvg = score.avgWaitTime;
                }
                break;
            case 3:
                if (score.avgWaitTime < leaderboardData[teamIndex].challengeThreeAvg) {
                    leaderboardData[teamIndex].challengeThreeAvg = score.avgWaitTime;
                }
                break;
            default:
                break;
        }
    }

    function averageScores(leaderboardData) {
        for (var leaderBoard of leaderboardData) {
            leaderBoard.totalAverage = ((leaderBoard.challengeOneAvg + leaderBoard.challengeTwoAvg + leaderBoard.challengeThreeAvg) / 3).toFixed(3);
        }
    }

    function setPlacing(leaderboardData) {
        var place = 1;

        leaderboardData.sort(function (a, b) {
            return a.totalAverage - b.totalAverage;
        });

        for (var leaderboard of leaderboardData) {
            leaderboard.place = place;
            place++;
        }
    }

    function processScores(scores) {

        var leaderboardData = [];

        for (var score of scores) {
            var teamIndex = addTeamRecord(score, leaderboardData);
            setBestScores(score, teamIndex, leaderboardData);
        }

        averageScores(leaderboardData);

        setPlacing(leaderboardData);

        return leaderboardData;
    }

    var getLeaderboard = function (req) {
        return new BluebirdPromise(function (resolve, reject) {

            try {
                repositoryFactory.teamScore.getScores()
                    .then(function (scores) {
                        logger.debug('started processing leaderbord data');
                        var leaderboard = processScores(scores);
                        logger.debug('ended processing leaderbord data');
                        resolve(leaderboard);
                    });
            }
            catch (error) {
                logger.error(error);
                reject(error);
            }
        });
    };

    return {
        getLeaderboard: getLeaderboard
    };
};

module.exports = leaderboardFacade;