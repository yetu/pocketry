/*jslint vars: true, plusplus: true, white: true */
/*global jQuery */
(function($) {

'use strict';

/* read tiles from DOM */

var container = $('.tiles');

// XXX:
// * type->size mapping won't be reliable in the future
// * icons are merely used for debugging
var TILES = {
	pin: { size: [1, 1], icon: '○' },
	app: { size: [2, 2], icon: '□' },
	feed: { size: [3, 2], icon: '▭' },
	placeholder: { size: [1, 1] }
};

var tiles = [];
container.children().each(function(i, node) { // TODO: move into constructor
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
});

/* apply layout */

var slotSize = 100; // TODO: determine based on tile size within DOM
var colCount = 8; // TODO: calculate based on container and slot size
var rowSpan = 2;
var board = new Pocketry(colCount, rowSpan, slotSize);
tiles.forEach(function(tile) {
	board.add(tile, tile.size[0], tile.size[1]);
});

// debug rendering
board._domatrix = LOG.renderMatrix(board.matrix);
$(document.body).append(board._domatrix);

}(jQuery));
