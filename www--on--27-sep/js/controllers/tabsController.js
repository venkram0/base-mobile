angular.module('starter.controllers')
.controller('tabsController', function ($scope, $rootScope,$cordovaNetwork, $timeout, commonService) {
	$scope.status = commonService.checkConnection();
	//    $scope.OnlineCheck=$cordovaNetwork.isOnline();   

	/*$rootScope.dashboardTab = true;
	$rootScope.taskTab = true;
	$rootScope.formsTab = true;
	$rootScope.reassignTab = true;
	$rootScope.settingsTab = true;*/
	/*$scope.onclick=function(){
		console.log("clicked");
		$rootScope.notificationsAddress=false
	}*/

});