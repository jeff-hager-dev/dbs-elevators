
var path = require('path');
var fs = require('fs');
var ArrivalSettings = require('../dto/arrivalSettings');
var scoringService = require('../services/scoringService.js')(new ArrivalSettings(3, 8, 25, 2, 1, 5, 5));
var jasmine = require('jasmine');
//var testFile = path.resolve(__dirname, 'testfiles/elevatorstops/twofloor.json');
//var submissionData = fs.readFileSync(testFile, 'utf8');

describe('score submissions tests', function () {

    var failTest = function (error) {
        expect(error).toBeUndefined();
    };

    it('simple pick and drop', function () {
        var arrival = { callId: 1, callTime: 2, startFloor: 1, endFloor: 20 };

        // 5 seconds to open on 1
        // 5 seconds to close on 1
        // 19 seconds to go to 20
        // 5 seconds to open

        var elevatorStops =
            [{ 'StopId': 0, 'ElevatorId': 1, 'Floor': 1, 'Pickup': [1], 'Dropoff': null },
                { 'StopId': 1, 'ElevatorId': 1, 'Floor': 20, 'Pickup': '', 'Dropoff': [1] }];

        var time = scoringService.calculateCallWaitTime(arrival, elevatorStops);
    });

    it('stop id out of order', function () {
        var arrival = { callId: 1, callTime: 2, startFloor: 1, endFloor: 20 };

        // 5 seconds to open on 1
        // 5 seconds to close on 1
        // 19 seconds to go to 20
        // 5 seconds to open

        var elevatorStops =
            [{ 'StopId': 1, 'ElevatorId': 1, 'Floor': 20, 'Pickup': '', 'Dropoff': [1] },
                { 'StopId': 0, 'ElevatorId': 1, 'Floor': 1, 'Pickup': [1], 'Dropoff': null }];

        var scoringDetail = scoringService.calculateCallWaitTime(arrival, elevatorStops);
        expect(scoringDetail.waitTime).toEqual(34);
    });

    it('multiple door opens', function () {
        var arrival = { callId: 1, callTime: 2, startFloor: 1, endFloor: 20 };

        // 5 seconds to open on floor 1
        // 5 seconds to close on floor 1
        // 5 seconds to open on floor 1
        // 5 seconds to close on floor 1
        // 19 seconds to travel to floor 20
        // 5 seconds to open on floor 20
        var elevatorStops =
            [{ 'StopId': 0, 'ElevatorId': 1, 'Floor': 1, 'Pickup': [1], 'Dropoff': null },
                { 'StopId': 1, 'ElevatorId': 1, 'Floor': 1, 'Pickup': [2], 'Dropoff': null },
                { 'StopId': 2, 'ElevatorId': 1, 'Floor': 20, 'Pickup': '', 'Dropoff': [1, 2] }];

        var scoringDetail = scoringService.calculateCallWaitTime(arrival, elevatorStops);
        expect(scoringDetail.waitTime).toEqual(44);
    });

    it('moving 20 floors should take 20 seconds', function () {

        var arrivals = [{ callId: 1, callTime: 2, startFloor: 1, endFloor: 20 }];

        var elevatorStops =
            [{ 'StopId': 0, 'ElevatorId': 1, 'Floor': 1, 'Pickup': [1], 'Dropoff': null },
                { 'StopId': 1, 'ElevatorId': 1, 'Floor': 20, 'Pickup': '', 'Dropoff': [1] }];

        var scoringDetail = scoringService.calculateCallWaitTime(arrivals[0],elevatorStops);

        // move 19 floors = 20 sec
        // open on floor 1 = 5 sec
        // close on floor 1 = 5 sec
        // open on floor 20 = 5 sec
        // close on floor 20 = 5 sec
        expect(scoringDetail.waitTime).toEqual(34);
    });

    it('moving 2 floors should take 2 seconds', function () {

        var arrivals = [{ callId: 1, callTime: 2, startFloor: 1, endFloor: 3 },
            { callId: 2, callTime: 2, startFloor: 1, endFloor: 5 },];
        var elevatorStops =
            [{ 'StopId': 0, 'ElevatorId': 1, 'Floor': 1, 'Pickup': [1, 2, 3, 4], 'Dropoff': null },
                { 'StopId': 1, 'ElevatorId': 1, 'Floor': 3, 'Pickup': '', 'Dropoff': [2] }];

        // move 2 floors = 4 sec
        // open on floor 1 = 5 sec
        // close on floor 1 = 5 sec
        // open on floor 3 = 5 sec
        // close on floor 3 = 5 sec
        var scoringDetail = scoringService.calculateCallWaitTime(arrivals[1], elevatorStops);
        expect(scoringDetail.waitTime).toEqual(19);
    });

    it('scoring must account for wait time', function () {
        var arrivals1 = { callId: 1, callTime: 2, startFloor: 1, endFloor: 3 };
        var arrivals2 = { callId: 2, callTime: 60, startFloor: 1, endFloor: 5 };
        var elevatorStops =
            [{ 'StopId': 0, 'ElevatorId': 1, 'Floor': 1, 'Pickup': [1], 'Dropoff': [] },
                { 'StopId': 1, 'ElevatorId': 1, 'Floor': 3, 'Pickup': [], 'Dropoff': [1] },
                { 'StopId': 2, 'ElevatorId': 1, 'Floor': 1, 'Pickup': [2], 'Dropoff': [0] },
                { 'StopId': 3, 'ElevatorId': 1, 'Floor': 5, 'Pickup': [0], 'Dropoff': [2] }];

        // in this case elevator 1 picks up call id 1 (5 seconds to open door, 5 seconds to close)
        //                         travels up to 3 (4 seconds)
        //                         drops at 3 (5 seconds open, 5 seconds close)  ...at this point callid one is done with 19 seconds ride time
        //                         travels back to 1 (4 seconds)
        //                         now 32 seconds have expired and we are back at 1.  Call time is 60, so we must wait 28 seconds
        //                         elevator picks up call id 2 (5 open, 5 close)
        //                         travels to 5 (8 seconds)
        //                         opens  (5 seconds)
        //                         total wait time = (callId 1 = 21 seconds) , callId 2 = 30 seconds

        var scoringDetail = scoringService.calculateCallWaitTime(arrivals1, elevatorStops);
        expect(scoringDetail.waitTime).toEqual(19);

        var scoringDetail2 = scoringService.calculateCallWaitTime(arrivals2, elevatorStops);
        expect(scoringDetail2.waitTime).toEqual(23);
    });

    it('multiple elevators', function () {
        var arrivals1 = { callId: 1, callTime: 2, startFloor: 1, endFloor: 3 };
        var arrivals2 = { callId: 2, callTime: 60, startFloor: 1, endFloor: 5 };
        var elevatorStops =
            [{ 'StopId': 2, 'ElevatorId': 2, 'Floor': 1, 'Pickup': [2], 'Dropoff': [0] },
                { 'StopId': 0, 'ElevatorId': 1, 'Floor': 1, 'Pickup': [1], 'Dropoff': [] },
                { 'StopId': 1, 'ElevatorId': 1, 'Floor': 3, 'Pickup': [], 'Dropoff': [1] },
                { 'StopId': 3, 'ElevatorId': 2, 'Floor': 5, 'Pickup': [0], 'Dropoff': [2] }];

        // same setup and times at test 'scoring must account for wait time', but two elevators

        var scoringDetail = scoringService.calculateCallWaitTime(arrivals1, elevatorStops);
        expect(scoringDetail.waitTime).toEqual(19);

        var scoringDetail2 = scoringService.calculateCallWaitTime(arrivals2, elevatorStops);
        expect(scoringDetail2.waitTime).toEqual(23);
    });



});
