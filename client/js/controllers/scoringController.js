'use strict';

hackathonApp.controller('ScoringController',
    function ($scope, $log, SubmissionResultService) {
        var submissionResults = SubmissionResultService.get();

        if (!submissionResults) {
            alert('replace wtih redirect to error');
        }

        $scope.teamScore = submissionResults.teamScore;
        $scope.scoringDetails = submissionResults.teamScoreDetails;
    });
