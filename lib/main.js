/*jslint vars: true, plusplus: true, white: true */
/*global jQuery */
(function($) {

'use strict';

var colCount = 8; //Math.floor(container.width() / tile.width()); // XXX: DEBUG'd
var rowSpan = 2; // TODO: configurable

var t11 = { size: [1, 1], icon: '○', color: '#EDD' };
var t22 = { size: [2, 2], icon: '□', color: '#DED' };
var t32 = { size: [3, 2], icon: '▭', color: '#DDE' };
var tiles = [t22, t11, t11, t11, t32, t32, t11, t11, t22, t32, t22];

var i, j, tile;
var board = new Pocketry(colCount, rowSpan);

// populate
for(i = 0; i < tiles.length; i++) {
	tile = Object.create(tiles[i]);
	tile.id = '#' + (i + 1);
	board.add(tile, tile.size[0], tile.size[1]);
}

// render
var container = $('.tiles');
board.render(container, 100);
board.draggable(container[0], 'li');

// debug rendering
LOG.renderMatrix(board.matrix).prependTo(document.body);

}(jQuery));
