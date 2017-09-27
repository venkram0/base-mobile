var app = angular.module('directives');
app.directive('googleDirective', function () {
	return {
		scope : {
			"googleDirectiveFn" : "="
		},
		link : function (scope, element, attrs, model) {
			var options = {
				types : [],
				componentRestrictions : {}
			};
			scope.gPlace = new google.maps.places.Autocomplete(element[0], options);
			google.maps.event.addListener(scope.gPlace, 'place_changed', function () {
				var geoComponents = scope.gPlace.getPlace();
				var latitude = geoComponents.geometry.location.lat();
				var longitude = geoComponents.geometry.location.lng();
				scope.googleDirectiveFn(latitude, longitude);
			});
		}
	};
});