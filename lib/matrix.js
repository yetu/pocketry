/*jslint nomen:true*/
/*global Matrix*/
var Matrix = (function () {
  'use strict';

  /**
   * Monadic wrapper for handling matrix selections
   * @constructor
   *
   */
  function MatrixSelection(context, rowStart, rowEnd, colStart, colEnd) {
    this.row = {
      start: rowStart,
      end: rowEnd
    };
    this.col = {
      start: colStart,
      end: colEnd
    };
    this._ = context;
  }

  /**
   * Selects the specified matrix rows range.
   * The selection spans from startIdx to endIdx.
   * The selection can contain 'virtual cells' - those cells,
   * which are not in the matrix yet.
   *
   * @param startIdx
   * @param endIdx
   * @returns {MatrixSelection}
   */
  MatrixSelection.prototype.rows = function (startIdx, endIdx) {
    if (endIdx === undefined || endIdx < -1) {
      endIdx = startIdx;
    }
    return new MatrixSelection(
      this._,
      startIdx,
      endIdx,
      this.col.start,
      this.col.end
    );
  };

  /**
   * Selects the specified matrix columns range.
   * The selection spans from startIdx to endIdx.
   *
   * @param startIdx
   * @param endIdx
   * @returns {MatrixSelection}
   */
  MatrixSelection.prototype.cols = function (startIdx, endIdx) {
    if (endIdx === undefined || endIdx < -1) {
      endIdx = startIdx;
    }
    return new MatrixSelection(
      this._,
      this.row.start,
      this.row.end,
      startIdx,
      endIdx
    );
  };

  /**
   * Checks whether the specified matrix row is selected.
   *
   * @param idx
   * @returns {boolean}
   */
  MatrixSelection.prototype.isRowSelected = function (idx) {
    return this.row.start <= idx && this.row.end >= idx;
  };

  /**
   * Checks whether the specified matrix column is selected.
   *
   * @param idx
   * @returns {boolean}
   */
  MatrixSelection.prototype.isColSelected = function (idx) {
    return this.col.start <= idx && this.col.end >= idx;
  };

  /**
   * Creates a value writing lambda.
   * Lambda writes to the current wrapped array matrix.
   *
   * @param rowId
   * @param colId
   * @returns {Function}
   */
  MatrixSelection.prototype.putter = function (rowId, colId) {
    var self = this;
    return function (val) {
      if (!self._[rowId]) {
        self._[rowId] = [];
      }
      self._[rowId][colId] = val;
    };
  };

  /**
   * Iterates through every cell in the selection.
   * Can write values to virtual cells using the `putter` function.
   *
   * @param {Function} fn - Function to execute on each value of the matrix
   * @param fn.value - matrix cell value of the current iteration
   * @param fn.rowIdx - current iteration row index
   * @param fn.colIdx - current iteration column index
   * @param fn.putter - function which writes value to the current iteration cell
   */
  MatrixSelection.prototype.each = function (fn) {
    var self = this;
    this.iterate(function (val, rowIdx, colIdx) {
      fn(val, rowIdx, colIdx, self.putter(rowIdx, colIdx));
    });
  };

  /**
   * Simple iteration function. Iterates over current selection
   * including virtual cells.
   * @param {Function} fn - the function to be applied at each iteration
   * @param fn.value - current cell value
   * @param fn.rowIdx - current iteration row index
   * @param fn.colIdx - current iteration col index
   */
  MatrixSelection.prototype.iterate = function (fn) {
    var curValue;
    for (var rowIdx = this.row.start; rowIdx <= this.row.end; rowIdx++) {
      for (var colIdx = this.col.start; colIdx <= this.col.end; colIdx++) {
        curValue = this._[rowIdx] ? this._[rowIdx][colIdx] : undefined;
        fn(curValue, rowIdx, colIdx);
      }
    }
  };

  /**
   * Applies a function against every non-virtual value
   * in the scope of the current matrix selection.
   * Returns the resulting application array.
   *
   * @param {Function} fn - Function to execute in each value of the matrix
   * @param fn.value - matrix cell value of the current iteration
   * @param fn.rowIdx - current iteration row index
   * @param fn.colIdx - current iteration column index
   * @returns {Array} - the array of function application results
   */

  MatrixSelection.prototype.map = function (fn) {
    var self = this;
    return this._.reduce(function (rowAcc, row, rowIdx) {
      if (self.isRowSelected(rowIdx)) {
        var newRow = row.reduce(function (colAcc, col, colIdx) {
          if (self.isColSelected(colIdx)) {
            colAcc.push(fn(col, rowIdx, colIdx));
          }
          return colAcc;
        }, []);
        rowAcc.push(newRow);
      }
      return rowAcc;
    }, []);
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
    var rowIdx = this.row.start;
    var colIdx = this.col.start;
    for (rowIdx; rowIdx <= this.row.end; rowIdx++) {
      for (colIdx; colIdx <= this.col.end; colIdx++) {
        if (fn(this._[rowIdx][colIdx], rowIdx, colIdx)) {
          return true;
        }
      }
    }
    return false;
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
   * Some matrix methods can work with virtual cells:
   *   - each
   *   - iterate
   * Others work with real matrix values (because there is no sense in using empty values):
   *   - map
   *   - some
   *
   * @param arrayBasedMatrix simple array-based matrix representation
   * @constructor
   */
  var Matrix = function (arrayBasedMatrix) {
    this._ = arrayBasedMatrix || [
      []
    ];
    this.selection = new MatrixSelection(this._,
      0,
      this._.length - 1,
      0,
      this._[0].length - 1);
  };

  /**
   * Gets the value of the corresponding matrix element.
   *
   * @param row - row index
   * @param col - column index
   * @returns {*}
   */
  Matrix.prototype.get = function (row, col) {
    var val;
    if (col === undefined && row !== undefined) {
      val = this._[row];
    } else if (row === undefined) {
      val = this._;
    } else {
      val = this._[row][col];
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

  /**
   * Append specified row to the matrix.
   * If no row specified - appends an empty row
   *
   * @param {Array} row
   * @returns {Matrix}
   */
  Matrix.prototype.appendRow = function (row) {
    row = (row !== undefined) ? row : [];
    this._.push(row);
    return this;
  };

// expose selection methods on Matrix prototype
  ['rows', 'cols', 'each', 'map', 'some'].forEach(function (method) {
    Matrix.prototype[method] = function () {
      return MatrixSelection.prototype[method].apply(this.selection, arguments);
    };
  });

  return Matrix;
}());