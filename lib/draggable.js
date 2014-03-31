/*jslint vars: true, nomen: true, plusplus: true, white: true */
/*global Pocketry */
(function() {

'use strict';

Pocketry.prototype.draggable = function() { // TODO: refactor excessive use of closures
	var self = this;

	var onDrop = function() {
		self.onDrop.apply(self, arguments);
	};

	var tiles = this.container.children(':not(.draggable)');
	tiles.each(function(i, node) {
		var draggie = new Draggabilly(node, { containment: self.container[0] });
		draggie.on('dragEnd', onDrop);
		$(node).addClass('draggable');
	});
};

Pocketry.prototype.onDrop = function(draggie, ev, pointer) {
	var layout = this.layout;

	var p0 = draggie.startPosition;
	var p1 = draggie.position;
	var t0 = determineTile(p0, layout.matrix, this.slotSize);
	var t1 = determineTile(p1, layout.matrix, this.slotSize);
	if(t0 === t1) {
		this.position(t0);
		return;
	}

	// replace with placeholder
	var i0 = layout.stack.indexOf(t0);
	if(t0.size[1] === layout.rowSpan) {
		layout.stack.splice(i0, 1);
	} else {
		var placeholder = Object.create(Pocketry.Layout.placeholder);
		placeholder.size = t0.size.slice();
		placeholder.placeholder = 2;
		placeholder.el = $(document.createElement(t0.el[0].nodeName));
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
		layout.stack.splice(i1, t1.placeholder === 2 ? 1 : 0, t0);
	} else { // dropped somewhere after tail
		layout.stack.push(t0);
	}

	rerender(this, this.slotSize, draggie.element);
};

function rerender(instance, slotSize, topNode) { // XXX: awkward signature
	var layout = instance.layout;

	var stack = layout.stack;
	layout.init();
	compact(stack, layout.rowSpan);
	stack.forEach(function(tile) {
		layout.add(tile, tile.size[0], tile.size[1]);
		// defer eventual position to trigger CSS animation
		setTimeout(function() {
			instance.position(tile);
		}, 1);
	});

	topNode.parentNode.appendChild(topNode); // z-index hack

	// XXX: DEBUG
	var domatrix = LOG.renderMatrix(layout.matrix);
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
