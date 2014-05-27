/*jslint vars: true, nomen: true, plusplus: true, browser: true, white: true */
/*global Pocketry, jQuery, Loash */
(function ($, _) {
  'use strict';

  Pocketry.prototype.draggable = function () {

    var self = this;
    this.init = function () {
      var tiles = this.container.children(':not(.draggable)');
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
      self._dragTile = determineTile(draggie.position, self.layout.matrix, self.slotSize);
    };

    this.onMove = function (draggie, ev, pointer) {
    };

    this.onDrop = function (draggie, ev, pointer) {
      var target = self.determineDropTarget(draggie.position);
      var dragTile = self._dragTile;
      delete self._dragTile; // ensures element snaps into position

      if (dragTile === target.tile) { // reset
        self.position(dragTile);
      } else {
        self.putToLayoutStack(dragTile, target);
        self.relayout(dragTile.el[0]);
      }
      self.publish('tile-dropped', {
        tile: dragTile,
        distance: draggie.dragPoint
      });
    };

    this.putToLayoutStack = function (dragTile, dropTarget) {
      var layout = self.layout;
      var dropTargetPosition = dropTarget.position;
      var dropTile = dropTarget.tile;
      if (dropTile) {
        console.log("dd",dropTarget);
        var dropTileIndex = layout.stack.indexOf(dropTarget.tile);
        console.log("droptile",dropTileIndex);
        var center = (dropTile.position.x + dropTile.size[0] / 2) * self.slotSize;
        var insertToIndex = dropTargetPosition.x > center ? dropTileIndex + 1 : dropTileIndex;
        layout.move(dragTile, insertToIndex);
      } else { // dropped somewhere after tail
        layout.move(dragTile);
      }
    };

    this.determineDropTarget = function (targetPos) {
      // use center as reference point -- XXX: use mouse pointer instead?
      var pos = {
        x: targetPos.x + (self._dragTile.size[0] * self.slotSize) / 2,
        y: targetPos.y + (self._dragTile.size[1] * self.slotSize) / 2
      };
      return {
        position: pos,
        tile: determineTile(pos, self.layout.matrix, self.slotSize)
      };
    };

    function determineTile(coords, matrix, slotSize) {
      var slot = determineSlot(coords, slotSize);
      var row = matrix.get(slot.y);
      return row !== undefined && row[slot.x];
    }

    function determineSlot(coords, slotSize) {
      return {
        x: Math.round(coords.x / slotSize),
        y: Math.round(coords.y / slotSize)
      };
    }

    this.init.call(this);

    return self;
  };
}(jQuery, _));
