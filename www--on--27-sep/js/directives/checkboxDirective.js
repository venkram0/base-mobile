.directive('myValidationCheck', function() {
    return {
        scope: {
            myValidationCheck: '='
        },
        require: 'ngModel',
        link: function(scope, elm, attrs, ngModel) {

            scope.$watch('myValidationCheck', function(value) {
                ngModel.$setValidity('checkTrue', value ? true : false);
            });

        }
    };
});