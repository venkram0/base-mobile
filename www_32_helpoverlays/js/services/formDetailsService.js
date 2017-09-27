angular.module('starter.services')
.service('formsService', function ($http, $ionicLoading, commonService) {
	return {
		navigateToForms : function (url, headers, cb) {
			$http.get(url, headers)
			.success(function (res) {
				cb(true, res);
			})
			.error(function () {
				commonService.Loaderhide();

			});
		},
		getRecords : function (url, headers, cb) {
			$http.get(url, headers)
			.success(function (res, status) {
				cb(res);
			})
			.error(function () {
				cb("error");
				commonService.Loaderhide();

			});
		},
		deleteRecord : function (url, headers, cb) {
			$http.delete (url, headers)
			.success(function (res, status) {
				cb(res);
			})
			.error(function (res) {
				alert("failed" + JSON.stringify(res));
			});
		},
		assignedtask : function (url, headers, cb) {
			$http.get(url, headers)
			.success(function (res, status) {
				cb(res);
			})
			.error(function (err) {
				commonService.Loaderhide();

			});
		},
		reassignedForm : function (url, headers, cb) {
			$http.get(url, headers)
			.success(function (res, status) {
				cb(res);
			})
			.error(function () {
				cb("error");
				alert("service error");
				commonService.Loaderhide();

			});
		},
		getReassignedRecords : function (url, headers, cb) {
			$http.get(url, headers)
			.success(function (res, status) {
				cb(res);
			})
			.error(function () {
				cb("error");
				alert("service error");
				commonService.Loaderhide();

			});
		}

	}

});