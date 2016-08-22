'use strict';

class Leaderboard {
    constructor(place,
                team,
                challengeOneAvg,
                challengeTwoAvg,
                challengeThreeAvg,
                totalAverage) {
        this.place = place;
        this.team = team;
        this.challengeOneAvg = challengeOneAvg;
        this.challengeTwoAvg = challengeTwoAvg;
        this.challengeThreeAvg = challengeThreeAvg;
        this.totalAverage = totalAverage;
    }
}

module.exports = Leaderboard;