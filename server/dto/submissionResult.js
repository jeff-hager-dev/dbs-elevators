'use strict';

class SubmissionResult {
    constructor(validations, teamScore, teamScoreDetails) {
        this.validations = validations;
        this.teamScore = teamScore;
        this.teamScoreDetails = teamScoreDetails;
    }
}
module.exports = SubmissionResult;