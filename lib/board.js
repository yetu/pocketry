/*jslint vars: true, white: true */
'use strict';

// `rowSpan` indicates the max. vertical size of an individual element
function Board(colCount, rowSpan) {
	this.colCount = colCount;
	this.rowSpan = rowSpan;

	this.matrix = []; // two-dimensional array; rows * columns

	var i;
	for(i = 0; i < this.rowSpan; i++) {
		this.addRow();
	}
}
Board.prototype.add = function(obj, width, height) {
	var rowIndex, colIndex, span, fit;
	for(rowIndex = 0; rowIndex < this.matrix.length; rowIndex++) {
		if(rowIndex % this.rowSpan === 0) { // row spans are processed together
			for(colIndex = 0; colIndex < this.colCount; colIndex++) {
				fit = this.put(obj, rowIndex, colIndex, width, height);
				if(fit) {
					return true;
				} else if(height === 1) { // larger elements are top-aligned
					for(span = 0; span < this.rowSpan; span++) {
						var _rowIndex = rowIndex + span;
						fit = this.put(obj, _rowIndex, colIndex, width, height);
						if(fit) {
							return true;
						}
					}
				}
			}
		}
	}
	return false;
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
Board.prototype.addRow = function() {
	var row = new Array(this.colCount);
	this.matrix.push(row);
};
