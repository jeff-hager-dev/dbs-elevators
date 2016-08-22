'use strict';

var BluebirdPromise = require('bluebird');

var ArrivalSettings = require('../dto/arrivalSettings');
var PickDropValidation = require('../dto/pickDropValidation');
var ScoringService = require('../services/scoringService')(new ArrivalSettings(3, 8, 25, 2, 1, 5, 5));
var ScoreDetail = require('../dto/scoreDetail');

var validateArrivalsService = function (arrivalSettings) {
    arrivalSettings = arrivalSettings;

    function validateJsonFormat(submission, validations) {

        for (var stop of submission) {
            if (!stop.hasOwnProperty('stopId') ||
                !stop.hasOwnProperty('pickup') ||
                !stop.hasOwnProperty('dropoff') ||
                !stop.hasOwnProperty('floor') ||
                !stop.hasOwnProperty('elevatorId')) {
                validations.push('Format must be [ { "stopId": Number, "elevatorId": Number, "floor": Number, "pickup": [Number], "dropoff": [Number] },]');
                break;
            }
        }
    }

    function validateElevatorUse(elevatorStops, validations) {
        var elevators = [];

        for (var elevatorStop of elevatorStops) {
            if (elevatorStop.elevatorId > arrivalSettings.numberOfElevators) {
                validations.push('elevator '.concat(elevatorStop.elevatorId, ' does not exist on stop id ', elevatorStop.stopId));
            }
        }
    }

    function validationMaxCapicity(elevatorStops, validations) {
        var elevators = [];
        for (var elevatorStop of elevatorStops) {
            if (elevators[elevatorStop.elevatorId] === undefined) {
                elevators[elevatorStop.elevatorId] = elevatorStop.pickup.length;
            }
            else {
                elevators[elevatorStop.elevatorId] = elevators[elevatorStop.elevatorId] +
                    (elevatorStop.pickup ? elevatorStop.pickup.length : 0) -
                    (elevatorStop.dropoff ? elevatorStop.dropoff.length : 0);
            }

            if (elevators[elevatorStop.elevatorId] > arrivalSettings.maxElevatorCapacity) {
                validations.push('elevator '.concat(elevatorStop.elevatorId, ' exceeded max capacity on stop id ', elevatorStop.stopId));
            }
        }
    }

    function calculateWaitTimeForElevatorStops(elevatorStops) {
        var elevators = [];
        for (var elevatorIndex = 1; elevatorIndex < arrivalSettings.numberOfElevators + 1; elevatorIndex++) {
            var time = 0;

            var elevatorIndexedStops = elevatorStops.filter(function (val) {
                return val.elevatorId === elevatorIndex;
            });

            for (var elevatorIndexedStopId = 0; elevatorIndexedStopId < elevatorIndexedStops.length; elevatorIndexedStopId++) {
                var scoreDetail = new ScoreDetail(null, 0, null);
                time += time + ScoringService.calculateFloorMovement(scoreDetail, elevatorIndexedStops, elevatorIndexedStopId).waitTime;

                var elevatorIndexedStop = elevatorIndexedStops[elevatorIndexedStopId];

                if (elevatorIndexedStop.pickup && elevatorIndexedStop.pickup.length > 0) {
                    time += arrivalSettings.timeToOpenDoor;
                    elevatorIndexedStop.arrivalTime = time;
                    time += arrivalSettings.timeToCloseDoor;
                }
                else if (elevatorIndexedStop.dropoff && elevatorIndexedStop.dropoff.length > 0) {
                    time += arrivalSettings.timeToOpenDoor + arrivalSettings.timeToCloseDoor;
                }
            }
        }
    }

    function validatePickedUpBeforeDrop(arrival, pickDropValidation, validations) {
        if (pickDropValidation.pickUp !== undefined && pickDropValidation.dropOff !== undefined) {
            if (pickDropValidation.dropOff.stopId < pickDropValidation.pickUp.stopId) {
                validations.push('call id '.concat(arrival.callId, ' was dropped off on stop ', pickDropValidation.dropOff.stopId, ' before it was picked up on stop ', pickDropValidation.pickUp.stopId));
            }
        }
    }

    function validatePickupOnFloor(arrival, pickDropValidation, validations) {
        if (pickDropValidation.pickUp === undefined) {
            validations.push('passenger '.concat(arrival.callId, ' never picked up on floor ', arrival.startFloor));
        }
    }

    function validateDropOnFloor(arrival, pickDropValidation, validations) {
        if (pickDropValidation.dropOff === undefined) {
            validations.push('passenger '.concat(arrival.callId, ' never dropped off on floor ', arrival.endFloor));
        }
    }

    function processDrop(arrival, stop, validations, arrivalValidation) {
        if (stop.dropoff) {
            if (stop.dropoff.indexOf(arrival.callId) > -1) {
                if (arrivalValidation.dropOff) {
                    validations.push('callId '.concat(arrival.callId, ' dropped more than once on stop ', stop.stopId));
                }
                else {
                    arrivalValidation.dropOff = stop;

                    if (arrival.endFloor !== stop.floor) {
                        validations.push('callId '.concat(arrival.callId, ' dropped on the wrong floor on stop ', stop.stopId));
                    }
                }
            }
        }
    }

    function processPickup(arrival, stop, validations, arrivalValidation) {
        if (stop.pickup) {
            if (stop.pickup.indexOf(arrival.callId) > -1) {
                if (arrivalValidation.pickUp) {
                    validations.push('callId '.concat(arrival.callId, ' picked up more than once on stop ', stop.stopId));
                }
                else {
                    arrivalValidation.pickUp = stop;

                    if (arrival.startFloor !== stop.floor) {
                        validations.push('callId '.concat(arrival.callId, ' picked up on the wrong floor on stop ',
                                         stop.stopId, ' ', JSON.stringify(arrival), '-', JSON.stringify(stop)));
                    }
                }
            }
        }
    }

    function validatePickupAndDrops(arrivals, elevatorStops, validations) {
        for (var arrival of arrivals) {

            var pickDropValidation = new PickDropValidation(undefined, undefined);

            for (var stop of elevatorStops) {
                processDrop(arrival, stop, validations, pickDropValidation);
                processPickup(arrival, stop, validations, pickDropValidation);
            }

            validatePickupOnFloor(arrival, pickDropValidation, validations);
            validateDropOnFloor(arrival, pickDropValidation, validations);
            validatePickedUpBeforeDrop(arrival, pickDropValidation, validations);
        }
    }

    var validateArrivals = function (arrivals, elevatorStops) {

        return new BluebirdPromise(function (resolve, reject) {
            var validations = [];

            if (!arrivals) {
                validations.push('No arrivals submitted');
            }

            if (validations.length === 0) { validateJsonFormat(elevatorStops, validations); }

            if (validations.length === 0) {

            //  calculateWaitTimeForElevatorStops(elevatorStops);

                validatePickupAndDrops(arrivals, elevatorStops, validations);

                validationMaxCapicity(elevatorStops, validations);

                validateElevatorUse(elevatorStops, validations);
            }

            if (validations.length > 0) {
                resolve(validations);
            }
            else {
                resolve(null);
            }
        });
    };

    var validateUploadFile = function (callback) {
        callback(null, null);
    };

    return {
        validateArrivals: validateArrivals
    };
};

module.exports = validateArrivalsService;
