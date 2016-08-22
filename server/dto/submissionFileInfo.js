'use strict';

class SubmissionFileInfo {
    constructor(validationResult, teamName, challengeId, submission) {
        this.validationResult = validationResult;
        this.teamName = teamName;
        this.challengeId = challengeId;
        this.submission = submission;
    }
}
module.exports = SubmissionFileInfo;