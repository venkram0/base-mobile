angular.module('starter.controllers')
.controller('settingsCtrl', function ($scope, $state, $timeout, commonService,$ionicHistory, $localstorage, formsSave, alertService, strings, config) {
	
	if (netCheck == true) {
		$scope.pswrdChange = true;
	} else {
		$scope.pswrdChange = false;
	}
	var netCheck = commonService.checkConnection();
	securityHeaders.headers = commonService.securityHeaders();
	$scope.aboutUs = function () {
		$state.transitionTo("app.aboutus");
	},

	$scope.changePassword = function (passwordData) {
		if (!netCheck) {
			alertService.doAlert(strings.noNetwork);
		} else {
			var userpassword = $localstorage.setObject("password");
			if (passwordData != undefined && passwordData.oldpassword && passwordData.oldpassword.length > 0 && passwordData.newpassword && passwordData.newpassword.length > 0 && passwordData.repwd && passwordData.repwd.length > 0) {
				if (passwordData.oldpassword === passwordData.newpassword) {
					alertService.doAlert("Old password and new password should not match");
				} else if (passwordData.newpassword === passwordData.repwd) {
					var url = config.url + "api/v1/users/pwdchange";
					passwordData.username = $localstorage.getObject("username"); ;
					console.log(passwordData);
					formsSave.changePassword(url, passwordData, securityHeaders, function (response) {
						console.log(response);
						if (response.status === 200) {
							alertService.doAlert(response.message);
							$state.transitionTo("app.login");
						} else {
							alertService.doAlert(response.message);
						}
					});
				} else {
					alertService.doAlert("Passwords didn't match");
				}
			} else {
				alertService.doAlert("All fields are mandatory");
			}
		}
	};
	$scope.changePwd = function () {
		$state.transitionTo("app.changePassword");
	},
	$scope.backToSettings = function () {
		$state.transitionTo("tabs.settings");
	},
	$scope.inputType = 'password';
	$scope.hideShowPassword = function () {
		if ($scope.inputType == 'password')
			$scope.inputType = 'text';
		else
			$scope.inputType = 'password';
	};
	$scope.logout = function () {
		$localstorage.setObject("loggedIn", false);
		$state.transitionTo("app.login");
		 $timeout(function () {
        $ionicHistory.clearCache();
 		$ionicHistory.clearHistory();
       }, 200) 
	};
	$scope.goToSite = function () {
		window.open('http://formsz.com', '_system', 'location=yes');
	};

});
