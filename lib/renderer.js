/*jslint vars: true, nomen: true, plusplus: true, white: true */
/*global jQuery, Pocketry */
(function($) {

'use strict';

// `slotSize` specifies the pixel value for a slot's width and height
Pocketry.prototype.render = function(container, slotSize) {
	container = container.jquery ? container : $(container);

	var tiles = [];
	this.walk(function(rowIndex, colIndex, span) {
		var _rowIndex = rowIndex + span;
		var tile = this.matrix[_rowIndex][colIndex];
		if(!tile || tile._processed) { // TODO: tile === undefined => tail; halt!?
			return;
		}

		var el = $('<li />').text(tile.id).css({ // XXX: element type hard-coded
			width: (tile.size[0] * slotSize) + 'px',
			height: (tile.size[1] * slotSize) + 'px',
			backgroundColor: tile.color
		}).data({ tile: tile });

		var x = colIndex * slotSize;
		var y = _rowIndex * slotSize;
		// defer eventual position to trigger CSS animation
		deferTransform(el, 'translate(' + x + 'px, ' + y + 'px)', 10);

		tile._processed = true; // XXX: modifying foreign objects is nasty
		tiles.push(el[0]);
	});

	container.css({
		width: this.colCount * slotSize,
		height: this.matrix.length * slotSize
	}).append(tiles);
};

function deferTransform(el, transform, delay) {
	setTimeout(function() {
		el.css('transform', transform);
	}, delay);
}

}(jQuery));
