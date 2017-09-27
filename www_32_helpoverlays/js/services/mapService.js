angular.module('starter.services')
.service('mapService', function ($http, $ionicLoading, commonService) {
	return {

		getMapRecords : function (url, headers, cb) {
			$http.get(url, headers)
			.success(function (res, status) {
				cb(res);
			})
			.error(function () {
				cb("error");
				commonService.Loaderhide();

			});
		},
		restGetType : function (url, headres, cb) {
			$http.get(url, headres).then(function (response) {
				cb(true, response);
			},
				function (response) {
				cb(false, response);
			})
		}

	}

});