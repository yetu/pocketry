/*!
 * EventEmitter v4.2.7 - git.io/ee
 * Oliver Caldwell
 * MIT license
 * @preserve
 */

(function () {
	'use strict';

	/**
	 * Class for managing events.
	 * Can be extended to provide event functionality in other classes.
	 *
	 * @class EventEmitter Manages event registering and emitting.
	 */
	function EventEmitter() {}

	// Shortcuts to improve speed and size
	var proto = EventEmitter.prototype;
	var exports = this;
	var originalGlobalValue = exports.EventEmitter;

	/**
	 * Finds the index of the listener for the event in it's storage array.
	 *
	 * @param {Function[]} listeners Array of listeners to search through.
	 * @param {Function} listener Method to look for.
	 * @return {Number} Index of the specified listener, -1 if not found
	 * @api private
	 */
	function indexOfListener(listeners, listener) {
		var i = listeners.length;
		while (i--) {
			if (listeners[i].listener === listener) {
				return i;
			}
		}

		return -1;
	}

	/**
	 * Alias a method while keeping the context correct, to allow for overwriting of target method.
	 *
	 * @param {String} name The name of the target method.
	 * @return {Function} The aliased method
	 * @api private
	 */
	function alias(name) {
		return function aliasClosure() {
			return this[name].apply(this, arguments);
		};
	}

	/**
	 * Returns the listener array for the specified event.
	 * Will initialise the event object and listener arrays if required.
	 * Will return an object if you use a regex search. The object contains keys for each matched event. So /ba[rz]/ might return an object containing bar and baz. But only if you have either defined them with defineEvent or added some listeners to them.
	 * Each property in the object response is an array of listener functions.
	 *
	 * @param {String|RegExp} evt Name of the event to return the listeners from.
	 * @return {Function[]|Object} All listener functions for the event.
	 */
	proto.getListeners = function getListeners(evt) {
		var events = this._getEvents();
		var response;
		var key;

		// Return a concatenated array of all matching events if
		// the selector is a regular expression.
		if (evt instanceof RegExp) {
			response = {};
			for (key in events) {
				if (events.hasOwnProperty(key) && evt.test(key)) {
					response[key] = events[key];
				}
			}
		}
		else {
			response = events[evt] || (events[evt] = []);
		}

		return response;
	};

	/**
	 * Takes a list of listener objects and flattens it into a list of listener functions.
	 *
	 * @param {Object[]} listeners Raw listener objects.
	 * @return {Function[]} Just the listener functions.
	 */
	proto.flattenListeners = function flattenListeners(listeners) {
		var flatListeners = [];
		var i;

		for (i = 0; i < listeners.length; i += 1) {
			flatListeners.push(listeners[i].listener);
		}

		return flatListeners;
	};

	/**
	 * Fetches the requested listeners via getListeners but will always return the results inside an object. This is mainly for internal use but others may find it useful.
	 *
	 * @param {String|RegExp} evt Name of the event to return the listeners from.
	 * @return {Object} All listener functions for an event in an object.
	 */
	proto.getListenersAsObject = function getListenersAsObject(evt) {
		var listeners = this.getListeners(evt);
		var response;

		if (listeners instanceof Array) {
			response = {};
			response[evt] = listeners;
		}

		return response || listeners;
	};

	/**
	 * Adds a listener function to the specified event.
	 * The listener will not be added if it is a duplicate.
	 * If the listener returns true then it will be removed after it is called.
	 * If you pass a regular expression as the event name then the listener will be added to all events that match it.
	 *
	 * @param {String|RegExp} evt Name of the event to attach the listener to.
	 * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.addListener = function addListener(evt, listener) {
		var listeners = this.getListenersAsObject(evt);
		var listenerIsWrapped = typeof listener === 'object';
		var key;

		for (key in listeners) {
			if (listeners.hasOwnProperty(key) && indexOfListener(listeners[key], listener) === -1) {
				listeners[key].push(listenerIsWrapped ? listener : {
					listener: listener,
					once: false
				});
			}
		}

		return this;
	};

	/**
	 * Alias of addListener
	 */
	proto.on = alias('addListener');

	/**
	 * Semi-alias of addListener. It will add a listener that will be
	 * automatically removed after it's first execution.
	 *
	 * @param {String|RegExp} evt Name of the event to attach the listener to.
	 * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.addOnceListener = function addOnceListener(evt, listener) {
		return this.addListener(evt, {
			listener: listener,
			once: true
		});
	};

	/**
	 * Alias of addOnceListener.
	 */
	proto.once = alias('addOnceListener');

	/**
	 * Defines an event name. This is required if you want to use a regex to add a listener to multiple events at once. If you don't do this then how do you expect it to know what event to add to? Should it just add to every possible match for a regex? No. That is scary and bad.
	 * You need to tell it what event names should be matched by a regex.
	 *
	 * @param {String} evt Name of the event to create.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.defineEvent = function defineEvent(evt) {
		this.getListeners(evt);
		return this;
	};

	/**
	 * Uses defineEvent to define multiple events.
	 *
	 * @param {String[]} evts An array of event names to define.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.defineEvents = function defineEvents(evts) {
		for (var i = 0; i < evts.length; i += 1) {
			this.defineEvent(evts[i]);
		}
		return this;
	};

	/**
	 * Removes a listener function from the specified event.
	 * When passed a regular expression as the event name, it will remove the listener from all events that match it.
	 *
	 * @param {String|RegExp} evt Name of the event to remove the listener from.
	 * @param {Function} listener Method to remove from the event.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.removeListener = function removeListener(evt, listener) {
		var listeners = this.getListenersAsObject(evt);
		var index;
		var key;

		for (key in listeners) {
			if (listeners.hasOwnProperty(key)) {
				index = indexOfListener(listeners[key], listener);

				if (index !== -1) {
					listeners[key].splice(index, 1);
				}
			}
		}

		return this;
	};

	/**
	 * Alias of removeListener
	 */
	proto.off = alias('removeListener');

	/**
	 * Adds listeners in bulk using the manipulateListeners method.
	 * If you pass an object as the second argument you can add to multiple events at once. The object should contain key value pairs of events and listeners or listener arrays. You can also pass it an event name and an array of listeners to be added.
	 * You can also pass it a regular expression to add the array of listeners to all events that match it.
	 * Yeah, this function does quite a bit. That's probably a bad thing.
	 *
	 * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add to multiple events at once.
	 * @param {Function[]} [listeners] An optional array of listener functions to add.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.addListeners = function addListeners(evt, listeners) {
		// Pass through to manipulateListeners
		return this.manipulateListeners(false, evt, listeners);
	};

	/**
	 * Removes listeners in bulk using the manipulateListeners method.
	 * If you pass an object as the second argument you can remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
	 * You can also pass it an event name and an array of listeners to be removed.
	 * You can also pass it a regular expression to remove the listeners from all events that match it.
	 *
	 * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to remove from multiple events at once.
	 * @param {Function[]} [listeners] An optional array of listener functions to remove.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.removeListeners = function removeListeners(evt, listeners) {
		// Pass through to manipulateListeners
		return this.manipulateListeners(true, evt, listeners);
	};

	/**
	 * Edits listeners in bulk. The addListeners and removeListeners methods both use this to do their job. You should really use those instead, this is a little lower level.
	 * The first argument will determine if the listeners are removed (true) or added (false).
	 * If you pass an object as the second argument you can add/remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
	 * You can also pass it an event name and an array of listeners to be added/removed.
	 * You can also pass it a regular expression to manipulate the listeners of all events that match it.
	 *
	 * @param {Boolean} remove True if you want to remove listeners, false if you want to add.
	 * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add/remove from multiple events at once.
	 * @param {Function[]} [listeners] An optional array of listener functions to add/remove.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.manipulateListeners = function manipulateListeners(remove, evt, listeners) {
		var i;
		var value;
		var single = remove ? this.removeListener : this.addListener;
		var multiple = remove ? this.removeListeners : this.addListeners;

		// If evt is an object then pass each of it's properties to this method
		if (typeof evt === 'object' && !(evt instanceof RegExp)) {
			for (i in evt) {
				if (evt.hasOwnProperty(i) && (value = evt[i])) {
					// Pass the single listener straight through to the singular method
					if (typeof value === 'function') {
						single.call(this, i, value);
					}
					else {
						// Otherwise pass back to the multiple function
						multiple.call(this, i, value);
					}
				}
			}
		}
		else {
			// So evt must be a string
			// And listeners must be an array of listeners
			// Loop over it and pass each one to the multiple method
			i = listeners.length;
			while (i--) {
				single.call(this, evt, listeners[i]);
			}
		}

		return this;
	};

	/**
	 * Removes all listeners from a specified event.
	 * If you do not specify an event then all listeners will be removed.
	 * That means every event will be emptied.
	 * You can also pass a regex to remove all events that match it.
	 *
	 * @param {String|RegExp} [evt] Optional name of the event to remove all listeners for. Will remove from every event if not passed.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.removeEvent = function removeEvent(evt) {
		var type = typeof evt;
		var events = this._getEvents();
		var key;

		// Remove different things depending on the state of evt
		if (type === 'string') {
			// Remove all listeners for the specified event
			delete events[evt];
		}
		else if (evt instanceof RegExp) {
			// Remove all events matching the regex.
			for (key in events) {
				if (events.hasOwnProperty(key) && evt.test(key)) {
					delete events[key];
				}
			}
		}
		else {
			// Remove all listeners in all events
			delete this._events;
		}

		return this;
	};

	/**
	 * Alias of removeEvent.
	 *
	 * Added to mirror the node API.
	 */
	proto.removeAllListeners = alias('removeEvent');

	/**
	 * Emits an event of your choice.
	 * When emitted, every listener attached to that event will be executed.
	 * If you pass the optional argument array then those arguments will be passed to every listener upon execution.
	 * Because it uses `apply`, your array of arguments will be passed as if you wrote them out separately.
	 * So they will not arrive within the array on the other side, they will be separate.
	 * You can also pass a regular expression to emit to all events that match it.
	 *
	 * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
	 * @param {Array} [args] Optional array of arguments to be passed to each listener.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.emitEvent = function emitEvent(evt, args) {
		var listeners = this.getListenersAsObject(evt);
		var listener;
		var i;
		var key;
		var response;

		for (key in listeners) {
			if (listeners.hasOwnProperty(key)) {
				i = listeners[key].length;

				while (i--) {
					// If the listener returns true then it shall be removed from the event
					// The function is executed either with a basic call or an apply if there is an args array
					listener = listeners[key][i];

					if (listener.once === true) {
						this.removeListener(evt, listener.listener);
					}

					response = listener.listener.apply(this, args || []);

					if (response === this._getOnceReturnValue()) {
						this.removeListener(evt, listener.listener);
					}
				}
			}
		}

		return this;
	};

	/**
	 * Alias of emitEvent
	 */
	proto.trigger = alias('emitEvent');

	/**
	 * Subtly different from emitEvent in that it will pass its arguments on to the listeners, as opposed to taking a single array of arguments to pass on.
	 * As with emitEvent, you can pass a regex in place of the event name to emit to all events that match it.
	 *
	 * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
	 * @param {...*} Optional additional arguments to be passed to each listener.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.emit = function emit(evt) {
		var args = Array.prototype.slice.call(arguments, 1);
		return this.emitEvent(evt, args);
	};

	/**
	 * Sets the current value to check against when executing listeners. If a
	 * listeners return value matches the one set here then it will be removed
	 * after execution. This value defaults to true.
	 *
	 * @param {*} value The new value to check for when executing listeners.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.setOnceReturnValue = function setOnceReturnValue(value) {
		this._onceReturnValue = value;
		return this;
	};

	/**
	 * Fetches the current value to check against when executing listeners. If
	 * the listeners return value matches this one then it should be removed
	 * automatically. It will return true by default.
	 *
	 * @return {*|Boolean} The current value to check for or the default, true.
	 * @api private
	 */
	proto._getOnceReturnValue = function _getOnceReturnValue() {
		if (this.hasOwnProperty('_onceReturnValue')) {
			return this._onceReturnValue;
		}
		else {
			return true;
		}
	};

	/**
	 * Fetches the events object and creates one if required.
	 *
	 * @return {Object} The events storage object.
	 * @api private
	 */
	proto._getEvents = function _getEvents() {
		return this._events || (this._events = {});
	};

	/**
	 * Reverts the global {@link EventEmitter} to its previous value and returns a reference to this version.
	 *
	 * @return {Function} Non conflicting EventEmitter class.
	 */
	EventEmitter.noConflict = function noConflict() {
		exports.EventEmitter = originalGlobalValue;
		return EventEmitter;
	};

	// Expose the class either via AMD, CommonJS or the global object
	if (typeof define === 'function' && define.amd) {
		define(function () {
			return EventEmitter;
		});
	}
	else if (typeof module === 'object' && module.exports){
		module.exports = EventEmitter;
	}
	else {
		this.EventEmitter = EventEmitter;
	}
}.call(this));

/*!
 * eventie v1.0.5
 * event binding helper
 *   eventie.bind( elem, 'click', myFn )
 *   eventie.unbind( elem, 'click', myFn )
 * MIT license
 */

/*jshint browser: true, undef: true, unused: true */
/*global define: false, module: false */

( function( window ) {

'use strict';

var docElem = document.documentElement;

var bind = function() {};

function getIEEvent( obj ) {
  var event = window.event;
  // add event.target
  event.target = event.target || event.srcElement || obj;
  return event;
}

if ( docElem.addEventListener ) {
  bind = function( obj, type, fn ) {
    obj.addEventListener( type, fn, false );
  };
} else if ( docElem.attachEvent ) {
  bind = function( obj, type, fn ) {
    obj[ type + fn ] = fn.handleEvent ?
      function() {
        var event = getIEEvent( obj );
        fn.handleEvent.call( fn, event );
      } :
      function() {
        var event = getIEEvent( obj );
        fn.call( obj, event );
      };
    obj.attachEvent( "on" + type, obj[ type + fn ] );
  };
}

var unbind = function() {};

if ( docElem.removeEventListener ) {
  unbind = function( obj, type, fn ) {
    obj.removeEventListener( type, fn, false );
  };
} else if ( docElem.detachEvent ) {
  unbind = function( obj, type, fn ) {
    obj.detachEvent( "on" + type, obj[ type + fn ] );
    try {
      delete obj[ type + fn ];
    } catch ( err ) {
      // can't delete window object properties
      obj[ type + fn ] = undefined;
    }
  };
}

var eventie = {
  bind: bind,
  unbind: unbind
};

// ----- module definition ----- //

if ( typeof define === 'function' && define.amd ) {
  // AMD
  define( eventie );
} else if ( typeof exports === 'object' ) {
  // CommonJS
  module.exports = eventie;
} else {
  // browser global
  window.eventie = eventie;
}

})( this );

/*!
 * getStyleProperty v1.0.3
 * original by kangax
 * http://perfectionkills.com/feature-testing-css-properties/
 */

/*jshint browser: true, strict: true, undef: true */
/*global define: false, exports: false, module: false */

( function( window ) {

'use strict';

var prefixes = 'Webkit Moz ms Ms O'.split(' ');
var docElemStyle = document.documentElement.style;

function getStyleProperty( propName ) {
  if ( !propName ) {
    return;
  }

  // test standard property first
  if ( typeof docElemStyle[ propName ] === 'string' ) {
    return propName;
  }

  // capitalize
  propName = propName.charAt(0).toUpperCase() + propName.slice(1);

  // test vendor specific properties
  var prefixed;
  for ( var i=0, len = prefixes.length; i < len; i++ ) {
    prefixed = prefixes[i] + propName;
    if ( typeof docElemStyle[ prefixed ] === 'string' ) {
      return prefixed;
    }
  }
}

// transport
if ( typeof define === 'function' && define.amd ) {
  // AMD
  define( function() {
    return getStyleProperty;
  });
} else if ( typeof exports === 'object' ) {
  // CommonJS for Component
  module.exports = getStyleProperty;
} else {
  // browser global
  window.getStyleProperty = getStyleProperty;
}

})( window );

/*!
 * classie v1.0.1
 * class helper functions
 * from bonzo https://github.com/ded/bonzo
 * MIT license
 * 
 * classie.has( elem, 'my-class' ) -> true/false
 * classie.add( elem, 'my-new-class' )
 * classie.remove( elem, 'my-unwanted-class' )
 * classie.toggle( elem, 'my-class' )
 */

/*jshint browser: true, strict: true, undef: true, unused: true */
/*global define: false, module: false */

( function( window ) {

'use strict';

// class helper functions from bonzo https://github.com/ded/bonzo

function classReg( className ) {
  return new RegExp("(^|\\s+)" + className + "(\\s+|$)");
}

// classList support for class management
// altho to be fair, the api sucks because it won't accept multiple classes at once
var hasClass, addClass, removeClass;

if ( 'classList' in document.documentElement ) {
  hasClass = function( elem, c ) {
    return elem.classList.contains( c );
  };
  addClass = function( elem, c ) {
    elem.classList.add( c );
  };
  removeClass = function( elem, c ) {
    elem.classList.remove( c );
  };
}
else {
  hasClass = function( elem, c ) {
    return classReg( c ).test( elem.className );
  };
  addClass = function( elem, c ) {
    if ( !hasClass( elem, c ) ) {
      elem.className = elem.className + ' ' + c;
    }
  };
  removeClass = function( elem, c ) {
    elem.className = elem.className.replace( classReg( c ), ' ' );
  };
}

function toggleClass( elem, c ) {
  var fn = hasClass( elem, c ) ? removeClass : addClass;
  fn( elem, c );
}

var classie = {
  // full names
  hasClass: hasClass,
  addClass: addClass,
  removeClass: removeClass,
  toggleClass: toggleClass,
  // short names
  has: hasClass,
  add: addClass,
  remove: removeClass,
  toggle: toggleClass
};

// transport
if ( typeof define === 'function' && define.amd ) {
  // AMD
  define( classie );
} else if ( typeof exports === 'object' ) {
  // CommonJS
  module.exports = classie;
} else {
  // browser global
  window.classie = classie;
}

})( window );

/**
 * getSize v1.1.7
 * measure size of elements
 */

/*jshint browser: true, strict: true, undef: true, unused: true */
/*global define: false, exports: false, require: false, module: false */

( function( window, undefined ) {

'use strict';

// -------------------------- helpers -------------------------- //

var getComputedStyle = window.getComputedStyle;
var getStyle = getComputedStyle ?
  function( elem ) {
    return getComputedStyle( elem, null );
  } :
  function( elem ) {
    return elem.currentStyle;
  };

// get a number from a string, not a percentage
function getStyleSize( value ) {
  var num = parseFloat( value );
  // not a percent like '100%', and a number
  var isValid = value.indexOf('%') === -1 && !isNaN( num );
  return isValid && num;
}

// -------------------------- measurements -------------------------- //

var measurements = [
  'paddingLeft',
  'paddingRight',
  'paddingTop',
  'paddingBottom',
  'marginLeft',
  'marginRight',
  'marginTop',
  'marginBottom',
  'borderLeftWidth',
  'borderRightWidth',
  'borderTopWidth',
  'borderBottomWidth'
];

function getZeroSize() {
  var size = {
    width: 0,
    height: 0,
    innerWidth: 0,
    innerHeight: 0,
    outerWidth: 0,
    outerHeight: 0
  };
  for ( var i=0, len = measurements.length; i < len; i++ ) {
    var measurement = measurements[i];
    size[ measurement ] = 0;
  }
  return size;
}



function defineGetSize( getStyleProperty ) {

// -------------------------- box sizing -------------------------- //

var boxSizingProp = getStyleProperty('boxSizing');
var isBoxSizeOuter;

/**
 * WebKit measures the outer-width on style.width on border-box elems
 * IE & Firefox measures the inner-width
 */
( function() {
  if ( !boxSizingProp ) {
    return;
  }

  var div = document.createElement('div');
  div.style.width = '200px';
  div.style.padding = '1px 2px 3px 4px';
  div.style.borderStyle = 'solid';
  div.style.borderWidth = '1px 2px 3px 4px';
  div.style[ boxSizingProp ] = 'border-box';

  var body = document.body || document.documentElement;
  body.appendChild( div );
  var style = getStyle( div );

  isBoxSizeOuter = getStyleSize( style.width ) === 200;
  body.removeChild( div );
})();


// -------------------------- getSize -------------------------- //

function getSize( elem ) {
  // use querySeletor if elem is string
  if ( typeof elem === 'string' ) {
    elem = document.querySelector( elem );
  }

  // do not proceed on non-objects
  if ( !elem || typeof elem !== 'object' || !elem.nodeType ) {
    return;
  }

  var style = getStyle( elem );

  // if hidden, everything is 0
  if ( style.display === 'none' ) {
    return getZeroSize();
  }

  var size = {};
  size.width = elem.offsetWidth;
  size.height = elem.offsetHeight;

  var isBorderBox = size.isBorderBox = !!( boxSizingProp &&
    style[ boxSizingProp ] && style[ boxSizingProp ] === 'border-box' );

  // get all measurements
  for ( var i=0, len = measurements.length; i < len; i++ ) {
    var measurement = measurements[i];
    var value = style[ measurement ];
    value = mungeNonPixel( elem, value );
    var num = parseFloat( value );
    // any 'auto', 'medium' value will be 0
    size[ measurement ] = !isNaN( num ) ? num : 0;
  }

  var paddingWidth = size.paddingLeft + size.paddingRight;
  var paddingHeight = size.paddingTop + size.paddingBottom;
  var marginWidth = size.marginLeft + size.marginRight;
  var marginHeight = size.marginTop + size.marginBottom;
  var borderWidth = size.borderLeftWidth + size.borderRightWidth;
  var borderHeight = size.borderTopWidth + size.borderBottomWidth;

  var isBorderBoxSizeOuter = isBorderBox && isBoxSizeOuter;

  // overwrite width and height if we can get it from style
  var styleWidth = getStyleSize( style.width );
  if ( styleWidth !== false ) {
    size.width = styleWidth +
      // add padding and border unless it's already including it
      ( isBorderBoxSizeOuter ? 0 : paddingWidth + borderWidth );
  }

  var styleHeight = getStyleSize( style.height );
  if ( styleHeight !== false ) {
    size.height = styleHeight +
      // add padding and border unless it's already including it
      ( isBorderBoxSizeOuter ? 0 : paddingHeight + borderHeight );
  }

  size.innerWidth = size.width - ( paddingWidth + borderWidth );
  size.innerHeight = size.height - ( paddingHeight + borderHeight );

  size.outerWidth = size.width + marginWidth;
  size.outerHeight = size.height + marginHeight;

  return size;
}

// IE8 returns percent values, not pixels
// taken from jQuery's curCSS
function mungeNonPixel( elem, value ) {
  // IE8 and has percent value
  if ( getComputedStyle || value.indexOf('%') === -1 ) {
    return value;
  }
  var style = elem.style;
  // Remember the original values
  var left = style.left;
  var rs = elem.runtimeStyle;
  var rsLeft = rs && rs.left;

  // Put in the new values to get a computed value out
  if ( rsLeft ) {
    rs.left = elem.currentStyle.left;
  }
  style.left = value;
  value = style.pixelLeft;

  // Revert the changed values
  style.left = left;
  if ( rsLeft ) {
    rs.left = rsLeft;
  }

  return value;
}

return getSize;

}

// transport
if ( typeof define === 'function' && define.amd ) {
  // AMD for RequireJS
  define( [ 'get-style-property/get-style-property' ], defineGetSize );
} else if ( typeof exports === 'object' ) {
  // CommonJS for Component
  module.exports = defineGetSize( require('get-style-property') );
} else {
  // browser global
  window.getSize = defineGetSize( window.getStyleProperty );
}

})( window );

/*!
 * Draggabilly v1.1.0
 * Make that shiz draggable
 * http://draggabilly.desandro.com
 * MIT license
 */

( function( window ) {

'use strict';

// vars
var document = window.document;

// -------------------------- helpers -------------------------- //

// extend objects
function extend( a, b ) {
  for ( var prop in b ) {
    a[ prop ] = b[ prop ];
  }
  return a;
}

function noop() {}

// ----- get style ----- //

var defView = document.defaultView;

var getStyle = defView && defView.getComputedStyle ?
  function( elem ) {
    return defView.getComputedStyle( elem, null );
  } :
  function( elem ) {
    return elem.currentStyle;
  };


// http://stackoverflow.com/a/384380/182183
var isElement = ( typeof HTMLElement === 'object' ) ?
  function isElementDOM2( obj ) {
    return obj instanceof HTMLElement;
  } :
  function isElementQuirky( obj ) {
    return obj && typeof obj === 'object' &&
      obj.nodeType === 1 && typeof obj.nodeName === 'string';
  };

// -------------------------- requestAnimationFrame -------------------------- //

// https://gist.github.com/1866474

var lastTime = 0;
var prefixes = 'webkit moz ms o'.split(' ');
// get unprefixed rAF and cAF, if present
var requestAnimationFrame = window.requestAnimationFrame;
var cancelAnimationFrame = window.cancelAnimationFrame;
// loop through vendor prefixes and get prefixed rAF and cAF
var prefix;
for( var i = 0; i < prefixes.length; i++ ) {
  if ( requestAnimationFrame && cancelAnimationFrame ) {
    break;
  }
  prefix = prefixes[i];
  requestAnimationFrame = requestAnimationFrame || window[ prefix + 'RequestAnimationFrame' ];
  cancelAnimationFrame  = cancelAnimationFrame  || window[ prefix + 'CancelAnimationFrame' ] ||
                            window[ prefix + 'CancelRequestAnimationFrame' ];
}

// fallback to setTimeout and clearTimeout if either request/cancel is not supported
if ( !requestAnimationFrame || !cancelAnimationFrame )  {
  requestAnimationFrame = function( callback ) {
    var currTime = new Date().getTime();
    var timeToCall = Math.max( 0, 16 - ( currTime - lastTime ) );
    var id = window.setTimeout( function() {
      callback( currTime + timeToCall );
    }, timeToCall );
    lastTime = currTime + timeToCall;
    return id;
  };

  cancelAnimationFrame = function( id ) {
    window.clearTimeout( id );
  };
}

// -------------------------- definition -------------------------- //

function draggabillyDefinition( classie, EventEmitter, eventie, getStyleProperty, getSize ) {

// -------------------------- support -------------------------- //

var transformProperty = getStyleProperty('transform');
// TODO fix quick & dirty check for 3D support
var is3d = !!getStyleProperty('perspective');

// --------------------------  -------------------------- //

function Draggabilly( element, options ) {
  // querySelector if string
  this.element = typeof element === 'string' ?
    document.querySelector( element ) : element;

  this.options = extend( {distance: 1}, this.options );
  extend( this.options, options );

  this._create();
}

// inherit EventEmitter methods
extend( Draggabilly.prototype, EventEmitter.prototype );

Draggabilly.prototype.options = {
};

Draggabilly.prototype._create = function() {

  // properties
  this.position = {};
  this._getPosition();

  this.startPoint = { x: 0, y: 0 };
  this.dragPoint = { x: 0, y: 0 };

  this.startPosition = extend( {}, this.position );

  // set relative positioning
  var style = getStyle( this.element );
  if ( style.position !== 'relative' && style.position !== 'absolute' ) {
    this.element.style.position = 'relative';
  }

  this.enable();
  this.setHandles();

};

/**
 * set this.handles and bind start events to 'em
 */
Draggabilly.prototype.setHandles = function() {
  this.handles = this.options.handle ?
    this.element.querySelectorAll( this.options.handle ) : [ this.element ];

  for ( var i=0, len = this.handles.length; i < len; i++ ) {
    var handle = this.handles[i];
    // bind pointer start event
    if ( window.navigator.pointerEnabled ) {
      // W3C Pointer Events, IE11. See https://coderwall.com/p/mfreca
      eventie.bind( handle, 'pointerdown', this );
      // disable scrolling on the element
      handle.style.touchAction = 'none';
    } else if ( window.navigator.msPointerEnabled ) {
      // IE10 Pointer Events
      eventie.bind( handle, 'MSPointerDown', this );
      // disable scrolling on the element
      handle.style.msTouchAction = 'none';
    } else {
      // listen for both, for devices like Chrome Pixel
      //   which has touch and mouse events
      eventie.bind( handle, 'mousedown', this );
      eventie.bind( handle, 'touchstart', this );
      disableImgOndragstart( handle );
    }
  }
};

// remove default dragging interaction on all images in IE8
// IE8 does its own drag thing on images, which messes stuff up

function noDragStart() {
  return false;
}

// TODO replace this with a IE8 test
var isIE8 = 'attachEvent' in document.documentElement;

// IE8 only
var disableImgOndragstart = !isIE8 ? noop : function( handle ) {

  if ( handle.nodeName === 'IMG' ) {
    handle.ondragstart = noDragStart;
  }

  var images = handle.querySelectorAll('img');
  for ( var i=0, len = images.length; i < len; i++ ) {
    var img = images[i];
    img.ondragstart = noDragStart;
  }
};


// get left/top position from style
Draggabilly.prototype._getPosition = function() {
  // properties
  var style = getStyle( this.element );

  var x = parseInt( style.left, 10 );
  var y = parseInt( style.top, 10 );

  // clean up 'auto' or other non-integer values
  this.position.x = isNaN( x ) ? 0 : x;
  this.position.y = isNaN( y ) ? 0 : y;

  this._addTransformPosition( style );
};

// add transform: translate( x, y ) to position
Draggabilly.prototype._addTransformPosition = function( style ) {
  if ( !transformProperty ) {
    return;
  }
  var transform = style[ transformProperty ];
  // bail out if value is 'none'
  if ( transform.indexOf('matrix') !== 0 ) {
    return;
  }
  // split matrix(1, 0, 0, 1, x, y)
  var matrixValues = transform.split(',');
  // translate X value is in 12th or 4th position
  var xIndex = transform.indexOf('matrix3d') === 0 ? 12 : 4;
  var translateX = parseInt( matrixValues[ xIndex ], 10 );
  // translate Y value is in 13th or 5th position
  var translateY = parseInt( matrixValues[ xIndex + 1 ], 10 );
  this.position.x += translateX;
  this.position.y += translateY;
};

// -------------------------- events -------------------------- //

// trigger handler methods for events
Draggabilly.prototype.handleEvent = function( event ) {
  var method = 'on' + event.type;
  if ( this[ method ] ) {
    this[ method ]( event );
  }
};

// returns the touch that we're keeping track of
Draggabilly.prototype.getTouch = function( touches ) {
  for ( var i=0, len = touches.length; i < len; i++ ) {
    var touch = touches[i];
    if ( touch.identifier === this.pointerIdentifier ) {
      return touch;
    }
  }
};

// ----- start event ----- //

Draggabilly.prototype.onmousedown = function( event ) {
  // dismiss clicks from right or middle buttons
  var button = event.button;
  if ( button && ( button !== 0 && button !== 1 ) ) {
    return;
  }
  this.beforeDragStart( event, event );
};

Draggabilly.prototype.ontouchstart = function( event ) {
  // disregard additional touches
  if ( this.isDragging ) {
    return;
  }

  this.beforeDragStart( event, event.changedTouches[0] );
};

Draggabilly.prototype.onMSPointerDown =
Draggabilly.prototype.onpointerdown = function( event ) {
  // disregard additional touches
  if ( this.isDragging ) {
    return;
  }

  this.beforeDragStart( event, event );
};

function setPointerPoint( point, pointer ) {
  point.x = pointer.pageX !== undefined ? pointer.pageX : pointer.clientX;
  point.y = pointer.pageY !== undefined ? pointer.pageY : pointer.clientY;
}

// hash of events to be bound after start event
var postStartEvents = {
  mousedown: [ 'mousemove', 'mouseup' ],
  touchstart: [ 'touchmove', 'touchend', 'touchcancel' ],
  pointerdown: [ 'pointermove', 'pointerup', 'pointercancel' ],
  MSPointerDown: [ 'MSPointerMove', 'MSPointerUp', 'MSPointerCancel' ]
};

/**
 * before drag start
 * @param {Event} event
 * @param {Event or Touch} pointer
 */
Draggabilly.prototype.beforeDragStart = function( event, pointer ) {
  if ( !this.isEnabled ) {
    return;
  }

  // prevent default behaviour only if distance is set to 0
  // this denotes that the element is only draggable without side effects
  if (this.options.distance === 0){
    if ( event.preventDefault ) {
      event.preventDefault();
    } else {
      event.returnValue = false;
    }
  }

  // save pointer identifier to match up touch events
  this.pointerIdentifier = pointer.pointerId !== undefined ?
    // pointerId for pointer events, touch.indentifier for touch events
    pointer.pointerId : pointer.identifier;

  this._getPosition();

  this.measureContainment();

  // point where drag began
  setPointerPoint( this.startPoint, pointer );

  // bind move and end events
  this._bindEvents({
    // get proper events to match start event
    events: postStartEvents[ event.type ],
    // IE8 needs to be bound to document
    node: event.preventDefault ? window : document
  });
};

Draggabilly.prototype.dragStart = function(event, pointer){
  if (this.isDragging){
    return;
  }
  // position _when_ drag began
  this.startPosition.x = this.position.x;
  this.startPosition.y = this.position.y;

  // reset left/top style
  this.setLeftTop();

  this.dragPoint.x = 0;
  this.dragPoint.y = 0;

  classie.add( this.element, 'is-dragging' );

  // reset isDragging flag
  this.isDragging = true;

  this.emitEvent( 'dragStart', [ this, event, pointer ] );

  // start animation
  this.animate();
};

Draggabilly.prototype._bindEvents = function( args ) {
  for ( var i=0, len = args.events.length; i < len; i++ ) {
    var event = args.events[i];
    eventie.bind( args.node, event, this );
  }
  // save these arguments
  this._boundEvents = args;
};

Draggabilly.prototype._unbindEvents = function() {
  var args = this._boundEvents;
  // IE8 can trigger dragEnd twice, check for _boundEvents
  if ( !args || !args.events ) {
    return;
  }

  for ( var i=0, len = args.events.length; i < len; i++ ) {
    var event = args.events[i];
    eventie.unbind( args.node, event, this );
  }
  delete this._boundEvents;
};

Draggabilly.prototype.measureContainment = function() {
  var containment = this.options.containment;
  if ( !containment ) {
    return;
  }

  this.size = getSize( this.element );
  var elemRect = this.element.getBoundingClientRect();

  // use element if element
  var container = isElement( containment ) ? containment :
    // fallback to querySelector if string
    typeof containment === 'string' ? document.querySelector( containment ) :
    // otherwise just `true`, use the parent
    this.element.parentNode;

  this.containerSize = getSize( container );
  var containerRect = container.getBoundingClientRect();

  this.relativeStartPosition = {
    x: elemRect.left - containerRect.left,
    y: elemRect.top  - containerRect.top
  };
};

Draggabilly.prototype.elementHasMoved = function(){
  var start = this.startPoint,
    pointer = this.dragPoint,
    dx = pointer.x - start.x,
    dy =  pointer.y - start.y;
  return dx * dx + dy * dy  > this.options.distance * this.options.distance;
};

// ----- move event ----- //

Draggabilly.prototype.onmousemove = function( event ) {
  this.dragMove( event, event );
};

Draggabilly.prototype.onMSPointerMove =
Draggabilly.prototype.onpointermove = function( event ) {
  if ( event.pointerId === this.pointerIdentifier ) {
    this.dragMove( event, event );
  }
};

Draggabilly.prototype.ontouchmove = function( event ) {
  var touch = this.getTouch( event.changedTouches );
  if ( touch ) {
    this.dragMove( event, touch );
  }
};

/**
 * drag move
 * @param {Event} event
 * @param {Event or Touch} pointer
 */
Draggabilly.prototype.dragMove = function( event, pointer ) {

  setPointerPoint( this.dragPoint, pointer );
  if (!this.isDragging){
    if (this.elementHasMoved()){
      this.dragStart(event, pointer);
    }
  } else {
    var dragX = this.dragPoint.x - this.startPoint.x;
    var dragY = this.dragPoint.y - this.startPoint.y;

    var grid = this.options.grid;
    var gridX = grid && grid[0];
    var gridY = grid && grid[1];

    dragX = applyGrid( dragX, gridX );
    dragY = applyGrid( dragY, gridY );

    dragX = this.containDrag( 'x', dragX, gridX );
    dragY = this.containDrag( 'y', dragY, gridY );

    // constrain to axis
    dragX = this.options.axis === 'y' ? 0 : dragX;
    dragY = this.options.axis === 'x' ? 0 : dragY;

    this.position.x = this.startPosition.x + dragX;
    this.position.y = this.startPosition.y + dragY;
    // set dragPoint properties
    this.dragPoint.x = dragX;
    this.dragPoint.y = dragY;

    this.emitEvent( 'dragMove', [ this, event, pointer ] );
  }
};

function applyGrid( value, grid, method ) {
  method = method || 'round';
  return grid ? Math[ method ]( value / grid ) * grid : value;
}

Draggabilly.prototype.containDrag = function( axis, drag, grid ) {
  if ( !this.options.containment ) {
    return drag;
  }
  var measure = axis === 'x' ? 'width' : 'height';

  var rel = this.relativeStartPosition[ axis ];
  var min = applyGrid( -rel, grid, 'ceil' );
  var max = this.containerSize[ measure ] - rel - this.size[ measure ];
  max = applyGrid( max, grid, 'floor' );
  return  Math.min( max, Math.max( min, drag ) );
};

// ----- end event ----- //

Draggabilly.prototype.onmouseup = function( event ) {
  this.dragEnd( event, event );
};

Draggabilly.prototype.onMSPointerUp =
Draggabilly.prototype.onpointerup = function( event ) {
  if ( event.pointerId === this.pointerIdentifier ) {
    this.dragEnd( event, event );
  }
};

Draggabilly.prototype.ontouchend = function( event ) {
  var touch = this.getTouch( event.changedTouches );
  if ( touch ) {
    this.dragEnd( event, touch );
  }
};

/**
 * drag end
 * @param {Event} event
 * @param {Event or Touch} pointer
 */
Draggabilly.prototype.dragEnd = function( event, pointer ) {
  // remove events even if drag is not started
  // they were binded in beforeDragStart
  this._unbindEvents();

  if (!this.isDragging){
    return false;
  }
  this.isDragging = false;

  delete this.pointerIdentifier;

  // use top left position when complete
  if ( transformProperty ) {
    this.element.style[ transformProperty ] = '';
    this.setLeftTop();
  }

  classie.remove( this.element, 'is-dragging' );

  this.emitEvent( 'dragEnd', [ this, event, pointer ] );

};

// ----- cancel event ----- //

// coerce to end event

Draggabilly.prototype.onMSPointerCancel =
Draggabilly.prototype.onpointercancel = function( event ) {
  if ( event.pointerId === this.pointerIdentifier ) {
    this.dragEnd( event, event );
  }
};

Draggabilly.prototype.ontouchcancel = function( event ) {
  var touch = this.getTouch( event.changedTouches );
  this.dragEnd( event, touch );
};

// -------------------------- animation -------------------------- //

Draggabilly.prototype.animate = function() {
  // only render and animate if dragging
  if ( !this.isDragging ) {
    return;
  }

  this.positionDrag();

  var _this = this;
  requestAnimationFrame( function animateFrame() {
    _this.animate();
  });

};

// transform translate function
var translate = is3d ?
  function( x, y ) {
    return 'translate3d( ' + x + 'px, ' + y + 'px, 0)';
  } :
  function( x, y ) {
    return 'translate( ' + x + 'px, ' + y + 'px)';
  };

// left/top positioning
Draggabilly.prototype.setLeftTop = function() {
  this.element.style.left = this.position.x + 'px';
  this.element.style.top  = this.position.y + 'px';
};

Draggabilly.prototype.positionDrag = transformProperty ?
  function() {
    // position with transform
    this.element.style[ transformProperty ] = translate( this.dragPoint.x, this.dragPoint.y );
  } : Draggabilly.prototype.setLeftTop;

Draggabilly.prototype.enable = function() {
  this.isEnabled = true;
};

Draggabilly.prototype.disable = function() {
  this.isEnabled = false;
  if ( this.isDragging ) {
    this.dragEnd();
  }
};

return Draggabilly;

} // end definition

// -------------------------- transport -------------------------- //

if ( typeof define === 'function' && define.amd ) {
  // AMD
  define( [
      'classie/classie',
      'eventEmitter/EventEmitter',
      'eventie/eventie',
      'get-style-property/get-style-property',
      'get-size/get-size'
    ],
    draggabillyDefinition );
} else {
  // browser global
  window.Draggabilly = draggabillyDefinition(
    window.classie,
    window.EventEmitter,
    window.eventie,
    window.getStyleProperty,
    window.getSize
  );
}

})( window );

/*jslint nomen:true*/
/*global Matrix, _*/
var Matrix = (function (_) {
  'use strict';

  /** pure functions **/

  function rows(matrix, selection, startIdx, endIdx) {
    if (endIdx === undefined || endIdx < -1) {
      endIdx = startIdx + 1;
    }
    return new MatrixSelection(
      matrix,
      startIdx,
      endIdx,
      selection.col.start,
      selection.col.end
    );
  }

  function cols(matrix, selection, startIdx, endIdx) {
    if (endIdx === undefined || endIdx < -1) {
      endIdx = startIdx + 1;
    }
    return new MatrixSelection(
      matrix,
      selection.row.start,
      selection.row.end,
      startIdx,
      endIdx
    );
  }

  function getRowValue(matrix, row) {
    return matrix[row];
  }

  function getSelectionValue(matrix, selection) {
    var val = matrix.
      slice(
        selection.row.start,
        selection.row.end
      ).
      map(function (row) {
        return row.slice(
          selection.col.start,
          selection.col.end
        );
      });
    if (val.length === 0) {
      val = undefined;
    }
    return val;
  }

  function getCellValue(matrix, row, col) {
    return matrix[row] ? matrix[row][col] : undefined;
  }

  function selectAll(matrix) {
    return new MatrixSelection(matrix,
      0,
      matrix.size()[0],
      0,
      matrix.size()[1]);
  }


  /**
   * Monadic wrapper for handling matrix selections
   * @constructor
   *
   */
  function MatrixSelection(matrix, rowStart, rowEnd, colStart, colEnd) {
    this.row = {
      start: rowStart,
      end: rowEnd
    };
    this.col = {
      start: colStart,
      end: colEnd
    };
    this.matrix = matrix;
  }

  /**
   * Selects the specified matrix rows range.
   * The selection spans from startIdx to endIdx exclusive.
   * The selection can contain 'virtual cells' - those cells,
   * which are not in the matrix yet.
   *
   * @param startIdx
   * @param endIdx - this index is not included in the selection
   * @returns {MatrixSelection}
   */
  MatrixSelection.prototype.rows = function (startIdx, endIdx) {
    return rows(this.matrix, this, startIdx, endIdx);
  };

  /**
   * Selects the specified matrix columns range.
   * The selection spans from startIdx to endIdx exclusive.
   *
   * @param startIdx
   * @param endIdx - this index is not included in the selection
   * @returns {MatrixSelection}
   */
  MatrixSelection.prototype.cols = function (startIdx, endIdx) {
    return cols(this.matrix, this, startIdx, endIdx);
  };

  MatrixSelection.prototype.val = function () {
    return getSelectionValue(this.matrix._, this);
  };

  /**
   * Compute selection dimensions.
   * @returns {[rows, cols]}
   */
  MatrixSelection.prototype.size = function () {
    return [
      this.row.end - this.row.start,
      this.col.end - this.col.start];
  };

  /**
   * Iterates over current selection including virtual cells.
   *
   * @param {Function} fn - the function to be applied at each iteration
   * @param fn.value - current cell value
   * @param fn.rowIdx - current iteration row index
   * @param fn.colIdx - current iteration col index
   */
  MatrixSelection.prototype.each = function (fn) {
    var rowEnd = this.row.end,
      colEnd = this.col.end,
      rowIdx,
      colIdx,
      curValue;
    for (rowIdx = this.row.start; rowIdx < rowEnd; rowIdx++) {
      for (colIdx = this.col.start; colIdx < colEnd; colIdx++) {
        curValue = this.matrix.get(rowIdx, colIdx);
        fn(curValue, rowIdx, colIdx);
      }
    }
  };

  /**
   * Applies a function against every value
   * in the scope of the current matrix selection.
   * If the selction exceeds the matrix dimensions
   * then matrix dimensions grow automatically.
   *
   * @param {Function} fn - Function to execute in each value of the matrix
   * @param fn.value - matrix cell value of the current iteration
   * @param fn.rowIdx - current iteration row index
   * @param fn.colIdx - current iteration column index
   * @returns {MatrixSelection} - the array of function application results
   */

  MatrixSelection.prototype.map = function (fn) {
    var self = this;
    this.each(function (val, rowId, colId) {
      if (!self.matrix._[rowId]) {
        self.matrix._[rowId] = [];
      }
      if (fn) {
        self.matrix._[rowId][colId] = fn(val, rowId, colId);
      } else {
        self.matrix._[rowId][colId] = null;
      }
    });

    return this.matrix;
  };

  /**
   * Checks each matrix value in the scope of the current selection against the predicate
   *
   * @param {Function} fn
   * @param fn.value - matrix cell value of the current iteration
   * @param fn.rowIdx - current iteration row index
   * @param fn.colIdx - current iteration column index
   * @returns {boolean} true if the predicate matches any value in the matrix.
   *                    False otherwise
   */
  MatrixSelection.prototype.some = function (fn) {
    var result = false;
    this.each(function (val, rowIdx, colIdx) {
      if (fn(val, rowIdx, colIdx)) {
        result = true;
      }
    });

    return result;
  };

  /**
   * Matrix class to handle matrix operations in functional style.
   * Wraps a simple array-based matrix representation.
   *
   * Supports the monadic row/column selection:
   *   matrix.rows(1,2).cols(2,5)
   *
   * This code results in the virtual selection covering 2 rows (row 1 and row 2)
   * and 4 columns in each row (col 2 to 5).
   *
   * Note: The selection can span beside the actual matrix dimensions.
   * This is called 'virtual cells'.
   *
   * @param arrayBasedMatrix simple array-based matrix representation
   * @constructor
   */
  var Matrix = function (arrayBasedMatrix) {
    this._ = arrayBasedMatrix || [
      []
    ];
    this.selection = selectAll(this);
  };

  /**
   * Gets the value of the corresponding matrix element/row/selection.
   *
   * @param row - row index
   * @param col - column index
   * @returns {*}
   */
  Matrix.prototype.get = function (row, col) {
    var val;
    this.selection = selectAll(this);
    if (col === undefined && row !== undefined) {
      val = getRowValue(this._, row);
    } else if (row === undefined) {
      val = getSelectionValue(this._, this.selection);
    } else {
      val = getCellValue(this._, row, col);
    }
    return val;
  };

  /**
   * Puts the value to the corresponding matrix element.
   *
   * @param row
   * @param col
   * @param {*} value
   */
  Matrix.prototype.put = function (row, col, value) {
    this._[row][col] = value;
    return this;
  };

  /**
   * Returns matrix size in [rows, cols] format
   *
   * @returns {Array}
   */
  Matrix.prototype.size = function () {
    return [this._.length, this._[0].length];
  };

  Matrix.prototype.rows = function (startIdx, endIdx) {
    return rows(this, this.selection, startIdx, endIdx);
  };

  Matrix.prototype.cols = function (startIdx, endIdx) {
    return cols(this, this.selection, startIdx, endIdx);
  };

  /**
   * Iterates over each matrix value.
   *
   * @param {Function} fn - function which will be applied to each matrix value
   * @param fn.value - current cell value
   * @param fn.rowId - current cell row index
   * @param fn.colId - current cell column index
   * @returns {Matrix}
   */
  Matrix.prototype.each = function (fn) {
    _.each(this._, function (row, rowId) {
      _.each(row, function (val, colId) {
        fn(val, rowId, colId);
      });
    });
  };

  /**
   * Maps each matrix value to function application result.
   *
   * @param {Function} fn - function which will be applied to each matrix value.
   * It's result will be written as current matrix cell value.
   * @param fn.value - current cell value
   * @param fn.rowId - current cell row index
   * @param fn.colId - current cell column index
   * @returns {Matrix}
   */
  Matrix.prototype.map = function (fn) {
    var self = this;
    _.each(this._, function (row, rowId) {
      _.each(row, function (val, colId) {
        self.put(rowId, colId, fn(val, rowId, colId));
      });
    });
    return this;
  };

  /**
   * Checks each matrix value against the predicate.
   *
   * @param {Function} fn
   * @param fn.value - matrix cell value of the current iteration
   * @param fn.rowIdx - current iteration row index
   * @param fn.colIdx - current iteration column index
   * @returns {boolean} true if the predicate matches any value in the matrix.
   *                    False otherwise
   */
  Matrix.prototype.some = function (fn) {
    return _.some(this._, function (row, rowId) {
      return _.some(row, function (val, colId) {
        return fn(val, rowId, colId);
      });
    });
  };

  return Matrix;
}(_));
/*jslint vars: true, nomen: true, plusplus: true, browser: true, white: true */
/*global jQuery */
var Pocketry = (function ($, _) {
	'use strict';

	function Board(container, rowSpan, options) {
		var self = this;

		function init() {
			this.container = $(container);
			options = options || {};

			self.slotSize = options.slotSize || 100; // TODO: determine based on tile size within DOM
			self.filterClass = options.filterClass || "is-hidden"; // TODO: document

			var a = self.determineColCount();
			if (!a) {
				return;
			}
			self.layout = new Pocketry.Layout(a, rowSpan);
			self.initTiles(this.container);

			this.draggable();
			window.addEventListener('resize', Pocketry.debounce(10, self.onResize));
		}

		this.initTiles = function (container) {
			var self = this;
			var tiles = _.map(container.children(), function (item, index) {
				var type = $(item).attr('data-type');
				var tile = _.extend(_.clone(self.getTileType(type)), {
					el: $(item),
					id: '#' + (index + 1)
				});
				return tile;
			});

			tiles.forEach(self.add);
			tiles.forEach(self.position);
			return tiles;
		};

		this.getTileType = function (type) {
			return Board.TILES[type] || Board.TILES[0];
		};

		this.onResize = function () {
			if (visible(self.container)) {
				self.updateContainerDimensions();
				self.relayout();
			}
		};

		function visible(element){
			return element[0].offsetHeight > 0 && element[0].offsetWidth > 0;
		}

		this.relayout = function (topNode) {
			this.layout.rebuild();
			this.layout.stack.forEach(function (tile) {
				if (tile === self._dragTile) { // avoid repositioning active dragee -- XXX: breaks encapsulation
					return;
				}
				setTimeout(function () {
					self.position(tile);
				}, 1);
			});

			if (topNode) {
				topNode.parentNode.appendChild(topNode); // z-index hack -- TODO: use "transitionend" event instead
			}
			this.publish('relayout');
		};

		this.updateContainerDimensions = function () {
			this.container.css('width', '');
			this.layout.colCount = this.determineColCount();
			this.container.css({ // force expansion, required due to children's abspos
				width: (this.layout.colCount * this.slotSize) + 'px',
				height: (this.layout.matrix.size()[0] * this.slotSize) + 'px'
			});
		};

		this.add = function (tile) {
			tile.hidden = tile.el.hasClass(self.filterClass);
			self.layout.add(tile);
		};

		this.position = function (tile) {
			var x = tile.position.x * self.slotSize;
			var y = tile.position.y * self.slotSize;
			var transform = 'translate(' + x + 'px, ' + y + 'px)';
			tile.el.css({ // TODO: move width/height into CSS?
				top: 0,
				left: 0,
				width: (tile.size[0] * self.slotSize) + 'px',
				height: (tile.size[1] * self.slotSize) + 'px',
				'-webkit-transform': transform,
				transform: transform,
				'transition-duration': '0.5s',
				'-webkit-transition-duration': '0.5s' /* Safari */
			});
			self.updateContainerDimensions();
		};

		this.determineColCount = function () {
			var container = this.container[0];
			var colCount = 1;
			if (container) {
				colCount = Math.floor(container.clientWidth / this.slotSize);
			}
			return colCount;
		};

		init.call(self);
	}

	Board.TILES = {
		pin: { size: [1, 1], icon: '○' },
		app: { size: [2, 2], icon: '□' },
		feed: { size: [3, 2], icon: '▭' },
		placeholder: { size: [1, 1] }
	};

	return Board;

}(jQuery, _));

/*jslint vars: true, plusplus: true, nomen: true, white: true */
/*global Pocketry, Matrix */
Pocketry.Layout = function () {

	'use strict';
// `rowSpan` indicates the max. vertical size of an individual element
	function Layout(colCount, rowSpan) {
		this.colCount = colCount;
		this.rowSpan = rowSpan;
		this.init();
	}

	Layout.prototype.init = function () {
		this.stack = []; // one-dimensional array of tiles
		// two-dimensional array; rows * columns
		// initialized to colCount * rowSpan width by default
		this.matrix = this.initMatrix();
		delete this.scanStartPosition;
	};

	Layout.prototype.initMatrix = function () {
		return new Matrix().rows(0, this.rowSpan).cols(0, this.colCount).map();
	};

// adds a tile to the matrix
// that object must have a `size` property of the form `[width, height]`
	Layout.prototype.add = function (tile) {
		if (tile.hidden) {
			this.stack.push(tile); // XXX: DRY!
			return [];
		}

		if (this._canFitTile(tile)) {
			var unplaced = this.walk(
					tryToFitTile(tile),
					tile.size,
					this.scanStartPosition
			);
			if (unplaced) { // try again
				this._markRowAsScanned();
				this.extend();
				return this.add(tile);
			}
			this._markScanPositionAtTile(tile);

			this.stack.push(tile);
		}
		return [];
	};

	Layout.prototype._canFitTile = function (tile) {
		return tile.size[0] <= this.matrix.size()[1];
	};

	Layout.prototype._markRowAsScanned = function () {
		this.scanStartPosition = {
			col: 0,
			row: this.matrix.size()[0]
		};
	};

	Layout.prototype._markScanPositionAtTile = function (tile) {
		// the position advances only
		// if the tile fits within the row height
		if (tile.size[1] >= this.rowSpan) {
			this.scanStartPosition = {
				col: tile.position.x + tile.size[0],
				row: (this.scanStartPosition ? this.scanStartPosition.row : 0)
			};
		}
	};

	/**
	 * Predicate which determine if the current tile is placed
	 *
	 * @param tile - current tile to check
	 * @returns {boolean} true if tile is placed
	 */
	function placedTile(tile) {
		return tile !== undefined && tile !== null;
	}

	function tryToFitTile(tile) {
		return function (tileSelection) {
			if (tileSelection.some(placedTile)) {
				return false;
			} else {
				tileSelection.map(function () {
					return tile;
				});
				tile.position = { x: tileSelection.col.start, y: tileSelection.row.start };
				return true;
			}
		};
	}

	/**
	 * Moves tiles in the stack to specified position.
	 * If position is not specified put tile to the end.
	 *
	 * @param tile - tile to move
	 * @param toPosition - position to move
	 */
	Layout.prototype.move = function (tile, toPosition) {
		if (toPosition == null) {
			toPosition = -1;
		}
		var stack = this.stack;
		_.remove(stack, tile);
		if (toPosition !== -1) {
			stack.splice(toPosition, 0, tile);
		} else {
			stack.push(tile);
		}
		this.rebuild();
	};

	/**
	 * Rebuild matrix according to the current tails stack state.
	 *
	 */
	Layout.prototype.rebuild = function () {
		var self = this;
		var stack = this.stack;
		this.init();
		stack.forEach(function (tile) {
			self.add(tile);
		});
	};

	/**
	 * Returns a tile from the layout
	 * denoted by its position
	 *
	 * @param position - tile position object
	 * @returns {*}
	 */
	Layout.prototype.getTile = function (position) {
		return this.matrix.get(position.y, position.x);
	};

	/**
	 * Moves the given tile to the new position in the layout.
	 *
	 * @param tile - a tile to be repositioned
	 * @param newPosition - new position coordinates within the layout
	 */
	Layout.prototype.moveTo = function (tile, newPosition) {
		var n = this.getStackNeighbor(newPosition);
		var newStackIndex = this.getTileInsertIndex(n, newPosition);
		this.move(tile, newStackIndex);
	};

	/**
	 * Determines the nearest stack neighbor for the given position.
	 * Depends on the walk algorithm implementation.
	 *
	 * @param position
	 * @returns {*}
	 */
	Layout.prototype.getStackNeighbor = function (position) {
		var neighbor = this.matrix.get(position.y, position.x);
		while (!neighbor) {
			position = stepUp(position, this.rowSpan);
			position = stepRight(position, this.matrix.size()[1] - 1, this.rowSpan);
			if (isLayoutEnded(position, this.stack)) {
				break;
			}
			neighbor = this.getStackNeighbor(position);
		}

		return neighbor;
	};

	function stepUp(position, rowHeight) {
		var offsetInsideRow = position.y % rowHeight;
		if (offsetInsideRow !== 0) {
			// if not topmost position in a row
			// position is advanced to the top
			position.y -= offsetInsideRow;
		}
		return position;
	}

	function stepRight(position, rowLength, rowHeight) {
		if (position.x >= rowLength) {
			// search in the next row
			position.x = 0;
			position.y += rowHeight;
		} else {
			position.x += 1;
		}
		return position;
	}

	function isLayoutEnded(position, stack) {
		var lastTile = stack[stack.length - 1];
		return (position.x > lastTile.position.x
				&& position.y >= lastTile.position.y);
	}

	/**
	 * Determines whether the tile should be inserted before or after
	 * its neighbor
	 * @param neighbor - neighbor tile
	 * @param position - tile target position
	 * @returns {number}
	 */
	Layout.prototype.getTileInsertIndex = function (neighbor, position) {
		if (!neighbor) {
			return -1;
		}
		var stackIndex = this.stack.indexOf(neighbor),
				np = neighbor.position;

		if (position.x > np.x + neighbor.size[0] / 2) {
			stackIndex += 1;
		}

		return stackIndex;
	};

	/**
	 * Iterates through the layout.
	 * Each iteration is based on the matrix selection.
	 * Selection size is identical to the passed stepSize parameter.
	 *
	 * The resulting 'selection cursor' iterates through
	 * all possible selection area positions.
	 *
	 * The callback is applied to each iteration selection.
	 *
	 * @param {Function} callback - function to be applied to each selection.
	 * @param callback.selection - the current selection of the stepSize size.
	 * @param callback.iteration - the current iteration number
	 * @param stepSize - the [cols, rows] size of the iteration selection.
	 * Defaults to [1,1]
	 * @param scanOffset - denotes the number of rows and columns to skip
	 * @returns {boolean}
	 */
	Layout.prototype.walk = function (callback, stepSize, scanOffset) {
		stepSize = stepSize || [1, 1];
		scanOffset = scanOffset || {col: 0, row: 0};

		var stop = false,
				row = scanOffset.row,
				totalRows = this.matrix.size()[0];

		// walk row by row
		while ((row < totalRows) && !stop) {
			var currentRowToScan = this._getRowToScan(row, scanOffset.col);
			stop = this._scanRow(currentRowToScan, stepSize, callback);
			row += this.rowSpan;
		}

		return !stop;
	};

	/**
	 * Return a row selection from the underlying matrix.
	 * This selection will be scanned by walk algorithm.
	 *
	 * @param rowOffset - the row index offset
	 * @param colOffset - the col index offset
	 * @returns {*|MatrixSelection}
	 * @private
	 */
	Layout.prototype._getRowToScan = function (rowOffset, colOffset) {
		return this.matrix.
				rows(
						rowOffset,
						rowOffset + this.rowSpan
				).
				cols(
						colOffset,
						this.matrix.size()[1]
				);
	};

	/**
	 * Scans the specified row and apply the callback on each step
	 *
	 * @param row - the row to be scanned
	 * @param stepSize - the size of the scan step
	 * @param callback - the function to be applied on each step
	 * @returns {boolean}
	 * @private
	 */
	Layout.prototype._scanRow = function (row, stepSize, callback) {
		var stepNumber = 0,
				selection = {row: {start: 0, end: 0}, col: {start: 0, end: 0}},
				stop = false;

		var steps = this._getNumberOfScanSteps(row, stepSize);
		while (stepNumber < steps && !stop) {
			selection = this._nextTopDownScanStep(
					stepNumber,
					stepSize,
					row);
			stop = callback(
					this.matrix.
							rows(selection.row.start, selection.row.end).
							cols(selection.col.start, selection.col.end),
					stepNumber
			);
			stepNumber++;
		}

		return stop;
	};

	/**
	 * Returns the number of scan steps for the given matrix.
	 *
	 * @param matrix - matrix to be scanned
	 * @param stepSize - the size of the scan step
	 * @returns {number}
	 * @private
	 */
	Layout.prototype._getNumberOfScanSteps = function (matrix, stepSize) {
		var sz = matrix.size();

		// assume that adjacent steps are always of size 1
		var inRow = sz[0] - stepSize[1] + 1;
		var inCol = sz[1] - stepSize[0] + 1;
		return inRow * inCol;
	};

	/**
	 * Compute next iteration step statically
	 * based on the current iteration number.
	 * The algorithm is 'top-down column scan', based on matrix dimensions:
	 *
	 * [ 1 3 ]
	 * [ 2 4 ]
	 *
	 * [ 1 3 5 7 ]
	 * [ 2 4 6 8 ]
	 *
	 * [ 1 4 7 ]
	 * [ 2 5 8 ]
	 * [ 3 6 9 ]
	 *
	 * The underlying matrix is divided in columns.
	 * Each column is scanned top to bottom.
	 *
	 * @param stepNumber - current iteration number
	 * @param stepSize - selection dimensions
	 * @param scanArea - matrix selection to be scanned
	 * @returns {*} - current walk selection
	 */
	Layout.prototype._nextTopDownScanStep = function (stepNumber, stepSize, scanArea) {

		var stepRowIdx, stepColIdx, stepsPerColumn;

		stepsPerColumn = scanArea.size()[0] - stepSize[1] + 1;
		stepColIdx = scanArea.col.start + Math.floor(stepNumber / stepsPerColumn);
		stepRowIdx = scanArea.row.start + stepNumber % stepsPerColumn;

		var step = {
			row: {
				start: stepRowIdx,
				end: stepRowIdx + stepSize[1]
			},
			col: {
				start: stepColIdx,
				end: stepColIdx + stepSize[0]
			}
		};

		return step;
	};

// add a set of rows (based on row span)
	Layout.prototype.extend = function () {
		var newRowIdx = this.matrix.size()[0];
		this.matrix.rows(newRowIdx, newRowIdx + this.rowSpan).map();
	};

	return Layout;

}();

/*jslint vars: true, nomen: true, plusplus: true, browser: true, white: true */
/*global Pocketry, jQuery, _ */
(function ($, _) {
  'use strict';

  Pocketry.prototype.draggable = function () {

    var self = this;
    this.init = function () {
      var tiles = this.container.children(':not(.draggable)');
      $.each(tiles, function (index, node) {
        var draggie = new Draggabilly(node, { containment: self.container[0] });

        draggie.on('dragStart', self.onPick);
        draggie.on('dragMove', Pocketry.debounce(50, function () {
          if (self._dragTile) {
            self.onMove.apply(self, arguments);
          }
        }));
        draggie.on('dragEnd', self.onDrop);
        $(node).addClass('draggable');
      });
      return tiles;
    };

    self.onPick = function (draggie, ev, pointer) {
      self._dragTile = self.determineTile(
        draggie.position,
        self.layout.matrix,
        self.slotSize
      );
    };

    this.onMove = function (draggie, ev, pointer) {
      console.log(draggie.position, pointer.x, pointer.y);
    };

    this.onDrop = function (draggie, ev, pointer) {
      var relativePointer = getRelativePointer(pointer);
      var target = self.determineDropTarget(relativePointer);
      var dragTile = self._dragTile;
      delete self._dragTile; // ensures element snaps into position

      if (dragTile === target.tile) { // reset
        self.position(dragTile);
      } else {
        self.layout.moveTo(dragTile, target.tilePosition);
        self.relayout();
      }
      self.publish('tile-dropped', {
        tile: dragTile,
        distance: draggie.dragPoint
      });
    };

    function getRelativePointer(pointer){
      var offset = Pocketry.offset(self.container);
      return {
        x: pointer.pageX - offset.left,
        y: pointer.pageY - offset.top
      };
    }

    this.determineTile = function (targetPos) {
      var tilePosition = determineTilePosition(targetPos, this.slotSize);
      return this.layout.getTile(tilePosition);
    };

    function determineTilePosition(coords, slotSize) {
      return {
        x: Math.floor(coords.x / slotSize),
        y: Math.floor(coords.y / slotSize)
      };
    }

    this.determineDropTarget = function (targetPos) {
      return {
        position: targetPos,
        tilePosition: determineTilePosition(targetPos, this.slotSize),
        tile: this.determineTile(targetPos)
      };
    };

    this.init.call(this);

    return self;
  };
}(jQuery, _));

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

Pocketry.offset = function(el) {
  var domElement = el[0],
  body = document.documentElement || document.body,
  scrollX = window.pageXOffset || body.scrollLeft,
  scrollY = window.pageYOffset || body.scrollTop,
  x = domElement.getBoundingClientRect().left + scrollX,
  y = domElement.getBoundingClientRect().top + scrollY;
  return { left: x, top:y };
};
