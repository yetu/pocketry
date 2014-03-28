/*jslint vars: true, nomen: true, plusplus: true, white: true */
/*global jQuery */
var Pocketry = (function($) {

'use strict';

// XXX:
// * type->size mapping won't be reliable in the future
// * icons are merely used for debugging
var TILES = {
	pin: { size: [1, 1], icon: '○' },
	app: { size: [2, 2], icon: '□' },
	feed: { size: [3, 2], icon: '▭' },
	placeholder: { size: [1, 1] }
};

function Board(container, rowSpan) {
	this.container = container.jquery ? container : $(container);
	this.slotSize = 100; // TODO: determine based on tile size within DOM
	this.colCount = 8; // TODO: calculate based on container and slot size
	this.layout = new Pocketry.Layout(this.colCount, rowSpan);

	// read tiles from DOM
	var tiles = [];
	var self = this;
	this.container.children().each(function(i, node) {
		var el = $(node);
		var type = el.attr('data-type');

		var tile = TILES[type];
		if(!tile) {
			return;
		}

		tile = Object.create(tile);
		tile.id = '#' + (i + 1); // XXX: DEBUG?
		tile.type = type; // XXX: DEBUG?
		tile.el = el;
		tiles.push(tile);

		self.layout.add(tile, tile.size[0], tile.size[1]);
		self.position(tile);
	});
}

Board.prototype.position = function(tile) {
	var x = tile.position[0] * this.slotSize;
	var y = tile.position[1] * this.slotSize;
	var transform = 'translate(' + x + 'px, ' + y + 'px)';
	tile.el.css({ // TODO: move width/height into CSS?
		top: 0,
		left: 0,
		width: (tile.size[0] * this.slotSize) + 'px',
		height: (tile.size[1] * this.slotSize) + 'px',
		'-webkit-transform': transform,
		transform: transform
	});

	tile.el.parent().css({ // force expansion, required due to children's abspos
		width: this.colCount * this.slotSize,
		height: this.layout.matrix.length * this.slotSize
	});
};

return Board;

}(jQuery));
