angular.module('starter.controllers')
.controller('dashboardCtrl', function ($scope, $rootScope, $timeout,commonService,$localstorage, config,dashboardService ) {
	var username = $localstorage.getObject("username");
	securityHeaders.headers = commonService.securityHeaders();
        $scope.status = commonService.checkConnection();
	$scope.dashboardStatistics=function(){
			var url = config.url +"api/v1/formszDetails/DashboardStatistics/"+username;
			dashboardService.dashboardStatistics(url,securityHeaders, function (response) {
				console.log(response);
				var value=response.data;
				$scope.completed =value.taskComp;
				$scope.pending = value.taskPending;
				$scope.overAllTasks=value.taskPending+value.taskComp;
				$scope.cardedAddress = value.cardedAddress;
				$scope.noncardedAddress = value.noncardedAddress;
				$scope.cardingRange = value.cardedAddress + value.noncardedAddress;
				commonService.Loaderhide();
			});
		
	}
});