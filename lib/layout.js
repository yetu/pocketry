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
    return new Matrix().rows(0, this.rowSpan).cols(0, this.colCount).map();
  };

// adds a tile to the matrix
// that object must have a `size` property of the form `[width, height]`
// returns a list of placeholders used to fill gaps within the layout
  Layout.prototype.add = function (tile) {
    if (tile.hidden) {
      this.stack.push(tile); // XXX: DRY!
      return [];
    }

    var prevTail = this.tail;

    var unplaced = this.walk(tryToFitTile(tile), tile.size, this.tail);
    if (unplaced) { // try again
      this.extend();
      return this.add(tile);
    }

    // fill gaps
//    var placeholders = [];
//    this.walk(prevTail, function (rowIndex, colIndex, span) {
//      var _rowIndex = rowIndex + span;
//      if (colIndex === this.tail.x && _rowIndex === this.tail.y) {
//        return false; // halt
//      }
//      var val = this.matrix.
//        get(_rowIndex, colIndex);
//      if (val === undefined) {
//        var placeholder =
//          createPlaceholder(colIndex, _rowIndex, placeholders);
//        this.matrix.put(_rowIndex, colIndex, placeholder);
//      }
//      return true;
//    });
//
//    this.stack.push(tile);
//    return placeholders || [];
    return [];
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
        return true;
      }

      tile.position = { x: colIndex, y: _rowIndex };

    }
  }


  function createPlaceholder(colIndex, _rowIndex, placeholders) {
    var placeholder = Object.create(Layout.placeholder);
    placeholder.position = { x: colIndex, y: _rowIndex };
    placeholders.push(placeholder);
    return placeholder;
  }

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
   * @param stepSize - the [cols, rows] size of the iteration selection.
   * @param start
   * Defaults to [1, 1]
   * @returns {boolean}
   */
  Layout.prototype.walk = function (callback, stepSize, start) {
    stepSize = stepSize || [1, 1];

    //TODO: incapsulate stop-proceed logic
    var rowStart = 0;
    var colStart = 0;
    if (start) {
      colStart = start.x;
      rowStart = start.y;
      rowStart -= rowStart % this.rowSpan; // row loop must start at the top
    }

    var self = this,
      stepNumber = 0,
      stop = false,
      selection = {row: {start: 0, end: 0}, col: {start: 0, end: 0}};

    var steps = getNumberOfSteps(this.matrix, stepSize);

    while (stepNumber < steps && !stop) {
      selection = nextStep(selection, stepNumber, stepSize, this.matrix);
      stop = callback(
        this.matrix.
          rows(selection.row.start, selection.row.end).
          cols(selection.col.start, selection.col.end)
      );
      stepNumber++;
    }

    return !stop;
  };

  function getNumberOfSteps(matrix, stepSize) {
    var sz = matrix.size();

    //XXX: stepSize is convergent to tile size, rename?
    // assume that adjacent steps are always of size 1
    var inRow = sz[0] - stepSize[1] + 1;
    var inCol = sz[1] - stepSize[0] + 1;
    return inRow * inCol;
  }

  /**
   * Compute next iteration step statically.
   * The algorithm is 'top-left', based on matrix dimensions:
   *
   * [ 1 2 ]
   * [ 3 4 ]
   *
   * [ 1 2 5 6 ]
   * [ 3 4 7 8 ]
   *
   * [ 1 2 3 ]
   * [ 4 5 6 ]
   * [ 7 8 9 ]
   *
   * The reference point is the minimal available dimension.
   * We assume row height to be the minimal dimension in all our cases!
   *
   * @param prevSelection - previous step selection
   * @param stepNumber - current iteration number
   * @param stepSize - selection dimensions
   * @param matrix - iteratee matrix
   * @returns {*} - current walk selection
   */
  function nextStep(prevSelection, stepNumber, stepSize, matrix) {
    var maxRows = matrix.size()[0];
    var maxCols = matrix.size()[1];
    // vary the row index switching
    // depending on stepSize
    var minSize = Math.floor(maxRows / stepSize[1]);

    prevSelection.row.start = Math.floor(stepNumber / minSize) % minSize;
    prevSelection.row.end = prevSelection.row.start + stepSize[1];
    prevSelection.col.start =
      minSize * Math.floor(stepNumber / (minSize * minSize))
        + stepNumber % minSize;
    prevSelection.col.end = prevSelection.col.start + stepSize[0];

    // adjust indices if the algorithm overrun the right border
    if (prevSelection.col.end > maxCols) {
      prevSelection.col.start -= 1;
      prevSelection.col.end -= 1;
      prevSelection.row.start += 1;
      prevSelection.row.end += 1;
    }

    return prevSelection;
  }

// add a set of rows (based on row span)
  Layout.prototype.extend = function () {
    var newRowIdx = this.matrix.size()[0];
    this.matrix.rows(newRowIdx, newRowIdx + this.rowSpan).map();
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
