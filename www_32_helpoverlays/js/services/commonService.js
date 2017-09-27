angular.module('starter.services')
    .service('commonService', function(alertService, $localstorage, $cordovaGeolocation, $ionicLoading) {

        return {
            securityHeaders: function() {
                return {
                    "Content-Type": "application/json",
                    "X-Access-Token": $localstorage.getObject("token"),
                    "X-Key": $localstorage.getObject("username")
                }
            },



            LoaderShow: function(text) {
                $ionicLoading.show({
                    template: text
                });
            },
            Loaderhide: function() {
                $ionicLoading.hide();
            },
            updateNetworkStatus: function(network) {
                networkstatus = network;
            },
            checkloginConnection: function() {
                var online = navigator.onLine;
                if (online === true) {
                    settingsNetworkStatus = true;
                }
                if (online === false) {
                    settingsNetworkStatus = false;
                }
                return settingsNetworkStatus;
            },
            checkSettingsConnection: function() {
                return settingsNetworkStatus;
            },
            checkConnection: function() {

                return networkstatus;
            },
            responseValidation: function(response) {
                if (response.status == 202) {
                    return response.message;
                }
                if (response.status == 204) {
                    return response.message;
                }
            },

            getLatLong: function(callback) {

                var posOptions = {
                    timeout: 10000,
                    enableHighAccuracy: true,
                    maximumAge: 0
                };
                $cordovaGeolocation
                    .getCurrentPosition(posOptions)
                    .then(function(position) {
                        var successResponse = {};
                        var arr = [];
                        arr.push(position.coords.latitude);
                        arr.push(position.coords.longitude);
                        successResponse.netstatus = "success";
                        successResponse["latlong"] = arr;

                        callback(successResponse);
                    }, function(err) {
                        var errorResponse = {};
                        errorResponse.netstatus = "error";
                        errorResponse.message = "Please enable location service in your device";
                        /* if (window.cordova) {
                            cordova.plugins.diagnostic.isLocationEnabled(function(enabled) {
                                if (enabled == false) {
                                    cordova.plugins.diagnostic.switchToLocationSettings();
                                } else {

                                }
                            }, function(error) {
                                alert("The following error occurred: " + error);
                            });
                        } */
                        callback(errorResponse);
                    });

            }

        }
    });