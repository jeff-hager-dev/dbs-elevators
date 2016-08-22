'use strict';

hackathonApp.factory('authenticationSvc', ['$http', '$q', '$window', function ($http, $q, $window) {
    var userInfo;

    function createAccount(userName, password, teamMembers) {
        var deferred = $q.defer();

        $http.post('api/security/createAccount', { userName: userName, password: password, teamMembers: teamMembers })
            .then(function (team) {
                deferred.resolve(userInfo);
            }, function (error) {
                deferred.reject(error);
            });

        return deferred.promise;
    }

    function login(userName, password) {
        var deferred = $q.defer();

        $http.post('/api/security/login', { userName: userName, password: password })
            .then(function (result) {
                userInfo = {
                    accessToken: result.data.accesstoken,
                    userName: result.data.userName
                };
                $window.sessionStorage['userInfo'] = JSON.stringify(userInfo);
                deferred.resolve(userInfo);
            }, function (error) {
                deferred.reject(error);
            });

        return deferred.promise;
    }

    function logout() {
        var deferred = $q.defer();

        $http({
            method: 'POST',
            url: '/api/security/logout',
            headers: {
                'accesstoken': userInfo.accessToken
            }
        }).then(function (result) {
            userInfo = null;
            $window.sessionStorage['userInfo'] = null;
            deferred.resolve(result);
        }, function (error) {
            deferred.reject(error);
        });

        return deferred.promise;
    }

    function isLoggedIn() {
        if (userInfo) {
            return true;
        }
        else {
            return false;
        }
    }

    function getUserInfo() {
        return userInfo;
    }

    function init() {
        if ($window.sessionStorage['userInfo']) {
            userInfo = JSON.parse($window.sessionStorage['userInfo']);
        }
    }

    init();

    return {
        login: login,
        logout: logout,
        getUserInfo: getUserInfo,
        isLoggedIn: isLoggedIn,
        createAccount: createAccount
    };
}]);
