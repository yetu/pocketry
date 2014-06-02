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
    return [];
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
