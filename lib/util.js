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
	console.log('subscriptions', subs);
};

/**
 * Stop listening for determined message. If some callback
 * is specified, will remove just the callback, if not, will
 * remove all the callbacks.
 * @param  {string}   msg      event name
 * @param  {Function} callback the handler or undefined for unsubscribe for all
 * @return {void}
 */
Pocketry.prototype.unsubscribe = function(msg, callback) {
	if(this.subscriptions && this.subscriptions[msg]) {
		if (callback != null) {
			var index = this.subscriptions[msg].indexOf(callback);
			if (index >= 0) {
				this.subscriptions[msg].splice(index, 1);
			}
		} else {
			this.subscriptions[msg] = [];
		}
	}
};

/**
 * Stop to listen to all events.
 * @return {void}
 */
Pocketry.prototype.deafen = function() {
	this.subscriptions = {};
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

Pocketry.offset = function(el) {
  var domElement = el[0],
  body = document.documentElement || document.body,
  scrollX = window.pageXOffset || body.scrollLeft,
  scrollY = window.pageYOffset || body.scrollTop,
  x = domElement.getBoundingClientRect().left + scrollX,
  y = domElement.getBoundingClientRect().top + scrollY;
  return { left: x, top:y };
};
