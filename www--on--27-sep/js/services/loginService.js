var app = angular.module('starter.services', [])
	app.service('loginService', function ($http, $ionicPopup, alertService, strings, commonService) {
		return {
			userData : function (url, data, callback) {
				$http.post(url, data)
				.success(function (res, status) {
					callback(res);
				})
				.error(function (err) {
					commonService.Loaderhide();
					callback(strings.noServer);
				});
			},
			forgotPassword : function (url, data, callback) {
				$http.post(url, data)
				.success(function (res, status) {
					callback(res);
				})
				.error(function (err) {
					commonService.Loaderhide();
					callback(strings.noNetwork);
				});
			}
		}
	});