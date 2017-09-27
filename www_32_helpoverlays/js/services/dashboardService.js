angular.module('starter.services')
    .service('dashboardService', function($http, alertService, commonService) {
        return {
            listOfForms: function(url, headers, cb) {
                $http.get(url, headers)

                    .success(function(res, status) {
                        cb(res);
                    })
                    .error(function(err) {
                        commonService.Loaderhide();
                    });

            },
            dashboardStatistics : function (url, headers, cb) {
                $http.get(url,headers)

                .success(function (res, status) {
                    cb(res);
                })
                .error(function (err) {
                    commonService.Loaderhide();
                });

            },
            notifyService : function (url, headers, cb) {
                $http.get(url,headers)

                .success(function (res, status) {
                    cb(res);
                })
                .error(function (err) {
                    commonService.Loaderhide();
                });

            }


        }

    });