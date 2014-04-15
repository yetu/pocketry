/*jslint vars: true, plusplus: true, white: true */
/*global Pocketry, jQuery */
(function($) {

'use strict';

var board = new Pocketry('.tiles', 2, { interactive: true });

// debug rendering
console.log(LOG.serializeStack(board.layout.stack));
board._domatrix = LOG.renderMatrix(board.layout.matrix);
$(document.body).append(board._domatrix);
board.subscribe('tile-dropped', function(tile) {
	console.log(LOG.serializeStack(this.layout.stack));
	var domatrix = LOG.renderMatrix(this.layout.matrix);
	this._domatrix.parent()[0].insertBefore(domatrix[0], this._domatrix[0]);
	this._domatrix.remove();
	this._domatrix = domatrix;
});

}(jQuery));
