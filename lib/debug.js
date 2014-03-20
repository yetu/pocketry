/*jslint vars: true, plusplus: true, white: true */
/*global jQuery */
var LOG = (function($) {

'use strict';

var exports = {};

exports.renderMatrix = function(matrix) {
	var table = $('<table />');
	var i, j;
	for(i = 0; i < matrix.length; i++) {
		var row = $('<tr />').appendTo(table);
		for(j = 0; j < matrix[i].length; j++) {
			var cell = $('<td />').appendTo(row);
			var tile = matrix[i][j];
			if(tile && tile.id) {
				cell.text(exports.serializeTile(tile));
				cell.css('background-color', tile.color);
			}
		}
	}
	return table;
};

exports.serializeMatrix = function(matrix) {
	return matrix.map(function(row) {
		return row.map(exports.serializeTile).join(' | ');
	}).join('\n');
};

exports.serializeStack = function(stack) {
	return stack.map(exports.serializeTile).join(', ');
};

exports.serializeTile = function(tile) {
	if(tile.id === 'placeholder') {
		return '❎';
	}
	return tile.icon + (tile.id ? ' ' + tile.id : '');
};

return exports;

}(jQuery));
