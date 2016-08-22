'use strict';

class Submission {
    constructor(stopId, elevatorId, floor, pickup, dropoff) {
        this.stopId = stopId;
        this.elevatorId = elevatorId;
        this.floor = floor;
        this.pickup = pickup;
        this.dropoff = dropoff;
    }
}

module.exports = Submission;