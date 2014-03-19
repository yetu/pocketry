/*jslint vars: true, nomen: true, plusplus: true, white: true */
/*global jQuery, Board */
(function($) {

'use strict';

// `slotSize` specifies the pixel value for a slot's width and height
Board.prototype.render = function(container, slotSize) {
	container = container.jquery ? container : $(container);

	var tiles = [];
	this.walk(function(rowIndex, colIndex, span) {
		var _rowIndex = rowIndex + span;
		var tile = this.matrix[_rowIndex][colIndex];
		if(tile && !tile._processed) {
			var x = colIndex * slotSize;
			var y = _rowIndex * slotSize;
			var el = $('<li />').text(tile.id).css({ // XXX: element type hard-coded
				width: (tile.size[0] * slotSize) + 'px',
				height: (tile.size[1] * slotSize) + 'px',
				backgroundColor: tile.color
			}).data({
				transform: 'translate(' + x + 'px, ' + y + 'px)',
				tile: tile
			});
			tiles.push(el);
			tile._processed = true; // XXX: side-effecty!
		}
	});
	// transforms are animated via CSS, thus need to be triggered after the
	// elements have been added to the DOM
	container.css({
		width: this.colCount * slotSize,
		height: this.matrix.length * slotSize
	}).append(tiles).children().each(deferAnimation);
};

function deferAnimation(i, node) {
	var el = $(node);
	setTimeout(function() {
		el.css('transform', el.data('transform'));
	}, i * 10);
}

}(jQuery));
