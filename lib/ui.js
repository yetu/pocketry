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
      self.filterClass = options.filterClass || "hidden"; // TODO: document

      var a = self.determineColCount();
      self.layout = new Pocketry.Layout(a, rowSpan);
      self.initTiles(this.container);

      this.draggable();
      window.addEventListener('resize', Pocketry.debounce(10, self.onResize));
    }

    this.initTiles = function (container) {
      var self = this;
      var tiles = _.map(container.children(), function (item, index) {
        var type = $(item).attr('data-type');
        var tile = _.extend(_.clone(self.getTileType(type)), {
          el: $(item),
          id: '#' + (index + 1)
        });
        return tile;
      });

      tiles.forEach(self.add);
      tiles.forEach(self.position);
      return tiles;
    };

    this.getTileType = function (type) {
      return Board.TILES[type] || Board.TILES[0];
    };

    this.onResize = function () {
      self.updateContainerDimensions();
      self.relayout();
    };

    this.relayout = function (topNode) {
      var layout = this.layout;
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

      layout.compact();
      if (topNode) {
        topNode.parentNode.appendChild(topNode); // z-index hack -- TODO: use "transitionend" event instead
      }
      this.publish('relayout');
    };

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
      self.layout.add(tile);
    };

    this.position = function (tile) {
      var x = tile.position.x * self.slotSize;
      var y = tile.position.y * self.slotSize;
      var transform = 'translate(' + x + 'px, ' + y + 'px)';
      tile.el.css({ // TODO: move width/height into CSS?
        top: 0,
        left: 0,
        width: (tile.size[0] * self.slotSize) + 'px',
        height: (tile.size[1] * self.slotSize) + 'px',
        '-webkit-transform': transform,
        transform: transform
      });
      self.updateContainerDimensions();
    };

    this.determineColCount = function () {
      var container = this.container[0];
      var colCount = 1;
      if (container) {
        colCount = Math.floor(container.clientWidth / this.slotSize);
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
