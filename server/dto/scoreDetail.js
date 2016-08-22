'use strict';

class ScoreDetail {
    constructor(callId,
    elevatorId,
        waitTime,
        detail) {
        this.callId = callId;
        this.elevatorId = elevatorId;
        this.waitTime = waitTime;
        this.detail = detail;
    }
}

module.exports = ScoreDetail;