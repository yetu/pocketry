/*jslint vars: true, plusplus: true, white: true */
/*global jQuery */
(function($) {

'use strict';

var board = new Pocketry('.tiles', 2, { interactive: true });

// debug rendering
board._domatrix = LOG.renderMatrix(board.layout.matrix);
$(document.body).append(board._domatrix);

}(jQuery));
