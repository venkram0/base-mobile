angular.module('starter.services')
.service('commonMethod', function ($http, alertService, commonService,formsSave, setGetObj, $rootScope, $cordovaSQLite,strings, $localstorage, $state) {
	return {
		saveFormService : function (isValid, type) {
		commonService.LoaderShow(strings.submitting);
		commonService.getLatLong(function (geoLocation) {
			if (geoLocation.netstatus == "success") {
			/*	$scope.lat = geoLocation.latlong[0];
				$scope.long = geoLocation.latlong[1];*/
			}
			if (geoLocation.netstatus == "error") {
				commonService.Loaderhide();
				alertService.showToast(geoLocation.message);
			}
	//		$scope.status = commonService.checkConnection();
		//		if (type == "submit") {
		//	console.log(isValid);
			//		if (isValid) {
						
				//		console.log(isValid);
						$scope.objectFormPreparationOffline(function(data,validation){
						if ($rootScope.prepopDataShow) {
							var rarId = $localstorage.getObject("reassignedRecordId");
							var url = config.url + "api/v1/formszDetails/" + rarId;
							data.IsReassign = false;
							console.log(data);
							formsSave.saveReassignedForm(url, data, securityHeaders, function (response) {
								if (response.status == 204) {
									commonService.Loaderhide();
									alertService.doAlert(response.message);
								} else {
									$rootScope.signatureimage = "";
									/*if ($rootScope.prepopDataShow) {
										if($rootScope.submittedFrom=="list"){
									    $rootScope.$emit("CallParentMethod", {});
										alertService.doAlert(strings.submitted);
										commonService.Loaderhide();
										}if($rootScope.submittedFrom=="map"){
										$ionicHistory.goBack();
										alertService.doAlert(strings.submitted);
                                        commonService.Loaderhide();										
										}

									 } else {
										alertService.doAlert(strings.submitted);
										$state.transitionTo("tabs.reasign");
									}*/
									

								}

							});
						} 
					});
			/*		} else {
						commonService.Loaderhide();
						alertService.doAlert(strings.fillMandetory);
					}*/
		});
	}
} //return close
});
		