'use strict';

hackathonApp.controller('mainController', ['$window', '$scope', '$location', 'authenticationSvc',
    function ($window, $scope, $location, authenticationSvc) {

        refreshAuth();

        $scope.$watch(function () {
            return authenticationSvc.getUserInfo();
        }, function (value) {
            refreshAuth();
        });

        $scope.signInStatusClick = function () {
            if (authenticationSvc.isLoggedIn()) {
                if ($window.confirm('Are you sure you want to sign out?')) {
                    logout();
                    $scope.signInStatus = 'Sign In';
                    refreshAuth();
                }
            }
            else {
                $location.path('/signin');
            }
        };

        function refreshAuth() {
            if (authenticationSvc.isLoggedIn()) {
                $scope.signInStatus = authenticationSvc.getUserInfo().userName;
            }
            else {
                $scope.signInStatus = 'Sign In';
            }
        }

        function logout() {
            authenticationSvc.logout()
                .then(function (result) {
                    $location.path('/');
                }, function (error) {
                    console.log(error);
                });
        }
    }]);