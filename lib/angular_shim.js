// jqLite shim for AngularJS
if(typeof jQuery === 'undefined') {
	var jQuery = angular.element;
}
if(typeof $ === 'undefined') {
	var $ = jQuery;
}
