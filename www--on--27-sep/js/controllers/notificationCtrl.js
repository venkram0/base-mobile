angular.module('starter.controllers')
.controller('nofification', function ($scope, $rootScope,$ionicHistory,alertService,dashboardService, $state,strings,setGetObj,$timeout,$ionicTabsDelegate,config,commonService,$filter,$localstorage,reassign) {
	var username=$localstorage.getObject("username");
	$scope.status = commonService.checkConnection();
	securityHeaders.headers = commonService.securityHeaders();
	var filterBarInstance;
	$scope.getNotifications=function(){
	var items=[];
	if($scope.status){
	var url=config.url+"api/v1/formszDetails/getNotifications/"+username;
	console.log(url);
	dashboardService.notifyService(url, securityHeaders, function (response) {
		console.log(response);
		if(response.status==200){
		angular.forEach(response.data, function (dataObj, key) {
			items.push({
				_id:dataObj._id,
				adminName:dataObj.adminName,
				TaskId:dataObj.taskId,
				taskName:dataObj.taskName,
				recordId:dataObj.recordId,
				actionType:dataObj.actionType,
				displayValues:dataObj.displayValues,
				comments:dataObj.comments,
				FormId:dataObj.formId,
				status:dataObj.status,
				time:dataObj.createdTime
			});
		});
		}
		$scope.items=items;
		console.log($scope.items);
	
	});
}else{
		$scope.items=items;
}
},

$scope.navigateToRecord = function (item) {
	console.log(item);
	 setGetObj.setNotificationItem(item);
//	$localstorage.setObject("NotificationTaskId", item.taskId);
	$rootScope.notificationsAddress=true;
	if (item.status == false) {
		console.log("first loop");
		$rootScope.recordId = item.recordId;
		var url = config.url + 'api/v1/formszDetails/notificationChange/' + item._id;
		var data = {};
		data.status = true;
		reassign.updateAddress(url, data, securityHeaders, function (response) {
			console.log(response);
			if (response.status == 200) {
				console.log("no navigationnnnnn");
			//	$state.go("app.taskformhistory");
			$state.go("tabs.assignedtasks");	
			}
		});

	}else{
	console.log("second loop");
	$state.go("tabs.assignedtasks");	
	
	}
},

$scope.navigateToTask=function(item){
	console.log(item);
	$rootScope.notificationsJobsOn=true;
	$rootScope.taskId=item.TaskId;
	if(item.status==false){
	var url=config.url+'api/v1/formszDetails/notificationChange/'+item._id;
	var data={};
	data.status=true;
		reassign.updateJob(url,data, securityHeaders, function (response) {
			console.log(response);
			if(response.status==200)
				{
				$state.go("tabs.assignedtasks");	
				}
		});
	}else{
		$state.go("tabs.assignedtasks");	
	}
},

$scope.refreshNotification=function(){
	if (filterBarInstance) {
			filterBarInstance();
			filterBarInstance = null;
		}
		$scope.getNotifications();
		$timeout(function () {
			$scope.$broadcast('scroll.refreshComplete');
		}, 1000);
}
});
