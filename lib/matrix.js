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
   *
   * @param startIdx
   * @param endIdx
   * @returns {MatrixSelection}
   */
  MatrixSelection.prototype.rows = function (startIdx, endIdx) {
    endIdx = (endIdx > -1 && endIdx <= this.row.end) ? endIdx : this.row.end;
    return new MatrixSelection(this._, startIdx, endIdx, this.col.start, this.col.end);
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
    endIdx = (endIdx > -1 && endIdx <= this.col.end) ? endIdx : this.col.end;
    return new MatrixSelection(this._, this.row.start, this.row.end, startIdx, endIdx);
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
   * Applies a function against every value
   * in the scope of current matrix selection.
   *
   * @param {Function} fn - Function to execute on each value of the matrix
   * @param fn.value - matrix cell value of the current iteration
   * @param fn.rowIdx - current iteration row index
   * @param fn.colIdx - current iteration column index
   */
  MatrixSelection.prototype.each = function (fn) {
    var self = this;
    this._.reduce(function (rowAcc, row, rowIdx) {
      if (self.isRowSelected(rowIdx)) {
        row.reduce(function (colAcc, col, colIdx) {
          if (self.isColSelected(colIdx)) {
            fn(col, rowIdx, colIdx);
          }
        });
      }
    });
  };

  /**
   * Applies a function against every value
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
    if (col === undefined) {
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
  Matrix.prototype.put = function(row, col, value){
     this._[row][col] = value;
  };

// expose selection methods on Matrix prototype
  ['rows', 'cols', 'each', 'map', 'some'].forEach(function (method) {
    Matrix.prototype[method] = function () {
      return MatrixSelection.prototype[method].apply(this.selection, arguments);
    };
  });

  return Matrix;
}());