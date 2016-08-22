'use strict';

hackathonApp.controller('SignInConfirmationController',
    function ($scope, authenticationSvc) {
        var login = authenticationSvc.getUserInfo();
        $scope.userName = login.userName;
    });