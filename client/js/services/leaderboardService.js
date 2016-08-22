'use strict';

hackathonApp.factory('LeaderboardService', function ($http, $timeout) {
  return {
    getLeaderboard: function () {
      return $http({ method: 'GET', url: '/api/leaderboard' });
    }
  };
});