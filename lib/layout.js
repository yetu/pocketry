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
    delete this.filledRows;
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

    var unplaced = this.walk(tryToFitTile(tile), tile.size, this.filledRows);
    if (unplaced) { // try again
      this.filledRows = this.matrix.size()[0];
      this.extend();
      return this.add(tile);
    }

    this.stack.push(tile);
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
    if (toPosition == null) {
      toPosition  = -1;
    }
    var stack = this.stack;
    _.remove(stack, tile);
    if (toPosition !== -1) {
      stack.splice(toPosition, 0, tile);
    } else {
      stack.push(tile);
    }
  };

  /**
   * Rebuild matrix according to the current tails stack state.
   *
   */
  Layout.prototype.rebuild = function(){
    var self = this;
    var stack = this.stack;
    this.init();
    stack.forEach(function (tile) {
      self.add(tile);
    });
   // this.compact();
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
   * @param stepSize - the [cols, rows] size of the iteration selection.
   * Defaults to [1,1]
   * @param rowOffset - the number of rows to skip
   * @returns {boolean}
   */
  Layout.prototype.walk = function (callback, stepSize, rowOffset) {
    stepSize = stepSize || [1, 1];
    rowOffset = rowOffset || 0;

    var stop = false,
      totalRows = this.matrix.size()[0];

    // walk row by row
    while ((rowOffset < totalRows) && !stop) {
      var currentRowToScan = this._getRowToScan(rowOffset);
      stop = this._scanRow(currentRowToScan, stepSize, callback);
      rowOffset += this.rowSpan;
    }

    return !stop;
  };

  /**
   * Return a row selection from the underlying matrix.
   *
   * @param offset - the index offset
   * @returns {*|MatrixSelection}
   * @private
   */
  Layout.prototype._getRowToScan = function (offset) {
    return this.matrix.
      rows(
        offset,
        offset + this.rowSpan
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
      selection = this._nextScanStep(
        stepNumber,
        stepSize,
        row);
      stop = callback(
        this.matrix.
          rows(selection.row.start, selection.row.end).
          cols(selection.col.start, selection.col.end)
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
   * Compute next iteration step statically based on the current iteration number.
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
   * The underlying matrix is divided in blocks.
   * Each block is a square with it's side equals minimal dimension.
   * We assume row height to be the minimal dimension in all our cases!
   * Each block is scanned from left to right (rowscan)
   * and from top to bottom (colscan).
   *
   * @param stepNumber - current iteration number
   * @param stepSize - selection dimensions
   * @param scanArea - matrix selection to be scanned
   * @returns {*} - current walk selection
   */
  Layout.prototype._nextScanStep = function (stepNumber, stepSize, scanArea) {
    var maxRows = scanArea.size()[0];
    var maxCols = scanArea.size()[1];
    // This variable determine the num of iterations
    // to be covered by rowscan routine
    var rowIterations = maxRows - stepSize[1] + 1;
    var colIterations = maxCols - stepSize[0] + 1;

    // determine the block size for the current layout
    // block is the minimal square which covers layout row without gaps
    // each block will be scanned left-to-right top-to-bottom
    // examples:
    // 2x4 matrix   [ B B x x]
    // 2x2 block    [ B B x x]
    //
    // 5x3 matrix  [ B B B ]
    // 3x3 block   [ B B B ]
    //             [ B B B ]
    //             [ x x x ]
    //             [ x x x ]

    var blockSize = Math.min(colIterations, rowIterations);
    // if there isn't integer number of blocks in the row
    // adjust block size if scan is approaching the right side:
    //
    // [ B B X X X]  => [ X X B B X] => We need to squash block dimension
    // [ B B X X X]     [ X X B B X]    which means lower col iterations num
    var availableColsIterations = blockSize;
    if (colIterations % blockSize > 0) {
      availableColsIterations = colIterations - columnOffset(stepNumber, blockSize);
    }

    // this function determines how many rows
    // have been already covered by iterations
    function scannedRows(stepNumber, blockSize) {
      return Math.floor(stepNumber / blockSize);
    }

    // this function determines how many blocks
    // have been already covered by iterations
    function scannedBlocks(stepNumber, blockSize) {
      return Math.floor(stepNumber / (blockSize * blockSize));
    }

    // this function determines how many columns have been covered
    // to the left side of the current cursor
    function columnOffset(stepNumber, blockSize) {
      return blockSize * scannedBlocks(stepNumber, blockSize);
    }

    function nextRowIndex() {
      return scannedRows(
        stepNumber,
        Math.min(availableColsIterations, blockSize)
      ) % rowIterations;
    }

    function nextColIndex() {
      return (blockSize < colIterations ?
        columnOffset(stepNumber, blockSize) : 0)
        + stepNumber % Math.min(availableColsIterations, blockSize);
    }

    var stepRowIdx = scanArea.row.start + nextRowIndex();
    var stepColIdx = scanArea.col.start + nextColIndex();

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
