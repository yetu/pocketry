/*jslint vars: true, nomen: true, plusplus: true, white: true */
/*global Pocketry */
(function() {

'use strict';

Pocketry.prototype.draggable = function() { // TODO: refactor excessive use of closures
	var self = this;
	var tiles = this.container.children(':not(.draggable)');

	tiles.each(function(i, node) {
		var draggie = new Draggabilly(node, { containment: self.container[0] });
		draggie.on('dragEnd', onDrop);
		$(node).addClass('draggable');
	});

	function onDrop(draggie, ev, pointer) {
		var p0 = draggie.startPosition;
		var p1 = draggie.position;
		var t0 = determineTile(p0, self.layout.matrix, self.slotSize);
		var t1 = determineTile(p1, self.layout.matrix, self.slotSize);
		if(t0 === t1) {
			self.position(t0);
			return;
		}

		// replace with placeholder
		var i0 = self.layout.stack.indexOf(t0);
		if(t0.size[1] === self.layout.rowSpan) {
			self.layout.stack.splice(i0, 1);
		} else {
			var placeholder = Object.create(Pocketry.Layout.placeholder);
			placeholder.size = t0.size.slice();
			placeholder.placeholder = 2;
			placeholder.el = $(document.createElement(t0.el[0].nodeName));
			self.layout.stack.splice(i0, 1, placeholder);
		}
		// re-insert
		if(t1) {
			if(t1.placeholder === 1) {
				// find next non-implicit tile as stack reference
				var startPos = determineSlot(p1, self.slotSize);
				self.layout.walk(startPos, function(rowIndex, colIndex, span) {
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
			var i1 = self.layout.stack.indexOf(t1);
			self.layout.stack.splice(i1, t1.placeholder === 2 ? 1 : 0, t0);
		} else { // dropped somewhere after tail
			self.layout.stack.push(t0);
		}

		rerender(self, this.container, self.slotSize, draggie.element);
	}
};

function rerender(instance, container, slotSize, topNode) { // XXX: awkward signature
	var stack = instance.layout.stack;
	instance.layout.init();
	compact(stack, instance.rowSpan);
	stack.forEach(function(tile) {
		instance.layout.add(tile, tile.size[0], tile.size[1]);
		// defer eventual position to trigger CSS animation
		setTimeout(function() {
			instance.position(tile);
		}, 1);
	});

	topNode.parentNode.appendChild(topNode); // z-index hack

	// XXX: DEBUG
	var domatrix = LOG.renderMatrix(instance.layout.matrix);
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
		var item = obsolete[i];
		item.el.remove();
		stack.splice(item, 1);
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
