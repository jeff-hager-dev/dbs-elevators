'use strict';

class ArrivalSettings {

    constructor(numberOfElevators,
                maxElevatorCapacity,
                numberOfFloors,
                secondsPerFloor,
                secondsPerFloorOverTenFloors,
                timeToOpenDoor,
                timeToCloseDoor) {
        this.numberOfElevators = numberOfElevators;
        this.maxElevatorCapacity = maxElevatorCapacity;
        this.numberOfFloors = numberOfFloors;
        this.secondsPerFloor = secondsPerFloor;
        this.secondsPerFloorOverTenFloors = secondsPerFloorOverTenFloors;
        this.timeToOpenDoor = timeToOpenDoor;
        this.timeToCloseDoor = timeToCloseDoor;
    }
}

module.exports = ArrivalSettings;