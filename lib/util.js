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
