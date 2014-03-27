/*jslint vars: true, nomen: true, plusplus: true, white: true */
/*global jQuery, Pocketry */
(function($) {

'use strict';

Pocketry.prototype.position = function(tile) {
	var x = tile.position[0] * this.slotSize;
	var y = tile.position[1] * this.slotSize;
	var transform = 'translate(' + x + 'px, ' + y + 'px)';
	tile.el.css({ // TODO: move width/height into CSS?
		width: (tile.size[0] * this.slotSize) + 'px',
		height: (tile.size[1] * this.slotSize) + 'px',
		'-webkit-transform': transform,
		transform: transform
	});

	tile.el.parent().css({ // force expansion, required due to children's abspos
		width: this.colCount * this.slotSize,
		height: this.matrix.length * this.slotSize
	});
};

}(jQuery));
