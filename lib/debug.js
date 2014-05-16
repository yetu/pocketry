/*jslint vars: true, plusplus: true, white: true */
/*global jQuery */
var LOG = (function ($) {

  'use strict';

  var exports = {};

  exports.renderMatrix = function (matrix) {
    var table = $('<table />');
    var i, j;
    for (i = 0; i < matrix.size()[0]; i++) {
      var row = $('<tr class="tiles" />');
      for (j = 0; j < matrix.size()[1]; j++) {
        var cell = $('<td />');
        var tile = matrix.get(i,j);
        if (tile && tile.id) {
          cell.addClass(tile.type);
          var txt = document.createTextNode(exports.serializeTile(tile));
          cell.append([txt]);
        }
        row.append(cell);
      }
      table.append(row);
    }
    return table;
  };

  exports.serializeMatrix = function (matrix) {
    var oldRow = 0;
    return matrix.map(function (val, rowIdx, colIdx) {
      var str = exports.serializeTile(val);
      if (rowIdx !== oldRow) {
        oldRow = rowIdx;
        str += ' | ';
      }
      return str;
    }).join('\n');
  };

  exports.serializeStack = function (stack) {
    return stack.map(exports.serializeTile).join(', ');
  };

  exports.serializeTile = function (tile) {
    if (tile.placeholder) {
      return tile.placeholder === 1 ? '✘' : '❎';
    }
    return tile.icon + (tile.id ? ' ' + tile.id : '');
  };

  return exports;

}(jQuery));
