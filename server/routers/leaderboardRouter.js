var express = require('express');

var leaderboardRouter = express.Router();
var leaderboardFacade = require('../facade/leaderboardFacade')();

var logger = require('../logging/logger');

leaderboardRouter.route('/')
    .get(function (req, res) {
        leaderboardFacade.getLeaderboard()
            .then(function (leaderboardData) {
                res.json(leaderboardData);
            })
            .catch(function (error) {
                res.status(500).send({error: error});
            });
    });

module.exports = leaderboardRouter;