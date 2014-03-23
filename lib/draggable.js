/*jslint vars: true, nomen: true, plusplus: true, white: true */
/*global Pocketry */
(function() {

'use strict';

Pocketry.prototype.draggable = function(container, tileSelector) { // TODO: refactor excessive use of closures
	var tiles = container.querySelectorAll(tileSelector);
	var slotSize = 100; // FIXME: hard-coded
	var self = this;

	Array.prototype.forEach.call(tiles, function(tile) {
		if(tile.getAttribute('data-draggable')) {
			return;
		}
		var draggie = new Draggabilly(tile, { containment: container });
		tile.setAttribute('data-draggable', 'true');
		draggie.on('dragEnd', onDrop);
	});

	function onDrop(draggie, ev, pointer) {
		var p0 = draggie.startPosition;
		var p1 = draggie.position;
		var t0 = determineTile(p0, self.matrix, slotSize);
		var t1 = determineTile(p1, self.matrix, slotSize);
		if(t0 === t1) {
			return;
		}

		// replace with placeholder
		var i0 = self.stack.indexOf(t0);
		var placeholder = Object.create(Pocketry.placeholder);
		placeholder.size = t0.size.slice();
		placeholder.placeholder = 2;
		self.stack.splice(i0, 1, placeholder);
		// re-insert
		if(t1) {
			if(t1.placeholder === 1) {
				// find next non-implicit tile as stack reference
				var startPos = determineSlot(p1, slotSize);
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

		// re-render
		var stack = self.stack;
		self.init();
		stack.forEach(function(tile) {
			delete tile._processed; // XXX: breaks encapsulation
			self.add(tile, tile.size[0], tile.size[1]);
		});
		self.render(container, slotSize, true);
		draggie.element.parentNode.appendChild(draggie.element); // z-index hack
		self.draggable(container, tileSelector); // XXX: awkward!
	}
};

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
