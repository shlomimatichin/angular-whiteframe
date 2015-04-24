var CSSTransitionEditor = function(previousValue) {
    var self = this;
    self._map = {};

    if (previousValue) {
        var parts = previousValue.split(",");
        for (var partIndex in parts) {
            var stripped = parts[partIndex].replace(/^\s+|\s+$/g, '');
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
    self.apply = function(element) {
        var serialized = self.serialize();
        element.style['-o-transition'] = serialized;
        element.style['-moz-transition'] = serialized;
        element.style['-webkit-transition'] = serialized;
        element.style.transition = serialized;
    }
};

(function() {
    var css = '.whiteframe-menu > div { outline:0; }' +
              '.whiteframe-menu > div:focus .whiteframe-menu-collapsed-label {' +
              '  border-bottom-style: dashed; border-bottom-width: 1px; }';
    var head = document.head || document.getElementsByTagName('head')[0];
    var style = document.createElement('style');
    style.type = 'text/css';
    if (style.styleSheet){
        style.styleSheet.cssText = css;
    } else {
        style.appendChild(document.createTextNode(css));
    }

    head.appendChild(style);
})();

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
    editor.apply(element);
    element.style.width = toWidth + 'px';
    element.style.height = toHeight + 'px';
    element.style.left = toLeft + 'px';
    element.style.top = toTop + 'px';
};

app.directive('whiteframeOver', [function() {
    'use strict';

    return {
        restrict: 'A',
        scope: {
            depthText: "@whiteframeZheight",
            paddingText: "@whiteframePadding",
            heightMultiplierText: "@whiteframeHeightMultiplier",
            growTransitionBegun: "=whiteframeGrowTransitionBegun",
            growTransitionReset: "=whiteframeGrowTransitionReset",
        },
        link: function (scope, element, attrs, ngModelCtrl) {
            scope.$parent.whiteframe = scope;
            scope.isOpen = false;
            scope.open = function(scrollTopOnOpen) {
                scope.scrollTopOnOpen = scrollTopOnOpen;
                scope.isOpen = true;
            };
            scope.close = function() {
                scope.isOpen = false;
            };
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
                    openedRoot.style.boxShadow = zHeight.boxShadow + ' rgba(0,0,0,' + zHeight.boxShadowOpacity + ')';
                    if (scope.scrollTopOnOpen !== undefined)
                        openedRoot.scrollTop = scope.scrollTopOnOpen;
                    $(openedRoot).hide().fadeIn(200, function() {
                        growCSSTransition(openedRoot,
                            width + 2*scope.padding,
                            scope.heightMultiplier * height,
                            -scope.padding,
                            -(scope.heightMultiplier * height + 1) / 2);
                        if (scope.growTransitionBegun)
                            scope.growTransitionBegun('0.3s', openedRoot);
                    });
                } else {
                    var offset = $(closedRoot).offset();
                    var width = $(closedRoot).width();
                    var height = $(closedRoot).height();
                    $(openedRoot).fadeOut(200, function(){
                        $(openedRoot).show().offset(offset).width(width).height(height);
                        if (scope.growTransitionReset)
                            scope.growTransitionReset(openedRoot);
                        $(openedRoot).hide();
                    });
                }
            });
        }
    }
}
]);

app.directive('whiteframeMenu', ['$compile', '$q', '$parse',
    function ($compile, $q, $parse) {
        'use strict';

        return {
            restrict: 'E',
            replace: true,
            scope: {
                zheight: "@whiteframeZheight",
                heightMultiplier: "@whiteframeHeightMultiplier",
                options: "=whiteframeMenuOptions",
                selected: "=whiteframeMenuSelected",
                placeholder: "@placeholder",
            },
            template:
                '<div class="whiteframe-menu">' +
                '<div style="height: 50px; background-color: #fff; display:block;" ' +
                    'whiteframe-over whiteframe-zheight="{{zheight}}" ' +
                    'whiteframe-padding=15 ' +
                    'whiteframe-height-multiplier="{{heightMultiplier}}" ' +
                    'whiteframe-grow-transition-begun="growTransition" ' +
                    'whiteframe-grow-transition-reset="growTransitionReset" ' +
                '   tabindex="0" ng-blur="closeMenu()">' +
                '    <div style="height: 30px; line-height:26px; border-style: solid; ' +
                '        border-width: 0 0 1px 0; border-color: rgba(0,0,0,0.12)" ' +
                '        ng-click="openMenu()" class="whiteframe-menu-container">' +
                '        <div style="position: relative; width:0px; height: 0px; left:100%; top:4px">' +
                '            <div style="position: relative; left:-16px;">' +
                '                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><path d="M5 8l4 4 4-4z"/></svg>' +
                '            </div>'+
                '        </div>'+
                '        <span class="whiteframe-menu-collapsed-label" ng-class="{\'whiteframe-menu-collapsed-label-empty\': !selected}" ng-bind="showingLabel"></span>' +
                '    </div>' +
                '    <div style="line-height:26px; background-color:#fff; display:block; overflow-x: hidden; overflow-y: scroll" class="whiteframe-opened-menu">' +
                '        <div ng-repeat="option in options" style="display:block; height:40px; line-height:36px; cursor:pointer; " ng-click="selectionMade(option)" class="whiteframe-menu-option">' +
                '            <span ng-bind="option.label"></span>' +
                '        </div>' +
                '    </div>' +
                '</div></div>',
            controller: function($scope, $element) {
                if (!$scope.zheight)
                    $scope.zheight = 1;
                if (!$scope.heightMultiplier)
                    $scope.heightMultiplier = 5;
                $scope.showingLabel = "";
                $scope.$watch('selected', function() {
                    if ($scope.selected)
                        $scope.showingLabel = $scope.selected.label;
                    else
                        $scope.showingLabel = $scope.placeholder;
                });
                $scope.openMenu = function() {
                    var optionIndex = -1;
                    for (var i in $scope.options)
                        if ($scope.selected == $scope.options[i]) {
                            optionIndex = i;
                            break;
                        }
                    $scope.whiteframe.open(40 * optionIndex + 5);
                    $element.children()[0].focus();
                };
                $scope.closeMenu = function() {
                    $scope.whiteframe.close();
                };
                $scope.selectionMade = function(option) {
                    $scope.selected = option;
                    $scope.showingLabel = option.label;
                    $scope.whiteframe.close();
                };
                $scope.growTransition = function(intervalDesc, element) {
                    var editor = new CSSTransitionEditor(element.style.transition);
                    editor.set('padding-left', intervalDesc);
                    editor.apply(element);
                    element.style['padding-left'] = 15 + 'px';
                };
                $scope.growTransitionReset = function(element) {
                    element.style['padding-left'] = 0;
                };
            },
        };
    }
]);

})();
