/*jslint vars: true, nomen: true, plusplus: true, white: true */
/*global jQuery, Pocketry */
(function($) {

'use strict';

// `slotSize` specifies the pixel value for a slot's width and height
Pocketry.prototype.render = function(container, slotSize, update) {
	container = container.jquery ? container : $(container);

	var elements = container.children();
	var nirvana = $('<div />').append(elements); // jqLite `#detach` equivalent

	var tiles = [];
	this.walk(function(rowIndex, colIndex, span) { // XXX: modifies foreign `tile` objects
		var _rowIndex = rowIndex + span;
		var tile = this.matrix[_rowIndex][colIndex];
		if(!tile || tile._processed) {
			return tile !== undefined; // halt upon reaching tail -- XXX: `undefined` check breaks encapsulation!?
		}

		var el = tile.elem || $('<li />'); // XXX: element type hard-coded
		var txt = document.createTextNode(tile.id);
		el.empty().append([txt]).css({
			width: (tile.size[0] * slotSize) + 'px',
			height: (tile.size[1] * slotSize) + 'px',
			backgroundColor: tile.color
		}).data({ tile: tile });

		var x = colIndex * slotSize;
		var y = _rowIndex * slotSize;
		var transform = 'translate(' + x + 'px, ' + y + 'px)';
		if(!update) {
			tile.elem = el.data({ tile: tile });
		}
		// defer eventual position to trigger CSS animation
		deferMove(el, transform, 1);

		tile._processed = true;
		tiles.push(el[0]);
	});

	container.css({
		width: this.colCount * slotSize,
		height: this.matrix.length * slotSize
	}).append(tiles);

	elements.each(discardOrphan); // avoids memory leaks due to obsolete nodes
};

function deferMove(el, transform, delay) {
	setTimeout(function() {
		el.css({
			top: 0,
			left: 0,
			'-webkit-transform': transform,
			transform: transform
		});
	}, delay);
}

function discardOrphan(i, node) {
	if(!node.parentNode) {
		$(node).remove();
	}
}

}(jQuery));
