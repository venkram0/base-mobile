angular.module('starter.controllers')
.controller('dashboardCtrl', function ($scope, $rootScope, $timeout,commonService,$localstorage, config,dashboardService ) {
	var username = $localstorage.getObject("username");
	securityHeaders.headers = commonService.securityHeaders();
        $scope.status = commonService.checkConnection();
      $scope.demoCaption1 = "This is demoing the first classic transparency walk-through.\nit has a caption, " +
    "round marking of DOM element\n and 'single-tap' icon";
  $scope.demoCaption2 = "This is demoing the second classic transparency walk-through.\nit has a caption, " +
    "regular marking of DOM element,\n 'arrow' to DOM element as icon\n and a button to close the walkthrough";
  $scope.demoCaption4 = "This is demoing the tip walk-through.\nit has a caption in a text box, \n" +
    "an icon attached to the text box \n and a button to close the walkthrough";
  
  $scope.onClick = function(demoId){
    switch (demoId){
      case 1:
        $scope.demoActive1 = true;
        break;
      case 2:
        $scope.demoActive2 = true;
        break;
      case 3:
        $scope.demoActive3 = true;
        break;
      case 4:
        $scope.demoActive4 = true;
        break;
    }
  };  
  commonService.Loaderhide();
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