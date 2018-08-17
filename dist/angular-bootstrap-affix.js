'use strict';
/**
 * Firefox document.body.scrollHeight = 0; 
 * Because of that the affix-bottom class is constantly added and removed causing flicker.
 * This function fixes that.
 * Stolen from here: http://james.padolsey.com/snippets/get-document-height-cross-browser/
 */
function getDocHeight() {
  var D = document;
  return Math.max(D.body.scrollHeight, D.documentElement.scrollHeight, D.body.offsetHeight, D.documentElement.offsetHeight, D.body.clientHeight, D.documentElement.clientHeight);
}
angular.module('mgcrea.bootstrap.affix', ['mgcrea.jquery']).directive('bsAffix', [
  '$window',
  'dimensions',
  '$timeout',
  function ($window, dimensions, $timeout) {
    var AFFIX_NEEDS_UPDATING = 'affixNeedsUpdating';
    var checkPosition = function (instance, el, options) {
      var scrollTop = window.pageYOffset;
      var windowHeight = window.innerHeight;
      var scrollHeight = getDocHeight();
      //document.body.scrollHeight;
      var position = dimensions.offset.call(el[0]);
      var height = dimensions.height.call(el[0]);
      var width = dimensions.width.call(el[0]);
      var offsetTop = options.offsetTop * 1;
      var offsetBottom = options.offsetBottom * 1;
      var top = options.top * 1;
      var reset = 'affix affix-top affix-bottom';
      var affix;
      if (options.offSetElement) {
        var offsetElement = getElement(options.offSetElement);
        if (offsetElement && offsetElement[0]) {
          top = offsetElement[0].clientHeight;
        }
      }
      if (angular.isUndefined(instance.originTop) || instance.originTop === null) {
        instance.originTop = position.top;
        if (top) {
          instance.originTop = instance.originTop - top;
        }
      }
      if (height > 0 && instance.originTop <= scrollTop) {
        affix = 'top';
      } else {
        affix = false;
      }
      if (instance.affixed === affix) {
        if (affix && angular.isDefined(top) && angular.isDefined(instance.top) && top !== instance.top && angular.isDefined(height) && height > 0) {
          el.attr('style', 'top:' + top + 'px;width:' + width + 'px;');
        }
        return;
      }
      instance.affixed = affix;
      el.removeClass(reset).addClass('' + (affix ? 'affix affix-' + affix : ''));
      if (affix && angular.isDefined(top) && angular.isDefined(height) && height > 0) {
        el.attr('style', 'top:' + top + 'px;width:' + width + 'px;');
        instance.top = top;
      } else {
        el.removeAttr('style');
        instance.top = null;
      }
    };
    var checkCallbacks = function (scope, instance, iElement, iAttrs) {
      if (instance.affixed) {
        if (iAttrs.onUnaffix)
          eval('scope.' + iAttrs.onUnaffix);
      } else {
        if (iAttrs.onAffix)
          eval('scope.' + iAttrs.onAffix);
      }
    };
    var getElement = function (elementId) {
      var element = angular.element(document.getElementById(elementId));
      return element;
    };
    return {
      restrict: 'EAC',
      link: function postLink(scope, iElement, iAttrs) {
        var instance = { unpin: null };
        var onScroll = function () {
          $timeout(function () {
            checkPosition(instance, iElement, iAttrs);
            checkCallbacks(scope, instance, iElement, iAttrs);
          });
        };
        var onClick = function () {
          $timeout(function () {
            checkPosition(instance, iElement, iAttrs);
            checkCallbacks(scope, instance, iElement, iAttrs);
          }, 1);
        };
        if (angular.isDefined(iAttrs.disablePinning) && (iAttrs.disablePinning === 'true' || iAttrs.disablePinning === true)) {
          return;
        }
        angular.element($window).on('scroll', onScroll);
        angular.element($window).on('click', onclick);
        scope.$on(AFFIX_NEEDS_UPDATING, onScroll);
        scope.$on('$destroy', function () {
          angular.element($window).off('scroll', onScroll);
          angular.element($window).off('click', onclick);
        });
      }
    };
  }
]);