'use strict';

hackathonApp.factory('SubmissionResultService', function () {
    var submissionResult = {};

    function set(data) {
        submissionResult = data;
    }
    function get() {
        return submissionResult;
    }

    return {
        set: set,
        get: get
    };
});