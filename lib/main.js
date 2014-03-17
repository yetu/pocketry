(function($) {

var cols = 4;

$(".tiles li").each(function(i, node) {
	var xpos = (i % cols) * 100;
	var ypos = Math.floor(i / cols) * 100;
	$(node).css("transform", "translate(" + xpos + "px, " + ypos + "px)");
});

}(jQuery));
