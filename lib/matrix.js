/*jslint nomen:true*/
/*global Matrix, _*/
var Matrix = (function (_) {
  'use strict';

  /** pure functions **/

  function rows(matrix, selection, startIdx, endIdx) {
    if (endIdx === undefined || endIdx < -1) {
      endIdx = startIdx + 1;
    }
    return new MatrixSelection(
      matrix,
      startIdx,
      endIdx,
      selection.col.start,
      selection.col.end
    );
  }

  function cols(matrix, selection, startIdx, endIdx) {
    if (endIdx === undefined || endIdx < -1) {
      endIdx = startIdx + 1;
    }
    return new MatrixSelection(
      matrix,
      selection.row.start,
      selection.row.end,
      startIdx,
      endIdx
    );
  }

  function getRowValue(matrix, row) {
    return matrix[row];
  }

  function getSelectionValue(matrix, selection) {
    var val = matrix.
      slice(
        selection.row.start,
        selection.row.end
      ).
      map(function (row) {
        return row.slice(
          selection.col.start,
          selection.col.end
        );
      });
    if (val.length === 0) {
      val = undefined;
    }
    return val;
  }

  function getCellValue(matrix, row, col) {
    return matrix[row] ? matrix[row][col] : undefined;
  }

  function selectAll(matrix) {
    return new MatrixSelection(matrix,
      0,
      matrix.size()[0],
      0,
      matrix.size()[1]);
  }


  /**
   * Monadic wrapper for handling matrix selections
   * @constructor
   *
   */
  function MatrixSelection(matrix, rowStart, rowEnd, colStart, colEnd) {
    this.row = {
      start: rowStart,
      end: rowEnd
    };
    this.col = {
      start: colStart,
      end: colEnd
    };
    this.matrix = matrix;
  }

  /**
   * Selects the specified matrix rows range.
   * The selection spans from startIdx to endIdx exclusive.
   * The selection can contain 'virtual cells' - those cells,
   * which are not in the matrix yet.
   *
   * @param startIdx
   * @param endIdx - this index is not included in the selection
   * @returns {MatrixSelection}
   */
  MatrixSelection.prototype.rows = function (startIdx, endIdx) {
    return rows(this.matrix, this, startIdx, endIdx);
  };

  /**
   * Selects the specified matrix columns range.
   * The selection spans from startIdx to endIdx exclusive.
   *
   * @param startIdx
   * @param endIdx - this index is not included in the selection
   * @returns {MatrixSelection}
   */
  MatrixSelection.prototype.cols = function (startIdx, endIdx) {
    return cols(this.matrix, this, startIdx, endIdx);
  };

  MatrixSelection.prototype.val = function () {
    return getSelectionValue(this.matrix._, this);
  };

  /**
   * Iterates over current selection including virtual cells.
   *
   * @param {Function} fn - the function to be applied at each iteration
   * @param fn.value - current cell value
   * @param fn.rowIdx - current iteration row index
   * @param fn.colIdx - current iteration col index
   */
  MatrixSelection.prototype.each = function (fn) {
    var rowEnd = this.row.end,
      colEnd = this.col.end,
      rowIdx,
      colIdx,
      curValue;
    for (rowIdx = this.row.start; rowIdx < rowEnd; rowIdx++) {
      for (colIdx = this.col.start; colIdx < colEnd; colIdx++) {
        curValue = this.matrix.get(rowIdx, colIdx);
        fn(curValue, rowIdx, colIdx);
      }
    }
  };

  /**
   * Applies a function against every value
   * in the scope of the current matrix selection.
   * If the selction exceeds the matrix dimensions
   * then matrix dimensions grow automatically.
   *
   * @param {Function} fn - Function to execute in each value of the matrix
   * @param fn.value - matrix cell value of the current iteration
   * @param fn.rowIdx - current iteration row index
   * @param fn.colIdx - current iteration column index
   * @returns {MatrixSelection} - the array of function application results
   */

  MatrixSelection.prototype.map = function (fn) {
    var self = this;
    this.each(function (val, rowId, colId) {
      if (!self.matrix._[rowId]) {
        self.matrix._[rowId] = [];
      }
      if (fn) {
        self.matrix._[rowId][colId] = fn(val, rowId, colId);
      } else {
        self.matrix._[rowId][colId] = null;
      }
    });

    return this.matrix;
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
    var result = false;
    this.each(function (val, rowIdx, colIdx) {
      if (fn(val, rowIdx, colIdx)) {
        result = true;
      }
    });

    return result;
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
   *
   * @param arrayBasedMatrix simple array-based matrix representation
   * @constructor
   */
  var Matrix = function (arrayBasedMatrix) {
    this._ = arrayBasedMatrix || [
      []
    ];
    this.selection = selectAll(this);
  };

  /**
   * Gets the value of the corresponding matrix element/row/selection.
   *
   * @param row - row index
   * @param col - column index
   * @returns {*}
   */
  Matrix.prototype.get = function (row, col) {
    var val;
    this.selection = selectAll(this);
    if (col === undefined && row !== undefined) {
      val = getRowValue(this._, row);
    } else if (row === undefined) {
      val = getSelectionValue(this._, this.selection);
    } else {
      val = getCellValue(this._, row, col);
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

  Matrix.prototype.rows = function (startIdx, endIdx) {
    return rows(this, this.selection, startIdx, endIdx);
  };

  Matrix.prototype.cols = function (startIdx, endIdx) {
    return cols(this, this.selection, startIdx, endIdx);
  };

  /**
   * Iterates over each matrix value.
   *
   * @param {Function} fn - function which will be applied to each matrix value
   * @param fn.value - current cell value
   * @param fn.rowId - current cell row index
   * @param fn.colId - current cell column index
   * @returns {Matrix}
   */
  Matrix.prototype.each = function (fn) {
    _.each(this._, function (row, rowId) {
      _.each(row, function (val, colId) {
        fn(val, rowId, colId);
      });
    });
  };

  /**
   * Maps each matrix value to function application result.
   *
   * @param {Function} fn - function which will be applied to each matrix value.
   * It's result will be written as current matrix cell value.
   * @param fn.value - current cell value
   * @param fn.rowId - current cell row index
   * @param fn.colId - current cell column index
   * @returns {Matrix}
   */
  Matrix.prototype.map = function (fn) {
    var self = this;
    _.each(this._, function (row, rowId) {
      _.each(row, function (val, colId) {
        self.put(rowId, colId, fn(val, rowId, colId));
      });
    });
    return this;
  };

  /**
   * Checks each matrix value against the predicate.
   *
   * @param {Function} fn
   * @param fn.value - matrix cell value of the current iteration
   * @param fn.rowIdx - current iteration row index
   * @param fn.colIdx - current iteration column index
   * @returns {boolean} true if the predicate matches any value in the matrix.
   *                    False otherwise
   */
  Matrix.prototype.some = function (fn) {
    return _.some(this._, function (row, rowId) {
      return _.some(row, function (val, colId) {
        return fn(val, rowId, colId);
      });
    });
  };

  return Matrix;
}(_));