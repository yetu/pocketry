/*jslint vars: true, nomen: true, plusplus: true, white: true */
/*global Pocketry */
(function() {

'use strict';

Pocketry.prototype.draggable = function(container, tileSelector) { // TODO: refactor excessive use of closures
	var tiles = container.querySelectorAll(tileSelector);
	var slotSize = 100; // XXX: hard-coded
	var self = this;

	Array.prototype.forEach.call(tiles, function(tile) {
		var draggie = new Draggabilly(tile, { containment: container });
		draggie.on('dragEnd', onDrop);
	});

	function onDrop(draggie, ev, pointer) {
		var p0 = draggie.startPosition;
		var p1 = draggie.position;
		var t0 = determineTile(p0);
		var t1 = determineTile(p1);
		if(!t0 || !t1 || t0 === t1) {
			return;
		}

		var i0 = self.stack.indexOf(t0);
		var placeholder = Object.create(Pocketry.placeholder);
		placeholder.size = t0.size.slice();
		self.stack.splice(i0, 1, placeholder);
		var i1 = self.stack.indexOf(t1);
		self.stack.splice(i1, 0, t0);

		// reset position for renderer's transformation
		draggie.element.style.top = 0;
		draggie.element.style.left = 0;
		// re-render
		var stack = self.stack;
		self.init();
		stack.forEach(function(tile) {
			delete tile._processed; // XXX: breaks encapsulation
			self.add(tile, tile.size[0], tile.size[1]);
		});
		self.render(container, slotSize, true);
		self.draggable(container, tileSelector); // XXX: awkward!
	}

	function determineTile(coords) {
		var x = Math.round(coords.x / slotSize);
		var y = Math.round(coords.y / slotSize);
		return self.matrix[y][x];
	}
};

}());
