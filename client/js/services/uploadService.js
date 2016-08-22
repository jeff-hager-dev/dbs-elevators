'use strict';

hackathonApp.factory('UploadService', function ($http, $timeout) {
    return {
      getFormData: function () {
        return $http({ method: 'GET', url: '/api/upload' });
    }
  };
});