'use strict';

hackathonApp.controller('LoginController', ['$scope', '$q', '$location', '$window', 'authenticationSvc',
    function ($scope, $q, $location, $window, authenticationSvc) {

        $scope.createTeam = function () {

            authenticationSvc.createAccount($scope.userName, $scope.password, '[placeholder]')
                .then(function (result) {
                    $scope.login();
                })
                .then(function (result) { }, function (error) {
                    $window.alert('Invalid credentials');
                    console.log(error);
                });
        };

        $scope.login = function () {

            authenticationSvc.login($scope.userName, $scope.password)
                .then(function (result) {
                    $location.path('/signInConfirmation');

                }, function (error) {
                    $window.alert('Invalid credentials');
                    console.log(error);
                });
        };
    }]);