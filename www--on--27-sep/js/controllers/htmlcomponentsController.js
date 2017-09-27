angular.module('starter.controllers')
.controller('formDetailsCtrl', function ($scope, $state, $ionicHistory, $rootScope, setGetObj, $ionicPopover, $ionicModal, $localstorage, config, alertService, $cordovaCamera, $cordovaBarcodeScanner, formsSave, formsService, commonService, $cordovaSQLite, strings) {
//	$scope.taskEllipse = false;
	securityHeaders.headers = commonService.securityHeaders();
	$scope.rating = {};
	$scope.recordInfo = {};
	$scope.filedId = "";
	$scope.readonlyFields = [];
	$scope.status = commonService.checkConnection();
 	var geocoder = new google.maps.Geocoder();
	if ($scope.status == true) {
		if($rootScope.TaskData){
			$scope.submitButton = false;
			$scope.saveButton = true;
		}else{
			$scope.submitButton = true;
			$scope.saveButton = true;
		}
	} else {
		$scope.saveButton = false;
		$scope.submitButton = true;
	}

	/*$ionicPopover.fromTemplateUrl('templates/popover.html', {
		scope : $scope
	}).then(function (popover) {
		$scope.popover = popover;
	});

	$ionicPopover.fromTemplateUrl('templates/ellipsePopover.html', {
		scope : $scope
	}).then(function (popover) {
		$scope.elipsePopover = popover;
	});

	$scope.openPopover = function ($event, id, index) {
		$scope.selectedImageIndex = index;
		$scope.selectedId = id;
		$scope.popover.show($event);
	};
	$scope.openellipsePopover = function () {
		$scope.elipsePopover.show();
	};
	$scope.closeellipsePopover = function () {
		$scope.elipsePopover.hide();
	};
	$scope.closePopover = function () {
		$scope.popover.hide();
	};

	//Cleanup the popover when we're done with it!
	$scope.$on('$destroy', function () {
		$scope.popover.remove();
	});*/

	$scope.fileds = {};
	$scope.Barcode = {};
	$scope.Location = {},
	$scope.selected = [];
	$scope.checkLength;

	$scope.toggleSelection = function (item, id) {
		var items = [];
		if ($scope.selected[id]) {
			var idx = $scope.selected[id].indexOf(item);
			if (idx > -1) {
				$scope.selected[id].splice(idx, 1);
			} else {
				if ($scope.selected[id].length >= 1) {
					angular.forEach($scope.selected[id], function (value, key) {
						items.push(value);
					})
				}
				items.push(item);
				$scope.selected[id] = items;
			}
		} else {
			items.push(item);
			$scope.selected[id] = items;
		}
		$scope.fileds[id] = $scope.selected[id];
	};
	$scope.isContains = function (collection, item) {
		if (collection.indexOf(item) != -1) {
			return true;
		} else {
			return false;
		}
	},

	$scope.saveForm = function (isValid, type) {
		commonService.LoaderShow(strings.submitting);
		commonService.getLatLong(function (geoLocation) {
			if (geoLocation.netstatus == "success") {
				$scope.lat = geoLocation.latlong[0];
				$scope.long = geoLocation.latlong[1];
			}
			if (geoLocation.netstatus == "error") {
				commonService.Loaderhide();
				alertService.showToast(geoLocation.message);
			}
			
			$scope.status = commonService.checkConnection();

			
			if ($rootScope.isGridRecodsShow == false) {
				var url = config.url + "api/v1/formszDetails/create";
				if (isValid) {
					$scope.prepareFormObject(function(obj,validation){
					commonService.LoaderShow(strings.submitting);
				if(validation==false){
					console.log(obj);
					formsSave.saveForm(url, obj, securityHeaders, function (response) {
						console.log(response);
						if (response.status == 203) {
							commonService.Loaderhide();
							alertService.doAlert(strings.invalidresponse);
						} else {
							$rootScope.signatureimage = "";
							commonService.Loaderhide();
							$state.transitionTo("app.taskformhistory");
							/*if ($rootScope.TaskData) {
								$state.transitionTo("app.taskformhistory");
							} else {
								$state.transitionTo("tabs.forms");
							}*/
							alertService.doAlert(strings.submitted);
						}
					});
				} else {
					commonService.Loaderhide();
				}
				});	
				} else {
					commonService.Loaderhide();
					alertService.doAlert(strings.fillMandetory);
				}
			} else {
				if (type == "submit") {
					if (isValid) {
						$scope.objectFormPreparationOffline(function(data,validation){
						if ($rootScope.isHistoryChecked == "reassign" || $rootScope.prepopDataShow) {
							var rarId = $localstorage.getObject("reassignedRecordId");
							var url = config.url + "api/v1/formszDetails/" + rarId;
							data.IsReassign = false;
							console.log(data);
							formsSave.saveReassignedForm(url, data, securityHeaders, function (response) {
								console.log(response);
								if (response.status == 204) {
									commonService.Loaderhide();
									alertService.doAlert(response.message);
								} else {
									$rootScope.signatureimage = "";
								//	if ($rootScope.prepopDataShow) {
										if($rootScope.submittedFrom=="list"){
											console.log("listtt");
										    $rootScope.$emit("CallParentMethod", {});
											alertService.doAlert(strings.submitted);
											commonService.Loaderhide();
										}if($rootScope.submittedFrom=="map"){
											console.log("mappppp");
											$ionicHistory.goBack();
											alertService.doAlert(strings.submitted);
	                                        commonService.Loaderhide();										
										}

									/* } else {
										alertService.doAlert(strings.submitted);
										$state.transitionTo("tabs.reasign");
									}*/
									

								}

							});
						} else {
							if(validation==false){
							var url = config.url + "api/v1/formszDetails/create";

							var recordId = $localstorage.getObject("offlineRecordId");
							console.log(data);
							formsSave.saveForm(url, data, securityHeaders, function (response) {
								console.log(response);
								if (response.status == 203) {
									commonService.Loaderhide();
									alertService.doAlert(strings.invalidresponse);
								} else {
									$rootScope.signatureimage = "";
									commonService.Loaderhide();
									if ($rootScope.TaskData) {
										$state.transitionTo("app.taskformhistory");
									} else {
										$state.transitionTo("app.history");
									}
									var query = 'DELETE FROM FormData_table WHERE FormId=? and uniqueID=? and TaskId=?';
									$cordovaSQLite.execute(db, query, [data.formId, recordId, data.taskId]).then(function (res) {});
									alertService.doAlert(strings.submitted);
								}
							});
						 }else{
							 commonService.Loaderhide();
							 alertService.doAlert(strings.fillMandetory);
						 }
						}
					});
					} else {
						commonService.Loaderhide();
						alertService.doAlert(strings.fillMandetory);
					}

				} else { // type
					console.log("enteredddd");
					$scope.saveOfflineForm(obj, type);
				}

			} // else loop

		});

	},
	$scope.prepareFormObject = function (callback) {
		var finalrecord = {};
		var obj = {};
		var breakCheck = false;
		var record = [];
		angular.forEach($scope.fields, function (value, key) {
			if (value.type.view == "group") {
				angular.forEach(value.type.fields, function (value, key) {
					var obvalue,
					fieldId;
					var obLabelkey = "";
					angular.forEach(value, function (value, key) {
						var inobj = {};
						var obkey;
						var keyflag = "";
						var valueflag = "";
						if (key == "id") {
							fieldId = value;
							if (value.indexOf("Image") > -1) {
								keyflag = "Image";
								var image = $scope.imgeasSet[$scope.recordInfo[value]]
									obvalue = image;
								valueflag = obvalue;
								finalrecord[fieldId] = obvalue;
							} else if (value.indexOf("Signature") > -1) {
								keyflag = "Image";
								var img = $scope.sign[$scope.recordInfo[value]];
								obvalue = img;
								valueflag = obvalue;
								finalrecord[fieldId] = obvalue;
							} else if (value.indexOf("Checkbox") > -1) {
								obvalue = $scope.fileds[value];
								finalrecord[fieldId] = obvalue;
							} else if (value.indexOf("Rating") > -1) {
								keyflag = "Rating";
								obvalue = document.getElementById(value).value;
								valueflag = obvalue;
								finalrecord[fieldId] = obvalue;
							} else {
								obvalue = $scope.recordInfo[value];
								finalrecord[fieldId] = obvalue;
							}
						}
						if (key == "lable") {
							obLabelkey = value;
						}
						if (key == "required" && keyflag == "Image" && value == true && valueflag == undefined) {
							commonService.Loaderhide();
							alertService.doAlert(strings.fillMandetory);
							breakCheck = true;
						}
						if (key == "required" && keyflag == "Signature" && value == true && valueflag == undefined) {
							commonService.Loaderhide();
							alertService.doAlert(strings.fillMandetory);
							breakCheck = true;
						}
					});
				});
			} else if (value.type.view == "section") {
				var obvalue,
				fieldId;
				var obkey;
				var keyflag = "";
				var valueflag = "";
				var obLabelkey = "";
				angular.forEach(value.type.fields, function (value, key) {
					if (value.type == "group") {
						angular.forEach(value.data.type.fields, function (value, key) {
							var obvalue,
							fieldId;
							var obLabelkey = "";
							angular.forEach(value, function (value, key) {

								var inobj = {};
								var obkey;
								var keyflag = "";
								var valueflag = "";

								if (breakCheck == false) {
									if (key == "id") {
										fieldId = value;
										if (value.indexOf("Image") > -1) {
											keyflag = "Image";
											var image = $scope.imgeasSet[$scope.recordInfo[value]];
											obvalue = image;
											valueflag = obvalue;

										} else if (value.indexOf("Signature") > -1) {
											keyflag = "Image";
											var img = $scope.sign[$scope.recordInfo[value]];
											obvalue = img;
											valueflag = obvalue;

										} else if (value.indexOf("Checkbox") > -1) {
											obvalue = $scope.fileds[value];
										} else if (value.indexOf("Rating") > -1) {
											keyflag = "Rating";
											obvalue = document.getElementById(value).value;
											valueflag = obvalue;

										} else {
											obvalue = $scope.recordInfo[value];
										}
									}

									if (key == "lable") {
										obLabelkey = value;
									}
									if (key == "required" && keyflag == "Image" && value == true && valueflag == undefined) {
										commonService.Loaderhide();
										alertService.doAlert(strings.fillMandetory);
										breakCheck = true;
									}
									if (key == "required" && keyflag == "Signature" && value == true && valueflag == undefined) {
										commonService.Loaderhide();
										alertService.doAlert(strings.fillMandetory);

										breakCheck = true;
									}
									if (key == "isPrimary") {
										if (obvalue == undefined) {
											finalrecord[fieldId] = "";
										} else {
											finalrecord[fieldId] = obvalue;
										}
									}
								}

							});
						});

					} else {
						angular.forEach(value.data, function (value, key) {
							var obkey;
							var keyflag = "";
							var valueflag = "";
							if (breakCheck == false) {
								if (key == "id") {
									fieldId = value;
									if (value.indexOf("Image") > -1) {
										keyflag = "Image";
										var image = $scope.imgeasSet[$scope.recordInfo[value]]
											obvalue = image;
										valueflag = obvalue;
									} else if (value.indexOf("Signature") > -1) {
										keyflag = "Image";
										var img = $scope.sign[$scope.recordInfo[value]];
										obvalue = img;
										valueflag = obvalue;
									} else if (value.indexOf("Checkbox") > -1) {
										obvalue = $scope.fileds[value];
									} else if (value.indexOf("Rating") > -1) {
										keyflag = "Rating";
										obvalue = document.getElementById(value).value;
										valueflag = obvalue;
									} else {
										obvalue = $scope.recordInfo[value];
									}
								}
								if (key == "lable") {
									obLabelkey = value;
								}
								if (key == "required" && keyflag == "Image" && value == true && valueflag == undefined) {
									commonService.Loaderhide();
									alertService.doAlert(strings.fillMandetory);
									breakCheck = true;
								}
								if (key == "required" && keyflag == "Signature" && value == true && valueflag == undefined) {
									commonService.Loaderhide();
									alertService.doAlert(strings.fillMandetory);
									breakCheck = true;
								}
								if (key == "isPrimary") {
									if (obvalue == undefined) {
										finalrecord[fieldId] = "";
									} else {
										finalrecord[fieldId] = obvalue;
									}
								}
							} //break false
						});
					}
				});
			} else {
				var obvalue,
				fieldId;
				var obkey;
				var keyflag = "";
				var valueflag = "";
				var obLabelkey = "";
				angular.forEach(value, function (value, key) {
					commonService.Loaderhide();
					if (breakCheck == false) {
						if (key == "id") {
							fieldId = value;
							if (value.indexOf("Image") > -1) {
								keyflag = "Image";
								var image = $scope.imgeasSet[$scope.recordInfo[value]]
									obvalue = image;
								valueflag = obvalue;
								finalrecord[fieldId] = obvalue;
							} else if (value.indexOf("Signature") > -1) {
								keyflag = "Image";
								var img = $scope.sign[$scope.recordInfo[value]];
								obvalue = img;
								valueflag = obvalue;
								finalrecord[fieldId] = obvalue;
							} else if (value.indexOf("Checkbox") > -1) {
								obvalue = $scope.fileds[value];
								finalrecord[fieldId] = obvalue;
							} else if (value.indexOf("Rating") > -1) {
								keyflag = "Rating";
								obvalue = document.getElementById(value).value;
								valueflag = obvalue;
								finalrecord[fieldId] = obvalue;
							}  else if (value.indexOf("Location") > -1) {
								keyflag = "Location";
								obvalue = $scope.lat+","+$scope.long;
								valueflag = obvalue;
								finalrecord[fieldId] = obvalue;
							} else {
								obvalue = $scope.recordInfo[value];
								finalrecord[fieldId] = obvalue;
							}

						}
						if (key == "lable") {
							obLabelkey = value;
						}
						if (key == "required" && keyflag == "Image" && value == true && valueflag == undefined) {
							commonService.Loaderhide();
							alertService.doAlert(strings.fillMandetory);
							breakCheck = true;
						}
						if (key == "required" && keyflag == "Signature" && value == true && valueflag == undefined) {

							commonService.Loaderhide();
							alertService.doAlert(strings.fillMandetory);

							breakCheck = true;
						}

					} //break false

				});
			}
		}); // for loop $scope.field.length
		var arryfinal = [];

		arryfinal.push(finalrecord);
		obj.record = arryfinal;
		obj.lat = $scope.lat;
		obj.long = $scope.long;
		var datenow = new Date();
        var isoDate = datenow.toISOString();
		obj.updatedTime = isoDate;
		if (breakCheck == false) {
			$scope.formId = $localstorage.getObject("formId");
			obj.formId = $scope.formId;
			if ($rootScope.TaskData) {
				obj.taskId = $localstorage.getObject("TaskId");
			} else {
				obj.taskId = "form";
			}
			obj.updatedBy = $localstorage.getObject("username");

		}
		commonService.Loaderhide();
		callback(obj,breakCheck);
	},
	$scope.getLocation = function ( index,id) {
     commonService.LoaderShow(strings.pleasewait);
     $scope.locationIndex = index;
        // if ($scope.selectedFormRecordFields[id] == undefined || $scope.selectedFormRecordFields[id] == "") {
   //	if ($scope.status == true) {
     commonService.getLatLong(function (geoLocation) {
        if (geoLocation.netstatus == "success") {
         var lat = geoLocation.latlong[0];
         var long = geoLocation.latlong[1];
         var latlons = lat+","+long;
         var latlngStr = latlons.split(',', 2);
           var latlng = {lat: parseFloat(latlngStr[0]), lng: parseFloat(latlngStr[1])};
           $scope.latLong= lat + " , " + long;
        	if ($scope.status == true) {
           geocoder.geocode({'location': latlng}, function(results, status) {
          console.log(results);
          console.log(status);
          if (status === 'OK') {
            $scope.addressIn = results[0].formatted_address;
            if ($scope.recordInfo) {
                $scope.recordInfo[id] = results[0].formatted_address;
            }
            if ($scope.selectedFormRecordFields) {
               $scope.selectedFormRecordFields[id] = results[0].formatted_address;
            }
           }
         });
         }  // network check
         commonService.Loaderhide();
       }
         if (geoLocation.netstatus == "error") {
         	console.log("entereddd into errorrr");
          commonService.Loaderhide();
          alertService.showToast(geoLocation.message);
       }
     });
   // }
   },
	$scope.takePicture = function (id) {
		$scope.popover_hide = false;
		var options = {
			quality : 100,
			destinationType : Camera.DestinationType.DATA_URL,
			sourceType : Camera.PictureSourceType.CAMERA,
			allowEdit : false,
			encodingType : Camera.EncodingType.JPEG,
			targetWidth : 900,
			targetHeight : 900

		};

		$cordovaCamera.getPicture(options).then(function (imageData) {
			$scope.imgURI = "data:image/jpeg;base64," + imageData;
			//		$scope.imgeasSet[$scope.selectedImageIndex] = $scope.imgURI;
			$scope.imgeasSet[id] = $scope.imgURI;
			$scope.closePopover();
            $scope.getDirection(function(){
				$scope.getAccurateDirection();
			});
		}, function (err) {
			$scope.closePopover();
		});
	},
	$scope.choosePhoto = function (id) {
		$scope.popover_hide = false;
		var options = {
			quality : 100,
			destinationType : Camera.DestinationType.DATA_URL,
			sourceType : Camera.PictureSourceType.PHOTOLIBRARY,
			allowEdit : false,
			encodingType : Camera.EncodingType.JPEG,
			targetWidth : 900,
			targetHeight : 900,
			popoverOptions : CameraPopoverOptions,
			saveToPhotoAlbum : false
		};

		$cordovaCamera.getPicture(options).then(function (imageData) {
			$scope.imgURI = "data:image/jpeg;base64," + imageData;
			//			$scope.imgeasSet[$scope.selectedImageIndex] = $scope.imgURI;
			$scope.imgeasSet[id] = $scope.imgURI;
			$scope.closePopover();
		}, function (err) {
			$scope.closePopover();
		});
	},
	$scope.scanBarcode = function (index, id) {
		$scope.barCodeIndex = index;
		$cordovaBarcodeScanner.scan().then(function (imageData) {
			$scope.codeURI = imageData.text;
			//			$scope.Barcode[$scope.barCodeIndex] = $scope.codeURI;
			$scope.Barcode[id] = $scope.codeURI;
			if ($scope.selectedFormRecordFields)
				$scope.selectedFormRecordFields[id] = $scope.Barcode[id];
		}, function (error) {});
	},
	$scope.back = function () {
		$ionicHistory.goBack();
	},
	$scope.closesigPopup = function () {
		$scope.closePopover();
	},
	$scope.imageToDataUri = function (img, width, height) {
		var sourceImage = new Image();
		sourceImage.src = img;
		// create an off-screen canvas
		var canvas = document.createElement('canvas'),
		ctx = canvas.getContext('2d');

		// set its dimension to target size
		canvas.width = width;
		canvas.height = height;

		// draw source image into the off-screen canvas:
		ctx.drawImage(sourceImage, 0, 0, width, height);

		// encode image to data-uri with base64 version of compressed image
		return canvas.toDataURL();
	},
	$scope.openSignatureModal = function ($event, index, id) {

		$scope.signIndex = index;
		$ionicPopover.fromTemplateUrl('templates/signature.html', {
			scope : $scope,
			"backdropClickToClose" : false
		}).then(function (popover) {
			$scope.sigpopover = popover;
			$scope.sigpopover.show($event);
			var canvas = document.getElementById('signatureCanvas');
			var context = canvas.getContext('2d');

			window.setTimeout(function () {
				var signaturePad = new SignaturePad(canvas);
				$scope.closePopover = function () {
					$scope.sigpopover.remove();
				};
				$scope.clearCanvas = function () {
					signaturePad.clear();
				}
				$scope.saveCanvas = function () {
					if (signaturePad.isEmpty()) {
						signaturePad.clear();
					} else {
						var sigImg = signaturePad.toDataURL();
						var smallsig = $scope.imageToDataUri(sigImg, 100, 60);

						$scope.signatureimage = smallsig;
						//						$scope.sign[$scope.signIndex] = $scope.signatureimage;
						$scope.sign[id] = $scope.signatureimage;
						signaturePad.clear();
						context.clearRect(0, 0, canvas.width, canvas.height);
						delete signaturePad;
						$scope.sigpopover.remove();
					}
				}
			}, 300);
		});
		var flag = false;
		$scope.$on('popover.removed', function () {
			flag = true;
		});
		var clearSigPad = function () {
			$scope.sigpopover.remove();
		};
		$scope.$on('popover.hidden', function () {
			if (flag == false) {
				clearSigPad();
			}
			return;
		});
	},
	$scope.convertToDate = function (date) {
		if (date == null) {
			return "";
		} else {
			return new Date(date);
		}
	},

	$scope.objectFormPreparationOffline = function (callback) {
		console.log("/////////////////////////////////////////////");
		var valueObject = {};
		var keyflag;
		var requiredField;
		var arryfinal = [];
		var obvalue,
		fieldId;
		var breakLoop = false;
		var obkey;
		var inobj = {};
		angular.forEach($scope.fields, function (value, key) {
			requiredField = value.required;

			if (value.type.view == "group") {
				angular.forEach(value.type.fields, function (v, k) {
					fieldId = v.id;
					angular.forEach($scope.selectedFormRecordFields, function (obvalue, obkey) {
						if (breakLoop == false) {
							if (obkey == fieldId) {
								if (v.type.view == "camera") {
									//			if (value.indexOf("Image")) {
									keyflag = "camera";
									var objLen = Object.keys($scope.imgeasSet).length;
									if (objLen == 0) {
										inobj[fieldId] = obvalue;
									} else {
										obvalue = $scope.imgeasSet[fieldId];
										inobj[fieldId] = obvalue;
									}
								} else if (v.type.view == "sign") {
									var objLen = Object.keys($scope.sign).length;
									if (objLen == 0) {
										inobj[fieldId] = obvalue;
									} else {
										obvalue = $scope.sign[fieldId];
										inobj[fieldId] = obvalue;
									}
								} else if (v.type.view == "checkbox") {
									var objLen = Object.keys($scope.fileds).length;
									if (objLen == 0) {
										inobj[fieldId] = obvalue;
									} else {
										objvalue = $scope.fileds[value.id];
										inobj[fieldId] = objvalue;
									}
								} else if (v.type.view == "barcode") {
									var objLen = Object.keys($scope.Barcode).length;
									if (objLen == 0) {
										inobj[fieldId] = obvalue;
									} else {
										obvalue = $scope.Barcode[fieldId];
										inobj[fieldId] = obvalue;
									}
								} else if (v.type.view == "rating") {
									obvalue = document.getElementById(v.id).value;
									inobj[fieldId] = obvalue;
								} else {
									inobj[fieldId] = obvalue;

								}

								if (requiredField == true && inobj[fieldId] == null) {
									commonService.Loaderhide();
									alertService.doAlert(strings.fillMandetory);
									breakLoop = true;
								}
							} // obkey=feildId
						} //break loop
					});
				});

			} else if (value.type.view == "section") {

				angular.forEach(value.type.fields, function (v, k) {

					if (v.data.type.view == "group") {
						angular.forEach(v.data.type.fields, function (fieldObject, fieldkey) {
							fieldId = fieldObject.id;
							angular.forEach($scope.selectedFormRecordFields, function (obvalue, obkey) {
								if (breakLoop == false) {
									if (obkey == fieldId) {
										if (v.type.view == "camera") {
											keyflag = "camera";
											var objLen = Object.keys($scope.imgeasSet).length;
											if (objLen == 0) {
												inobj[fieldId] = obvalue;
											} else {
												obvalue = $scope.imgeasSet[fieldId];
												inobj[fieldId] = obvalue;
											}
										} else if (v.type.view == "sign") {
											var objLen = Object.keys($scope.sign).length;
											if (objLen == 0) {
												inobj[fieldId] = obvalue;
											} else {
												obvalue = $scope.sign[fieldId];
												inobj[fieldId] = obvalue;
											}
										} else if (v.type.view == "checkbox") {
											var objLen = Object.keys($scope.fileds).length;
											if (objLen == 0) {
												inobj[fieldId] = obvalue;
											} else {
												objvalue = $scope.fileds[value.id];
												inobj[fieldId] = objvalue;
											}
										} else if (v.type.view == "barcode") {
											var objLen = Object.keys($scope.Barcode).length;
											if (objLen == 0) {
												inobj[fieldId] = obvalue;
											} else {
												obvalue = $scope.Barcode[fieldId];
												inobj[fieldId] = obvalue;
											}
										} else if (v.type.view == "rating") {
											obvalue = document.getElementById(value.id).value;
											inobj[fieldId] = obvalue;
										} else {
											inobj[fieldId] = obvalue;

										}

										if (requiredField == true && inobj[fieldId] == null) {
											commonService.Loaderhide();
											alertService.doAlert(strings.fillMandetory);
											breakLoop = true;
										}
									} // obkey=feildId
								} //break loop
							});
						});
					} else {
						fieldId = v.data.id;
						angular.forEach($scope.selectedFormRecordFields, function (obvalue, obkey) {
							if (breakLoop == false) {
								if (obkey == fieldId) {
									if (v.type.view == "camera") {
										keyflag = "camera";
										var objLen = Object.keys($scope.imgeasSet).length;
										if (objLen == 0) {
											inobj[fieldId] = obvalue;
										} else {
											obvalue = $scope.imgeasSet[fieldId];
											inobj[fieldId] = obvalue;
										}
									} else if (v.type.view == "sign") {
										var objLen = Object.keys($scope.sign).length;
										if (objLen == 0) {
											inobj[fieldId] = obvalue;
										} else {
											obvalue = $scope.sign[fieldId];
											inobj[fieldId] = obvalue;
										}
									} else if (v.type.view == "checkbox") {
										var objLen = Object.keys($scope.fileds).length;
										if (objLen == 0) {
											inobj[fieldId] = obvalue;
										} else {
											objvalue = $scope.fileds[value.id];
											inobj[fieldId] = objvalue;
										}
									} else if (v.type.view == "barcode") {
										var objLen = Object.keys($scope.Barcode).length;
										if (objLen == 0) {
											inobj[fieldId] = obvalue;
										} else {
											obvalue = $scope.Barcode[fieldId];
											inobj[fieldId] = obvalue;
										}
									} else if (fieldObject.type.view == "rating") {
										obvalue = document.getElementById(fieldObject.id).value;
										inobj[fieldId] = obvalue;
									} else {
										inobj[fieldId] = obvalue;

									}

									if (requiredField == true && inobj[fieldId] == null) {
										commonService.Loaderhide();
										alertService.doAlert(strings.fillMandetory);
										breakLoop = true;
									}
								} // obkey=feildId
							} //break loop
						});
					}
				});
			} else {
				fieldId = value.id;
				angular.forEach($scope.selectedFormRecordFields, function (obvalue, obkey) {

					if (breakLoop == false) {
						if (obkey == fieldId) {
							if (value.type.view == "camera") {
								keyflag = "camera";
								var objLen = Object.keys($scope.imgeasSet).length;
								if (objLen == 0) {
									inobj[fieldId] = obvalue;
								} else {
									obvalue = $scope.imgeasSet[fieldId];
									inobj[fieldId] = obvalue;
								}
							} else if (value.type.view == "sign") {
								var objLen = Object.keys($scope.sign).length;
								if (objLen == 0) {
									inobj[fieldId] = obvalue;
								} else {
									obvalue = $scope.sign[fieldId];
									inobj[fieldId] = obvalue;
								}
							} else if (value.type.view == "checkbox") {
								var objLen = Object.keys($scope.fileds).length;
								if (objLen == 0) {
									inobj[fieldId] = obvalue;
								} else {
									objvalue = $scope.fileds[value.id];
									inobj[fieldId] = objvalue;
								}
							} else if (value.type.view == "barcode") {
								var objLen = Object.keys($scope.Barcode).length;
								if (objLen == 0) {
									inobj[fieldId] = obvalue;
								} else {
									obvalue = $scope.Barcode[fieldId];
									inobj[fieldId] = obvalue;
								}
							} else if (value.type.view == "rating") {
								obvalue = document.getElementById(value.id).value;
								inobj[fieldId] = obvalue;
							} else if (value.type.view == "map") {
											obvalue = $scope.lat+","+$scope.long;
											inobj[fieldId] = obvalue;
							} else {
								console.log("ppppppppppppppppppppppppp");
								inobj[fieldId] = obvalue;

							}

							if (requiredField == true && inobj[fieldId] == null) {
								commonService.Loaderhide();
								alertService.doAlert(strings.fillMandetory);
								breakLoop = true;
							}
						} // obkey=feildId
					} //break loop
				});
			}

		});
		if (breakLoop == false) {
			arryfinal.push(inobj);
			$scope.formId = $localstorage.getObject("formId");
			valueObject.record = arryfinal;
			valueObject.formId = $scope.formId;
			if ($rootScope.TaskData) {
				valueObject.taskId = $localstorage.getObject("TaskId");
			} else {
				valueObject.taskId = "form";
			}
			valueObject.lat = $scope.lat;
		    valueObject.long = $scope.long;
			var datenow = new Date();
            var isoDate = datenow.toISOString();
			valueObject.updatedTime = isoDate;
			valueObject.updatedBy = $localstorage.getObject("username");
			valueObject.status = true;
		}
		console.log(valueObject);
		callback(valueObject,breakLoop);
	},

	$scope.saveOfflineForm = function (isValid, type) {

		var formId = $localstorage.getObject("formId");
		var userId = $localstorage.getObject("userId");
		var recordId = $localstorage.getObject("offlineRecordId");
		commonService.LoaderShow(strings.saving);
		$cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS FormData_table(uniqueID integer primary key autoincrement,FormId integer,userId integer ,FormValues text,FormStatus text,TaskId text,recordId text,isRequired text)').then(function (res) {}, function (err) {
			alert(JSON.stringify(err));
		});
		var query = 'SELECT * FROM FormData_table WHERE FormId=? AND userId=?';
		$cordovaSQLite.execute(db, query, [formId, userId]).then(function (res) {
			var len = res.rows.length;
			var query
			if ($rootScope.isView) {
				var obj = $scope.prepareFormObject(function(obj,validation){
				var values = JSON.stringify(obj);
				query = 'INSERT INTO FormData_table (FormId,userId, FormValues,FormStatus,TaskId,recordId,isRequired) VALUES (?,?,?,?,?,?,?)';
				$cordovaSQLite.execute(db, query, [obj.formId, userId, values, "false", obj.taskId, "", isValid]).then(function (res) {
					$state.transitionTo("app.taskformhistory");
					/*if ($rootScope.TaskData) {
						$state.transitionTo("app.taskformhistory");
					} else {
						$state.transitionTo("app.history");
					}*/
					alertService.doAlert(strings.formSaved);
					commonService.Loaderhide();

				}, function (e) {
					alert("error " + JSON.stringify(e));
				});

			});	
			} else {
				$scope.objectFormPreparationOffline(function (valueObject, isFailed) {
					if (!isFailed) {
				//		var breakLoop = false;
				//		if (breakLoop == false) {
						//	console.log("am going");
						//	if ($rootScope.isGridRecodsShow) {
						//		console.log("am not going..");
							//	if ($scope.status == true) {
									/*if ($rootScope.isHistoryChecked == false) {
										var recordId = $localstorage.getObject("offlineRecordId");
										var updatedValues = JSON.stringify(valueObject);
										var query = "UPDATE FormData_table SET FormValues=? ,isRequired=? where uniqueID=? ";

										$cordovaSQLite.execute(db, query, [updatedValues, isValid, recordId]).then(function (res) {
											if ($rootScope.TaskData) {
												$state.transitionTo("app.taskformhistory");
											} else {
												$state.transitionTo("app.history");
											}
											alertService.doAlert(strings.formupdated);
											commonService.Loaderhide();
										}, function (e) {
											alert("error update " + JSON.stringify(e));
										});
									} else {

										var recordId = $localstorage.getObject("offlineRecordId");

										var updatedValues = JSON.stringify(valueObject.record);
										var query = "UPDATE FormData_table SET FormValues=? ,isRequired=? where recordId=?";
										$cordovaSQLite.execute(db, query, [updatedValues, isValid, recordId]).then(function (res) {
											$state.transitionTo("tabs.reasign");
											alertService.doAlert(strings.formupdated);
											commonService.Loaderhide();
										}, function (e) {
											alert("error update " + JSON.stringify(e));
										});
									}
									//	} //
								} else {*/
								//	console.log("poffflineeeeeeeeee");
									/*if ($rootScope.offlineReData) {
										console.log("ammmmmmmmmm");
										var recordId = $localstorage.getObject("offlineRecordId");
										var formID = $localstorage.getObject("formId");
										var updatedValues = JSON.stringify(valueObject.record);
										var query = "UPDATE FormData_table SET FormValues=? ,isRequired=? where uniqueID=? AND FormId=?";
										$cordovaSQLite.execute(db, query, [updatedValues, isFailed, recordId, formID]).then(function (res) {
											
											$state.transitionTo("tabs.reasign");
											alertService.doAlert(strings.formupdated);
											commonService.Loaderhide();
										}, function (e) {
											alert("error update " + JSON.stringify(e));
										});
									} else */if ($rootScope.prepopDataShow) {
										console.log("ammmmmmmmmmyyyyyyyyyyyyyyyyyyyyyyy");
										console.log(valueObject);
										var recordId = $localstorage.getObject("offlineRecordId");
										var updatedValues = JSON.stringify(valueObject.record);
										var query = "UPDATE PrepopData_table SET fieldValues=? recordStatus=? where recordId=?";
										$cordovaSQLite.execute(db, query, [updatedValues,"true", recordId]).then(function (res) {

											$state.transitionTo("app.taskformhistory");
											alertService.doAlert(strings.formupdated);
											commonService.Loaderhide();
										}, function (e) {
											alert("error update " + JSON.stringify(e));
										});
									} else {
										console.log("arrrrrrrrrrrrrrrrrrrrrrrm");
										var recordId = $localstorage.getObject("offlineRecordId");
										var updatedValues = JSON.stringify(valueObject);
										var query = "UPDATE FormData_table SET FormValues=?,isRequired=? where uniqueID=?";
										$cordovaSQLite.execute(db, query, [updatedValues, isValid, recordId]).then(function (res) {
												$state.transitionTo("app.taskformhistory");
											/*if ($rootScope.TaskData) {
												$state.transitionTo("app.taskformhistory");
											} else {
												$state.transitionTo("app.history");
											}*/
											alertService.doAlert(strings.formupdated);
											commonService.Loaderhide();
										}, function (e) {
											alert("error update " + JSON.stringify(e));
										});
									}
					//			} //offline else
					//		}// is grid record show

					//	} // breakloop
					}
				});
			}
		}, function (e) {
			alert("error " + JSON.stringify(e));
		});
	};

	$scope.getBarcode = function (barcode) {
		return barcode;
	};
	$scope.openMap = function () {
		$rootScope.NavigatedFrom = "form";
		$state.go("app.map");
	};

	$scope.isDependentField = function (fieldId) {
	/*	console.log("uuuuuuuuuuuuu");
		console.log(fieldId);*/
	if ($scope.status == true) {
		if ($scope.dependentFields.indexOf(fieldId) != -1) {
			return true
		} else {
			return false

		}
	}else{
		return false
	}
	}

	$scope.isReadonlyDependField = function (fieldId) {

		if($scope.readonlyFields !=undefined || $scope.readonlyFields.length!=0)
		  { 

		   if ($scope.readonlyFields.indexOf(fieldId) != -1) {
			return true
		   } else {
			return false

		   }
		  }

	}
	$scope.clickedme = function (data) {}
	$scope.getRadioButtonInfo = function (selectedOption, avilableOptions) {}
		$scope.getExistOptionDerivedField = function(selectedOption,allOptions)
	{
		
		$scope.getDropDownInfo(selectedOption,allOptions);
	}
	$scope.getDropDownInfo = function (selectedOption, avilableOptions) {

		angular.forEach(avilableOptions, function (option, index) {
			if (option.lable == selectedOption) {

				angular.forEach(option.dependFields, function (dependFields, logicType) {
					if (logicType == "Show") {
						angular.forEach(dependFields, function (dependField, index) {
							var currentIndex = $scope.dependentFields.indexOf(dependField.id);
							$scope.dependentFields.splice(currentIndex, 1);

						})
					} else if (logicType == "Hide") {
						angular.forEach(dependFields, function (dependField, index) {
							if ($scope.dependentFields.indexOf(dependField.id) == -1)
								$scope.dependentFields.push(dependField.id);

						})
					} else if (logicType == "Readonly") {

						angular.forEach(dependFields, function (dependField, index) {
							var currentIndex = $scope.dependentFields.indexOf(dependField.id);
							$scope.dependentFields.splice(currentIndex, 1);
							if ($scope.dependentFields.indexOf(dependField.id) == -1)
								$scope.readonlyFields.push(dependField.id);

						})

					}

				})
			} else {

				if (option.dependFields == undefined) {
					angular.forEach(option.dependFields, function (dependFields, logicType) {
						if (logicType == "Show") {
							angular.forEach(dependFields, function (dependField, index) {
								//var currentIndex = $scope.dependentFields.indexOf(dependField.id);
								if ($scope.dependentFields.indexOf(dependField.id) == -1)
									$scope.dependentFields.push(dependField.id);

							})
						} else if (logicType == "Hide") {
							angular.forEach(dependFields, function (dependField, index) {
								if ($scope.dependentFields.indexOf(dependField.id) == -1)
									$scope.dependentFields.push(dependField.id);

							})
						}
						
					})
				}

			}
		})
	}
	$scope.getformSkeleton = function () {
		commonService.LoaderShow(strings.loading);
		$scope.status = commonService.checkConnection();
		if ($scope.status == true) {
			var itemId = $rootScope.skeletonId;
			var url = config.url + "api/v1/formsz/" + itemId;
			formsService.navigateToForms(url, securityHeaders, function (status, response) {
				console.log(response);
				$scope.dependentFields = response.dependentFields;
				if (response.isAllowMap === true) {
					$scope.mapAllowed = true;
				}
				commonService.LoaderShow(strings.loading);
				if (status) {
					var obj = {};
					obj["formId"] = response._id;
					obj["formSkeleton"] = response.FormSkeleton;
					formskeletonStorage.push(obj);
					$scope.formSkeleton = response.FormSkeleton;
					$scope.formId = response._id;
					$localstorage.setObject("formId", $scope.formId);
					$localstorage.setObject("data", $scope.formSkeleton);
					if ($scope.status == true) {
						$scope.obj = $localstorage.getObject("data");
					} else {
						$scope.obj = $localstorage.getObject("offlineData");
					}
					$scope.fields = $scope.obj;
					window.setTimeout(function () {
						commonService.Loaderhide();
					}, 600);
				}
			});
		} else {
			$scope.obj = $localstorage.getObject("offlineData");
			try {
				$scope.fields = JSON.parse($scope.obj);
			} catch (err) {
				$scope.fields = $scope.obj;
			}
			commonService.Loaderhide();
		}
	};
	/*	var initLoadFormsSkeleton = function () {
	$scope.getformSkeleton();
	};
	initLoadFormsSkeleton();*/

})
