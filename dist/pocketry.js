/*!
 * Draggabilly PACKAGED v1.1.0
 * Make that shiz draggable
 * http://draggabilly.desandro.com
 * MIT license
 */

!function(a){function b(a){return new RegExp("(^|\\s+)"+a+"(\\s+|$)")}function c(a,b){var c=d(a,b)?f:e;c(a,b)}var d,e,f;"classList"in document.documentElement?(d=function(a,b){return a.classList.contains(b)},e=function(a,b){a.classList.add(b)},f=function(a,b){a.classList.remove(b)}):(d=function(a,c){return b(c).test(a.className)},e=function(a,b){d(a,b)||(a.className=a.className+" "+b)},f=function(a,c){a.className=a.className.replace(b(c)," ")});var g={hasClass:d,addClass:e,removeClass:f,toggleClass:c,has:d,add:e,remove:f,toggle:c};"function"==typeof define&&define.amd?define("classie/classie",g):"object"==typeof exports?module.exports=g:a.classie=g}(window),function(){function a(){}function b(a,b){for(var c=a.length;c--;)if(a[c].listener===b)return c;return-1}function c(a){return function(){return this[a].apply(this,arguments)}}var d=a.prototype,e=this,f=e.EventEmitter;d.getListeners=function(a){var b,c,d=this._getEvents();if(a instanceof RegExp){b={};for(c in d)d.hasOwnProperty(c)&&a.test(c)&&(b[c]=d[c])}else b=d[a]||(d[a]=[]);return b},d.flattenListeners=function(a){var b,c=[];for(b=0;b<a.length;b+=1)c.push(a[b].listener);return c},d.getListenersAsObject=function(a){var b,c=this.getListeners(a);return c instanceof Array&&(b={},b[a]=c),b||c},d.addListener=function(a,c){var d,e=this.getListenersAsObject(a),f="object"==typeof c;for(d in e)e.hasOwnProperty(d)&&-1===b(e[d],c)&&e[d].push(f?c:{listener:c,once:!1});return this},d.on=c("addListener"),d.addOnceListener=function(a,b){return this.addListener(a,{listener:b,once:!0})},d.once=c("addOnceListener"),d.defineEvent=function(a){return this.getListeners(a),this},d.defineEvents=function(a){for(var b=0;b<a.length;b+=1)this.defineEvent(a[b]);return this},d.removeListener=function(a,c){var d,e,f=this.getListenersAsObject(a);for(e in f)f.hasOwnProperty(e)&&(d=b(f[e],c),-1!==d&&f[e].splice(d,1));return this},d.off=c("removeListener"),d.addListeners=function(a,b){return this.manipulateListeners(!1,a,b)},d.removeListeners=function(a,b){return this.manipulateListeners(!0,a,b)},d.manipulateListeners=function(a,b,c){var d,e,f=a?this.removeListener:this.addListener,g=a?this.removeListeners:this.addListeners;if("object"!=typeof b||b instanceof RegExp)for(d=c.length;d--;)f.call(this,b,c[d]);else for(d in b)b.hasOwnProperty(d)&&(e=b[d])&&("function"==typeof e?f.call(this,d,e):g.call(this,d,e));return this},d.removeEvent=function(a){var b,c=typeof a,d=this._getEvents();if("string"===c)delete d[a];else if(a instanceof RegExp)for(b in d)d.hasOwnProperty(b)&&a.test(b)&&delete d[b];else delete this._events;return this},d.removeAllListeners=c("removeEvent"),d.emitEvent=function(a,b){var c,d,e,f,g=this.getListenersAsObject(a);for(e in g)if(g.hasOwnProperty(e))for(d=g[e].length;d--;)c=g[e][d],c.once===!0&&this.removeListener(a,c.listener),f=c.listener.apply(this,b||[]),f===this._getOnceReturnValue()&&this.removeListener(a,c.listener);return this},d.trigger=c("emitEvent"),d.emit=function(a){var b=Array.prototype.slice.call(arguments,1);return this.emitEvent(a,b)},d.setOnceReturnValue=function(a){return this._onceReturnValue=a,this},d._getOnceReturnValue=function(){return this.hasOwnProperty("_onceReturnValue")?this._onceReturnValue:!0},d._getEvents=function(){return this._events||(this._events={})},a.noConflict=function(){return e.EventEmitter=f,a},"function"==typeof define&&define.amd?define("eventEmitter/EventEmitter",[],function(){return a}):"object"==typeof module&&module.exports?module.exports=a:this.EventEmitter=a}.call(this),function(a){function b(b){var c=a.event;return c.target=c.target||c.srcElement||b,c}var c=document.documentElement,d=function(){};c.addEventListener?d=function(a,b,c){a.addEventListener(b,c,!1)}:c.attachEvent&&(d=function(a,c,d){a[c+d]=d.handleEvent?function(){var c=b(a);d.handleEvent.call(d,c)}:function(){var c=b(a);d.call(a,c)},a.attachEvent("on"+c,a[c+d])});var e=function(){};c.removeEventListener?e=function(a,b,c){a.removeEventListener(b,c,!1)}:c.detachEvent&&(e=function(a,b,c){a.detachEvent("on"+b,a[b+c]);try{delete a[b+c]}catch(d){a[b+c]=void 0}});var f={bind:d,unbind:e};"function"==typeof define&&define.amd?define("eventie/eventie",f):"object"==typeof exports?module.exports=f:a.eventie=f}(this),function(a){function b(a){if(a){if("string"==typeof d[a])return a;a=a.charAt(0).toUpperCase()+a.slice(1);for(var b,e=0,f=c.length;f>e;e++)if(b=c[e]+a,"string"==typeof d[b])return b}}var c="Webkit Moz ms Ms O".split(" "),d=document.documentElement.style;"function"==typeof define&&define.amd?define("get-style-property/get-style-property",[],function(){return b}):"object"==typeof exports?module.exports=b:a.getStyleProperty=b}(window),function(a){function b(a){var b=parseFloat(a),c=-1===a.indexOf("%")&&!isNaN(b);return c&&b}function c(){for(var a={width:0,height:0,innerWidth:0,innerHeight:0,outerWidth:0,outerHeight:0},b=0,c=g.length;c>b;b++){var d=g[b];a[d]=0}return a}function d(a){function d(a){if("string"==typeof a&&(a=document.querySelector(a)),a&&"object"==typeof a&&a.nodeType){var d=f(a);if("none"===d.display)return c();var e={};e.width=a.offsetWidth,e.height=a.offsetHeight;for(var k=e.isBorderBox=!(!j||!d[j]||"border-box"!==d[j]),l=0,m=g.length;m>l;l++){var n=g[l],o=d[n];o=h(a,o);var p=parseFloat(o);e[n]=isNaN(p)?0:p}var q=e.paddingLeft+e.paddingRight,r=e.paddingTop+e.paddingBottom,s=e.marginLeft+e.marginRight,t=e.marginTop+e.marginBottom,u=e.borderLeftWidth+e.borderRightWidth,v=e.borderTopWidth+e.borderBottomWidth,w=k&&i,x=b(d.width);x!==!1&&(e.width=x+(w?0:q+u));var y=b(d.height);return y!==!1&&(e.height=y+(w?0:r+v)),e.innerWidth=e.width-(q+u),e.innerHeight=e.height-(r+v),e.outerWidth=e.width+s,e.outerHeight=e.height+t,e}}function h(a,b){if(e||-1===b.indexOf("%"))return b;var c=a.style,d=c.left,f=a.runtimeStyle,g=f&&f.left;return g&&(f.left=a.currentStyle.left),c.left=b,b=c.pixelLeft,c.left=d,g&&(f.left=g),b}var i,j=a("boxSizing");return function(){if(j){var a=document.createElement("div");a.style.width="200px",a.style.padding="1px 2px 3px 4px",a.style.borderStyle="solid",a.style.borderWidth="1px 2px 3px 4px",a.style[j]="border-box";var c=document.body||document.documentElement;c.appendChild(a);var d=f(a);i=200===b(d.width),c.removeChild(a)}}(),d}var e=a.getComputedStyle,f=e?function(a){return e(a,null)}:function(a){return a.currentStyle},g=["paddingLeft","paddingRight","paddingTop","paddingBottom","marginLeft","marginRight","marginTop","marginBottom","borderLeftWidth","borderRightWidth","borderTopWidth","borderBottomWidth"];"function"==typeof define&&define.amd?define("get-size/get-size",["get-style-property/get-style-property"],d):"object"==typeof exports?module.exports=d(require("get-style-property")):a.getSize=d(a.getStyleProperty)}(window),function(a){function b(a,b){for(var c in b)a[c]=b[c];return a}function c(){}function d(d,e,g,j,k){function m(a,c){this.element="string"==typeof a?f.querySelector(a):a,this.options=b({distance:1,forceTranslatePositioning:!1},this.options),b(this.options,c),this._create()}function n(){return!1}function o(a,b){a.x=void 0!==b.pageX?b.pageX:b.clientX,a.y=void 0!==b.pageY?b.pageY:b.clientY}function p(a,b,c){return c=c||"round",b?Math[c](a/b)*b:a}var q=j("transform"),r=!!j("perspective");b(m.prototype,e.prototype),m.prototype.options={},m.prototype._create=function(){this.position={},this._getPosition(),this.startPoint={x:0,y:0},this.dragPoint={x:0,y:0},this.startPosition=b({},this.position);var a=h(this.element);"relative"!==a.position&&"absolute"!==a.position&&(this.element.style.position="relative"),this.enable(),this.setHandles()},m.prototype.setHandles=function(){this.handles=this.options.handle?this.element.querySelectorAll(this.options.handle):[this.element];for(var b=0,c=this.handles.length;c>b;b++){var d=this.handles[b];a.navigator.pointerEnabled?(g.bind(d,"pointerdown",this),d.style.touchAction="none"):a.navigator.msPointerEnabled?(g.bind(d,"MSPointerDown",this),d.style.msTouchAction="none"):(g.bind(d,"mousedown",this),g.bind(d,"touchstart",this),t(d))}};var s="attachEvent"in f.documentElement,t=s?function(a){"IMG"===a.nodeName&&(a.ondragstart=n);for(var b=a.querySelectorAll("img"),c=0,d=b.length;d>c;c++){var e=b[c];e.ondragstart=n}}:c;m.prototype._getPosition=function(){var a=h(this.element),b=parseInt(a.left,10),c=parseInt(a.top,10);this.position.x=isNaN(b)?0:b,this.position.y=isNaN(c)?0:c,this._addTransformPosition(a)},m.prototype._addTransformPosition=function(a){if(q){var b=a[q];if(0===b.indexOf("matrix")){var c=b.split(","),d=0===b.indexOf("matrix3d")?12:4,e=parseInt(c[d],10),f=parseInt(c[d+1],10);this.position.x+=e,this.position.y+=f}}},m.prototype.handleEvent=function(a){var b="on"+a.type;this[b]&&this[b](a)},m.prototype.getTouch=function(a){for(var b=0,c=a.length;c>b;b++){var d=a[b];if(d.identifier===this.pointerIdentifier)return d}},m.prototype.onmousedown=function(a){var b=a.button;b&&0!==b&&1!==b||this.beforeDragStart(a,a)},m.prototype.ontouchstart=function(a){this.isDragging||this.beforeDragStart(a,a.changedTouches[0])},m.prototype.onMSPointerDown=m.prototype.onpointerdown=function(a){this.isDragging||this.beforeDragStart(a,a)};var u={mousedown:["mousemove","mouseup"],touchstart:["touchmove","touchend","touchcancel"],pointerdown:["pointermove","pointerup","pointercancel"],MSPointerDown:["MSPointerMove","MSPointerUp","MSPointerCancel"]};m.prototype.beforeDragStart=function(b,c){this.isEnabled&&(0===this.options.distance&&(b.preventDefault?b.preventDefault():b.returnValue=!1),this.pointerIdentifier=void 0!==c.pointerId?c.pointerId:c.identifier,this._getPosition(),this.measureContainment(),o(this.startPoint,c),this._bindEvents({events:u[b.type],node:b.preventDefault?a:f}))},m.prototype.dragStart=function(a,b){this.isDragging||(this.startPosition.x=this.position.x,this.startPosition.y=this.position.y,this.setLeftTop(),this.dragPoint.x=0,this.dragPoint.y=0,d.add(this.element,"is-dragging"),d.add(this.element,"dragged"),this.isDragging=!0,this.emitEvent("dragStart",[this,a,b]),this.animate())},m.prototype._bindEvents=function(a){for(var b=0,c=a.events.length;c>b;b++){var d=a.events[b];g.bind(a.node,d,this)}this._boundEvents=a},m.prototype._unbindEvents=function(){var a=this._boundEvents;if(a&&a.events){for(var b=0,c=a.events.length;c>b;b++){var d=a.events[b];g.unbind(a.node,d,this)}delete this._boundEvents}},m.prototype.measureContainment=function(){var a=this.options.containment;if(a){this.size=k(this.element);var b=this.element.getBoundingClientRect(),c=i(a)?a:"string"==typeof a?f.querySelector(a):this.element.parentNode;this.containerSize=k(c);var d=c.getBoundingClientRect();this.relativeStartPosition={x:b.left-d.left,y:b.top-d.top}}},m.prototype.elementHasMoved=function(){var a=this.startPoint,b=this.dragPoint,c=b.x-a.x,d=b.y-a.y;return c*c+d*d>this.options.distance*this.options.distance},m.prototype.onmousemove=function(a){this.dragMove(a,a)},m.prototype.onMSPointerMove=m.prototype.onpointermove=function(a){a.pointerId===this.pointerIdentifier&&this.dragMove(a,a)},m.prototype.ontouchmove=function(a){var b=this.getTouch(a.changedTouches);b&&this.dragMove(a,b)},m.prototype.dragMove=function(a,b){if(o(this.dragPoint,b),this.isDragging){var c=this.dragPoint.x-this.startPoint.x,d=this.dragPoint.y-this.startPoint.y,e=this.options.grid,f=e&&e[0],g=e&&e[1];c=p(c,f),d=p(d,g),c=this.containDrag("x",c,f),d=this.containDrag("y",d,g),c="y"===this.options.axis?0:c,d="x"===this.options.axis?0:d,this.position.x=this.startPosition.x+c,this.position.y=this.startPosition.y+d,this.dragPoint.x=c,this.dragPoint.y=d,this.emitEvent("dragMove",[this,a,b])}else this.elementHasMoved()&&this.dragStart(a,b)},m.prototype.containDrag=function(a,b,c){if(!this.options.containment)return b;var d="x"===a?"width":"height",e=this.relativeStartPosition[a],f=p(-e,c,"ceil"),g=this.containerSize[d]-e-this.size[d];return g=p(g,c,"floor"),Math.min(g,Math.max(f,b))},m.prototype.onmouseup=function(a){this.dragEnd(a,a)},m.prototype.onMSPointerUp=m.prototype.onpointerup=function(a){a.pointerId===this.pointerIdentifier&&this.dragEnd(a,a)},m.prototype.ontouchend=function(a){var b=this.getTouch(a.changedTouches);b&&this.dragEnd(a,b)},m.prototype.dragEnd=function(a,b){if(this._unbindEvents(),!this.isDragging)return!1;this.isDragging=!1,delete this.pointerIdentifier,q&&(this.element.style[q]="",this.setLeftTop());var c=this;setTimeout(function(){d.remove(c.element,"dragged")},0),d.remove(c.element,"is-dragging"),this.emitEvent("dragEnd",[this,a,b])},m.prototype.onMSPointerCancel=m.prototype.onpointercancel=function(a){a.pointerId===this.pointerIdentifier&&this.dragEnd(a,a)},m.prototype.ontouchcancel=function(a){var b=this.getTouch(a.changedTouches);this.dragEnd(a,b)},m.prototype.animate=function(){if(this.isDragging){this.positionDrag();var a=this;l(function(){a.animate()})}};var v=r?function(a,b){return"translate3d( "+a+"px, "+b+"px, 0)"}:function(a,b){return"translate( "+a+"px, "+b+"px)"};return m.prototype.setLeftTop=function(){this.options.forceTranslatePositioning?this.element.style[q]=v(this.position.x,this.position.y):(this.element.style.left=this.position.x+"px",this.element.style.top=this.position.y+"px")},m.prototype.positionDrag=q?function(){this.element.style[q]=this.options.forceTranslatePositioning?v(this.position.x,this.position.y):v(this.dragPoint.x,this.dragPoint.y)}:m.prototype.setLeftTop,m.prototype.enable=function(){this.isEnabled=!0},m.prototype.disable=function(){this.isEnabled=!1,this.isDragging&&this.dragEnd()},m}for(var e,f=a.document,g=f.defaultView,h=g&&g.getComputedStyle?function(a){return g.getComputedStyle(a,null)}:function(a){return a.currentStyle},i="object"==typeof HTMLElement?function(a){return a instanceof HTMLElement}:function(a){return a&&"object"==typeof a&&1===a.nodeType&&"string"==typeof a.nodeName},j=0,k="webkit moz ms o".split(" "),l=a.requestAnimationFrame,m=a.cancelAnimationFrame,n=0;n<k.length&&(!l||!m);n++)e=k[n],l=l||a[e+"RequestAnimationFrame"],m=m||a[e+"CancelAnimationFrame"]||a[e+"CancelRequestAnimationFrame"];l&&m||(l=function(b){var c=(new Date).getTime(),d=Math.max(0,16-(c-j)),e=a.setTimeout(function(){b(c+d)},d);return j=c+d,e},m=function(b){a.clearTimeout(b)}),"function"==typeof define&&define.amd?define(["classie/classie","eventEmitter/EventEmitter","eventie/eventie","get-style-property/get-style-property","get-size/get-size"],d):a.Draggabilly=d(a.classie,a.EventEmitter,a.eventie,a.getStyleProperty,a.getSize)}(window);
/*jslint nomen:true*/
/*global Matrix, _*/
var Matrix = (function (_) {
  'use strict';

  /** pure functions **/

  function rows(matrix, selection, startIdx, endIdx) {
    if (endIdx === undefined || endIdx < -1) {
      endIdx = startIdx + 1;
    }
    return new MatrixSelection(
      matrix,
      startIdx,
      endIdx,
      selection.col.start,
      selection.col.end
    );
  }

  function cols(matrix, selection, startIdx, endIdx) {
    if (endIdx === undefined || endIdx < -1) {
      endIdx = startIdx + 1;
    }
    return new MatrixSelection(
      matrix,
      selection.row.start,
      selection.row.end,
      startIdx,
      endIdx
    );
  }

  function getRowValue(matrix, row) {
    return matrix[row];
  }

  function getSelectionValue(matrix, selection) {
    var val = matrix.
      slice(
        selection.row.start,
        selection.row.end
      ).
      map(function (row) {
        return row.slice(
          selection.col.start,
          selection.col.end
        );
      });
    if (val.length === 0) {
      val = undefined;
    }
    return val;
  }

  function getCellValue(matrix, row, col) {
    return matrix[row] ? matrix[row][col] : undefined;
  }

  function selectAll(matrix) {
    return new MatrixSelection(matrix,
      0,
      matrix.size()[0],
      0,
      matrix.size()[1]);
  }


  /**
   * Monadic wrapper for handling matrix selections
   * @constructor
   *
   */
  function MatrixSelection(matrix, rowStart, rowEnd, colStart, colEnd) {
    this.row = {
      start: rowStart,
      end: rowEnd
    };
    this.col = {
      start: colStart,
      end: colEnd
    };
    this.matrix = matrix;
  }

  /**
   * Selects the specified matrix rows range.
   * The selection spans from startIdx to endIdx exclusive.
   * The selection can contain 'virtual cells' - those cells,
   * which are not in the matrix yet.
   *
   * @param startIdx
   * @param endIdx - this index is not included in the selection
   * @returns {MatrixSelection}
   */
  MatrixSelection.prototype.rows = function (startIdx, endIdx) {
    return rows(this.matrix, this, startIdx, endIdx);
  };

  /**
   * Selects the specified matrix columns range.
   * The selection spans from startIdx to endIdx exclusive.
   *
   * @param startIdx
   * @param endIdx - this index is not included in the selection
   * @returns {MatrixSelection}
   */
  MatrixSelection.prototype.cols = function (startIdx, endIdx) {
    return cols(this.matrix, this, startIdx, endIdx);
  };

  MatrixSelection.prototype.val = function () {
    return getSelectionValue(this.matrix._, this);
  };

  /**
   * Compute selection dimensions.
   * @returns {[rows, cols]}
   */
  MatrixSelection.prototype.size = function () {
    return [
      this.row.end - this.row.start,
      this.col.end - this.col.start];
  };

  /**
   * Iterates over current selection including virtual cells.
   *
   * @param {Function} fn - the function to be applied at each iteration
   * @param fn.value - current cell value
   * @param fn.rowIdx - current iteration row index
   * @param fn.colIdx - current iteration col index
   */
  MatrixSelection.prototype.each = function (fn) {
    var rowEnd = this.row.end,
      colEnd = this.col.end,
      rowIdx,
      colIdx,
      curValue;
    for (rowIdx = this.row.start; rowIdx < rowEnd; rowIdx++) {
      for (colIdx = this.col.start; colIdx < colEnd; colIdx++) {
        curValue = this.matrix.get(rowIdx, colIdx);
        fn(curValue, rowIdx, colIdx);
      }
    }
  };

  /**
   * Applies a function against every value
   * in the scope of the current matrix selection.
   * If the selction exceeds the matrix dimensions
   * then matrix dimensions grow automatically.
   *
   * @param {Function} fn - Function to execute in each value of the matrix
   * @param fn.value - matrix cell value of the current iteration
   * @param fn.rowIdx - current iteration row index
   * @param fn.colIdx - current iteration column index
   * @returns {MatrixSelection} - the array of function application results
   */

  MatrixSelection.prototype.map = function (fn) {
    var self = this;
    this.each(function (val, rowId, colId) {
      if (!self.matrix._[rowId]) {
        self.matrix._[rowId] = [];
      }
      if (fn) {
        self.matrix._[rowId][colId] = fn(val, rowId, colId);
      } else {
        self.matrix._[rowId][colId] = null;
      }
    });

    return this.matrix;
  };

  /**
   * Checks each matrix value in the scope of the current selection against the predicate
   *
   * @param {Function} fn
   * @param fn.value - matrix cell value of the current iteration
   * @param fn.rowIdx - current iteration row index
   * @param fn.colIdx - current iteration column index
   * @returns {boolean} true if the predicate matches any value in the matrix.
   *                    False otherwise
   */
  MatrixSelection.prototype.some = function (fn) {
    var result = false;
    this.each(function (val, rowIdx, colIdx) {
      if (fn(val, rowIdx, colIdx)) {
        result = true;
      }
    });

    return result;
  };

  /**
   * Matrix class to handle matrix operations in functional style.
   * Wraps a simple array-based matrix representation.
   *
   * Supports the monadic row/column selection:
   *   matrix.rows(1,2).cols(2,5)
   *
   * This code results in the virtual selection covering 2 rows (row 1 and row 2)
   * and 4 columns in each row (col 2 to 5).
   *
   * Note: The selection can span beside the actual matrix dimensions.
   * This is called 'virtual cells'.
   *
   * @param arrayBasedMatrix simple array-based matrix representation
   * @constructor
   */
  var Matrix = function (arrayBasedMatrix) {
    this._ = arrayBasedMatrix || [
      []
    ];
    this.selection = selectAll(this);
  };

  /**
   * Gets the value of the corresponding matrix element/row/selection.
   *
   * @param row - row index
   * @param col - column index
   * @returns {*}
   */
  Matrix.prototype.get = function (row, col) {
    var val;
    this.selection = selectAll(this);
    if (col === undefined && row !== undefined) {
      val = getRowValue(this._, row);
    } else if (row === undefined) {
      val = getSelectionValue(this._, this.selection);
    } else {
      val = getCellValue(this._, row, col);
    }
    return val;
  };

  /**
   * Puts the value to the corresponding matrix element.
   *
   * @param row
   * @param col
   * @param {*} value
   */
  Matrix.prototype.put = function (row, col, value) {
    this._[row][col] = value;
    return this;
  };

  /**
   * Returns matrix size in [rows, cols] format
   *
   * @returns {Array}
   */
  Matrix.prototype.size = function () {
    return [this._.length, this._[0].length];
  };

  Matrix.prototype.rows = function (startIdx, endIdx) {
    return rows(this, this.selection, startIdx, endIdx);
  };

  Matrix.prototype.cols = function (startIdx, endIdx) {
    return cols(this, this.selection, startIdx, endIdx);
  };

  /**
   * Iterates over each matrix value.
   *
   * @param {Function} fn - function which will be applied to each matrix value
   * @param fn.value - current cell value
   * @param fn.rowId - current cell row index
   * @param fn.colId - current cell column index
   * @returns {Matrix}
   */
  Matrix.prototype.each = function (fn) {
    _.each(this._, function (row, rowId) {
      _.each(row, function (val, colId) {
        fn(val, rowId, colId);
      });
    });
  };

  /**
   * Maps each matrix value to function application result.
   *
   * @param {Function} fn - function which will be applied to each matrix value.
   * It's result will be written as current matrix cell value.
   * @param fn.value - current cell value
   * @param fn.rowId - current cell row index
   * @param fn.colId - current cell column index
   * @returns {Matrix}
   */
  Matrix.prototype.map = function (fn) {
    var self = this;
    _.each(this._, function (row, rowId) {
      _.each(row, function (val, colId) {
        self.put(rowId, colId, fn(val, rowId, colId));
      });
    });
    return this;
  };

  /**
   * Checks each matrix value against the predicate.
   *
   * @param {Function} fn
   * @param fn.value - matrix cell value of the current iteration
   * @param fn.rowIdx - current iteration row index
   * @param fn.colIdx - current iteration column index
   * @returns {boolean} true if the predicate matches any value in the matrix.
   *                    False otherwise
   */
  Matrix.prototype.some = function (fn) {
    return _.some(this._, function (row, rowId) {
      return _.some(row, function (val, colId) {
        return fn(val, rowId, colId);
      });
    });
  };

  return Matrix;
}(_));
/*jslint vars: true, nomen: true, plusplus: true, browser: true, white: true */
/*global jQuery */
var Pocketry = (function ($, _) {
	'use strict';

	function Board(container, rowSpan, options) {
		var self = this;

		function init() {
			this.container = $(container);
			options = options || {};

			self.slotSize = options.slotSize || 100; // TODO: determine based on tile size within DOM
			self.filterClass = options.filterClass || "is-hidden"; // TODO: document

			var a = self.determineColCount();
			if (!a) {
				return;
			}
			self.layout = new Pocketry.Layout(a, rowSpan);
			self.initTiles(this.container);

			this.draggable();
			window.addEventListener('resize', Pocketry.debounce(10, self.onResize));
		}

		this.initTiles = function (container) {
			var self = this;
			var tiles = _.map(container.children(), function (item, index) {
				var type = $(item).attr('data-type');
        var tileId =$(item).attr('data-tileid');
				var freezed = Boolean($(item).attr('data-freezed'));
				var tile = _.extend(_.clone(self.getTileType(type)), {
					el: $(item),
					id: '#' + (index + 1),
					freezed: freezed,
          tileId: tileId
				});
				return tile;
			});

			tiles.forEach(self.add);
			tiles.forEach(self.position);
			self.updateContainerDimensions();
			return tiles;
		};

		this.getTileType = function (type) {
			return Board.TILES[type] || Board.TILES[0];
		};

		this.onResize = function () {
			if (visible(self.container)) {
				self.updateContainerDimensions();
				self.relayout();
			}
		};

		function visible(element) {
			return element[0].offsetHeight > 0 && element[0].offsetWidth > 0;
		}

//		var arrayAppendTiles  = function(item){
//			this.container.append(item.el);
//		};

		this.relayout = function (topNode) {
			this.layout.stack.map(updateVisibility);
			this.layout.rebuild();

			//synchronize dom with stack state
			// TODO: Why do we need this change?
			//this.layout.stack.map(arrayAppendTiles.bind(this));
			this.layout.stack.forEach(function (tile) {
				if (tile === self._dragTile) { // avoid repositioning active dragee -- XXX: breaks encapsulation
					return;
				}

				self.position(tile);
			});

			if (topNode) {
				topNode.parentNode.appendChild(topNode); // z-index hack -- TODO: use "transitionend" event instead
			}
			this.publish('relayout');
		};

		function updateVisibility(tile) {
			tile.hidden = tile.el.hasClass('is-hidden');
		}

		this.updateContainerDimensions = function () {
			this.container.css('width', '');
			this.layout.colCount = this.determineColCount();
			this.container.css({ // force expansion, required due to children's abspos
				width: (this.layout.colCount * this.slotSize) + 'px',
				height: (this.layout.matrix.size()[0] * this.slotSize) + 'px'
			});
		};

		this.add = function (tile) {
			tile.hidden = tile.el.hasClass(self.filterClass);
			tile.el.css({
				width: (tile.size[0] * self.slotSize) + 'px',
				height: (tile.size[1] * self.slotSize) + 'px'
			});

			self.layout.add(tile);
		};

		this.position = function (tile) {
			var x = tile.position.x * self.slotSize;
			var y = tile.position.y * self.slotSize;
			// firefox cannot render translate good enough with big number of elements
			var transform = 'translate(' + x + 'px, ' + y + 'px)';
			tile.el.css({
				'-webkit-transform': transform,
				transform: transform
			});
		};

		this.determineColCount = function () {
			var container = this.container[0];
			var colCount = 1;
			if (container) {
				colCount = Math.floor(container.offsetWidth / this.slotSize);
			}
			return colCount;
		};

		init.call(self);
	}

	Board.TILES = {
		pin: { size: [1, 1], icon: '○' },
		app: { size: [2, 2], icon: '□' },
		feed: { size: [3, 2], icon: '▭' },
		placeholder: { size: [1, 1] }
	};

	return Board;

}(jQuery, _));

/*jslint vars: true, plusplus: true, nomen: true, white: true */
/*global Pocketry, Matrix */
Pocketry.Layout = function () {

	'use strict';
// `rowSpan` indicates the max. vertical size of an individual element
	function Layout(colCount, rowSpan) {
		this.colCount = colCount;
		this.rowSpan = rowSpan;
		this.init();
	}

	Layout.prototype.init = function () {
		this.stack = []; // one-dimensional array of tiles
		// two-dimensional array; rows * columns
		// initialized to colCount * rowSpan width by default
		this.matrix = this.initMatrix();
		delete this.scanStartPosition;
	};

	Layout.prototype.initMatrix = function () {
		return new Matrix().rows(0, this.rowSpan).cols(0, this.colCount).map();
	};

// adds a tile to the matrix
// that object must have a `size` property of the form `[width, height]`
	Layout.prototype.add = function (tile) {
		if (tile.hidden) {
			this.stack.push(tile); // XXX: DRY!
			return [];
		}

		if (this._canFitTile(tile)) {
			var unplaced = this.walk(
					tryToFitTile(tile),
					tile.size,
					this.scanStartPosition
			);
			if (unplaced) { // try again
				this._markRowAsScanned();
				this.extend();
				return this.add(tile);
			}
			this._markScanPositionAtTile(tile);

			this.stack.push(tile);
		}
		return [];
	};

	Layout.prototype._canFitTile = function (tile) {
		return tile.size[0] <= this.matrix.size()[1];
	};

	Layout.prototype._markRowAsScanned = function () {
		this.scanStartPosition = {
			col: 0,
			row: this.matrix.size()[0]
		};
	};

	Layout.prototype._markScanPositionAtTile = function (tile) {
		// the position advances only
		// if the tile fits within the row height
		if (tile.size[1] >= this.rowSpan) {
			this.scanStartPosition = {
				col: tile.position.x + tile.size[0],
				row: (this.scanStartPosition ? this.scanStartPosition.row : 0)
			};
		}
	};

	/**
	 * Predicate which determine if the current tile is placed
	 *
	 * @param tile - current tile to check
	 * @returns {boolean} true if tile is placed
	 */
	function placedTile(tile) {
		return tile !== undefined && tile !== null;
	}

	function tryToFitTile(tile) {
		return function (tileSelection) {
			if (tileSelection.some(placedTile)) {
				return false;
			} else {
				tileSelection.map(function () {
					return tile;
				});
				tile.position = { x: tileSelection.col.start, y: tileSelection.row.start };
				return true;
			}
		};
	}

	/**
	 * Moves tiles in the stack to specified position.
	 * If position is not specified put tile to the end.
	 *
	 * @param tile - tile to move
	 * @param toPosition - position to move
	 */
	Layout.prototype.move = function (tile, toPosition) {
		// freezed tiles should not move
		if (tile.freezed) {
			return;
		}
		if (toPosition == null) {
			toPosition = -1;
		}
		var stack = this.stack;
		_.remove(stack, tile);
		if (toPosition !== -1) {
			stack.splice(toPosition, 0, tile);
		} else {
			stack.push(tile);
		}
		this.rebuild();
	};

	/**
	 * Rebuild matrix according to the current tails stack state.
	 *
	 */
	Layout.prototype.rebuild = function () {
		var self = this;
		var stack = this.stack;
		this.init();
		stack.forEach(function (tile) {
			self.add(tile);
		});
	};

	/**
	 * Returns a tile from the layout
	 * denoted by its position
	 *
	 * @param position - tile position object
	 * @returns {*}
	 */
	Layout.prototype.getTile = function (position) {
		return this.matrix.get(position.y, position.x);
	};

	/**
	 * Moves the given tile to the new position in the layout.
	 *
	 * @param tile - a tile to be repositioned
	 * @param newPosition - new position coordinates within the layout
	 */
	Layout.prototype.moveTo = function (tile, newPosition) {
		var n = this.getStackNeighbor(newPosition);
		// do not move tiles if the neighbor is freezed
		if (n && n.freezed) {
			return;
		}
		var newStackIndex = this.getTileInsertIndex(n, newPosition);
		this.move(tile, newStackIndex);
	};

	/**
	 * Determines the nearest stack neighbor for the given position.
	 * Depends on the walk algorithm implementation.
	 *
	 * @param position
	 * @returns {*}
	 */
	Layout.prototype.getStackNeighbor = function (position) {
		position = normalizeBounds(position, this.matrix.size());
		var neighbor = this.matrix.get(position.y, position.x);
		while (!neighbor) {
			position = stepUp(position, this.rowSpan);
			position = stepRight(position, this.matrix.size()[1] - 1, this.rowSpan);
			if (isLayoutEnded(position, this.stack)) {
				break;
			}
			neighbor = this.getStackNeighbor(position);
		}

		return neighbor;
	};

	/**
	 * This method returns the normalized movement coordinates.
	 * Normalization ensures that target coordinates never get out of container's bounds.
	 */
	function normalizeBounds(position, container) {
		var normalized = {x: position.x, y: position.y};

		normalized.x = Math.max(0, position.x);
		normalized.x = Math.min(container[1], position.x);

		normalized.y = Math.max(0, position.y);
		normalized.y = Math.min(container[0], position.y);

		return normalized;
	}

	function stepUp(position, rowHeight) {
		var offsetInsideRow = position.y % rowHeight;
		if (offsetInsideRow !== 0) {
			// if not topmost position in a row
			// position is advanced to the top
			position.y -= offsetInsideRow;
		}
		return position;
	}

	function stepRight(position, rowLength, rowHeight) {
		if (position.x >= rowLength) {
			// search in the next row
			position.x = 0;
			position.y += rowHeight;
		} else {
			position.x += 1;
		}
		return position;
	}

	function isLayoutEnded(position, stack) {
		var lastTile = stack[stack.length - 1];
		return (position.x > lastTile.position.x
				&& position.y >= lastTile.position.y);
	}

	/**
	 * Determines whether the tile should be inserted before or after
	 * its neighbor
	 * @param neighbor - neighbor tile
	 * @param position - tile target position
	 * @returns {number}
	 */
	Layout.prototype.getTileInsertIndex = function (neighbor, position) {
		if (!neighbor) {
			return -1;
		}
		var stackIndex = this.stack.indexOf(neighbor),
				np = neighbor.position;

		if (position.x > np.x + neighbor.size[0] / 2) {
			stackIndex += 1;
		}

		return stackIndex;
	};

	/**
	 * Iterates through the layout.
	 * Each iteration is based on the matrix selection.
	 * Selection size is identical to the passed stepSize parameter.
	 *
	 * The resulting 'selection cursor' iterates through
	 * all possible selection area positions.
	 *
	 * The callback is applied to each iteration selection.
	 *
	 * @param {Function} callback - function to be applied to each selection.
	 * @param callback.selection - the current selection of the stepSize size.
	 * @param callback.iteration - the current iteration number
	 * @param stepSize - the [cols, rows] size of the iteration selection.
	 * Defaults to [1,1]
	 * @param scanOffset - denotes the number of rows and columns to skip
	 * @returns {boolean}
	 */
	Layout.prototype.walk = function (callback, stepSize, scanOffset) {
		stepSize = stepSize || [1, 1];
		scanOffset = scanOffset || {col: 0, row: 0};

		var stop = false,
				row = scanOffset.row,
				totalRows = this.matrix.size()[0];

		// walk row by row
		while ((row < totalRows) && !stop) {
			var currentRowToScan = this._getRowToScan(row, scanOffset.col);
			stop = this._scanRow(currentRowToScan, stepSize, callback);
			row += this.rowSpan;
		}

		return !stop;
	};

	/**
	 * Return a row selection from the underlying matrix.
	 * This selection will be scanned by walk algorithm.
	 *
	 * @param rowOffset - the row index offset
	 * @param colOffset - the col index offset
	 * @returns {*|MatrixSelection}
	 * @private
	 */
	Layout.prototype._getRowToScan = function (rowOffset, colOffset) {
		return this.matrix.
				rows(
				rowOffset,
						rowOffset + this.rowSpan
		).
				cols(
				colOffset,
				this.matrix.size()[1]
		);
	};

	/**
	 * Scans the specified row and apply the callback on each step
	 *
	 * @param row - the row to be scanned
	 * @param stepSize - the size of the scan step
	 * @param callback - the function to be applied on each step
	 * @returns {boolean}
	 * @private
	 */
	Layout.prototype._scanRow = function (row, stepSize, callback) {
		var stepNumber = 0,
				selection = {row: {start: 0, end: 0}, col: {start: 0, end: 0}},
				stop = false;

		var steps = this._getNumberOfScanSteps(row, stepSize);
		while (stepNumber < steps && !stop) {
			selection = this._nextTopDownScanStep(
					stepNumber,
					stepSize,
					row);
			stop = callback(
					this.matrix.
							rows(selection.row.start, selection.row.end).
							cols(selection.col.start, selection.col.end),
					stepNumber
			);
			stepNumber++;
		}

		return stop;
	};

	/**
	 * Returns the number of scan steps for the given matrix.
	 *
	 * @param matrix - matrix to be scanned
	 * @param stepSize - the size of the scan step
	 * @returns {number}
	 * @private
	 */
	Layout.prototype._getNumberOfScanSteps = function (matrix, stepSize) {
		var sz = matrix.size();

		// assume that adjacent steps are always of size 1
		var inRow = sz[0] - stepSize[1] + 1;
		var inCol = sz[1] - stepSize[0] + 1;
		return inRow * inCol;
	};

	/**
	 * Compute next iteration step statically
	 * based on the current iteration number.
	 * The algorithm is 'top-down column scan', based on matrix dimensions:
	 *
	 * [ 1 3 ]
	 * [ 2 4 ]
	 *
	 * [ 1 3 5 7 ]
	 * [ 2 4 6 8 ]
	 *
	 * [ 1 4 7 ]
	 * [ 2 5 8 ]
	 * [ 3 6 9 ]
	 *
	 * The underlying matrix is divided in columns.
	 * Each column is scanned top to bottom.
	 *
	 * @param stepNumber - current iteration number
	 * @param stepSize - selection dimensions
	 * @param scanArea - matrix selection to be scanned
	 * @returns {*} - current walk selection
	 */
	Layout.prototype._nextTopDownScanStep = function (stepNumber, stepSize, scanArea) {

		var stepRowIdx, stepColIdx, stepsPerColumn;

		stepsPerColumn = scanArea.size()[0] - stepSize[1] + 1;
		stepColIdx = scanArea.col.start + Math.floor(stepNumber / stepsPerColumn);
		stepRowIdx = scanArea.row.start + stepNumber % stepsPerColumn;

		var step = {
			row: {
				start: stepRowIdx,
				end: stepRowIdx + stepSize[1]
			},
			col: {
				start: stepColIdx,
				end: stepColIdx + stepSize[0]
			}
		};

		return step;
	};

// add a set of rows (based on row span)
	Layout.prototype.extend = function () {
		var newRowIdx = this.matrix.size()[0];
		this.matrix.rows(newRowIdx, newRowIdx + this.rowSpan).map();
	};

	return Layout;

}();

/*jslint vars: true, nomen: true, plusplus: true, browser: true, white: true */
/*global Pocketry, jQuery, _ */
(function ($, _) {
  'use strict';

  Pocketry.prototype.draggable = function () {

    var self = this;
    this.init = function () {
      var tiles = this.container.children(':not(.draggable) :not([data-freezed=true])');
      $.each(tiles, function (index, node) {

        if (node.draggable != null) {
          node.draggable('destroy');
        }

        var draggie = new Draggabilly(node, {
					containment: self.container[0],
					forceTranslatePositioning: true
				});

        draggie.on('dragStart', self.onPick);
        draggie.on('dragMove', Pocketry.debounce(50, function () {
          if (self._dragTile) {
            self.onMove.apply(self, arguments);
          }
        }));
        draggie.on('dragEnd', self.onDrop);
        $(node).addClass('draggable');
      });
      return tiles;
    };

    this.onPick = function (draggie, ev, pointer) {
      self._dragTile = self.determineTile(
        draggie.position,
        self.layout.matrix,
        self.slotSize
      );
    };

    this.onMove = function (draggie, ev, pointer) {
      console.debug(draggie.position, pointer.x, pointer.y);
    };

    this.onDrop = function (draggie, ev, pointer) {
      console.log('onDrop');
      var relativePointer = getRelativePointer(pointer);
      var target = self.determineDropTarget(relativePointer);
      var dragTile = self._dragTile;
      delete self._dragTile; // ensures element snaps into position

      if (dragTile === target.tile) { // reset
        self.position(dragTile);
      } else {
        self.layout.moveTo(dragTile, target.tilePosition);
        self.relayout();
      }
      self.publish('tile-dropped', {
        tile: dragTile,
        distance: draggie.dragPoint
      });
    };

    function getRelativePointer(pointer){
      var offset = Pocketry.offset(self.container);
      return {
        x: pointer.pageX - offset.left,
        y: pointer.pageY - offset.top
      };
    }

    this.determineTile = function (targetPos) {
      var tilePosition = determineTilePosition(targetPos, this.slotSize);
      return this.layout.getTile(tilePosition);
    };

    function determineTilePosition(coords, slotSize) {
      return {
        x: Math.floor(coords.x / slotSize),
        y: Math.floor(coords.y / slotSize)
      };
    }

    this.determineDropTarget = function (targetPos) {
      return {
        position: targetPos,
        tilePosition: determineTilePosition(targetPos, this.slotSize),
        tile: this.determineTile(targetPos)
      };
    };

    this.init.call(this);

    return self;
  };
}(jQuery, _));

/*jslint vars: true, browser: true, white: true */
/*global Pocketry */

Pocketry.prototype.publish = function(msg, data) {
	var listeners = this.subscriptions && this.subscriptions[msg];
	if(!listeners) {
		return;
	}
	var self = this;
	listeners.forEach(function(listener) {
		listener.call(self, data);
	});
};

Pocketry.prototype.subscribe = function(msg, callback) {
	var subs = this.subscriptions;
	if(!subs) {
		subs = this.subscriptions = {};
	}
	if(!subs[msg]) {
		subs[msg] = [];
	}
	subs[msg].push(callback);
	console.log('subscriptions', subs);
};

/**
 * Stop listening for determined message. If some callback
 * is specified, will remove just the callback, if not, will
 * remove all the callbacks.
 * @param  {string}   msg      event name
 * @param  {Function} callback the handler or undefined for unsubscribe for all
 * @return {void}
 */
Pocketry.prototype.unsubscribe = function(msg, callback) {
	if(this.subscriptions && this.subscriptions[msg]) {
		if (callback != null) {
			var index = this.subscriptions[msg].indexOf(callback);
			if (index >= 0) {
				this.subscriptions[msg].splice(index, 1);
			}
		} else {
			this.subscriptions[msg] = [];
		}
	}
};

/**
 * Stop to listen to all events.
 * @return {void}
 */
Pocketry.prototype.deafen = function() {
	this.subscriptions = {};
};

// adapted from StuffJS (https://github.com/bengillies/stuff-js)
Pocketry.debounce = function(wait, fn) {
	var timer;
	return function() {
		var self = this,
			args = arguments;
		if(timer) {
			clearTimeout(timer);
			timer = null;
		}
		timer = setTimeout(function() {
			fn.apply(self, args);
			timer = null;
		}, wait);
	};
};

Pocketry.offset = function(el) {
  var domElement = el[0],
  body = document.documentElement || document.body,
  scrollX = window.pageXOffset || body.scrollLeft,
  scrollY = window.pageYOffset || body.scrollTop,
  x = domElement.getBoundingClientRect().left + scrollX,
  y = domElement.getBoundingClientRect().top + scrollY;
  return { left: x, top:y };
};
