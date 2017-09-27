// angular.module('starter.services')
angular.module('directives', [])

.directive('ionOptionButton', [function () {
			console.log("hihihihi");
			function stopPropagation(e) {
				e.stopPropagation();
			}
			var ITEM_TPL_OPTION_BUTTONS =
				'<div class="item-options invisible">' +
				'</div>' + '<div class="item-options-left invisible">' +
				'</div>';

			return {

				require : '^ionItem',
				priority : Number.MAX_VALUE,
				compile : function ($element, $attr) {
					$attr.$set('class', ($attr['class'] || '') + ' button', true);
					return function ($scope, $element, $attr, itemCtrl) {
						if (!itemCtrl.optionsContainer) {
					//		itemCtrl.optionsContainer = jqLite(ITEM_TPL_OPTION_BUTTONS);
					//		itemCtrl.$element.append(itemCtrl.optionsContainer);
						}
					//	itemCtrl.optionsContainer.append($element);

						itemCtrl.$element.addClass('item-right-editable');

						//Don't bubble click up to main .item
						$element.on('click', stopPropagation);
					};
				}
			};

		}
	]);
