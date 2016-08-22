var logger = require('../logging/logger');
var BluebirdPromise = require('bluebird');
var fs = require('fs');
var repositoryFactory = require('../repository/repositoryFactory');
var SubmissionFileInfo = require('../dto/submissionFileInfo');
var SubmissionResult = require('../dto/submissionResult');
var ArrivalSettings = require('../dto/arrivalSettings');

BluebirdPromise.promisifyAll(fs);

var uploadFacade = function () {
    var validateFileUpload = function (req) {
        return new BluebirdPromise(function (resolve, reject) {
            try {
                if (!req.files) {
                    reject('issue uploading file');
                }

                resolve(req.files);
            }
            catch (error) {
                logger.error(error);
                reject(error);
            }
        });
    };

    var parseSubmissionData = function (submissionData) {
        return new BluebirdPromise(function (resolve, reject) {
            try {
                var parsed = JSON.parse(submissionData);
                resolve(parsed);
            }
            catch (error) {
                logger.error(error);
                reject('Error parsing JSON (JSON.parse) after file was loaded succesfully: '.concat(error), null);
            }
        });
    };

    var handleUpload = function (req, res) {
        return new BluebirdPromise(function (resolve, reject) {
            try {
                validateFileUpload(req).bind({})                                               // validate file
                    .then(function (submission) {
                        this.teamName = req.body.user;
                        return fs.readFileAsync(submission.file.path, 'utf8');                 // read file using fs
                    })
                    .then(function (submissionData) {
                        return parseSubmissionData(submissionData);                            // parse it
                    })
                    .then(function (parsedSubmission) {
                        this.stops = parsedSubmission.stops;
                        this.challengeId = parsedSubmission.challengeId;

                        return repositoryFactory.challenge.getChallenge(this.challengeId);                       // get challenge submitted against
                    })
                    .then(function (challenge) {
                        this.arrivals = challenge.calls;

                        this.arrivalSettings = new ArrivalSettings(
                            challenge.numberOfElevators,
                            challenge.maxCapacity,
                            challenge.maxFloor - challenge.minFloor + 1,
                            challenge.secondsPerFloor,
                            challenge.secondsPerFloorOverTenFloors,
                            challenge.timeToOpenDoor,
                            challenge.timeToCloseDoor);

                        var validationService = require('../services/validateArrivalsService')(this.arrivalSettings);

                        return validationService.validateArrivals(this.arrivals, this.stops);   // validate it
                    })
                    .then(function (validationErrors) {
                        if (validationErrors) {
                            var result = new SubmissionResult(validationErrors, null, null);
                            resolve(result);                                                    // return validation detail
                        }
                        else {
                            var scoringService = require('../services/scoringService.js')(this.arrivalSettings);

                            return scoringService.scoreSubmission(this.stops,                   // score it
                                this.arrivals,
                                this.teamName,
                                this.challengeId);
                        }
                    })
                    .then(function (teamScore) {
                        if (teamScore != null){
                            var submissionResult = new SubmissionResult(null, teamScore, teamScore.scoringDetail);
                            resolve(submissionResult);                                              // return scoring detail    
                        }
                    })
                    .catch(function (error) {
                        logger.error(error);
                        reject(error);
                    });
            }
            catch (error) {
                logger.error(error);
                reject(error);
            }
        });
    };

    return {
        handleUpload: handleUpload,
        validateFileUpload: validateFileUpload
    };
};

module.exports = uploadFacade;