angular.module('starter.controllers')
    .controller('taskCtrl', function($scope, $rootScope, $state, config,$ionicHistory, $cordovaSQLite, setGetObj, $ionicPopup, $filter, formsService, $ionicPopover, formsSave, alertService, commonService, $localstorage, reassign, strings, $timeout,$ionicModal) {
        var idArry = [];
        $scope.status = commonService.checkConnection();
        securityHeaders.headers = commonService.securityHeaders();
        var userId = $localstorage.getObject("userId");
        var username = $localstorage.getObject("username");
        var filterBarInstance;
        $scope.selection = [];
        $scope.sync_header_option=true;
        var fromGotToMap=false;
        if ($scope.status == true) {
            console.log("trueee")
             $scope.mapOption=true;
            $scope.moreOption=true;
            $scope.sync_header_option=true;
        } else {
            console.log("falseee")
            $scope.mapOption=false;
          $scope.sync_header_option=false;
            $scope.moreOption=false;
        }

    $scope.toggleSelection = function (recordId) {
        console.log(recordId);
        var idx = $scope.selection.indexOf(recordId);
        // is currently selected
        if (idx > -1) {
            console.log("iffffff 121111111111");
            $scope.selection.splice(idx, 1);
        }
        // is newly selected
        else {
            console.log("222222222 elseeeeeeeeeeee");
            $scope.selection.push(recordId);
        }
        console.log($scope.selection);
    };    
    $scope.methodCheck = function() {
        if ($scope.status == true) {
            console.log("firstttt");
            $scope.getAssignedTasks();
        } else {
            console.log("offflineeeeeeeeeeeeeee");
            $scope.ShowDownloadedTasks();
        }
    },
            $scope.navigateToMap = function(item) {
				fromGotToMap=true;
				commonService.LoaderShow(strings.pleasewait);
				$rootScope.NavigatedFrom = "jobs";
				$scope.getAssignedForms(item);
				$state.go("app.map");
				if ($scope.status == false) {
					alertService.showToast(strings.nonetworktoview);
				}
                
            },

            $scope.checkDownloads = function (callback) {
                var downloadedIds = [];
                $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS downloadedTasks (Username text,TaskName text ,TaskId text,Description text,startDate text,endDate text,formId text)").then(function(res) {});
                var query = 'SELECT * FROM downloadedTasks where Username=?';
                $cordovaSQLite.execute(db, query, [username]).then(function (res) {
                    var len = res.rows.length;
                    for (var i = 0; i < len; i++) {
                        var TaskId = res.rows.item(i).TaskId;
                        downloadedIds.push({
                            TaskId : TaskId
                        });
                    }
                    console.log(downloadedIds);
                   callback(downloadedIds);
                });
             },
            $scope.getAssignedTasks = function() {
                  console.log($rootScope.notificationsAddress);
                if($rootScope.notificationsAddress){
                console.log("defineddd");
                var item = setGetObj.getNotificationItem();
                console.log(item);
                $scope.TaskFormsHistoryOffline(item);
                }else{
                    $rootScope.notificationsAddress=false;
                     console.log(" nottt defineddd");
            //    }         
                $scope.checkDownloads(function (downloadedIds) {
                $rootScope.NavigatedFrom = "";
                var tasks = [];
                var userId = $localstorage.getObject("userId");
                commonService.LoaderShow(strings.pleasewait);
                var url = config.url + "api/v1/tasks/getTasksbyUser/" + userId;
                formsService.assignedtask(url, securityHeaders, function(response, status) {
                  var notifyStatus;
                    commonService.Loaderhide();
                    $scope.taskObj = {};
                    angular.forEach(response.data, function(dataValue, datakey) {
                       $rootScope.taskname =dataValue.name;
                        $scope.formArr = [];
                    //   var taskFormId=dataValue.assignedFormsz[0];
                    var formId;
                        angular.forEach(dataValue.assignedFormsz, function(value, key) {
                        formId=value.formId;
                        });
                        var status = false;
                        angular.forEach(downloadedIds, function (downloadId, key) {
                            if (downloadId.TaskId === dataValue._id) {
                                status = true;
                            }
                        });
                        if($rootScope.notificationsJobsOn){
                            console.log("111111111111");
                            if(dataValue._id==$rootScope.taskId){
                                notifyStatus=false;
                            }else{
                                console.log("2222222222222");
                                notifyStatus=true;
                            }
                        }else{
                            notifyStatus=true;
                        }
                        tasks.push({
                            TaskName: dataValue.name,
                            formId: formId,
                            startDate:dataValue.startDate,
                            endDate: dataValue.endDate,
                            taskDescription: dataValue.description,
                            taskId: dataValue._id,
                            status : status,
                            notifyStatus:notifyStatus
                        });
                    });
                    $scope.tasks = tasks;
                    console.log($scope.tasks);
                });
                 });
            }
            },
            $scope.getAssignedForms = function(item) {
                if($scope.selectCheckBox){
            $scope.toggleSelection(item.taskId);
                }else{
                console.log(item);
                 $rootScope.taskname =item.TaskName;
			//	commonService.LoaderShow(strings.pleasewait);
             //   setGetObj.setFormObject(item);
             setGetObj.setTaskHisotryForm(item);
                localStorage.setItem("mapTaskid", item.taskId);
                $rootScope.isHistoryChecked = !"reassign";
                $rootScope.assignedHistory = true;
            //    $scope.taskname = item.TaskName;
            console.log($scope.status);
                if ($scope.status == true) {
                    $rootScope.TaskData = true;
            //        $scope.taskId = item.taskId;
                    var TaskForms = [];
                //    angular.forEach(item.FormDetails, function(value, key) {
                        TaskForms.push({
                        //    FormName: value.formName,
                            FormId: item.formId,
                            TaskId: item.taskId,
                            TaskName: item.TaskName,
                            startDate: item.startDate,
                            endDate: item.endDate,
                        //    taskDescription: item.taskDescription,
                        //    FormDetails: item.FormDetails

                        });

                //    });
 //               console.log(TaskForms);
                    var date = new Date();
                    var currentDate = $filter('date')(date, "yyyy-MM-dd");   
//                    console.log(currentDate);

                    var endDate = $filter('date')(item.endDate, "yyyy-MM-dd");
//                    console.log(endDate);
                    var startDate = $filter('date')(item.startDate, "yyyy-MM-dd");
//                    console.log(startDate);
                    /*if(startDate<=currentDate && currentDate <=endDate){
                        console.log("valid");
                    $scope.TaskFormsHistoryOffline($rootScope.TaskForms[0]);
                    }else{
                        commonService.Loaderhide();
                        console.log("not validd");
                        alertService.showToast(strings.cannotviewtask);
                    }*/
                    $scope.TaskFormsHistoryOffline(TaskForms[0]);
					                  
                } else {
                    console.log(",,,,,,,,,,,,")
                $scope.getTaskFormOffline(item);
               // $scope.TaskFormsHistoryOffline(item);
                }
            }
            },
            $scope.back = function () {
              $ionicHistory.goBack();
            },
           
            $scope.downloadTask = function() {
                var item= setGetObj.getTaskHisotryForm();
                console.log(item);
                var url = config.url + "api/v1/formszDetails/downloadService/" + item.taskId + "/" + item.formId + "/" + username;
                console.log(url);
                reassign.downloadTask(url, securityHeaders, function(response) {
                    console.log(response);
                    var obVals=response.data;
                    console.log(obVals);
                    $scope.checkTask(obVals, item);
                   
                });
            },
            $scope.checkTask = function(dataObj,item) {
                console.log(item);
                console.log(dataObj);
                $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS downloadedTasks (Username text,TaskName text ,TaskId text,Description text,startDate text,endDate text,formId text)").then(function(res) {});
                var query = "SELECT * FROM downloadedTasks WHERE TaskId=?";
                $cordovaSQLite.execute(db, query, [item.taskId]).then(function(res) {
                   console.log(res.rows.length);
                    if (res.rows.length == 0) {
                        console.log("000000000000");
                        var query = 'INSERT INTO downloadedTasks (Username,TaskName,TaskId,Description,startDate,endDate,formId) VALUES (?,?,?,?,?,?,?)';
                        $cordovaSQLite.execute(db, query, [username, item.TaskName, item.taskId, item.taskDescription, item.startDate, item.endDate,item.formId]).then(function(res) {});
                            $scope.closeModal();
                            $scope.checkRecordsTask(dataObj,item);
            //         $scope.checkFormSkeletonOffline(item.formId);
                    } else {
                    console.log("lengthhhhhhhh");
                    $scope.closeModal();
                }
                });
            },
            
            $scope.checkRecordsTask = function(objectValues, item) {
                $scope.checkFormSkeletonOffline(objectValues.formId);
                $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS DisplayValues (recordId integer, displayFields text, taskId text,formId integer)").then(function(res) {});
                $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS PrepopData_table (recordId integer, fieldValues text, taskId text,formId integer,recordStatus text,username text)").then(function(res) {});
//              console.log(objectValues.DownloadRecords);
                angular.forEach(objectValues.DownloadRecords, function(dispValues, dispKey) {
//                    console.log(dispValues);
                    var recDpvals = [];
                    angular.forEach(dispValues.DisplayValues, function(dpvals, dpkeys) {
                        recDpvals.push(dpvals.fieldIdName);
                    });
                    var query = 'INSERT INTO DisplayValues (recordId, displayFields, taskId,formId) VALUES (?,?,?,?)';
                    $cordovaSQLite.execute(db, query, [dispValues.recordId, JSON.stringify(recDpvals), item.taskId, objectValues.formId]).then(function(res) {
                        var query = 'INSERT INTO PrepopData_table (recordId, fieldValues,taskId,formId,recordStatus,username) VALUES (?,?,?,?,?,?)';
                        $cordovaSQLite.execute(db, query, [dispValues.recordId, JSON.stringify(dispValues.AllFields), item.taskId, objectValues.formId,"false",username]).then(function(res) {
 //                           console.log("records inserted");
                            $scope.getAssignedTasks();
                        }, function(err) {
                            alert("prepoppppp " + JSON.stringify(err));
                        });

                    }, function(err) {
                        alert(JSON.stringify(err));
                    });
                });
            },
            $scope.checkFormSkeletonOffline = function(formId) {
                var url = config.url + "api/v1/formsz/" + formId;
                console.log(url);
                console.log(formId);
                formsService.navigateToForms(url, securityHeaders, function(status, response) {
                    var taskFormSkeleton = JSON.stringify(response.FormSkeleton);
                    var taskFormId = response._id;
                    var taskFormName = response.name;
                    $cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS FormSkeleton_table(FormId integer,Username text,id integer, FormName text ,FormSkeleton text)').then(function(res) {}, function(err) {});
                    var query = "SELECT * FROM FormSkeleton_table WHERE FormId=?";
                    $cordovaSQLite.execute(db, query, [taskFormId]).then(function(res) {
                        if (res.rows.length == 0) {
                            var query = 'INSERT INTO FormSkeleton_table (FormId,Username, id, FormName, FormSkeleton) VALUES (?,?,?,?,?)';
                            $cordovaSQLite.execute(db, query, [taskFormId, username, userId, taskFormName, taskFormSkeleton]).then(function(res) {}, function(err) {
                                alert(JSON.stringify(err));
                            });
                        } else {
                        }
                    }, function(err) {
                        alert("shssssss" + JSON.stringify(err));
                    });
                });
            },
            $scope.taskDetails = function(item) {
                if (item == undefined) {
                    var item = setGetObj.getFormObject();
                }
                var startDate = $filter('date')(item.startDate, "yyyy-MM-dd");
                var endDate = $filter('date')(item.endDate, "yyyy-MM-dd");
                var alertPopup = $ionicPopup.alert({
                    cssClass: 'custom-class', // Add
                    template: "<div>Job Name : " + item.TaskName + " </br><hr> Description : " + item.taskDescription + "</br><hr>Start Date : " + startDate + "</br><hr>End Date : " + endDate + "</div>",
                    buttons: [{
                        text: 'ok',
                        type: 'button-dark'
                    }, ]
                });
                alertPopup.then(function(res) {});
            },

            $scope.modal = $ionicModal.fromTemplate( '<ion-modal-view style="top:60%;padding-right:15px;padding-left:15px;">' +
                '<ion-content style="margin-top:10px;">'+
                    '<div class="list" style="margin-left:15px;margin-right:15px;border:1px solid #eee;border-radius:10px;">'+
                       '<div class="item" style="text-align:center;border-bottom:1px solid #eee;font-size:16px;" ng-click="downloadTask();">Download</div>'+
                       '<div class="item" style="text-align:center;font-size:16px;" ng-click="TaskFormsHistory();">History</div>'+
                    '</div>'+
                    '<div class="list" style="margin-top:10px;margin-left:15px;margin-right:15px;border:1px solid #eee;border-radius:10px;">'+
                       '<div class="item" style="text-align:center;color:#4A87EE;font-size:16px;" ng-click="closeModal()">Cancel</div>'+
                    '</div>'+
                '</ion-content>' +'</ion-modal-view>', {
              scope: $scope,
              animation: 'slide-in-up',
              backdropClickToClose: false,
              hardwareBackButtonClose: false
           })

            $scope.moreOptions = function(item){
//                console.log(item);
                setGetObj.setTaskHisotryForm(item);
                $scope.modal.show();
            }

            $scope.closeModal = function() {
              $scope.modal.hide();
            };

            // fetch all the offline tasks 
            $scope.ShowDownloadedTasks = function() {
                console.log("show downloadddddddddddddd");
                 $scope.checkDownloads(function (downloadedIds) {
                $rootScope.TaskData = false;
     //           var username = $localstorage.getObject("username");
                $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS downloadedTasks (Username text,TaskName text ,TaskId text,Description text,startDate text,endDate text,formId text)").then(function(res) {}, function(err) {});
                var query = "SELECT * FROM downloadedTasks WHERE Username=?";
                $cordovaSQLite.execute(db, query, [username]).then(function(res) {
                    var len = res.rows.length;
                    var arr = [];
                    for (var i = 0; i < len; i++) {
                        var obj = {};
                        obj.taskName = res.rows.item(i).TaskName;
                        obj.taskId = res.rows.item(i).TaskId;
                        obj.taskDescription = res.rows.item(i).Description;
                        obj.startDate = res.rows.item(i).startDate;
                        obj.endDate = res.rows.item(i).endDate;
                        obj.FormId = res.rows.item(i).formId;
                        arr.push(obj);
                    }
                    $scope.downloadedtaskObject = arr;

                    var taskItems = [];
                    for (var x = 0; x < $scope.downloadedtaskObject.length; x++) {
                        taskItems.push({
                            TaskName: $scope.downloadedtaskObject[x].taskName,
                            taskDescription: $scope.downloadedtaskObject[x].taskDescription,
                            TaskId: $scope.downloadedtaskObject[x].taskId,
                            startDate: $scope.downloadedtaskObject[x].startDate,
                            endDate: $scope.downloadedtaskObject[x].endDate,
                            FormId:$scope.downloadedtaskObject[x].FormId,
                            status:true
                        });
                    }
                    $scope.tasks = taskItems;
                    commonService.Loaderhide();
                    //		$state.transitionTo("tabs.OfflineForms.taskdownloads");
                }, function(err) {
                    $ionicLoading.hide();

                });
            });
            },

            $rootScope.$on("CallParentMethod", function() {
                var item = setGetObj.getTaskHisotryForm();
 //               console.log(item);
                $scope.TaskFormsHistoryOffline(item);

            });


        $scope.TaskFormsHistoryOffline = function(item) {
//            console.log(item);
             var first_item;
            var rest_of_the_items;
			commonService.LoaderShow(strings.pleasewait);
        //       $rootScope.taskname =dataValue.name;
                localStorage.setItem("mapFormId", item.FormId);
                $rootScope.formname = item.FormName;
                setGetObj.setTaskHisotryForm(item);
                //		$rootScope.hide_taskellipse = false;
                $rootScope.isView = false;
                $rootScope.TaskData = true;
                var assignedFormOfflineData = [];
                $rootScope.reassignedDataVals=[];
                if ($scope.status == true) {
                    var reassignedDataVals=[];
                    var url = config.url + "api/v1/formszDetails/getPrePopulatedDataforUser/" + item.TaskId + "/" + username;
                    reassign.getPrepopulatedData(url, securityHeaders, function(response) {
 //                    console.log(response);
                    //    angular.forEach(response, function(arrayvalues, arraykeys) {
                            angular.forEach(response.data, function(values, keys) {
                                var FormName = values.FormName;
                                if (values.isAllowMap === true) {
                                    $rootScope.taskMapAllowed = true;
                                }
                                if (values.isAllowMap === false) {
                                    $rootScope.taskMapAllowed = false;
                                }
                                    $rootScope.noTaskFormrecords = false;
                                    angular.forEach(values.DisplayValues, function(value, key) {
                                       
                                        var dpvals = [];
                                        angular.forEach(value.record, function(v, k) {
 //                                           console.log(v);
                                           var splitted = v.fieldIdName.split(',');
                                            first_item = splitted.shift();
                                            rest_of_the_items = splitted.join(',');
                                            dpvals.push(v.fieldIdName);
                                        });
 //                                       console.log(dpvals);
                                        if(value.status){
                                            reassignedDataVals.push({
                                                recordId: value.recordId,
                                                status:value.status,
                                                recordName: dpvals + [],
                                                recordName1:first_item,
                                                recordName2:rest_of_the_items,
                                                FormName: FormName,
                                                FormId: values.formId,
                                                TaskId: item.TaskId

                                        });
                                        }else{
                                            assignedFormOfflineData.push({
                                                recordId: value.recordId,
                                                status:value.status,
                                                recordName: dpvals + [],
                                                recordName1:first_item,
                                                recordName2:rest_of_the_items,
                                                FormName: FormName,
                                                FormId: values.formId,
                                                TaskId: item.TaskId

                                        });
                                        }
                                        if(value.status){
                                        $rootScope.reassignedDataVals = reassignedDataVals;
//                                        console.log($rootScope.reassignedDataVals);
                                       }else{
                                            $rootScope.prepopRecords = assignedFormOfflineData;
                                        }
                                    });
                                    commonService.Loaderhide();
//                                    console.log( $rootScope.prepopRecords);
                            //        }

                            });
                    //    });
                    });
					if(fromGotToMap===true){
					  	$rootScope.NavigatedFrom = "jobs";
						$state.go("app.map");
						if ($scope.status == false) {
							alertService.showToast(strings.nonetworktoview);
						}
						fromGotToMap=false;
					}else{
						$state.transitionTo("app.taskformhistory");
						
					}
					
                } else {
                    $scope.getTaskFormOffline(item);
                }

            },
            // get offline address (dp vals)
            $scope.getTaskFormOffline = function(item) {
                console.log("ooooooooooooooo")
                $rootScope.isGridRecodsShow = false;
                $rootScope.isView = true;
                $rootScope.condition = false;
                var assignedFormOfflineData = [];
                $localstorage.setObject("formId", item.FormId);
                $rootScope.prepopRecords = [];
                $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS DisplayValues (recordId integer, displayFields text, taskId text,formId integer)").then(function(res) {});
                var query = 'SELECT * FROM DisplayValues WHERE formId=? AND taskId=?';
                $cordovaSQLite.execute(db, query, [item.FormId, item.TaskId]).then(function(res) {
                    if (res.rows.length == 0) {
                        $rootScope.noTaskFormrecords = true;
                    } else {
                        $rootScope.noTaskFormrecords = false;
                        for (var i = 0; i < res.rows.length; i++) {
                            var recordName = res.rows.item(i).displayFields;
                            var recordId = res.rows.item(i).recordId;
                            var taskId = res.rows.item(i).taskId;
                            var formId = res.rows.item(i).formId;
                            var dpvals=JSON.parse(recordName);
                            var splitted = dpvals[0].split(',');
                            first_item = splitted.shift();
                            rest_of_the_items = splitted.join(',');

                            assignedFormOfflineData.push({
                                recordName: JSON.parse(recordName) + [],
                                recordName1:first_item,
                                recordName2:rest_of_the_items,
                                recordId: recordId,
                                TaskId: taskId,
                                FormId: formId
                            });
                        }
                        console.log(assignedFormOfflineData);
                        $rootScope.prepopRecords = assignedFormOfflineData;
                        commonService.Loaderhide();
                        $state.transitionTo("app.taskformhistory");

                    }

                });
            },

            /*new added methods from task history controller*/
            /* online submitted records fetching*/
        $scope.TaskFormsHistory = function () {
        $scope.closeModal();
        commonService.LoaderShow(strings.loading);
        var item = setGetObj.getTaskHisotryForm();
        console.log(item);
//        $rootScope.formEllipse = true;
        $rootScope.hidecamera = true;
        $rootScope.hidebarcode = true;
        $rootScope.hidelocation = true;
        $rootScope.condition = true;
//        $scope.historyObjects = [];
          var items = [];
        if ($scope.status == true) {
            var url = config.url + "api/v1/formszDetails/" + item.formId + "/" + username + "/" + item.taskId;
           console.log(url);
            reassign.getTaskRecords(url, securityHeaders, function (response) {
                console.log(response);
                angular.forEach(response.data, function (res) {
                    var finalDisplay = "";
                    var flag = true;
                    angular.forEach(res.displayFields, function (value, key) {
                        if (res.displayFields.length == 1) {
                            items.push({
                                FormId : item.formId,
                                recordId : res.recordId,
                                FormValues : value.filedValue
                            });
                        } else {
                            flag = false;
                            if (key == 0) {
                                finalDisplay = finalDisplay + " " + value.filedValue;
                            } else if (value.filedValue != "") {
                                finalDisplay = finalDisplay + "<br/> " + value.filedValue;
                            } else {
                                finalDisplay = finalDisplay + value.filedValue;
                            }
                        }
                        if (key == res.displayFields.length - 1 && flag == false) {
                            items.push({
                                FormId : item.formId,
                                recordId : res.recordId,
                                FormValues : finalDisplay
                            });
                        }
                    });
                });
                commonService.Loaderhide();
                $rootScope.taskformOnlinehistoryObjects = items;
                $state.transitionTo("app.taskformOnlinehistory");
            });
        } else {
            alertService.showToast(strings.nonetworktoview);
        }
    },
    /* viewing the individual submitted record online*/
    $rootScope.ViewTaskFormRecord = function (item) {
        console.log(item);
        $rootScope.condition = true;
    //    $rootScope.submitButton = true;
        $rootScope.skeletonId = item.FormId;
        $rootScope.prepopDataShow = false;
        $rootScope.TaskData = false;
        var url = config.url + "api/v1/formszDetails/" + item.recordId;
        formsService.getRecords(url, securityHeaders, function (response) {
            console.log(response);
            var RecordValues = response.record;
            $rootScope.selectedFormRecordFields = {};
            angular.forEach(RecordValues, function (value, key) {
                angular.forEach(value, function (v, k) {
                    console.log(v);
                    console.log(k);
                    if(k.includes("timestamp")){
                        console.log("yes time exists");
                        console.log(response.updatedTime);
                        $rootScope.selectedFormRecordFields[k] =  $filter('date')(response.updatedTime, "d MMM y HH:mm"); 
                    }else{
                    $rootScope.selectedFormRecordFields[k] = v;
                    }

                });
            });
        });
        $rootScope.isGridRecodsShow = true;
        hidemapIcon = false;
        $state.transitionTo("app.viewForm");
    },
        $scope.syncAllTasksOnline = function (selection) {
        $ionicPopup.confirm({
            title : 'Confirmation',
            template : 'Submit the Selected Records?'
        }).then(function (res) {
            if (res) {
                /*if ($scope.selectedAll && selection == "") {
                    console.log("if loooop");
                    var query = "SELECT * FROM FormData_table WHERE FormStatus='false';";
                    $cordovaSQLite.execute(db, query).then(function (res) {
                        var url = config.url + "api/v1/formszDetails/create";
                        var len = res.rows.length;
                        console.log(len);
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
                                        commonService.Loaderhide();
                                        if (response.status == 200) {
                                            alertService.showToast("Submitted records : " + i);
                                            var query = "DELETE FROM FormData_table WHERE uniqueID=?";
                                            $cordovaSQLite.execute(db, query, [uid]).then(function (res) {
                                                if (i == len) {
                                            console.log("doneeeeeeeeeee deleted");
                                            //        $scope.refreshOfflineRecords();
                                            //        $scope.clearSelection();
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
                        //  commonService.Loaderhide();
                        alertService.doAlert(strings.submittedAll);
                        $state.transitionTo("app.taskformhistory");
                    }, function (err) {
                        alert(JSON.stringify(err));
                    });
                } else {
                    console.log("else looopppp");
                    $scope.syncOfflineForm(selection);
                }*/
                console.log("else looopppp");
                    $scope.syncOfflineForm(selection);
            }
        });
    },
    $scope.syncOfflineForm = function (item) {
        console.log(item);
           var url = config.url + "api/v1/formszDetails/create";
          var prepopUrl = config.url + "api/v1/formszDetails/" + recId;
            for (var i = 0; i < item.length; i++) {
                (function (x) {
                    var query = "SELECT * FROM FormData_table WHERE TaskId=? AND FormStatus='false';";
                    $cordovaSQLite.execute(db, query, [item[i]]).then(function (res) {
                        var obj = {};
                        var isValid = res.rows.item(0).isRequired;
                        var uid = res.rows.item(0).uniqueID;
                        var FormId = res.rows.item(0).FormId;
                        var FormStatus = res.rows.item(0).FormStatus;
                        var taskId = res.rows.item(0).TaskId;
                        var formvalues = res.rows.item(0).FormValues;
                        obj.taskId = taskId;
                        obj.formId = FormId;
                        obj.record = JSON.parse(formvalues).record;
                        obj.updatedBy = $localstorage.getObject("username");
                        if (isValid == "true") {
                            formsSave.saveForm(url, obj, securityHeaders, function (response) {

                                if (response.status == 200) {
                                    var query = "DELETE FROM FormData_table WHERE uniqueID=?";
                                    $cordovaSQLite.execute(db, query, [uid]).then(function (res) {
                                        $scope.getAssignedTasks();
                                        $scope.clearSelection();
                                    }, function (err) {
                                        alert(JSON.stringify(err));
                                    });
                                }
                            });
                        } else {
                            alertService.showToast("unable to submit few records as mandatory fields are not filled");
                        //    $scope.clearSelection();
                        }
                    }, function (err) {
                        alert(JSON.stringify(err));
                    });
                })(i);

            }
            for (var i = 0; i < item.length; i++) {
                (function (x) {
                    var query = "SELECT * FROM PrepopData_table WHERE taskId=? AND recordStatus='false';";
                    $cordovaSQLite.execute(db, query, [item[i]]).then(function (res) {
                        var obj = {};
                    //    var isValid = res.rows.item(0).isRequired;
                        var recordId = res.rows.item(0).recordId;
                        var FormId = res.rows.item(0).FormId;
                        var FormStatus = res.rows.item(0).recordStatus;
                        var taskId = res.rows.item(0).taskId;
                        var formvalues = res.rows.item(0).fieldValues;
                        var datenow = new Date();
                        console.log(formvalues);
                        obj.taskId = taskId;
                        obj.formId = FormId;
                        obj.record = JSON.parse(formvalues);
                        obj.updatedTime=datenow.toISOString();
                        obj.updatedBy = $localstorage.getObject("username");
                        obj.status = true;
                    //    if (isValid == "true") {
                            formsSave.saveReassignedForm(prepopUrl, obj, securityHeaders, function (response) {
                                if (response.status == 200) {
                                    var query = "DELETE FROM PrepopData_table WHERE recordId=?";
                                    $cordovaSQLite.execute(db, query, [recordId]).then(function (res) {
                                        $scope.getAssignedTasks();
                                        $scope.clearSelection();
                                    }, function (err) {
                                        alert(JSON.stringify(err));
                                    });
                                }
                            });
                        /*} else {
                            alertService.showToast("unable to submit few records as mandatory fields are not filled");
                        //    $scope.clearSelection();
                        }*/
                    }, function (err) {
                        alert(JSON.stringify(err));
                    });
                })(i);

            }

            //      $state.transitionTo("tabs.OfflineForms");
            alertService.doAlert(strings.submitted);
        //    $state.transitionTo("app.taskformhistory");

    //    }
    
    },

    $scope.checkRecord = function () {
            $scope.sync_header_option=false;
            $scope.selectCheckBox = true;
             $scope.selectAllCheckBox = false;
            $scope.taskMapAllowed = false;
    },
    $scope.clearSelection = function () {
        $scope.sync_header_option=true;
        $scope.selectCheckBox = false;
    },
    $scope.checkAll=function(){
        $scope.selectCheckBox = true;
        angular.forEach($scope.tasks, function (item) {
                $scope.toggleSelection(item.taskId);
        });
    },
    $scope.refreshItems = function() {
        $scope.status = commonService.checkConnection();
        if (filterBarInstance) {
            filterBarInstance();
            filterBarInstance = null;
        }
       if ($scope.status == true) {
            console.log("firstttt");
            $scope.getAssignedTasks();
        } else {
            console.log("offflineeeeeeeeeeeeeee");
            $scope.ShowDownloadedTasks();
        }

        $timeout(function() {
           if ($scope.status == true) {
            console.log("firstttt");
            $scope.getAssignedTasks();
        } else {
            console.log("offflineeeeeeeeeeeeeee");
            $scope.ShowDownloadedTasks();
        }

            $scope.$broadcast('scroll.refreshComplete');
        }, 1000);
    };
       
    });