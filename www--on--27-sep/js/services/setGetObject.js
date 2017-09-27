angular.module('starter.services')
.service('setGetObj', function (alertService) {
	var formsData;
	var taskformsData;
	var historyData;
	var formObject;
	var formSkeleton;
	var prepopArray = [];
	// var FormNamesarray=[];
	return {
		setHisotryForm : function (formData) {
			formsData = formData;
		},
		getHisotryForm : function () {
			return formsData;
		},
		setNotificationItem : function (formData) {
			formsData = formData;
		},
		getNotificationItem : function () {
			return formsData;
		},
		setHistoryOfForms : function (item) {
			historyData = item;
		},

		getHistoryOfForms : function () {
			return historyData;
		},
		setFormObject : function (item) {
			formObject = item;
		},

		getFormObject : function () {
			return formObject;
		},
		setTaskHisotryForm : function (taskFormData) {
			taskformsData = taskFormData;
		},
		getTaskHisotryForm : function () {
			return taskformsData;
		},
		licenseValidation : function (response) {
			if (response.status == 202) {
				alertService.doAlert("Your license has expired, please contact your admin");
			}
		}
		/*,
		setTaskHistoryArray:function(prepopArray){
		prepopArray=prepopArray;
		},
		getTaskHistoryArray:function(){
		return prepopArray;
		}*/
		/*setFormSkeleton:function(skeleton){
		formSkeleton=skeleton;
		},
		getFormSkeleton:function(){
		return formSkeleton;
		}*/
		/*setFormNamesArray:function(FormNames){
		FormNamesarray=FormNames;
		},
		getFormNamesArray:function(){
		return FormNamesarray;
		}*/
	}
});