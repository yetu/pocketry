/*jslint vars: true, browser: true, white: true */
/*global Pocketry */

Pocketry.prototype.publish = function(msg, data) {
	var listeners = this.subscriptions && this.subscriptions[msg];
	if(!listeners) {
		return;
	}
	var self = this;
	listeners.forEach(function(listener) {
		listener.call(self, data);
	});
};

Pocketry.prototype.subscribe = function(msg, callback) {
	var subs = this.subscriptions;
	if(!subs) {
		subs = this.subscriptions = {};
	}
	if(!subs[msg]) {
		subs[msg] = [];
	}
	subs[msg].push(callback);
};

// adapted from StuffJS (https://github.com/bengillies/stuff-js)
Pocketry.debounce = function(wait, fn) {
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
};
