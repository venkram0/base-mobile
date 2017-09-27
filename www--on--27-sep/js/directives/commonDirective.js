var app = angular.module('directives');
app.directive('decimalsOnly', function () {
	return {
		require : '?ngModel',
		link : function (scope, element, attrs, ngModelCtrl) {
			if (!ngModelCtrl) {
				return;
			}

			ngModelCtrl.$parsers.push(function (val) {
				if (angular.isUndefined(val)) {
					var val = '';
				}

				var clean = val.replace(/[^-0-9\.]/g, '');
				var negativeCheck = clean.split('-');
				var decimalCheck = clean.split('.');
				if (!angular.isUndefined(negativeCheck[1])) {
					negativeCheck[1] = negativeCheck[1].slice(0, negativeCheck[1].length);
					clean = negativeCheck[0] + '-' + negativeCheck[1];
					if (negativeCheck[0].length > 0) {
						clean = negativeCheck[0];
					}

				}

				if (!angular.isUndefined(decimalCheck[1])) {
					decimalCheck[1] = decimalCheck[1].slice(0, 3);
					clean = decimalCheck[0] + '.' + decimalCheck[1];
				}

				if (val !== clean) {
					ngModelCtrl.$setViewValue(clean);
					ngModelCtrl.$render();
				}
				return clean;
			});

			element.bind('keypress', function (event) {
				if (event.keyCode === 32) {
					event.preventDefault();
				}
			});
		}
	};
});

app.directive('numbersOnly', function () {
	return {
		require : 'ngModel',
		link : function (scope, element, attr, ngModelCtrl) {
			function fromUser(text) {
				if (text) {
					var transformedInput = text.replace(/[^0-9]/g, '');

					if (transformedInput !== text) {
						ngModelCtrl.$setViewValue(transformedInput);
						ngModelCtrl.$render();
					}
					return transformedInput;
				}
				return undefined;
			}
			ngModelCtrl.$parsers.push(fromUser);
		}
	};
});
/*app.directive('uiShowPassword', [
function () {
return {
restrict: 'A',
scope: true,
link: function (scope, elem, attrs) {
var btnShowPass = angular.element('<button class="button button-clear"><i class="ion-eye"></i></button>'),
//      var btnShowPass = angular.element('<input type="checkbox" class=''>'),
elemType = elem.attr('type');

// this hack is needed because Ionic prevents browser click event
// from elements inside label with input
btnShowPass.on('mousedown', function (evt) {
(elem.attr('type') === elemType) ?
elem.attr('type', 'text') : elem.attr('type', elemType);
btnShowPass.toggleClass('button-positive');
//prevent input field focus
evt.stopPropagation();
});

btnShowPass.on('touchend', function (evt) {
var syntheticClick = new Event('mousedown');
evt.currentTarget.dispatchEvent(syntheticClick);

//stop to block ionic default event
evt.stopPropagation();
});

if (elem.attr('type') === 'password') {
elem.after(btnShowPass);
}
}
};
}]);*/