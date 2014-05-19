/*jslint vars: true, nomen: true, plusplus: true, browser: true, white: true */
/*global jQuery */
var Pocketry = (function ($) {

  'use strict';
  function Board(container, rowSpan, options) {
    options = options || {};
    this.filterClass = options.filterClass || "hidden"; // TODO: document

    this.container = container.jquery ? container : $(container);
    this.slotSize = 100; // TODO: determine based on tile size within DOM
    this.layout = new Pocketry.Layout(this.determineColCount(), rowSpan);

    // read tiles from DOM
    var tiles = [];
    var self = this;
    Array.prototype.forEach.call(this.container.children(), function (node, i) {
      var el = $(node);
      var type = el.attr('data-type');

      var tile = Board.TILES[type];
      if (!tile) {
        return;
      }

      tile = Object.create(tile);
      tile.id = '#' + (i + 1); // XXX: DEBUG?
      tile.type = type; // XXX: DEBUG?
      tile.el = el;
      tiles.push(tile);

      self.add(tile);
      self.position(tile);
    });
    this.container.addClass('animated');

    this.draggable();
    var onResize = this.onResize.bind(this);
    window.addEventListener('resize', Pocketry.debounce(10, onResize));
  }

  // XXX:
// * type->size mapping won't be reliable in the future
// * icons are merely used for debugging
  Board.TILES = {
    pin: { size: [1, 1], icon: '○' },
    app: { size: [2, 2], icon: '□' },
    feed: { size: [3, 2], icon: '▭' },
    placeholder: { size: [1, 1] }
  };


  Board.prototype.onResize = function () {
    this.updateContainerDimensions();
    this.relayout();
  };

  Board.prototype.relayout = function (topNode) {
    var self = this;
    var layout = this.layout;

    layout.compact();
    var stack = layout.stack;
    layout.init();
    stack.forEach(function (tile) {
      if (!tile.el[0].parentNode) { // tile was removed -- TODO: document
        return;
      }

      self.add(tile);
      if (tile === self._dragTile) { // avoid repositioning active dragee -- XXX: breaks encapsulation
        return;
      }
      // defer eventual position to trigger CSS animation
      setTimeout(function () {
        self.position(tile);
      }, 1);
    });

    if (topNode) {
      topNode.parentNode.appendChild(topNode); // z-index hack -- TODO: use "transitionend" event instead
    }
    this.publish('relayout');
  };

  Board.prototype.updateContainerDimensions = function () {
    this.container[0].style.width = ''; // auto-expand
    this.layout.colCount = this.determineColCount();
    this.container.css({ // force expansion, required due to children's abspos
      width: (this.layout.colCount * this.slotSize) + 'px',
      height: (this.layout.matrix.size()[0] * this.slotSize) + 'px'
    });
  };

  Board.prototype.add = function (tile) {
    tile.hidden = tile.el.hasClass(this.filterClass);
    var placeholders = this.layout.add(tile);
    var self = this;
    placeholders.forEach(function (placeholder) {
      placeholder.el = $(document.createElement(tile.el[0].nodeName));
      self.container.append(placeholder.el);
      self.position(placeholder);
    });
  };

  Board.prototype.position = function (tile) {
    var x = tile.position.x * this.slotSize;
    var y = tile.position.y * this.slotSize;
    var transform = 'translate(' + x + 'px, ' + y + 'px)';
    tile.el.css({ // TODO: move width/height into CSS?
      top: 0,
      left: 0,
      width: (tile.size[0] * this.slotSize) + 'px',
      height: (tile.size[1] * this.slotSize) + 'px',
      '-webkit-transform': transform,
      transform: transform
    });
    this.updateContainerDimensions();
  };

  Board.prototype.determineColCount = function () {
    return Math.floor(this.container[0].clientWidth / this.slotSize);
  };

  return Board;

}(jQuery));
