angular.module('starter.controllers')
.controller('taskHistoryCtrl', function ($scope,$ionicHistory, $rootScope, config, $state, setGetObj, $ionicPopup, $cordovaSQLite, $timeout, $ionicFilterBar, commonService, $localstorage, reassign, $ionicPopover, formsSave, alertService, strings,formsService,$ionicListDelegate) {
//	$scope.addrecordicon = true;
	securityHeaders.headers = commonService.securityHeaders();
	$scope.status = commonService.checkConnection();
 	var geocoder = new google.maps.Geocoder();
 	var user = $localstorage.getObject("username");
//	$rootScope.selectedFormRecordFields = {};
	var filterBarInstance;
	$scope.selection = [];
	$rootScope.submittedFrom="";
	if($scope.status){
		$scope.navigateOption=true;
		$scope.headerMapOption=true;
	}else{
		$scope.navigateOption=false;
		$scope.headerMapOption=false;
	}
   /* $scope.toggleSelection = function (recordId) {
		var idx = $scope.selection.indexOf(recordId);
		// is currently selected
		if (idx > -1) {
			$scope.selection.splice(idx, 1);
			if ($scope.selection.length == 0) {
				$scope.header_delete_hide = true;
				$scope.header_sync_hide = true;
			} else {
				$scope.header_delete_hide = false;
				$scope.header_sync_hide = false;
			}
		}
		// is newly selected
		else {
			$scope.selection.push(recordId);
			$scope.header_delete_hide = false;
			$scope.header_sync_hide = false;
		}
	};*/
	/*$ionicPopover.fromTemplateUrl('templates/taskformhistorypopover.html', {
		scope : $scope
	}).then(function (popover) {
		$scope.popover = popover;
	});
	$scope.openPopover = function () {
		$scope.popover.show();
	};
	$scope.closePopover = function () {
		$scope.popover.hide();
	}*/
	$scope.openMap = function () {
		commonService.LoaderShow(strings.pleasewait);
		$rootScope.NavigatedFrom = "tasks";
		$state.go("app.map");
		if ($scope.status == false) {
			alertService.showToast(strings.nonetworktoview);
		}
	},
	/*showing offline saved records list*/
	$scope.Tformhistory = function () {
		console.log("hi method");
		$scope.task_action_header = true;
//		$scope.addrecordicon = true;
		var userId = $localstorage.getObject("userId");
		var item = setGetObj.getTaskHisotryForm();
		console.log(item);
		var arr = [];
		$rootScope.formEllipse = false;
		$rootScope.TaskData = true;
		$cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS FormData_table(uniqueID integer primary key autoincrement,FormId integer,userId integer ,FormValues text,FormStatus text,TaskId text,recordId text,isRequired text)").then(function (res) {}, function (err) {});
		var query = 'SELECT * FROM FormData_table WHERE FormId=? and userId=? and TaskId=? and FormStatus="false";';
		$cordovaSQLite.execute(db, query, [item.FormId, userId, item.TaskId]).then(function (res) {
			var len = res.rows.length;
			console.log(len);
			for (var i = 0; i < len; i++) {
				var obj = {};
				obj.FormId = item.FormId;
				obj.userId = res.rows.item(i).userId;
				obj.recordId = res.rows.item(i).uniqueID;
				obj.FormValues = res.rows.item(i).FormValues;
				obj.TaskId = res.rows.item(i).TaskId;
				arr.push(obj);
			}
			$scope.offlineTaskformhistory = arr;
			/*if($scope.offlineTaskformhistory.length==0){
				$scope.saveHeader=false;
			}else{
				$scope.saveHeader=true
			}*/
			console.log($scope.offlineTaskformhistory);
		}, function (err) {
			alert(JSON.stringify(err));
		});

	},

	$scope.getTaskFormDetails = function () {
		$rootScope.barcodeShow=true;
        $rootScope.cameraShow=true;
		$rootScope.imgeasSet = {};
		$rootScope.sign = {};
		var item = setGetObj.getTaskHisotryForm();
		$rootScope.TaskData = true;
		$localstorage.setObject("TaskId", item.TaskId);
		$rootScope.formname = item.FormName;
//		$rootScope.saveButton = false;
//		$rootScope.submitButton = false;
		$rootScope.prepopDataShow = false;
		if ($scope.status == true) {
			$scope.taskId = item.TaskId;
			commonService.LoaderShow(strings.loading);
			$rootScope.condition = false;
			$rootScope.isView = true;
			$rootScope.isGridRecodsShow = false;
			$rootScope.skeletonId = item.FormId;
			$state.transitionTo("app.viewForm");
		} else {
			$scope.getTaskFormOfflineSkeleton(item);
		}

	},
	$scope.getTaskFormOfflineSkeleton = function (item) {
		$rootScope.imgeasSet = {};
		$rootScope.sign = {};
		$rootScope.isView = true;
		$rootScope.prepopDataShow = false;
		$rootScope.isGridRecodsShow = false;

		$scope.formId = $localstorage.setObject("offlineFormId", item.FormId);
		// $localstorage.setObject("hTaskId", "form");
		$cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS FormSkeleton_table(FormId integer,Username text,id integer, FormName text ,FormSkeleton text)').then(function (res) {}, function (err) {});
		var query = 'SELECT * FROM FormSkeleton_table WHERE FormId=? ';
		$cordovaSQLite.execute(db, query, [item.FormId]).then(function (res) {
			var len = res.rows.length;
			for (var i = 0; i < len; i++) {
				var formSkeleton = JSON.parse(res.rows.item(i).FormSkeleton);
				var formid = res.rows.item(i).FormId;
				var formname = res.rows.item(i).FormName;
				$localstorage.setObject("offlineData", formSkeleton);
				$state.transitionTo("app.viewForm");
			}
		}, function (err) {
			alert(JSON.stringify(err));
		});
	},
	$scope.editTaskForm = function (item) {
		$rootScope.prepopDataShow = false;
		$rootScope.isHistoryChecked = !"reassign";
		$rootScope.imgeasSet = {};
		$rootScope.sign = {};
		$rootScope.button = "save";
		$rootScope.TaskData = false;
		$rootScope.isView = false;
		$rootScope.offlineReData = false;
		$rootScope.formname = item.FormName;
		$rootScope.TaskData = true;
		$localstorage.setObject("hTaskId", item.TaskId);
		$localstorage.setObject("offlineTaskFormRecordId", item.recordId);
		$localstorage.setObject("offlineRecordId", item.recordId);
		if ($scope.status == true) {}
		else {
			$localstorage.setObject("formId", item.FormId);
		}
		$rootScope.condition = false;
		var RecordValues = JSON.parse(item.FormValues);
		var RecordData = RecordValues.record;
		$rootScope.selectedFormRecordFields = {};
		angular.forEach(RecordData, function (value, key) {
			$rootScope.selectedFormRecordFields = value;
		});
		$rootScope.isGridRecodsShow = true;
		if ($scope.status == true) {
			$rootScope.skeletonId = item.FormId;
			$state.transitionTo("app.viewForm");
		} else {
			var query = 'SELECT * FROM FormSkeleton_table WHERE FormId=?';
			$cordovaSQLite.execute(db, query, [item.FormId]).then(function (res) {
				var len = res.rows.length;
				for (var i = 0; i < len; i++) {
					var TaskFormValues = res.rows.item(i).FormSkeleton;
					$rootScope.fields = JSON.parse(TaskFormValues);
					$localstorage.setObject("offlineData", TaskFormValues);

					$state.transitionTo("app.viewForm");
				}
			}, function (err) {
				alert(JSON.stringify(err));
			});
		}
	},
	
	/*$scope.getPrePoprecord = function (item) {
		console.log(item);
		$rootScope.submittedFrom="list";
		$rootScope.selectedFormRecordFields = {};
		var user = $localstorage.getObject("username");
		$rootScope.prepopDataShow = true;
		if ($scope.status == true) {
			$rootScope.saveButton = true;
			$rootScope.submitButton = false;
			$rootScope.TaskData = true;
			$rootScope.isGridRecodsShow = true;
			$rootScope.formEllipse = true;
			$rootScope.skeletonId = item.FormId;
			$localstorage.setObject("TaskId", item.TaskId);
			var url = config.url + "api/v1/formszDetails/getprePOPRecords/" + user + "/" + item.FormId + "/" + item.recordId;
			formsSave.getPrepopData(url, securityHeaders, function (response) {
                console.log(response);
				$localstorage.setObject("reassignedRecordId", item.recordId);
				$rootScope.selectedFormRecordFields = {};
				if (response.message) {}
				else {
					angular.forEach(response, function (value, key) {
						angular.forEach(value.prepopulatedData, function (recordValues, recordKeys) {
							angular.forEach(recordValues, function (v, k) {
								$rootScope.selectedFormRecordFields[k] = v;
							});
						});
					});
				}
				$state.transitionTo("app.viewForm");
			});
			//		}
		} else {
			$scope.editPrepopulatedRecord(item);
		}

	},*/
	 
$scope.getPrePoprecord = function (item) {
  console.log(item);
  $rootScope.submittedFrom="list";
  $rootScope.selectedFormRecordFields = {};
  var user = $localstorage.getObject("username");
  $rootScope.prepopDataShow = true;
  if ($scope.status == true) {
	   $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS PrepopData_table (recordId integer, fieldValues text, taskId text,formId integer,recordStatus text)").then(function(res) {});
	   $rootScope.TaskData = true;
	   $rootScope.isGridRecodsShow = true;
	   $rootScope.skeletonId = item.FormId;
	   $localstorage.setObject("TaskId", item.TaskId);
	   $localstorage.setObject("reassignedRecordId", item.recordId);
	var query = "SELECT * FROM PrepopData_table WHERE recordId=?";
   	$cordovaSQLite.execute(db, query, [item.recordId]).then(function(res) {
	   	if(res.rows.length<=0){
	   		console.log("no lengthhh");
		   $scope.prepopResponse(item);
	   	}else{
	   		var arr=[];
	   		for (var i = 0; i < res.rows.length; i++) {
				var obj = {};
			//	obj.recordId = res.rows.item(0).recordId;
			//	obj.formId = res.rows.item(0).formId;
			//	obj.taskId = res.rows.item(0).taskId;
				obj.record = res.rows.item(0).fieldValues;
				arr.push(obj);
			}	
			angular.forEach(arr, function (values, keys) {
				var prepopValues = JSON.parse(values.record);
				angular.forEach(prepopValues, function (val, k) {
					$rootScope.selectedFormRecordFields = val;
				});
			});
	   		  $state.transitionTo("app.viewForm");

	   	}
   	});
  } else {
   $scope.editPrepopulatedRecord(item);
  }

 },
 $scope.prepopResponse=function(item){
 	var url = config.url + "api/v1/formszDetails/getprePOPRecords/" + user + "/" + item.FormId + "/" + item.recordId;
   formsSave.getPrepopData(url, securityHeaders, function (response) {
    console.log(response);
    if (response.message) {}
    else {
     angular.forEach(response, function (value, key) {
      angular.forEach(value.prepopulatedData, function (recordValues, recordKeys) {
       angular.forEach(recordValues, function (v, k) {
		console.log(v);
        if(k.includes("Location")){
         var latlngStr = v.split(',', 2);
         var latlng = {lat: parseFloat(latlngStr[0]), lng: parseFloat(latlngStr[1])};
         geocoder.geocode({'location': latlng}, function(results, status) {
             console.log(results);
             if (status === 'OK') {
           $rootScope.selectedFormRecordFields[k] = results[1].formatted_address;
                }
            });
        }
        else{
         $rootScope.selectedFormRecordFields[k] = v;
        }
       });
      });
     });
//	console.log($rootScope.selectedFormRecordFields);
    }
    $state.transitionTo("app.viewForm");
   });
 },

	$rootScope.getPrePoprecordFromMap = function (item) {
		console.log("hi this is controller call");
		$rootScope.submittedFrom="map";
		$rootScope.selectedFormRecordFields = {};
		var user = $localstorage.getObject("username");
		$rootScope.prepopDataShow = true;
		if ($scope.status == true) {
			$rootScope.TaskData = true;
			$rootScope.isGridRecodsShow = true;
			$rootScope.formEllipse = true;
			$rootScope.skeletonId = item.FormId;
			$localstorage.setObject("TaskId", item.TaskId);
			var url = config.url + "api/v1/formszDetails/getprePOPRecords/" + user + "/" + item.FormId + "/" + item.recordId;
			formsSave.getPrepopData(url, securityHeaders, function (response) {
				$localstorage.setObject("reassignedRecordId", item.recordId);
//				$rootScope.selectedFormRecordFields = {};
				if (response.message) {}
				else {
					angular.forEach(response, function (value, key) {
						angular.forEach(value.prepopulatedData, function (recordValues, recordKeys) {
							angular.forEach(recordValues, function (v, k) {
								$rootScope.selectedFormRecordFields[k] = v;
							});
						});
					});
				}
				$state.transitionTo("app.viewForm");
			});
			//		}
		} else {
			$scope.editPrepopulatedRecord(item);
		}

	},
	$scope.editPrepopulatedRecord = function (item) {
		console.log(item);
		$rootScope.isHistoryChecked = false;
		var arr = [];
		$rootScope.prepopDataShow = true;
		$rootScope.isView = false;
//		$rootScope.selectedFormRecordFields = {};
//		$rootScope.isGridRecodsShow = true;
		$cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS FormSkeleton_table(FormId integer,Username text,id integer, FormName text ,FormSkeleton text)').then(function (res) {}, function (err) {
				alert(JSON.stringify(err));
		});
		$localstorage.setObject("offlineRecordId", item.recordId);
		var query = "SELECT * FROM PrepopData_table WHERE recordId=?";
		$cordovaSQLite.execute(db, query, [item.recordId]).then(function (res) {
			for (var i = 0; i < res.rows.length; i++) {
				var obj = {};
				obj.recordId = res.rows.item(0).recordId;
				obj.formId = res.rows.item(0).formId;
				obj.taskId = res.rows.item(0).taskId;
				obj.record = res.rows.item(0).fieldValues;
				arr.push(obj);
			}	
			console.log(arr);
			angular.forEach(arr, function (values, keys) {
				var prepopValues = JSON.parse(values.record);
				console.log(prepopValues);
				angular.forEach(prepopValues, function (val, k) {
					console.log(val);
					$rootScope.selectedFormRecordFields = val;
				});
			});
			console.log($rootScope.selectedFormRecordFields);
			var query = 'SELECT * FROM FormSkeleton_table WHERE FormId=?';
			$cordovaSQLite.execute(db, query, [item.FormId]).then(function (res) {
		//		for (var i = 0; i < res.rows.length; i++) {
					var FormValues = res.rows.item(0).FormSkeleton;
					console.log("FormValues}FormVaFormValueslues");
					$rootScope.fields = JSON.parse(FormValues);
					console.log($rootScope.fields);		
					$localstorage.setObject("offlineData", FormValues);
					$state.transitionTo("app.viewForm");
		//		}
			}, function (err) {
				alert(JSON.stringify(err));
			});
			/*}else{
				console.log("no record");
			}*/
		});
	
	},
	$scope.backToOfflineTaskForms = function () {
		$state.go("app.taskformhistory");
	},
	$scope.backToTaskForms = function () {
		if($rootScope.notificationsAddress){
			$rootScope.notificationsAddress=false;
			$state.go('tabs.notifications');
		}/*else if($rootScope.notificationsJobsOn){
			$rootScope.notificationsJobsOn=false;
			$state.go('tabs.notifications');
		}*/
		else{
		  $ionicHistory.goBack();
		}
		  $rootScope.prepopRecords = [];
	},
	/*$scope.checkAll = function () {
		$scope.closePopover();
		if ($scope.offlineTaskformhistory.length == 0) {
			alertService.showToast(strings.norecords);
		} else {
//			$scope.addrecordicon = false;
			$scope.task_action_header = false;
			$scope.selectedAll = true;
			$scope.selectAllCheckBox = true;
			$scope.select_hide = true;
			$scope.selectCheckBox = false;
			$scope.select_all_hide = true;
			$scope.select_hide = true;
			$scope.taskMapAllowed = false;
			$scope.header_delete_hide = false;
			if ($scope.status == true) {
				$scope.header_sync_hide = false;
			} else {
				$scope.header_sync_hide = true;
			}
			$scope.clear_hide = false;

			angular.forEach($scope.offlineTaskformhistory, function (item) {
				item.Selected = $scope.selectedAll;
			});
		}
	},*/
	
	
	/*$scope.deleteAllRecords = function (selection) {
		$ionicPopup.confirm({
			title : 'Confirmation',
			template : 'Are you sure you want to Delete the Selected Records?'
		}).then(function (res) {
			if (res) {
				commonService.LoaderShow(strings.Deleting);
				var item = setGetObj.getTaskHisotryForm();
				if ($scope.selectedAll && selection == "") {
					var query = "SELECT * FROM FormData_table";
					$cordovaSQLite.execute(db, query).then(function (res) {
						$cordovaSQLite.execute(db, "DELETE FROM FormData_table where FormId=? and TaskId=?", [item.FormId, item.TaskId])
						.then(function (res) {
							commonService.Loaderhide();
							alertService.doAlert(strings.allRecordsDelete);
							$scope.refreshOfflineRecords();
							$state.transitionTo("app.taskformhistory");
						}, function (err) {
							alert(JSON.stringify(err));
						});
					}, function (err) {
						alert(JSON.stringify(err));
					});
				} else {
					$scope.deleteRecord(selection);
				}
			}
		});
	},*/
	
	
	$scope.deleteRecord = function (item) {
		commonService.LoaderShow(strings.Deleting);
		//delete selected records 
		if ($scope.selectCheckBox) {
			for (var i = 0; i < item.length; i++) {
				$cordovaSQLite.execute(db, "DELETE FROM FormData_table WHERE uniqueID=?", [item[i]])
				.then(function (res) {
					commonService.Loaderhide();
				}, function (err) {
					alert(JSON.stringify(err));
				});
			}
			alertService.doAlert(strings.selectedRecordDelete);
			$scope.refreshOfflineRecords();
			$state.transitionTo("app.taskformhistory");

		} else {
			
// delete individual record
			var query = "SELECT * FROM FormData_table WHERE uniqueID=?";
			$cordovaSQLite.execute(db, query, [item.recordId]).then(function (res) {
				if (res.rows.length > 0) {
					$cordovaSQLite.execute(db, "DELETE FROM FormData_table WHERE uniqueID=?", [item.recordId])
					.then(function (res) {
						commonService.Loaderhide();
						alertService.doAlert(strings.recordDelete);
						$scope.refreshOfflineRecords();
						$state.transitionTo("app.taskformhistory");

					}, function (err) {
						alert(JSON.stringify(err));
					});
				}

			}, function (err) {
				alert(JSON.stringify(err));
			});
		}
	};
	$scope.refreshOfflineRecords = function () {
		if (filterBarInstance) {
			filterBarInstance();
			filterBarInstance = null;
		}
		$scope.Tformhistory();
		$rootScope.$emit("CallParentMethod", {});
		$scope.clearSelection();
		$timeout(function () {
			$scope.Tformhistory();
			$rootScope.$emit("CallParentMethod", {});
			$scope.$broadcast('scroll.refreshComplete');
		}, 1000);
	};
	$scope.navigateToLocationFromPrepop = function (id) {
		console.log("navigateddd");
		$rootScope.NavigatedFrom = "prepoprec";
		$rootScope.navigatetoRecordId = id;
		$state.go("app.map");
	};

});