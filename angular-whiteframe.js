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
                depthText: "@whiteframezheight",
            },
            link: function (scope, element, attrs, ngModelCtrl) {
                scope.open = false;
                scope.depth = parseInt(scope.depthText);
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
                        $(openedRoot).animate({
                            'box-shadow-opacity': zHeight.boxShadowOpacity}, {
                            duration: 200,
                            step: function( now, fx ) {
                                openedRoot.style.boxShadow = zHeight.boxShadow + ' rgba(0,0,0,' + now + ')';
                            }
                        }).animate({
                            width: +230,
                            left: -15,
                            height: 95,
                            top: -57,
                            'padding-top': 38,
                            'padding-left': 15,
                        },300);
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
