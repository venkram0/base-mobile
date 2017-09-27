angular.module('starter.services')
    .service('alertService', function($ionicPopup, $cordovaToast) {
        return {
            doAlert: function(content) {
                $ionicPopup.alert({
                    title: 'Message',
                    content: content
                }).then(function(res) {});
            },
            showToast: function(message) {
                $cordovaToast.show(message, 'long', 'bottom').then(function(success) {}, function(error) {});
            }

        }

    });