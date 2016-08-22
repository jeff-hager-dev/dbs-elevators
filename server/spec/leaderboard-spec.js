
var leaderboardController = require('../facade/leaderboardFacade.js')();
var jasmine = require('jasmine');

describe('integration tests', function () {

    var failTest = function (error) {
        expect(error).toBeUndefined();
    };

    it('get leaderboard data', function (done) {
        leaderboardController.getLeaderboard()
            .then(function (data) {
                console.log(data);
            })
            .catch(failTest)
            .finally(done);
    });
});
