angular.module('starter.services')
.service('reassign', function ($http,$ionicLoading,commonService) {
	return {
		AssignedTasksForms : function (url, cb) {
			$http.get(url)
			.success(function (res) {
				cb(res);
			})
			.error(function () {
				commonService.Loaderhide();

			});
		},
		navigateToReassignedForms : function (url, cb) {
			$http.get(url)
			.success(function (res) {
				cb(res);
			})
			.error(function () {
				commonService.Loaderhide();

			});
		},
		getTaskRecords : function (url,headers, cb) {
			$http.get(url,headers)
			.success(function (res) {
				cb(res);
			})
			.error(function () {
				commonService.Loaderhide();

			});
		},
		getPrepopulatedData: function (url,headers, cb) {
			$http.get(url,headers)
			.success(function (res) {
				cb(res);
			})
			.error(function () {
				commonService.Loaderhide();

			});
		},
		downloadTask: function (url,headers, cb) {
			$http.get(url,headers)
			.success(function (res) {
				cb(res);
			})
			.error(function () {
				commonService.Loaderhide();

			});
		},
		getReassignedRecordsData : function (url,headers, cb) {
			$http.get(url,headers)
			.success(function (res, status) {
				cb(res);
			})
			.error(function () {
				cb("error");
				alert("service error");
				commonService.Loaderhide();

			});
		},
			updateJob: function (url, data,headers, callback) {
				$http.put(url, data,headers)
				.success(function (res) {
					callback(res);
				})
				.error(function (err) {
					commonService.Loaderhide();
					// callback(strings.noServer);
        				alertService.doAlert(strings.noServer);
                });
			},
			updateAddress: function (url, data,headers, callback) {
				$http.put(url, data,headers)
				.success(function (res) {
					callback(res);
				})
				.error(function (err) {
					commonService.Loaderhide();
					// callback(strings.noServer);
        				alertService.doAlert(strings.noServer);
                });
			}

	}

});