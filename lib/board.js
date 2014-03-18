/*jslint vars: true, plusplus: true, white: true */
var Board = (function() {

'use strict';

// `rowSpan` indicates the max. vertical size of an individual element
function Board(colCount, rowSpan) {
	this.colCount = colCount;
	this.rowSpan = rowSpan;

	this.matrix = []; // two-dimensional array; rows * columns
	this.extend();
}
Board.prototype.add = function(obj, width, height) {
	var unplaced = this.walk(function(rowIndex, colIndex, span) {
		if(span === 0 || height === 1) { // larger elements are top-aligned
			var fit = this.put(obj, rowIndex + span, colIndex, width, height);
			return !fit;
		}
	});
	if(unplaced) { // try again
		this.extend();
		return this.add.apply(this, arguments);
	}
};
// mark the given area's slots as occupied by the given object
// returns `false` if the area is already (partially) occupied
// NB: does not support irregular shapes
Board.prototype.put = function(obj, top, left, width, height) { // XXX: almost entirely duplicates `checkFit`
	var fit = this.checkFit(top, left, width, height);
	if(!fit) {
		return false;
	}

	var bottom = top + height;
	var right = left + width;
	var i, j;
	for(i = top; i < bottom; i++) {
		var row = this.matrix[i];
		for(j = left; j < right; j++) {
			row[j] = obj;
		}
	}
	return true;
};
// check whether the given area's slots are unoccupied
Board.prototype.checkFit = function(top, left, width, height) {
	if(left + width > this.colCount) {
		return false;
	}

	var bottom = top + height;
	var right = left + width;
	var i, j;
	for(i = top; i < bottom; i++) {
		var row = this.matrix[i];
		for(j = left; j < right; j++) {
			if(row[j] !== undefined) {
				return false;
			}
		}
	}
	return true;
};
// add a set of rows (based on row span)
Board.prototype.extend = function() {
	var i;
	for(i = 0; i < this.rowSpan; i++) {
		var row = new Array(this.colCount);
		this.matrix.push(row);
	}
};
// traverse the matrix while alternating between row-spans
// `callback` is invoked in the context of the instance and provided the current
// row, column and row-span index - if it returns `false`, further traversal is
// halted
// returns a boolean indicating whether traversal ran to completion
Board.prototype.walk = function(callback) {
	var rowIndex, colIndex, span;
	for(rowIndex = 0; rowIndex < this.matrix.length; rowIndex++) {
		if(rowIndex % this.rowSpan === 0) { // row spans are processed together
			for(colIndex = 0; colIndex < this.colCount; colIndex++) {
				for(span = 0; span < this.rowSpan; span++) {
					var cont = callback.call(this, rowIndex, colIndex, span);
					if(cont === false) {
						return false;
					}
				}
			}
		}
	}
	return true;
};

return Board;

}());
