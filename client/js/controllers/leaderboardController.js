'use strict';

hackathonApp.controller('LeaderboardController',
    function ($scope, $log, $interval, LeaderboardService) {

        var refresh;

        $scope.getLeaderboard = function () {
            LeaderboardService.getLeaderboard()
                .success(function (leaderboard) {
                    $log.debug('retrieved leaderboard');
                    $scope.leaderboard = leaderboard;
                })
                .error(function (data, status, headers, config) {
                    $log.warn('shit went wrong ' + status + data);
                });
        }

        $scope.getLeaderboard();

        $scope.refresh = $scope.intervalFunction = function () {
            if (angular.isDefined(refresh)) { return; }

            refresh = $interval(function () {
                $scope.getLeaderboard();
            }, 1000);
        };

        $scope.pauseRefresh = function () {
            if (angular.isDefined(refresh)) {
                $interval.cancel(refresh);
                refresh = undefined;
            }
        };

        $scope.$on('$destroy', function () {
            $log.debug('scope destroyed');
            $scope.pauseRefresh();
        });

        $scope.intervalFunction();
    });
