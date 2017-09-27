angular.module('directives',[])
.directive('showErrors',[function($timeout){
  console.log("controllerr");
  return{
    restrict:'A',
    require:'^form',
    link:function(scope,el,attrs,formCtrl){
      var inputEl   = el[0].querySelector("[name]");
      var inputNgE1 = angular.element(inputEl);
      var inputname =inputNgE1.attr('name');
      var helpText  = angular.element(el[0].querySelector("help-block"));
      inputNgE1.bind('change',function(){
        el.toggleClass('has-error',formDetailsCtrl[inputname].$invalid);
        //helpText.toggleClass('hide',formCtrl[inputname].$valid );
      })

      scope.$on('show-error-event',function(){
        el.toggleClass('has-error',formDetailsCtrl[inputname].$invalid);
      })
      scope.$on('hide-error-event',function(){
        $timeout(function(){
          el.removeClass('has-error');
        },0,false)
      })
    }
  }

}
]);