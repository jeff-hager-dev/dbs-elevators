'use strict';

var BluebirdPromise = require('bluebird');
var logger = require('../logging/logger');
var repositoryFactory = require('../repository/repositoryFactory');
var ScoreDetail = require('../dto/scoreDetail');

var scoringService = function (arrivalSettings) {

    arrivalSettings = arrivalSettings;

    function calculateFloorMovement(scoreDetail, submission, floorIndex) {
        var secondsToAdd = 0;
        var startFloor;
        var endFloor;

        if (floorIndex === 0) {
            startFloor = 1;  // start of elevator movement at floor 1
            endFloor = submission[floorIndex].floor;
        }
        else {
            startFloor = submission[floorIndex - 1].floor;  // previous floor
            endFloor = submission[floorIndex].floor;
        }

        var distance = Math.abs(startFloor - endFloor);

        // It takes 2 seconds for the elevator to travel per floor, except if traveling more than 10
        // floors where speed is only 1 seconds per floor
        if (distance > 10) {
            secondsToAdd = distance * arrivalSettings.secondsPerFloorOverTenFloors;
            scoreDetail.waitTime += secondsToAdd;
            if (scoreDetail.detail) {
                scoreDetail.detail.push('Stop '.concat(submission[floorIndex].stopId,
                    ', Floor ',
                    startFloor,
                    ' to ',
                    endFloor,
                    ', ',
                    secondsToAdd,
                    ' seconds (',
                    arrivalSettings.secondsPerFloorOverTenFloors,
                    ' per floor)'));
            }
        }
        else {
            secondsToAdd = distance * arrivalSettings.secondsPerFloor;
            scoreDetail.waitTime += secondsToAdd;
            if (scoreDetail.detail) {
                scoreDetail.detail.push('Stop '.concat(submission[floorIndex].stopId,
                                        ', Floor ',
                                        startFloor,
                                        ' to ',
                                        endFloor,
                                        ', ',
                                        secondsToAdd,
                                        ' seconds (',
                                        arrivalSettings.secondsPerFloor,
                                        ' per floor)'));
            }
        }

        return scoreDetail;
    }

    function isInArray(array, value) {
        return array.indexOf(value) > -1;
    }

    function getPickupElevatorId(arrival, submittedStops) {
        for (var i = 0; i < submittedStops.length; i++) {
            if (submittedStops[i].pickup && submittedStops[i].pickup.length > 0 && isInArray(submittedStops[i].pickup, arrival.callId)) {
                return submittedStops[i].elevatorId;
            }
        }
    }

    function handleElevatorDoors(stop, scoreDetail, tripEnded) {
        scoreDetail.waitTime += arrivalSettings.timeToOpenDoor;
        scoreDetail.detail.push('Stop '.concat(stop.stopId, ', Floor ', stop.floor, ', ', arrivalSettings.timeToOpenDoor, ' seconds to open door'));
        if (!tripEnded) {
            // except for the destination, the door closes
            scoreDetail.waitTime += arrivalSettings.timeToCloseDoor;
            scoreDetail.detail.push('Stop '.concat(stop.stopId, ', Floor ', stop.floor, ', ', arrivalSettings.timeToCloseDoor, ' seconds to close door'));
        }
    }

    var calculateCallWaitTime = function (arrival, submittedStops) {

        var totalElevatorTimeBeforePickup = 0;

        submittedStops = submittedStops.sort(function (a, b) {
            return parseFloat(a.stopId) - parseFloat(b.stopId);
        });

        // now consider only the elevator that picks up this person
        var elevatorId = getPickupElevatorId(arrival, submittedStops);
        var submittedStopsForElevator = submittedStops.filter(function (stop) {
            return stop.elevatorId === elevatorId;
        });

        var scoreDetail = new ScoreDetail(arrival.callId, elevatorId, 0, null);
        scoreDetail.detail = [];

        var tripEnded = false;
        var tripStarted = false;
        for (var i = 0; i < submittedStopsForElevator.length; i++) {
            var currentStop = submittedStopsForElevator[i];

            if (!tripStarted) {
                var clone = JSON.parse(JSON.stringify(scoreDetail));
                totalElevatorTimeBeforePickup = totalElevatorTimeBeforePickup + calculateFloorMovement(clone, submittedStopsForElevator, i).waitTime;
            }

            var pickedUpCallIDs = currentStop.pickup && currentStop.pickup.length > 0;
            // see if trip started
            if (pickedUpCallIDs && isInArray(currentStop.pickup, arrival.callId)) {
                tripStarted = true;

                if (totalElevatorTimeBeforePickup > arrival.callTime) {
                    var waitTime = totalElevatorTimeBeforePickup - arrival.callTime;
                    scoreDetail.waitTime += waitTime;
                    scoreDetail.detail.push('Added wait time of ' + waitTime + ' for elevator to arrive');
                }
            }
            else {
                // calculate floor movement only if it is a subsequent stop from the first
                if (tripStarted) {
                    scoreDetail = calculateFloorMovement(scoreDetail, submittedStopsForElevator, i);
                }
            }

            var droppedOffCallIDs = currentStop.dropoff && currentStop.dropoff.length > 0;
            tripEnded = droppedOffCallIDs && isInArray(currentStop.dropoff, arrival.callId);
            // if there was a pickup or a drop the doors open
            if (tripStarted && (pickedUpCallIDs || droppedOffCallIDs)) {
                handleElevatorDoors(currentStop, scoreDetail, tripEnded);
            }

            if (tripEnded) {
                return scoreDetail;
            }
        }
    };

    var getScoringDetails = function (challengeArrivals, submittedStops) {
        return new BluebirdPromise(function (resolve, reject) {
            var scoringDetail = [];

            for (var arrival of challengeArrivals) {
                var detail = calculateCallWaitTime(arrival, submittedStops);
                console.log(detail);
                scoringDetail.push(detail);
            }

            resolve(scoringDetail);
        });
    };

    var scoreSubmission = function (submittedStops, challengeArrivals, teamName, challengeId) {
        return new BluebirdPromise(function (resolve, reject) {

            getScoringDetails(challengeArrivals, submittedStops).bind({})
                .then(function (scoringDetail) {
                    this.scoringDetail = scoringDetail;
                    this.totalSeconds = 0;

                    for (var detail of scoringDetail) {
                        this.totalSeconds += detail.waitTime;
                    }

                    this.avgWaitTime = (parseFloat(this.totalSeconds) / parseFloat(challengeArrivals.length)).toFixed(3);

                    return repositoryFactory.teamScore.insert(teamName,
                        submittedStops.length,
                        this.avgWaitTime,
                        challengeId);
                })
                .then(function (score) {
                    score.scoringDetail = this.scoringDetail;
                    resolve(score);
                })
                .catch(function (error) {
                    logger.error(error);
                    reject(error);
                });
        });
    };

    return {
        scoreSubmission: scoreSubmission,
        calculateCallWaitTime: calculateCallWaitTime,
        calculateFloorMovement: calculateFloorMovement
    };
};

module.exports = scoringService;
