var CSSTransitionEditor = function(previousValue) {
    var self = this;
    self._map = {};

    if (previousValue) {
        var parts = previousValue.split(",");
        for (var part in parts) {
            var stripped = part.replace(/^\s+|\s+$/g, '');
            var fields = stripped.split(/\s+/);
            if (fields.length != 2)
                continue;
            self._map[fields[0]] = fields[1];
        }
    }

    self.set = function(field, value) {
        self._map[field] = value;
    }
    self.unset = function(field) {
        delete self._map[field];
    }
    self.serialize = function() {
        result = [];
        for (var field in self._map)
            result.push(field + " " + self._map[field]);
        return result.join(", ");
    }
};

(function() {

var app = angular.module('whiteframe', []);

var zHeights = [
    { boxShadow: null },
    { boxShadow: '0px 2px 5px 0', boxShadowOpacity: 0.26 },
    { boxShadow: '0px 8px 17px', boxShadowOpacity: 0.2 },
    { boxShadow: '0px 17px 50px', boxShadowOpacity: 0.19 },
    { boxShadow: '0px 16px 28px 0', boxShadowOpacity: 0.22 },
    { boxShadow: '0px 27px 24px 0', boxShadowOpacity: 0.2 },
];

var growCSSTransition = function(element, toWidth, toHeight, toLeft, toTop) {
    var editor = new CSSTransitionEditor(element.style.transition);
    editor.set('width', '0.3s');
    editor.set('height', '0.3s');
    editor.set('left', '0.3s');
    editor.set('top', '0.3s');
    var transition = editor.serialize();
    element.style['-os-transition'] = transition;
    element.style['-moz-transition'] = transition;
    element.style['-webkit-transition'] = transition;
    element.style.transition = transition;
    element.style.width = '' + toWidth + 'px';
    element.style.height = '' + toHeight + 'px';
    element.style.left = '' + toLeft + 'px';
    element.style.top = '' + toTop + 'px';
};

app.directive('whiteframeOver', ['$compile', '$q', '$parse',
    function ($compile, $q, $parse) {
        'use strict';

        return {
            restrict: 'A',
            scope: {
                depthText: "@whiteframeZheight",
                paddingText: "@whiteframePadding",
                heightMultiplierText: "@whiteframeHeightMultiplier",
            },
            link: function (scope, element, attrs, ngModelCtrl) {
                scope.isOpen = false;
                scope.open = function() {
                    scope.isOpen = true;
                };
                scope.$parent.openWhiteframe = scope.open;
                scope.close = function() {
                    scope.isOpen = false;
                };
                scope.$parent.closeWhiteframe = scope.close;
                scope.depth = parseInt(scope.depthText);
                scope.padding = parseInt(scope.paddingText);
                scope.heightMultiplier = parseInt(scope.heightMultiplierText);
                $(element).children().hide();
                var closedRoot = $(element).children()[0];
                var openedRoot = $(element).children()[1];
                $(closedRoot).show();
                scope.$watch('isOpen', function(value, prev) {
                    if (value === prev)
                        return;
                    if (value === true) {
                        var offset = $(closedRoot).offset();
                        var width = $(closedRoot).width();
                        var height = $(closedRoot).height();
                        var zHeight = zHeights[scope.depth];
                        $(openedRoot).show().offset(offset).width(width).height(height);
                        openedRoot.style.boxShadow = zHeight.boxShadow + ' rgba(0,0,0,0)';
                        openedRoot.style['box-shadow-opacity'] = 0;
                        $(openedRoot).animate({
                            'box-shadow-opacity': zHeight.boxShadowOpacity}, {
                            duration: 200,
                            step: function( now, fx ) {
                                openedRoot.style.boxShadow = zHeight.boxShadow + ' rgba(0,0,0,' + now + ')';
                            },
                            complete: function() {
                                growCSSTransition(openedRoot,
                                    width + 2*scope.padding,
                                    scope.heightMultiplier * height,
                                    -scope.padding,
                                    -(scope.heightMultiplier * height + 1) / 2);
                            },
                        });
                    } else {
                        var offset = $(closedRoot).offset();
                        var width = $(closedRoot).width();
                        var height = $(closedRoot).height();
                        $(openedRoot).fadeOut(200, function(){
                            $(openedRoot).show().offset(offset).width(width).height(height).hide();
                        });
                    }
                });
            }
        }
    }
]);

})();
