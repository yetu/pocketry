/*jslint vars: true, nomen: true, plusplus: true, white: true */
/*global Pocketry, jQuery */
(function($) {

'use strict';

Pocketry.prototype.draggable = function() { // TODO: refactor excessive use of closures
	var self = this;

	var onPick = function(draggie, ev, pointer) {
		self._dragTile = determineTile(draggie.position, self.layout.matrix,
			self.slotSize);
	};
	var onMove = debounce(50, function() {
		if(self._dragTile) { // debouncing leads to move-after-drop occurrences
			self.onMove.apply(self, arguments);
		}
	});
	var onDrop = function() {
		self.onDrop.apply(self, arguments);
	};

	var tiles = this.container.children(':not(.draggable)');
	Array.prototype.forEach.call(tiles, function(node) {
		var draggie = new Draggabilly(node, { containment: self.container[0] });
		draggie.on('dragStart', onPick);
		draggie.on('dragMove', onMove);
		draggie.on('dragEnd', onDrop);
		$(node).addClass('draggable');
	});
};

Pocketry.prototype.onMove = function(draggie, ev, pointer) {
	var target = this.determineDropTarget(draggie.position);
	this.placeTile(this._dragTile, target);
};

Pocketry.prototype.onDrop = function(draggie, ev, pointer) {
	var dragTile = this._dragTile;
	var target = this.determineDropTarget(draggie.position);
	delete this._dragTile; // ensures element snaps into position
	if(dragTile === target.tile) { // reset
		this.position(dragTile);
		return;
	}
	this.placeTile(dragTile, target);
	this.publish('tile-dropped', dragTile);
};

Pocketry.prototype.placeTile = function(dragTile, dropTarget) { // TODO: rename
	var layout = this.layout;
	var p1 = dropTarget.position;
	var t1 = dropTarget.tile;

	// replace with placeholder
	var i0 = layout.stack.indexOf(dragTile);
	if(dragTile.size[1] === layout.rowSpan) { // skip placeholder for tall items
		layout.stack.splice(i0, 1);
	} else {
		var placeholder = Object.create(Pocketry.Layout.placeholder);
		placeholder.size = dragTile.size.slice();
		placeholder.placeholder = 2;
		placeholder.el = $(document.createElement(dragTile.el[0].nodeName));
		this.container.append(placeholder.el);
		layout.stack.splice(i0, 1, placeholder);
	}
	// re-insert
	if(t1) {
		if(t1.placeholder === 1) {
			// find next non-implicit tile as stack reference
			var startPos = determineSlot(p1, this.slotSize);
			layout.walk(startPos, function(rowIndex, colIndex, span) {
				var topRow = startPos.y - (startPos.y % layout.rowSpan); // XXX: breaks encapsulation?
				if(colIndex === startPos.x && rowIndex === topRow) {
					return true;
				}
				var tile = this.matrix[rowIndex + span][colIndex];
				if(tile.placeholder !== 1) {
					t1 = tile;
					return false;
				}
			});
		}
		var i1 = layout.stack.indexOf(t1);
		var center = (t1.position[0] + t1.size[0] / 2) * this.slotSize;
		var insertAfter = p1.x > center;
		layout.stack.splice(insertAfter ? i1 + 1 : i1,
				t1.placeholder === 2 ? 1 : 0, dragTile);
	} else { // dropped somewhere after tail
		layout.stack.push(dragTile);
	}

	this.relayout(dragTile.el[0]);
};

Pocketry.prototype.relayout = function(topNode) {
	var self = this;
	var layout = this.layout;

	var stack = layout.stack;
	layout.init();
	compact(stack, layout.rowSpan);
	stack.forEach(function(tile) {
		layout.add(tile, tile.size[0], tile.size[1]);
		if(tile === self._dragTile) { // avoid repositioning active dragee -- XXX: breaks encapsulation
			return;
		}
		// defer eventual position to trigger CSS animation
		setTimeout(function() {
			self.position(tile);
		}, 1);
	});

	topNode.parentNode.appendChild(topNode); // z-index hack
	this.publish('relayout');
};

Pocketry.prototype.determineDropTarget = function(targetPos) {
	// use center as reference point -- XXX: use mouse pointer instead?
	var pos = {
		x: targetPos.x + (this._dragTile.size[0] * this.slotSize) / 2,
		y: targetPos.y + (this._dragTile.size[1] * this.slotSize) / 2
	};
	return {
		position: pos,
		tile: determineTile(pos, this.layout.matrix, this.slotSize)
	};
};

function compact(stack, rowSpan) {
	var obsolete = [];
	var candidates = [];
	var occupied = false;
	var height = 0;
	var i;

	function nextColumn() {
		if(!occupied) {
			obsolete = obsolete.concat(candidates);
		}
		candidates = [];
		occupied = false;
		height = 0;
	}

	for(i = 0; i < stack.length; i++) {
		var tile = stack[i];
		var tileHeight = tile.size[1];

		height += tileHeight;
		if(height > rowSpan) {
			nextColumn();
			height = tileHeight;
		}

		if(!occupied && tile.placeholder) {
			candidates.push(i);
		} else {
			occupied = true;
		}

		if(height === rowSpan) {
			nextColumn();
		}
	}

	for(i = obsolete.length - 1; i >= 0; i--) {
		stack.splice(obsolete[i], 1);
	}
}

function determineTile(coords, matrix, slotSize) {
	var slot = determineSlot(coords, slotSize);
	return matrix[slot.y][slot.x];
}

function determineSlot(coords, slotSize) {
	return {
		x: Math.round(coords.x / slotSize),
		y: Math.round(coords.y / slotSize)
	};
}

// adapted from StuffJS (https://github.com/bengillies/stuff-js)
function debounce(wait, fn) {
	var timer;
	return function() {
		var self = this,
			args = arguments;
		if(timer) {
			clearTimeout(timer);
			timer = null;
		}
		timer = setTimeout(function() {
			fn.apply(self, args);
			timer = null;
		}, wait);
	};
}

}(jQuery));
