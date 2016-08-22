var logger = require('../logging/logger');
var repositoryDataAccess = require('../repository/repositoryFactory')();
var BluebirdPromise = require('bluebird');

var challengeFacade = function () {

    var getAvailableChallenges = function (req, res) {
        return new BluebirdPromise(function (resolve, reject) {
            try {
                var challenges = repositoryDataAccess.getRepository('challenge').getAvailableChallenges();
                resolve(challenges);
            }
            catch (error) {
                logger.error(error);
                reject(error);
            }
        });
    };

    return {
        getAvailableChallenges: getAvailableChallenges
    };
};

module.exports = challengeFacade;