var db;
var securityHeaders = {};
var formskeletonStorage = [];
var networkstatus = true;
var toggleStatus = true;
var formids = [];

//var settingsNetworkStatus;
//var onlineTabs;
// Ionic Starter App
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'leaflet-directive', 'starter.controllers', 'ionic-material', 'ionMdInput', 'starter.services', 'constants', 'messages', 'directives', 'jett.ionic.filter.bar', 'ngCordova', 'ionic.rating', 'ion.rangeslider','angular-svg-round-progressbar'])
    .run(function($state,$rootScope,$timeout, $ionicPlatform, $ionicPopup, $cordovaSQLite, $cordovaStatusbar, commonService,$localstorage) {
        $rootScope.$on('$stateChangeStart', function(event, toState, toStateParams){
            if(toState.name=="app.login"){
                var loginStatus = $localstorage.getObject("loggedIn");
                if(loginStatus==true){
                    $timeout(function() {
                        event.preventDefault(); // stop current execution
                        $state.go('tabs.dashboard');
                //    $state.go('tabs.assignedtasks');
                    },300);
                }
                if(loginStatus==false){
                    $timeout(function() {
                        $state.go('app.login');
                    },300);
                }
            }   
        });
        $ionicPlatform.ready(function() {

            // document.addEventListener("deviceready", function() {
            //     if ($localstorage.getObject("username") !== null && $localstorage.getObject("password") !== null) {
            //         $state.go('tabs.dashboard');
            //     } else {
            //         $state.go('app.login');
            //     }
            // }, false);
            
            /* Back Button handle */
            $ionicPlatform.registerBackButtonAction(function(event) {
                commonService.Loaderhide();
                if ($state.current.name == "app.viewForm") {}
                event.preventDefault();
            }, 100);

            /* Listen to network status */
            document.addEventListener("offline", onOffline, false);
            document.addEventListener("online", onOnline, false);

            function onOnline() {
                // Handle the online event
                commonService.updateNetworkStatus(true);
            }

            function onOffline() {
                // Handle the offline event
                commonService.updateNetworkStatus(false);
            }
            //navigator.splashscreen.hide();
            try {
                $cordovaStatusbar.styleHex('#595d65');
            } catch (err) {
                alert(err);
            }

            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
            }

            if (window.cordova && window.cordova.logger) {
                window.cordova.logger.__onDeviceReady();
            }

            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
            if (window.cordova) {
                db = $cordovaSQLite.openDB({
                    name: "OfflineDB.db",
                    location: 'default'
                }); //device
            } else {
                db = window.openDatabase("my.db", '1', 'my', 1024 * 1024 * 100); // browser

            }

        });
    })
    .directive('focusMe', function($timeout, $parse) {
        return {
            link: function(scope, element, attrs) {
                var model = $parse(attrs.focusMe);
                scope.$watch(model, function(value) {
                    if (value === true) {
                        $timeout(function() {
                            element[0].focus();
                        });
                    }
                });
                element.bind('blur', function() {
                    scope.$apply(model.assign(scope, false));
                })
            }
        };
    })
    .config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider, $ionicFilterBarConfigProvider, $httpProvider) {
        $httpProvider.interceptors.push(function($q) {
            return {
                responseError: function(rejection) {
                    if (rejection.status <= 0) {
                        return $q.reject(rejection);
                    }
                    return $q.reject(rejection);
                }
            };
        });
        $ionicConfigProvider.views.transition('none');
        // Turn off caching for demo simplicity's sake
        $ionicConfigProvider.views.maxCache(0);
        /*
        // Turn off back button text
        $ionicConfigProvider.backButton.previousTitleText(false);
         */
        $stateProvider.state('app', {
                url: '/app',
                abstract: true,
                templateUrl: 'templates/menu.html',
                controller: 'AppCtrl'
            })
            .state('app.login', {
                url: '/login',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/login.html',
                        controller: 'LoginCtrl'
                    },

                }
            })
            /*.state('app.forgotpassword', {
                url: '/forgotpassword',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/forgotPassword.html',
                        controller: 'LoginCtrl'
                    },

                }
            })*/
            /*.state('app.search', {
            	url : '/search',
            	templateUrl : 'templates/main.html',
            	controller : 'MainController'

            })*/

           /* .state('app.history', {
                url: '/history',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/historylist.html',
                        controller: 'HistoryCtrl'
                    },
                }
            })*/
            /*.state('app.onlinehistory', {
                url: '/onlinehistory',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/onlinehistory.html',
                        controller: 'HistoryCtrl'
                    },
                }
            })*/
            /*.state('app.reAssignHistory', {
                url: '/reAssignHistory',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/reassignedHistory.html',
                        controller: 'reassignedHistory'
                    },
                }
            })*/

            .state('app.viewForm', {
                url: '/viewForm',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/formDetails.html',
                        controller: 'formDetailsCtrl'
                    },
                }
            })

            .state('tabs', {
                url: "/tab",
                abstract: true,
                templateUrl: "templates/tabs.html",
                controller: 'tabsController'
            })

            /*.state('tabs.forms', {
                url: '/forms',
                views: {
                    'forms-tab': {
                        templateUrl: 'templates/listofforms.html',
                        controller: 'formsCtrl'
                    }
                }
            })*/

            .state('tabs.dashboard', {
                url: "/dashboard",
                views: {
                    'dashboard-tab': {
                        templateUrl: "templates/dashboard.html",
                        controller: 'dashboardCtrl'
                    }
                }
            })


            .state('tabs.assignedtasks', {
                url: "/assignedtasks",
                views: {
                    'task-tab': {
                        templateUrl: "templates/assignedtasks.html",
                        controller: 'taskCtrl'
                    }
                }
            })
            .state('tabs.notifications', {
                url: "/notifications",
                views: {
                    'notification-tab': {
                        templateUrl: "templates/notifications.html",
                        controller: 'nofification'
                    }
                }
            })
            .state('app.taskforms', {
                url: "/taskforms",
                views: {
                    'menuContent': {
                        templateUrl: "templates/formsOfTask.html",
                        controller: 'taskCtrl'
                    }
                }
            })
            
            .state('app.taskformhistory', {
                url: "/taskformhistory",
                views: {
                    'menuContent': {
                        templateUrl: "templates/taskformhistory.html",
                        controller: 'taskHistoryCtrl'
                    }
                }
            })
            .state('app.taskformOnlinehistory', {
                url: "/taskformOnlinehistory",
                views: {
                    'menuContent': {
                        templateUrl: "templates/taskformOnlinehistory.html",
                        controller: 'taskCtrl'
                    }
                }
            })
            
            /*.state('tabs.reasign', {
                url: "/reasign",
                views: {
                    'reasign-tab': {
                        templateUrl: "templates/reasign.html",
                        controller: 'reassignCtrl'
                    }
                }
            })*/
            .state('tabs.settings', {
                url: "/settings",
                views: {
                    'settings-tab': {
                        templateUrl: "templates/settings.html",
                        controller: 'settingsCtrl'
                    }
                }
            })
           /* .state('app.changePassword', {
                url: "/changePassword",
                views: {
                    'menuContent': {
                        templateUrl: "templates/changepassword.html",
                        controller: 'settingsCtrl'
                    }
                }
            })*/
            .state('app.map', {
                url: "/map",
                views: {
                    'menuContent': {
                        templateUrl: "templates/map.html",
                        controller: 'mapController'
                    }
                }
            })
            .state('app.aboutus', {
                url: "/aboutus",
                views: {
                    'menuContent': {
                        templateUrl: "templates/aboutus.html",
                        controller: 'settingsCtrl'
                    }
                }
            })
        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/app/login');

    });