'use strict';

hackathonApp.controller('ValidationController',
    function ($scope, $log, SubmissionResultService) {
        var submissionResults = SubmissionResultService.get();

        if (!submissionResults){
            alert('replace wtih redirect to error');
        }

        $scope.validations = submissionResults.validations;
    });
