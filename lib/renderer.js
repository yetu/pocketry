/*jslint vars: true, white: true */
'use strict';

// `slotSize` specifies the pixel value for a slot's width and height
Board.prototype.render = function(slotSize) { // XXX: largely duplicates `add` method => extract `walk`?
	var tiles = [];
	var rowIndex, colIndex, span;
	for(rowIndex = 0; rowIndex < this.matrix.length; rowIndex++) {
		if(rowIndex % this.rowSpan === 0) { // row spans are processed together
			for(colIndex = 0; colIndex < this.colCount; colIndex++) {
				for(span = 0; span < this.rowSpan; span++) {
					var _rowIndex = rowIndex + span;
					var tile = this.matrix[_rowIndex][colIndex];
					if(tile && !tile._processed) {
						var x = colIndex * slotSize;
						var y = _rowIndex * slotSize;
						var el = jQuery('<li />').text(tile.id).css({ // XXX: element type hard-coded
							width: (tile.size[0] * slotSize) + 'px',
							height: (tile.size[1] * slotSize) + 'px',
							transform: 'translate(' + x + 'px, ' + y + 'px)',
							backgroundColor: tile.color
						});
						tiles.push(el);
						tile._processed = true; // XXX: side-effecty!
					}
				}
			}
		}
	}
	return tiles;
};
