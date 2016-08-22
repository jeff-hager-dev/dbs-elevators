'use strict';

hackathonApp.controller('UploadController', ['$window', '$scope', '$location', 'Upload', 'UploadService', 'SubmissionResultService', 'authenticationSvc', '$log', '$timeout',
    function ($window,
                $scope,
                $location,
                Upload,
                UploadService,
                SubmissionResultService,
                authenticationSvc,
                $log,
                $timeout) {
        $scope.loading = false;
        $scope.uploadFiles = function (file, errFiles) {

            var login = authenticationSvc.getUserInfo();
            $scope.login = login.userName;
            $scope.loading = true;

            if (login.userName === undefined) {
                $window.alert('You must be logged in to submit.  You will be redirected to the login page.');
            }

            $scope.f = file;
            $scope.errFile = errFiles && errFiles[0];

            if (file) {
                file.upload = Upload.upload({ url: 'api/upload', data: { file: file, user: login.userName } })
                    .then(function (response) {
                        SubmissionResultService.set(response.data);

                        if (response.data.teamScore) {
                            $location.path('/scoring');
                        }
                        else {
                            $location.path('/validation');
                        }
                    })
                    .catch(function(error) {
                        alert('unhandled error: ' + error.statusText);
                    })
                    .finally(function () {
                        $scope.loading = false;
                    });
            }
        };
    }]);