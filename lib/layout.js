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

  Layout.placeholder = {
    id: 'placeholder',
    size: [1, 1],
    placeholder: 1 // 1 = implicit, 2 = explicit
  };

  Layout.prototype.init = function () {
    this.stack = []; // one-dimensional array of tiles
    // two-dimensional array; rows * columns
    // initialized to colCount * rowSpan width by default
    this.matrix = this.initMatrix();
    delete this.tail;
  };

  Layout.prototype.initMatrix = function () {
    var arr = [];
    for (var i = 0; i < this.rowSpan; i++) {
      arr.push(new Array(this.colCount));
    }
    return new Matrix(arr);
  };

// adds a tile to the matrix
// that object must have a `size` property of the form `[width, height]`
// returns a list of placeholders used to fill gaps within the layout
  Layout.prototype.add = function (tile) {
    if (tile.hidden) {
      this.stack.push(tile); // XXX: DRY!
      return [];
    }

    var width = tile.size[0];
    var height = tile.size[1];
    var prevTail = this.tail;

    var unplaced = this.walk(this.tail, function (rowIndex, colIndex, span) {
      if (span === 0 || height === 1) { // larger elements are top-aligned
        var _rowIndex = rowIndex + span;
        var fit = this.put(tile, _rowIndex, colIndex);
        if (fit) {
          tile.position = { x: colIndex, y: _rowIndex };
          this.tail = {
            x: colIndex + (width - 1),
            y: _rowIndex + (height - 1)
          };
          return false; // halt
        }
        return true; // continue
      }
    });
    if (unplaced) { // try again
      this.extend();
      return this.add.apply(this, arguments);
    }

    // fill gaps
    var placeholders = [];
    this.walk(prevTail, function (rowIndex, colIndex, span) {
      var _rowIndex = rowIndex + span;
      if (colIndex === this.tail.x && _rowIndex === this.tail.y) {
        return false; // halt
      }
      var val = this.matrix.
        get(_rowIndex, colIndex);
      if (val === undefined) {
        var placeholder =
          createPlaceholder(colIndex, _rowIndex, placeholders);
        this.matrix.put(_rowIndex, colIndex, placeholder);
      }
      return true;
    });

    this.stack.push(tile);
    return placeholders || [];
  };

  function createPlaceholder(colIndex, _rowIndex, placeholders) {
    var placeholder = Object.create(Layout.placeholder);
    placeholder.position = { x: colIndex, y: _rowIndex };
    placeholders.push(placeholder);
    return placeholder;
  }

// traverse the matrix while alternating between row-spans
// `cont` is an optional object with matrix coordinates to start from
// `callback` is invoked in the context of the instance and provided the current
// row, column and row-span index - if it returns `false`, further traversal is
// halted
// returns a boolean indicating whether traversal ran to completion
  Layout.prototype.walk = function (start, callback) {
    if (callback === undefined) { // shift arguments
      callback = start;
      start = undefined;
    }

    var rowIndex, colIndex, span;
    var rowStart = 0;
    var colStart = 0;
    if (start) {
      colStart = start.x;
      rowStart = start.y;
      rowStart -= rowStart % this.rowSpan; // row loop must start at the top
    }

    this.matrix.rows(rowStart).cols(colStart).each(function (val, rowIdx, colIdx) {
      return;
    });

    for (rowIndex = rowStart; rowIndex < this.matrix.size()[0]; rowIndex++) {
      if (rowIndex !== rowStart) { // start column only applies to initial row
        colStart = 0;
      }
      if (rowIndex % this.rowSpan === 0) { // alternating between row spans
        for (colIndex = colStart; colIndex < this.colCount; colIndex++) {
          for (span = 0; span < this.rowSpan; span++) {
            var cont = callback.call(this, rowIndex, colIndex, span);
            if (cont === false) {
              return false;
            }
          }
        }
      }
    }
    return true;
  };

// mark the given area's slots as occupied by the given object
// returns `false` if the area is already (partially) occupied
// NB: does not support irregular shapes
  Layout.prototype.put = function (tile, rowIdx, colIdx) { // XXX: almost entirely duplicates `checkFit`
    var fit = this.checkFit(tile, rowIdx, colIdx);
    if (!fit) {
      return false;
    }

    var bottom = rowIdx + tile.size[1] - 1;
    var right = colIdx + tile.size[0] - 1;
    var self = this;
    this.matrix.rows(rowIdx, bottom).cols(colIdx, right).each(function (val, rid, cid, put) {
      put(tile);
    });

    return true;
  };

// check whether the given area's slots are available and unoccupied
  Layout.prototype.checkFit = function (tile, rowIdx, colIdx) {
    var width = tile.size[0];
    var height = tile.size[1];
    if (colIdx + width > this.colCount) {
      return false;
    }

    var bottom = rowIdx + height - 1;
    var right = colIdx + width - 1;

    var occupied = this.matrix.
      rows(rowIdx, bottom).
      cols(colIdx, right).
      some(function (val, rid, cid) {
        return val !== undefined;
      });

    return !occupied;
  };

// add a set of rows (based on row span)
  Layout.prototype.extend = function () {
    var i;
    for (i = 0; i < this.rowSpan; i++) {
      var row = new Array(this.colCount);
      this.matrix.appendRow(row);
    }
    return
  };

// collapse gaps
  Layout.prototype.compact = function () {
    var obsolete = [];
    var candidates = [];
    var occupied = false;
    var height = 0;
    var i;

    function nextColumn() {
      if (!occupied) {
        obsolete = obsolete.concat(candidates);
      }
      candidates = [];
      occupied = false;
      height = 0;
    }

    for (i = 0; i < this.stack.length; i++) {
      var tile = this.stack[i];
      var tileHeight = tile.size[1];

      height += tileHeight;
      if (height > this.rowSpan) {
        nextColumn();
        height = tileHeight;
      }

      if (!occupied && tile.placeholder) {
        candidates.push(i);
      } else {
        occupied = true;
      }

      if (height === this.rowSpan) {
        nextColumn();
      }
    }

    for (i = obsolete.length - 1; i >= 0; i--) {
      this.stack.splice(obsolete[i], 1);
    }
  };

  return Layout;

}();
