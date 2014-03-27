/*jslint vars: true, nomen: true, plusplus: true, white: true */
/*global Pocketry */
(function() {

'use strict';

Pocketry.prototype.draggable = function(container) { // TODO: refactor excessive use of closures
	var self = this;
	var tiles = container.children(':not(.draggable)');

	tiles.each(function(i, node) {
		var draggie = new Draggabilly(node, { containment: container[0] });
		draggie.on('dragEnd', onDrop);
		$(node).addClass('draggable');
	});

	function onDrop(draggie, ev, pointer) {
		var p0 = draggie.startPosition;
		var p1 = draggie.position;
		var t0 = determineTile(p0, self.matrix, self.slotSize);
		var t1 = determineTile(p1, self.matrix, self.slotSize);
		if(t0 === t1) {
			self.position(t0);
			return;
		}

		// replace with placeholder
		var i0 = self.stack.indexOf(t0);
		if(t0.size[1] === self.rowSpan) {
			self.stack.splice(i0, 1);
		} else {
			var placeholder = Object.create(Pocketry.placeholder);
			placeholder.size = t0.size.slice();
			placeholder.placeholder = 2;
			self.stack.splice(i0, 1, placeholder);
		}
		// re-insert
		if(t1) {
			if(t1.placeholder === 1) {
				// find next non-implicit tile as stack reference
				var startPos = determineSlot(p1, self.slotSize);
				self.walk(startPos, function(rowIndex, colIndex, span) {
					var topRow = startPos.y - (startPos.y % this.rowSpan); // XXX: breaks encapsulation?
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
			var i1 = self.stack.indexOf(t1);
			self.stack.splice(i1, t1.placeholder === 2 ? 1 : 0, t0);
		} else { // dropped somewhere after tail
			self.stack.push(t0);
		}

		rerender(self, container, self.slotSize, draggie.element);
	}
};

function rerender(instance, container, slotSize, topNode) { // XXX: awkward signature
	var stack = instance.stack;
	instance.init();
	compact(stack, instance.rowSpan);
	stack.forEach(function(tile) {
		instance.add(tile, tile.size[0], tile.size[1]);
	});

	topNode.parentNode.appendChild(topNode); // z-index hack

	// XXX: DEBUG
	var domatrix = LOG.renderMatrix(instance.matrix);
	instance._domatrix.parent()[0].insertBefore(domatrix[0], instance._domatrix[0]);
	instance._domatrix.remove();
	instance._domatrix = domatrix;
}

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

}());
