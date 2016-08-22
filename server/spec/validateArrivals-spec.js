var ArrivalSettings = require('../dto/arrivalSettings');
var validationService = require('../services/validateArrivalsService.js')(new ArrivalSettings(3, 8, 25, 2, 1, 5, 5));

describe('validation service tests', function () {

    it('all passengers must be picked up', function (done) {
        var arrivals = [{ callId: 1, callTime: 2, startFloor: 1, endFloor: 3 }];
        var elevatorStops = [{ 'StopId': 0, 'ElevatorId': 1, 'Floor': 1, 'Pickup': [2, 3, 4], 'Dropoff': null },
            { 'StopId': 1, 'ElevatorId': 1, 'Floor': 3, 'Pickup': [2, 3, 4], 'Dropoff': [1] }];

        validationService.validateArrivals(arrivals, elevatorStops)
            .then(function (validations) {
                expect(validations).not.toBeNull();
                expect(validations.length).toEqual(1);
                expect(validations[0]).toEqual('passenger 1 never picked up on floor 1');
            })
            .catch(failTest)
            .finally(done);
    });

    it('arrivals must be provided', function (done) {
        var elevatorStops = [{ 'StopId': 1, 'ElevatorId': 1, 'Floor': 1, 'Pickup': [2, 3, 4], 'Dropoff': null }];
        validationService.validateArrivals(null, elevatorStops)
            .then(function (validations) {
                expect(validations[0]).toEqual('No arrivals submitted');
            })
            .catch(failTest)
            .finally(done);
    });

    it('all passengers must be dropped off', function (done) {
        var arrivals = [{ callId: 1, callTime: 2, startFloor: 1, endFloor: 3 }];
        var elevatorStops =
            [{ 'StopId': 0, 'ElevatorId': 1, 'Floor': 1, 'Pickup': [1, 3, 4], 'Dropoff': null },
                { 'StopId': 1, 'ElevatorId': 1, 'Floor': 2, 'Pickup': [], 'Dropoff': [3, 4] }];

        validationService.validateArrivals(arrivals, elevatorStops)
            .then(function (validations) {
                expect(validations).not.toBeNull();
                expect(validations.length).toEqual(1);
                expect(validations[0]).toEqual('passenger 1 never dropped off on floor 3');
            })
            .catch(failTest)
            .finally(done);
    });

    it('passengers cannot be picked up more than once', function (done) {
        var arrivals = [{ callId: 1, callTime: 2, startFloor: 1, endFloor: 3 }];
        var elevatorStops =
            [{ 'StopId': 0, 'ElevatorId': 1, 'Floor': 1, 'Pickup': [1, 2, 3, 4, 5], 'Dropoff': [1] },
                { 'StopId': 1, 'ElevatorId': 1, 'Floor': 2, 'Pickup': [1], 'Dropoff': null }];
        validationService.validateArrivals(arrivals, elevatorStops)
            .then(function (validations) {
                expect(validations).not.toBeNull();
                expect(validations.length).toEqual(1);
                expect(validations[0]).toEqual('callId 1 picked up more than once on stop 1');
            })
            .catch(failTest)
            .finally(done);
    });

    it('passengers cannot be dropped off more than once', function (done) {
        var arrivals = [{ callId: 1, callTime: 2, startFloor: 1, endFloor: 3 }];
        var elevatorStops =
            [{ 'StopId': 0, 'ElevatorId': 1, 'Floor': 1, 'Pickup': [1, 2, 3, 4, 5], 'Dropoff': [1] },
                { 'StopId': 1, 'ElevatorId': 1, 'Floor': 2, 'Pickup': null, 'Dropoff': [1] }];
        validationService.validateArrivals(arrivals, elevatorStops)
            .then(function (validations) {
                expect(validations).not.toBeNull();
                expect(validations.length).toEqual(1);
                expect(validations[0]).toEqual('callId 1 dropped more than once on stop 1');
            })
            .catch(failTest)
            .finally(done);
    });
/*
    it('elevator must have time to travel between stops', function (done) {
        var arrivals = [{ callId: 20, callTime: 500, startFloor: 10, endFloor: 20 }];
        var elevatorStops =
            [{ 'StopId': 0, 'ElevatorId': 1, 'Floor': 1, 'Pickup': [1], 'Dropoff': null },
             { 'StopId': 1, 'ElevatorId': 1, 'Floor': 3, 'Pickup': [], 'Dropoff': [1] },
             { 'StopId': 2, 'ElevatorId': 1, 'Floor': 10, 'Pickup': [20], 'Dropoff': [] },
             { 'StopId': 3, 'ElevatorId': 1, 'Floor': 20, 'Pickup': [], 'Dropoff': [20] }];

        validationService.validateArrivals(arrivals, elevatorStops)
            .then(function (validations) {
                expect(validations).not.toBeNull();
                expect(validations.length).toEqual(1);
                expect(validations[0]).toEqual('callId 2 is invalid because elevator could not have been on that floor yet');
            })
            .catch(failTest)
            .finally(done);
    });
*/
    it('dropoff or pickups can be null or empty array', function (done) {
        var arrivals = [{ callId: 1, callTime: 2, startFloor: 1, endFloor: 3 }];
        var elevatorStops =
            [{ 'StopId': 0, 'ElevatorId': 1, 'Floor': 1, 'Pickup': [1], 'Dropoff': null },
                { 'StopId': 1, 'ElevatorId': 1, 'Floor': 2, 'Pickup': [2, 3], 'Dropoff': [] },
                { 'StopId': 2, 'ElevatorId': 1, 'Floor': 3, 'Pickup': null, 'Dropoff': [1] },
                { 'StopId': 3, 'ElevatorId': 1, 'Floor': 3, 'Pickup': [], 'Dropoff': [2, 3] }];

        validationService.validateArrivals(arrivals, elevatorStops)
            .then(function (validations) {
                expect(validations).toBeNull();
            })
            .catch(failTest)
            .finally(done);
    });

    it('elevator cannot drop off before picking up', function (done) {
        var arrivals = [{ callId: 1, callTime: 2, startFloor: 1, endFloor: 3 },];
        var elevatorStops =
            [{ 'StopId': 0, 'ElevatorId': 1, 'Floor': 1, 'Pickup': [], 'Dropoff': [1] },
                { 'StopId': 1, 'ElevatorId': 1, 'Floor': 2, 'Pickup': [1], 'Dropoff': [] }];

        validationService.validateArrivals(arrivals, elevatorStops)
            .then(function (validations) {
                expect(validations).not.toBeNull();
                expect(validations.length).toEqual(1);
                expect(validations[0]).toEqual('call id 1 was dropped off on stop 0 before it was picked up on stop 1');
            })
            .catch(failTest)
            .finally(done);
    });

    it('elevator cannot exceed max capacity', function (done) {
        var arrivals = [{ callId: 1, callTime: 2, startFloor: 1, endFloor: 3 }];
        var elevatorStops = [{ 'StopId': 0, 'ElevatorId': 1, 'Floor': 1, 'Pickup': [1, 3, 4], 'Dropoff': null },
            { 'StopId': 1, 'ElevatorId': 2, 'Floor': 2, 'Pickup': [5], 'Dropoff': [] },
            { 'StopId': 2, 'ElevatorId': 2, 'Floor': 4, 'Pickup': [6], 'Dropoff': null },
            { 'StopId': 3, 'ElevatorId': 1, 'Floor': 2, 'Pickup': [7, 8, 9, 10, 11], 'Dropoff': [] },
            { 'StopId': 4, 'ElevatorId': 1, 'Floor': 5, 'Pickup': [12], 'Dropoff': [] },
            { 'StopId': 4, 'ElevatorId': 1, 'Floor': 5, 'Pickup': null, 'Dropoff': [1, 3, 4] }];
        validationService.validateArrivals(arrivals, elevatorStops)
            .then(function (validations) {
                expect(validations).not.toBeNull();
                expect(validations.length).toEqual(1);
                expect(validations[0]).toEqual('elevator 1 exceeded max capacity on stop id 4');
            })
            .catch(failTest)
            .finally(done);
    });

    it('bug fix integration test 1', function (done) {

        var arrivals = [{ '_id': { '$oid': '5719304901edc32c363ef191' }, 'callId': 1, 'callTime': 56, 'startFloor': 1, 'endFloor': 9, '__v': 0 }, { '_id': { '$oid': '5719304901edc32c363ef193' }, 'callId': 3, 'callTime': 137, 'startFloor': 1, 'endFloor': 6, '__v': 0 }, { '_id': { '$oid': '5719304901edc32c363ef194' }, 'callId': 4, 'callTime': 168, 'startFloor': 1, 'endFloor': 5, '__v': 0 }, { '_id': { '$oid': '5719304901edc32c363ef192' }, 'callId': 2, 'callTime': 61, 'startFloor': 1, 'endFloor': 7, '__v': 0 }, { '_id': { '$oid': '5719304901edc32c363ef195' }, 'callId': 5, 'callTime': 309, 'startFloor': 1, 'endFloor': 2, '__v': 0 }, { '_id': { '$oid': '5719304901edc32c363ef196' }, 'callId': 6, 'callTime': 309, 'startFloor': 1, 'endFloor': 4, '__v': 0 }, { '_id': { '$oid': '5719304901edc32c363ef197' }, 'callId': 7, 'callTime': 358, 'startFloor': 1, 'endFloor': 6, '__v': 0 }, { '_id': { '$oid': '5719304901edc32c363ef198' }, 'callId': 8, 'callTime': 375, 'startFloor': 1, 'endFloor': 2, '__v': 0 }, { '_id': { '$oid': '5719304901edc32c363ef199' }, 'callId': 9, 'callTime': 415, 'startFloor': 7, 'endFloor': 1, '__v': 0 }, { '_id': { '$oid': '5719304901edc32c363ef19a' }, 'callId': 10, 'callTime': 422, 'startFloor': 1, 'endFloor': 6, '__v': 0 }, { '_id': { '$oid': '5719304901edc32c363ef19b' }, 'callId': 11, 'callTime': 423, 'startFloor': 1, 'endFloor': 4, '__v': 0 }, { '_id': { '$oid': '5719304901edc32c363ef19c' }, 'callId': 12, 'callTime': 433, 'startFloor': 1, 'endFloor': 6, '__v': 0 }, { '_id': { '$oid': '5719304901edc32c363ef19d' }, 'callId': 13, 'callTime': 436, 'startFloor': 1, 'endFloor': 8, '__v': 0 }, { '_id': { '$oid': '5719304901edc32c363ef19e' }, 'callId': 14, 'callTime': 466, 'startFloor': 1, 'endFloor': 2, '__v': 0 }, { '_id': { '$oid': '5719304901edc32c363ef19f' }, 'callId': 15, 'callTime': 468, 'startFloor': 1, 'endFloor': 7, '__v': 0 }];

        var elevatorStops = [{ 'StopId': 0, 'ElevatorId': 1, 'Floor': 1, 'Pickup': [1, 2, 3, 4], 'Dropoff': null },
            { 'StopId': 1, 'ElevatorId': 1, 'Floor': 3, 'Pickup': '', 'Dropoff': [2] },
            { 'StopId': 2, 'ElevatorId': 1, 'Floor': 4, 'Pickup': '', 'Dropoff': [2, 3] },
            { 'StopId': 3, 'ElevatorId': 1, 'Floor': 4, 'Pickup': '', 'Dropoff': [4] }];

        validationService.validateArrivals(arrivals, elevatorStops)
            .then(function (validations) {
                expect(validations).not.toBeNull();
                expect(validations.length).toEqual(24);
            })
            .catch(failTest)
            .finally(done);
    });


    var failTest = function (error) {
        expect(error).toBeUndefined();
    };
});