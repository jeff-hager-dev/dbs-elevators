'use strict';

var hackathonApp = angular.module('hackathonApp', ['ngResource', 'ngRoute', 'ngFileUpload'])
    .config(function ($routeProvider) {
        $routeProvider.when('/upload',
            {
                templateUrl: 'templates/upload.html',
                controller: 'UploadController',
                resolve: {
                    auth: ['$q', 'authenticationSvc', function ($q, authenticationSvc) {
                        var userInfo = authenticationSvc.getUserInfo();

                        if (userInfo) {
                            return $q.when(userInfo);
                        } else {
                            return $q.reject({ authenticated: false });
                        }
                    }]
                }
            })
        .when('/signin',
            {
                templateUrl: 'templates/signin.html',
                controller: 'LoginController'
            })
        .when('/signup',
            {
                templateUrl: 'templates/signup.html',
                controller: 'LoginController'
            })
        .when('/scoring',
            {
                templateUrl: 'templates/scoring.html',
                controller: 'ScoringController'
            })
        .when('/validation',
            {
                templateUrl: 'templates/validation.html',
                controller: 'ValidationController'
            })
        .when('/leaderboard',
            {
                templateUrl: 'templates/leaderboard.html',
                controller: 'LeaderboardController'
            })
        .when('/',
            {
                templateUrl: 'templates/home.html'
            })
        .when('/rules',
            {
                templateUrl: 'templates/rules.html'
            })
        .when('/data',
            {
                templateUrl: 'templates/data.html'
            })
        .when('/notauthenticated',
            {
                templateUrl: 'templates/notauthenticated.html'
            })
        .when('/signInConfirmation',
            {
                templateUrl: 'templates/signInConfirmation.html',
                controller: 'SignInConfirmationController'
            });
    });

hackathonApp.run(['$rootScope', '$location', function ($rootScope, $location) {

    $rootScope.$on('$routeChangeSuccess', function (userInfo) {
        console.log('blah blahblb');
        console.log(userInfo.userName);
    });

    $rootScope.$on('$routeChangeError', function (event, current, previous, eventObj) {
        if (eventObj.authenticated === false) {
            $location.path('/notauthenticated');
        }
    });
}]);