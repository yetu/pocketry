/*jslint vars: true, nomen: true, plusplus: true, white: true */
/*global jQuery, Pocketry */
(function($) {

'use strict';

// `slotSize` specifies the pixel value for a slot's width and height
Pocketry.prototype.render = function(container, slotSize, update) {
	container = container.jquery ? container : $(container);

	var tiles = [];
	this.walk(function(rowIndex, colIndex, span) { // XXX: modifies foreign `tile` objects
		var _rowIndex = rowIndex + span;
		var tile = this.matrix[_rowIndex][colIndex];
		if(!tile || tile._processed) { // TODO: tile === undefined => tail; halt!?
			return;
		}

		var el = tile.elem || $('<li />'); // XXX: element type hard-coded
		el.text(tile.id).css({
			width: (tile.size[0] * slotSize) + 'px',
			height: (tile.size[1] * slotSize) + 'px',
			backgroundColor: tile.color
		}).data({ tile: tile });

		var x = colIndex * slotSize;
		var y = _rowIndex * slotSize;
		var transform = 'translate(' + x + 'px, ' + y + 'px)';
		if(update) {
			el.css('transform', transform);
		} else {
			tile.elem = el.data({ tile: tile });
			// defer eventual position to trigger CSS animation
			deferTransform(el, transform, 10);
		}

		tile._processed = true;
		tiles.push(el[0]);
	});

	container.css({
		width: this.colCount * slotSize,
		height: this.matrix.length * slotSize
	});

	if(!update) {
		container.append(tiles);
	}
};

function deferTransform(el, transform, delay) {
	setTimeout(function() {
		el.css('transform', transform);
	}, delay);
}

}(jQuery));
