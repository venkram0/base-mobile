angular.module('starter.controllers')
.controller('reassignedHistory', function ($scope, $rootScope, commonService, $ionicPopup, $state, formsSave, alertService, strings, config, $localstorage, $ionicModal, $cordovaSQLite) {
	securityHeaders.headers = commonService.securityHeaders();
	$scope.status = commonService.checkConnection();

	$rootScope.condition = false;
	if ($scope.status == true) {
		$scope.ViewOnlineRecord = true;
		$scope.header_delete_hide = true;
		$scope.header_sync_hide = true;
		$scope.hide_history_ellipse = true;
		$scope.hide_task_ellipse = true;
	} else {
		$scope.sync_hide = true;
	}
	$scope.getItems = function () {
		var items = [];
		if ($rootScope.offlineReData) {
			$scope.hide_history_ellipse = true;
			$scope.header_delete_hide = true;
			$scope.header_sync_hide = true;
			angular.forEach($rootScope.FormsReAssigned, function (value, key) {
				items.push({
					FormId : value.FormId,
					record : value.records,
					TaskId : value.taskId,
					id : value._id
				})

			});
			$scope.items = items;
		} else {
			/*--- online ---*/
			$scope.sync_hide = true;
			for (var x = 0; x < $rootScope.FormsReAssigned.length; x++) {
				items.push({

					id : $rootScope.FormsReAssigned[x]._id,
					comments : $rootScope.FormsReAssigned[x].comments,
					record : $rootScope.FormsReAssigned[x].record
				});
			}
			$scope.items = items;
		}
	},

	$scope.offlineViewReassignRecord = function (item) {
		$rootScope.button = "save";
		$rootScope.isHistoryChecked = !"reassign";
		$rootScope.offlineReData = true;
		$localstorage.setObject("hTaskId", "form");
		$localstorage.setObject("offlineRecordId", item.id);
		$localstorage.setObject("formId", item.FormId);
		var FormId = item.FormId;
		var RecordData = JSON.parse(item.record);
		$rootScope.selectedFormRecordFields = {};
		angular.forEach(RecordData, function (value, key) {
			$rootScope.selectedFormRecordFields = value;
		});
		$rootScope.isGridRecodsShow = true;
		$cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS FormSkeleton_table(FormId integer,Username text,id integer, FormName text ,FormSkeleton text)').then(function (res) {}, function (err) {});
		var query = 'SELECT * FROM FormSkeleton_table WHERE FormId=?';
		$cordovaSQLite.execute(db, query, [FormId]).then(function (res) {
			var len = res.rows.length;
			for (var i = 0; i < len; i++) {
				var FormValues = res.rows.item(i).FormSkeleton;
				$rootScope.fields = JSON.parse(FormValues);
				$localstorage.setObject("offlineData", FormValues);
				$state.transitionTo("app.viewForm");
			}

		}, function (err) {
			alert(JSON.stringify(err));
		});

	},
	$scope.syncReassignFormOnline = function (item) {

		var query = "SELECT * FROM FormData_table WHERE FormId=? AND uniqueID=?;";
		$cordovaSQLite.execute(db, query, [item.FormId, item.id]).then(function (res) {
			var len = res.rows.length;
			if (len == 0) {
				alertService.doAlert(strings.nodata);
			} else {
				var reassignId = $localstorage.getObject("reassignedRecordId");
				var url = config.url + "api/v1/formszDetails/" + reassignId;
				var obj = {};

				for (var i = 0; i < len; i++) {
					var formvalues = res.rows.item(i).FormValues;
					var uid = res.rows.item(i).uniqueID;
					var FormId = res.rows.item(i).FormId;
					var FormStatus = res.rows.item(i).FormStatus;
					var taskId = res.rows.item(0).TaskId;
					obj.status = false;
					obj.formId = FormId;
					obj.record = JSON.parse(formvalues);
					obj.updatedBy = $localstorage.getObject("username");
				}
				formsSave.saveReassignedForm(url, obj, securityHeaders, function (response) {
					if (response.status) {
						commonService.Loaderhide();
						alertService.doAlert(strings.invalidresponse);
					} else {
						$rootScope.signatureimage = "";
						commonService.Loaderhide();
						var query = "DELETE FROM FormData_table WHERE uniqueID=?";
						$cordovaSQLite.execute(db, query, [uid]).then(function (res) {}, function (err) {
							alert(JSON.stringify(err));
						});
						$state.transitionTo("tabs.OfflineForms.reassigneddownloads");
						alertService.doAlert(strings.submitted);
					}
				});
			} //else
		}, function (err) {
			alert(JSON.stringify(err));
		});
	},
	$scope.getItems();
});