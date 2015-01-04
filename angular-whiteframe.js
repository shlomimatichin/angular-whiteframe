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
                scope.open = false;
                scope.depth = parseInt(scope.depthText);
                scope.padding = parseInt(scope.paddingText);
                scope.heightMultiplier = parseInt(scope.heightMultiplierText);
                $(element).children().hide();
                var closedRoot = $(element).children()[0];
                var openedRoot = $(element).children()[1];
                $(closedRoot).show();
                scope.$watch('open', function(value, prev) {
                    if (value === prev)
                        return;
                    if (value === true) {
                        var offset = $(closedRoot).offset();
                        $(openedRoot).show().offset(offset).width($(openedRoot).width()).height($(openedRoot).height());
                        var zHeight = zHeights[scope.depth];
                        openedRoot.style.boxShadow = zHeight.boxShadow + ' rgba(0,0,0,0)';
                        openedRoot.style['box-shadow-opacity'] = 0;
                        var width = $(closedRoot).width();
                        var height = $(closedRoot).height();
                        $(openedRoot).animate({
                            'box-shadow-opacity': zHeight.boxShadowOpacity}, {
                            duration: 200,
                            step: function( now, fx ) {
                                openedRoot.style.boxShadow = zHeight.boxShadow + ' rgba(0,0,0,' + now + ')';
                            },
                            complete: function() {
                                openedRoot.style['-webkit-transition'] = 'width 0.3s, left 0.3s, height 0.3s, top 0.3s, padding-top 0.3s, padding-left 0.3s';
                                openedRoot.style.transition = 'width 0.3s, left 0.3s, height 0.3s, top 0.3s, padding-top 0.3s, padding-left 0.3s';
                                openedRoot.style.width = '' + (width + 2*scope.padding) + 'px';
                                openedRoot.style.left = '-' + scope.padding + 'px';
                                openedRoot.style.height = '' + (scope.heightMultiplier * height) + 'px';
console.log('' + (scope.heightMultiplier * height) + 'px');
                                openedRoot.style.top = '-' + ((scope.heightMultiplier * height + 1)/2) + 'px';
//                                openedRoot.style['padding-top'] = '' + (scope.heightMultiplier * height / 2) + 'px';
                                openedRoot.style['padding-left'] = '' + scope.padding + 'px';
console.log('done');
                            },
                        });
                    } else {
                    }
                });
                $(element).click(function() {
                    scope.open = true;
                    scope.$digest();
                });
            }
        }
    }
]);

})();
