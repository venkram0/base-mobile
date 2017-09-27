angular.module('starter.controllers')

.controller('LoginCtrl', function ($scope, $rootScope, $state, $timeout, ionicMaterialInk, $cordovaNetwork, loginService, config, $localstorage, alertService, commonService, $cordovaSQLite, $cordovaDevice, strings) {
	securityHeaders.headers = commonService.securityHeaders();

	var filterBarInstance;
	$rootScope.imgeasSet = {};
	$rootScope.sign = {};

	$scope.login = function (user) {
		$scope.status = commonService.checkConnection();
		commonService.LoaderShow(strings.pleasewait);
		if (user) {
			if (user.username != "" && user.password != "" && user.username != undefined && user.password != undefined) {
				if ($scope.status == true) {
					var url = config.url + "login";

					commonService.getLatLong(function (geoLocation) {
						if (geoLocation.netstatus == "success") {
							$scope.lat = geoLocation.latlong[0];
							$scope.long = geoLocation.latlong[1];
						}
						if (geoLocation.netstatus == "error") {
							alertService.showToast(geoLocation.message);
						}
						$scope.username = user.username;
						$scope.password = user.password;
						user.type = 2;
						user.lat = $scope.lat;
						user.long = $scope.long;
						user.uuid = $cordovaDevice.getUUID();
						console.log(user);
						loginService.userData(url, user, function (response) {
							console.log(response);
							if (response.status == 200) {
								$localstorage.setObject("token", response.token);
								$localstorage.setObject("userId", response.user._id);
								$localstorage.setObject("username", response.user.username);
						//		$localstorage.setObject("password", response.user.password);
								$localstorage.setObject("groupname", response.user.groupname);
								$scope.onOnline(user);
							} else if (response == strings.noServer) {
								commonService.Loaderhide();
								alertService.doAlert(strings.noServer);
							} else {
								alertService.doAlert(strings.invalidCredentials);
								commonService.Loaderhide();
							}
						});
					});
				} else {
					$scope.onOffline(user);
				}
			}
			else {
			commonService.Loaderhide();
			alertService.doAlert(strings.mandetory);
			}
		}
		else {
		commonService.Loaderhide();
		alertService.doAlert(strings.mandetory);
		}
	},

	$scope.onOnline = function (user) {
		$localstorage.setObject("loggedIn", true);
		var username = $localstorage.getObject("username");
	//	var password = $localstorage.getObject("password");
		$cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS loginInfo_table (Username text, Password text)");
		var query = "SELECT * FROM loginInfo_table WHERE Username=?";
		$cordovaSQLite.execute(db, query, [user.username]).then(function (res) {
			if (res.rows.length <= 0) {
				var query = "INSERT INTO loginInfo_table (Username, Password) VALUES (?,?)";
				$cordovaSQLite.execute(db, query, [user.username, ""]).then(function (res) {}, function (err) {
					alert(err);
				});
			}
		//	$state.transitionTo("tabs.assignedtasks");
			$state.transitionTo("tabs.dashboard");
		});
	},

	$scope.onOffline = function (user) {
		$localstorage.setObject("loggedIn", true);
		var query = "SELECT Username,Password FROM loginInfo_table WHERE Username=?";
		$cordovaSQLite.execute(db, query, [user.username]).then(function (res) {
			var len = res.rows.length;
			if (len <= 0) {
				alertService.doAlert(strings.loginrequired);
				commonService.Loaderhide();
			} else {
				for (var i = 0; i <= len; i++) {
					alertService.showToast(strings.offlinemode);
					$state.transitionTo("tabs.assignedtasks");
				}
			}
		}, function (err) {
			alertService.doAlert(strings.loginrequired);
			commonService.Loaderhide();
		});
	},

	$scope.forgotPassword = function () {
		$state.transitionTo("app.forgotpassword");
	};
	$scope.getPassword = function (user) {
		if (user != undefined) {
			var url = config.url + "forgotpwd";
			console.log(user);
			loginService.forgotPassword(url, user, function (response, status) {
			console.log(response);
				if (response.status == 200) {
					alertService.doAlert(response.message);
					user.username = '';
				} else {
					alertService.doAlert(strings.InvldUnEm);
					user.username = '';
				}
			});

		} else {
			alertService.doAlert(strings.fieldMandetory);
		}
	};
	$scope.backTologin = function () {
		$state.transitionTo("app.login");
	};

	$timeout(function () {
		$scope.$parent.hideHeader();
	}, 0);
	ionicMaterialInk.displayEffect();
});