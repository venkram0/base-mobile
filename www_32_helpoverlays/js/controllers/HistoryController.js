angular.module('starter.controllers')
.controller('HistoryCtrl', function ($scope, $rootScope, config, $state, setGetObj, $ionicPopup, $cordovaSQLite, $timeout, $ionicFilterBar, commonService, $localstorage, formsService, $ionicPopover, formsSave, alertService, strings) {
	$scope.forms_action_header = true;
	$scope.addrecordiconForms = true;
	$rootScope.prepopDataShow = false;
	securityHeaders.headers = commonService.securityHeaders();
	$ionicPopover.fromTemplateUrl('templates/historyPopover.html', {

		scope : $scope
	}).then(function (popover) {
		$scope.popover = popover;
	});
	$scope.openPopover = function () {
		$scope.popover.show();
	};
	$scope.closePopover = function () {
		$scope.popover.hide();
	};
	$scope.clear_hide = true;
	$scope.selection = [];

	$scope.toggleSelection = function (recordId) {
		var idx = $scope.selection.indexOf(recordId);
		// is currently selected
		if (idx > -1) {

			$scope.selection.splice(idx, 1);
			if ($scope.selection.length == 0) {
				$scope.header_delete = true;
				$scope.heder_sync = true;
			} else {
				$scope.header_delete = false;
				//	$scope.heder_sync = false;
				if ($scope.status == true) {
					$scope.heder_sync = false;
				}
			}
		}
		// is newly selected
		else {
			$scope.selection.push(recordId);
			$scope.header_delete = false;
			if ($scope.status == true) {
				$scope.heder_sync = false;
			}
		}
	};

	$scope.selectAllCheckBox = false;

	$scope.status = commonService.checkConnection();
	var filterBarInstance;

	if ($scope.status == true) {
		$scope.form_history_hide = false;
		if ($rootScope.isHistoryChecked) {
			$scope.ViewOnlineRecord = false;
			$scope.sync_hide = true;
			$scope.delete_hide = true;
			$scope.edit_hide = true;

		} else {
			$scope.ViewOnlineRecord = true;
		}
	} else {
		$scope.heder_sync = true;
		$scope.sync_hide = true;
		$scope.ViewOnlineRecord = true;
	}

	$scope.getOfflineForms = function () {

		$scope.forms_action_header = true;
		var item = setGetObj.getHistoryOfForms();
		$rootScope.TaskData = false;
		$rootScope.isHistoryChecked = false;
		$rootScope.isView = false;
		$scope.header_delete_hide = true;
		$scope.header_sync_hide = true;
		$rootScope.formname = item.FormName;
		var userId = $localstorage.getObject("userId");
		var user = $localstorage.getObject("username");
		$localstorage.setObject("formId", item.id);
		$cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS FormData_table(uniqueID integer primary key autoincrement,FormId integer,userId integer ,FormValues text,FormStatus text,TaskId text,recordId text,isRequired text)").then(function (res) {}, function (err) {});
		var query = 'SELECT * FROM FormData_table WHERE FormId=? and userId=? and FormStatus="false" and TaskId="form";';
		$cordovaSQLite.execute(db, query, [item.id, userId]).then(function (res) {
			var len = res.rows.length;
			var arr = [];
			for (var i = 0; i < len; i++) {
				var obj = {};
				obj.FormId = res.rows.item(i).FormId;
				obj.userId = res.rows.item(i).userId;
				obj._id = res.rows.item(i).uniqueID;
				obj.records = res.rows.item(i).FormValues;
				obj.formName = item.FormName;
				arr.push(obj);
			}
			$scope.historyFormObjects = arr;
			var items = [];
			try {
				for (var x = 0; x < $rootScope.historyFormObjects.records.length; x++) {
					items.push({
						recordId : x + 1,
						FormValues : $rootScope.historyFormObjects.records[x]

					});
				}
			} catch (err) {
				for (var x = 0; x < $scope.historyFormObjects.length; x++) {
					$localstorage.setObject("offlineFormId", $scope.historyFormObjects[x].FormId);
					items.push({
						recordId : $scope.historyFormObjects[x]._id,
						FormId : $scope.historyFormObjects[x].FormId,
						FormValues : $scope.historyFormObjects[x].records
					});
				}

			}
			$scope.offlineitems = items;

			commonService.Loaderhide();
			$state.transitionTo("app.history");
		}, function (err) {
			alert(JSON.stringify(err));
		});
	},

	$scope.getOnlineItems = function () {
		var items = [];
		try {
			for (var x = 0; x < $rootScope.historyObjects.records.length; x++) {
				items.push({
					recordId : x + 1,
					FormValues : $rootScope.historyObjects.records[x]

				});
			}
		} catch (err) {
			for (var x = 0; x < $rootScope.historyObjects.length; x++) {
				$localstorage.setObject("offlineFormId", $rootScope.historyObjects[x].FormId);
				items.push({
					recordId : $rootScope.historyObjects[x]._id,
					FormId : $rootScope.historyObjects[x].FormId,
					FormValues : $rootScope.historyObjects[x].records
				});
			}

		}
		$scope.items = items;

	},

	$scope.getListOfRecords = function () {
		$scope.closePopover();
		var id = $localstorage.getObject("formId");
		$scope.header_delete_hide = true;
		$scope.header_sync_hide = true;
		$rootScope.skeletonId = id;
		var user = $localstorage.getObject("username");
		if ($scope.status == true) {
			$rootScope.isHistoryChecked = true;
			var url = config.url + "api/v1/formszDetails/" + id + "/" + user + "/form";
			formsService.getRecords(url, securityHeaders, function (response) {
				$rootScope.formname = response.formName;
				$rootScope.historyObjects = response;
				$state.transitionTo("app.onlinehistory");
			});
		} else {
			alertService.showToast(strings.nonetworktoview);
		}
	},
	$scope.getFormDetails = function () {
		var id = $localstorage.getObject("formId");
		$localstorage.setObject("offlineFormId", id);
		$rootScope.imgeasSet = {};
		$rootScope.sign = {};
		$rootScope.condition = false;
		$rootScope.isView = true;
		$rootScope.isHistoryChecked = false;
		$rootScope.isGridRecodsShow = false;
		$rootScope.saveButton = false;
		$rootScope.submitButton = false;
		$scope.status = commonService.checkConnection();
		$rootScope.barcodeShow=true;
		$rootScope.cameraShow=true;
		if ($scope.status == true) {
			commonService.LoaderShow(strings.loading);
			if (formskeletonStorage.length > 0) {
				commonService.LoaderShow(strings.loading);
				angular.forEach(formskeletonStorage, function (value, key) {

					if (value.formId == id) {
						$scope.formSkeleton = value.formSkeleton;
						$scope.formId = value.formId;
						$localstorage.setObject("formId", $scope.formId);
						$localstorage.setObject("data", $scope.formSkeleton);
						$state.transitionTo("app.viewForm");
					} else {
						commonService.LoaderShow(strings.loading);
						$rootScope.skeletonId = id;
						
						$state.transitionTo("app.viewForm");
					}
				});
			} else {
				commonService.LoaderShow(strings.loading);
				$rootScope.skeletonId = id;
				$state.transitionTo("app.viewForm");
			}
			
		} else {
			$scope.viewOfflineForm(id);
		}
	},
	$scope.viewOfflineForm = function (id) {
		$rootScope.isView = true;
		$scope.formId = $localstorage.setObject("offlineFormId", id);
		$localstorage.setObject("hTaskId", "form");
		$cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS FormSkeleton_table(FormId integer,Username text,id integer, FormName text ,FormSkeleton text)').then(function (res) {}, function (err) {});
		var query = 'SELECT * FROM FormSkeleton_table WHERE FormId=? ';
		$cordovaSQLite.execute(db, query, [id]).then(function (res) {
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

	$scope.editOfflineForm = function (item) {
		$rootScope.TaskData = false;
		$rootScope.imgeasSet = {};
		$rootScope.sign = {};
		$rootScope.condition = false;
		$rootScope.offlineReData = false;
		$localstorage.setObject("offlineRecordId", item.recordId);
		var recordId = $localstorage.getObject("offlineRecordId");
		var RecordValues = JSON.parse(item.FormValues);
		var RecordData = RecordValues.record;
		$rootScope.selectedFormRecordFields = {};
		angular.forEach(RecordData, function (value, key) {
			$rootScope.selectedFormRecordFields = value;
			setGetObj.setHisotryForm(value);
		});
		$rootScope.isGridRecodsShow = true;
		if ($scope.status == true) {
			$rootScope.skeletonId = item.FormId;
			$state.transitionTo("app.viewForm");
		} else {
			$cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS FormSkeleton_table(FormId integer,Username text,id integer, FormName text ,FormSkeleton text)').then(function (res) {
				var query = 'SELECT * FROM FormSkeleton_table WHERE FormId=?';
				$cordovaSQLite.execute(db, query, [item.FormId]).then(function (res) {
					var len = res.rows.length;
					for (var i = 0; i < len; i++) {
						var FormValues = res.rows.item(i).FormSkeleton;
						$rootScope.fields = JSON.parse(FormValues);
						$state.transitionTo("app.viewForm");
					}
				}, function (err) {
					alert(JSON.stringify(err));
				});
			}, function (err) {});
		}

	},

	$scope.viewRecord = function (item) {
		$rootScope.imgeasSet = {};
		$rootScope.sign = {};
		$rootScope.condition = true;
		$rootScope.formEllipse = true;
		var RecordValues = item.FormValues;
		$rootScope.selectedFormRecordFields = {};
		angular.forEach(RecordValues, function (value, key) {
			$rootScope.selectedFormRecordFields[key] = value;
		});

		$rootScope.isGridRecodsShow = true;
		$state.transitionTo("app.viewForm");
	},
	$scope.back = function () {
		if ($rootScope.isHistoryChecked) {
			$state.transitionTo("app.history");
		} else {
			$state.transitionTo("tabs.forms");
		}
	},
	$scope.backToHeader = function () {
		$scope.forms_action_header = true;
	},
	$scope.checkAll = function () {
		$scope.closePopover();
		if ($scope.offlineitems.length == 0) {
			alertService.showToast(strings.norecords);
		} else {
			$scope.addrecordiconForms = false;
			$scope.header_delete = false;
			$scope.heder_sync = false;
			$scope.forms_action_header = false;
			$scope.selectedAll = true;
			$scope.selectAllCheckBox = true;
			$scope.select_hide = true;
			$scope.selectCheckBox = false;
			$scope.select_all_hide = true;
			$scope.select_hide = true;
			angular.forEach($scope.items, function (item) {
				item.Selected = $scope.selectedAll;
			});
		}
	},

	$scope.checkRecord = function () {
		$scope.closePopover();
		$scope.selection = [];
		if ($scope.offlineitems.length == 0) {
			alertService.showToast(strings.norecords);
		} else {
			$scope.addrecordiconForms = false;
			$scope.forms_action_header = false;
			$scope.closePopover();
			$scope.header_delete = true;
			$scope.heder_sync = true;
			$scope.selectCheckBox = true;
			$scope.selectedAll = false;
			$scope.selectAllCheckBox = false;
		}

	},
	$scope.clearSelection = function () {
		$scope.addrecordiconForms = true;
		$scope.closePopover();
		$scope.forms_action_header = true;
		$scope.selectedAll = false;
		$scope.select_hide = false;
		$scope.select_all_hide = false;
		$scope.clear_hide = true;
		$scope.selectAllCheckBox = false;
		$scope.selectCheckBox = false;

	},

	$scope.syncOfflineForm = function (item) {
		var isFormExist = false;
		var FormId = $localstorage.getObject("offlineFormId");
		if ($scope.selectCheckBox) {
			/* sync selected records */
			var url = config.url + "api/v1/formszDetails/create";
			for (var i = 0; i < item.length; i++) {
				if (!isFormExist) {
					(function (x) {
						var query = "SELECT * FROM FormData_table WHERE FormId=? AND uniqueID=? AND FormStatus='false';";
						$cordovaSQLite.execute(db, query, [FormId, item[i]]).then(function (res) {
							var obj = {};
							var isValid = res.rows.item(0).isRequired;
							var formvalues = res.rows.item(0).FormValues;
							var uid = res.rows.item(0).uniqueID;
							var FormId = res.rows.item(0).FormId;
							var taskId = res.rows.item(0).TaskId;
							var FormStatus = res.rows.item(0).FormStatus;
							obj.taskId = taskId;
							obj.formId = FormId;
							obj.record = JSON.parse(formvalues).record;
							obj.updatedBy = $localstorage.getObject("username");
							if (isValid == "true") {
								formsSave.saveForm(url, obj, securityHeaders, function (response) {

									if (response.status == 200) {
										var query = "DELETE FROM FormData_table WHERE uniqueID=?";
										$cordovaSQLite.execute(db, query, [uid]).then(function (res) {
											$scope.refreshItems();
											$scope.clearSelection();
										}, function (err) {
											alert(JSON.stringify(err));
										});
									}
								});
							} else {
								isFormExist = true;
								alertService.showToast("unable to submit few records as mandatory fields are not filled");
								$scope.clearSelection();
							}
						}, function (err) {
							alert(JSON.stringify(err));
						});
					})(i);
				}
			}
			if (!isFormExist) {
				alertService.doAlert(strings.submitted);
				$state.transitionTo("app.history");

			}

		} else {
			/* sync individual record */
			var query = "SELECT * FROM FormData_table WHERE FormId=? AND uniqueID=? AND FormStatus='false';";
			$cordovaSQLite.execute(db, query, [FormId, item.recordId]).then(function (res) {
				var len = res.rows.length;
				if (len == 0) {
					alertService.doAlert(strings.nodata);
				} else {
					var url = config.url + "api/v1/formszDetails/create";
					var obj = {};

					for (var i = 0; i < len; i++) {
						var isValid = res.rows.item(i).isRequired;
						var formvalues = res.rows.item(i).FormValues;
						var uid = res.rows.item(i).uniqueID;
						var FormId = res.rows.item(i).FormId;
						var FormStatus = res.rows.item(i).FormStatus;
						var taskId = res.rows.item(i).TaskId;
						obj.taskId = taskId;
						obj.formId = FormId;
						obj.record = JSON.parse(formvalues).record;
						obj.updatedBy = $localstorage.getObject("username");
						if (isValid == "true") {
							formsSave.saveForm(url, obj, securityHeaders, function (response) {
								if (response.status == 200) {
									var query = "DELETE FROM FormData_table WHERE uniqueID=?";
									$cordovaSQLite.execute(db, query, [item.recordId]).then(function (res) {}, function (err) {
										alert(JSON.stringify(err));
									});

									alertService.doAlert(strings.submitted);
									$scope.refreshItems();
									$scope.clearSelection();
									$state.transitionTo("app.history");
								}

							});
						} else {
							alertService.showToast("unable to submit record as mandatory fields are not filled");
							$scope.clearSelection();
						}
					}

				} //else
			}, function (err) {
				alert(JSON.stringify(err));
			});
		}
	},
	$scope.syncAllOfflineForm = function (selection) {
		$ionicPopup.confirm({
			title : 'Confirmation',
			template : 'Submit the Selected Records?'
		}).then(function (res) {
			if (res) {
				if ($scope.selectedAll && selection == "") {
					var query = "SELECT * FROM FormData_table WHERE FormStatus='false';";
					$cordovaSQLite.execute(db, query).then(function (res) {
						var url = config.url + "api/v1/formszDetails/create";
						var len = res.rows.length;
						for (var i = 0; i < len; i++) {
							(function (x) {
								var obj = {};
								var isValid = res.rows.item(i).isRequired;
								var formvalues = res.rows.item(i).FormValues;
								var uid = res.rows.item(i).uniqueID;
								var FormId = res.rows.item(i).FormId;
								var FormStatus = res.rows.item(i).FormStatus;
								var taskId = res.rows.item(0).TaskId;
								obj.taskId = taskId;
								obj.formId = FormId;
								obj.record = JSON.parse(formvalues).record;
								obj.updatedBy = $localstorage.getObject("username");

								if (isValid == "true") {
									formsSave.saveForm(url, obj, securityHeaders, function (response) {

										if (response.status == 200) {
											alertService.showToast("Submitted records : " + i);
											var query = "DELETE FROM FormData_table WHERE uniqueID=?";
											$cordovaSQLite.execute(db, query, [uid]).then(function (res) {
												if (i == len) {
													$scope.refreshItems();
													$scope.clearSelection();
												}
											}, function (err) {
												alert(JSON.stringify(err));
											});

										}

									});
								} else {
									alertService.showToast("unable to submit few records as mandatory fields are not filled");
									$scope.clearSelection();
								}

							})(i);
						}

						alertService.doAlert(strings.submittedAll);
						$state.transitionTo("app.history");
					}, function (err) {
						alert(JSON.stringify(err));
					});
				} else {
					$scope.syncOfflineForm(selection);
				}
			} else {}
		});
	},

	$scope.refreshItems = function () {
		if (filterBarInstance) {
			filterBarInstance();
			filterBarInstance = null;
		}
		if ($rootScope.isHistoryChecked) {
			$scope.getOnlineItems();
		} else {
			$scope.getOfflineForms();
			$scope.clearSelection();
		}

		$timeout(function () {

			if ($rootScope.isHistoryChecked) {
				$scope.getOnlineItems();
			} else {
				$scope.getOfflineForms();
			}
			$scope.$broadcast('scroll.refreshComplete');
		}, 1000);
	};

	$scope.deleteRecord = function (item) {
		/* delete selected records */
		if ($scope.selectCheckBox) {
			for (var i = 0; i < item.length; i++) {
				$cordovaSQLite.execute(db, "DELETE FROM FormData_table WHERE uniqueID=?", [item[i]])
				.then(function (res) {}, function (err) {
					alert(JSON.stringify(err));
				});
				//		$scope.refreshItems(item);
			}
			alertService.doAlert(strings.selectedRecordDelete);
			$scope.refreshItems();
			$state.transitionTo("app.history");

		} else {
			/*delete individual record*/
			var query = "SELECT * FROM FormData_table WHERE uniqueID=?";
			$cordovaSQLite.execute(db, query, [item.recordId]).then(function (res) {
				if (res.rows.length > 0) {
					$cordovaSQLite.execute(db, "DELETE FROM FormData_table WHERE uniqueID=?", [item.recordId])
					.then(function (res) {
						alertService.doAlert(strings.recordDelete);
						$scope.refreshItems();
						$state.transitionTo("app.history");

					}, function (err) {
						alert(JSON.stringify(err));
					});
				}

			}, function (err) {
				alert(JSON.stringify(err));
			});

		}
	};
	$scope.deleteAllRecord = function (selection) {
		$ionicPopup.confirm({
			title : 'Confirmation',
			template : 'Are you sure you want to Delete the Selected Records?'
		}).then(function (res) {
			if (res) {
				if ($scope.selectedAll && selection == "") {
					var query = "SELECT * FROM FormData_table ";
					$cordovaSQLite.execute(db, query).then(function (res) {
						$cordovaSQLite.execute(db, "DELETE FROM FormData_table where FormId=? and TaskId=?", [item.id, "form"])
						.then(function (res) {
							//							alertService.showToast("Deleted records : "+i);
							alertService.doAlert(strings.allRecordsDelete);
							$scope.refreshItems();
							$state.transitionTo("app.history");

						}, function (err) {
							alert(JSON.stringify(err));
						});
					}, function (err) {
						alert(JSON.stringify(err));
					});
				} else {
					$scope.deleteRecord(selection);
				}
			} else {}
		});
		var item = setGetObj.getHistoryOfForms();

	};

});