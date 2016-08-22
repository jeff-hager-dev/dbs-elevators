var mongoose = require('mongoose'),
    Challenge = mongoose.model('Challenge'),
    BlueBirdPromise = require('bluebird');

BlueBirdPromise.promisifyAll(mongoose);

var challengeRepository = function () {

    var getChallenge = function (id) {
        return new BlueBirdPromise(function (resolve, reject) {

            Challenge.findOne({ 'challengeId': id })
                .then(function (arrivals) {
                    resolve(arrivals);
                })
                .catch(function (error) {
                    reject(error);
                });
        });
    };

    var getAvailableChallenges = function () {
        return new BlueBirdPromise(function (resolve, reject) {

            Challenge.find({isActive:1},{challengeId:1, challengeDesc:1})
                .then(function (challenges) {
                    resolve(challenges);
                })
                .catch(function (error) {
                    reject(error);
                });
        });
    };

    return {
        getChallenge: getChallenge,
        getAvailableChallenges: getAvailableChallenges
    };
};

module.exports = challengeRepository;
