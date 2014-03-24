/*jslint vars: true, plusplus: true, white: true */
/*global jQuery */
var LOG = (function($) {

'use strict';

var exports = {};

exports.renderMatrix = function(matrix) {
	var table = $('<table />');
	var i, j;
	for(i = 0; i < matrix.length; i++) {
		var row = $('<tr />');
		for(j = 0; j < matrix[i].length; j++) {
			var cell = $('<td />');
			var tile = matrix[i][j];
			if(tile && tile.id) {
				cell.css({ backgroundColor: tile.color });
				var txt = document.createTextNode(exports.serializeTile(tile));
				cell.append([txt]);
			}
			row.append(cell);
		}
		table.append(row);
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
	if(tile.placeholder) {
		return tile.placeholder === 1 ? '✘' : '❎';
	}
	return tile.icon + (tile.id ? ' ' + tile.id : '');
};

return exports;

}(jQuery));
