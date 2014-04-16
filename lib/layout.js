/*jslint vars: true, plusplus: true, nomen: true, white: true */
/*global Pocketry */
Pocketry.Layout = (function() {

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

Layout.prototype.init = function() {
	this.stack = []; // one-dimensional array of tiles
	this.matrix = []; // two-dimensional array; rows * columns
	delete this.tail;
	this.extend();
};

// adds a tile to the matrix
// that object must have a `size` property of the form `[width, height]`
// returns a list of placeholders used to fill gaps within the layout
Layout.prototype.add = function(tile) {
	if(tile.hidden) {
		this.stack.push(tile); // XXX: DRY!
		return [];
	}

	var width = tile.size[0];
	var height = tile.size[1];
	var prevTail = this.tail;

	var unplaced = this.walk(this.tail, function(rowIndex, colIndex, span) {
		if(span === 0 || height === 1) { // larger elements are top-aligned
			var _rowIndex = rowIndex + span;
			var fit = this.put(tile, _rowIndex, colIndex, width, height);
			if(fit) {
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
	if(unplaced) { // try again
		this.extend();
		return this.add.apply(this, arguments);
	}

	// fill gaps
	var placeholders = [];
	this.walk(prevTail, function(rowIndex, colIndex, span) {
		var _rowIndex = rowIndex + span;
		if(colIndex === this.tail.x && _rowIndex === this.tail.y) {
			return false; // halt
		}
		var row = this.matrix[_rowIndex];
		if(row[colIndex] === undefined) {
			var placeholder = Object.create(Layout.placeholder);
			placeholder.position = { x: colIndex, y: _rowIndex };
			row[colIndex] = placeholder;
			placeholders.push(placeholder);
		}
	});

	this.stack.push(tile);
	return placeholders || [];
};

// mark the given area's slots as occupied by the given object
// returns `false` if the area is already (partially) occupied
// NB: does not support irregular shapes
Layout.prototype.put = function(obj, top, left, width, height) { // XXX: almost entirely duplicates `checkFit`
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

// check whether the given area's slots are available and unoccupied
Layout.prototype.checkFit = function(top, left, width, height) {
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
Layout.prototype.extend = function() {
	var i;
	for(i = 0; i < this.rowSpan; i++) {
		var row = new Array(this.colCount);
		this.matrix.push(row);
	}
};

// collapse gaps
Layout.prototype.compact = function() {
	var obsolete = [];
	var candidates = [];
	var occupied = false;
	var height = 0;
	var i;

	function nextColumn() {
		if(!occupied) {
			obsolete = obsolete.concat(candidates);
		}
		candidates = [];
		occupied = false;
		height = 0;
	}

	for(i = 0; i < this.stack.length; i++) {
		var tile = this.stack[i];
		var tileHeight = tile.size[1];

		height += tileHeight;
		if(height > this.rowSpan) {
			nextColumn();
			height = tileHeight;
		}

		if(!occupied && tile.placeholder) {
			candidates.push(i);
		} else {
			occupied = true;
		}

		if(height === this.rowSpan) {
			nextColumn();
		}
	}

	for(i = obsolete.length - 1; i >= 0; i--) {
		this.stack.splice(obsolete[i], 1);
	}
};

// traverse the matrix while alternating between row-spans
// `cont` is an optional object with matrix coordinates to start from
// `callback` is invoked in the context of the instance and provided the current
// row, column and row-span index - if it returns `false`, further traversal is
// halted
// returns a boolean indicating whether traversal ran to completion
Layout.prototype.walk = function(start, callback) {
	if(callback === undefined) { // shift arguments
		callback = start;
		start = undefined;
	}

	var rowIndex, colIndex, span;
	var rowStart = 0;
	var colStart = 0;
	if(start) {
		colStart = start.x;
		rowStart = start.y;
		rowStart -= rowStart % this.rowSpan; // row loop must start at the top
	}

	for(rowIndex = rowStart; rowIndex < this.matrix.length; rowIndex++) {
		if(rowIndex !== rowStart) { // start column only applies to initial row
			colStart = 0;
		}
		if(rowIndex % this.rowSpan === 0) { // alternating between row spans
			for(colIndex = colStart; colIndex < this.colCount; colIndex++) {
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

return Layout;

}());
