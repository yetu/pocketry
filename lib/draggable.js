/*jslint vars: true, nomen: true, plusplus: true, browser: true, white: true */
/*global Pocketry, jQuery, _ */
(function ($, _) {
  'use strict';

  Pocketry.prototype.draggable = function () {

    var self = this;
    this.init = function () {
      var tiles = this.container.children(':not(.draggable) :not([data-freezed=true])');
      $.each(tiles, function (index, node) {
        var draggie = new Draggabilly(node, { containment: self.container[0] });

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

    self.onPick = function (draggie, ev, pointer) {
      self._dragTile = self.determineTile(
        draggie.position,
        self.layout.matrix,
        self.slotSize
      );
    };

    this.onMove = function (draggie, ev, pointer) {
      console.log(draggie.position, pointer.x, pointer.y);
    };

    this.onDrop = function (draggie, ev, pointer) {
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
