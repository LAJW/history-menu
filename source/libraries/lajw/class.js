/*
Class.js - strict class wrapper

 - read only methods and prototypes
 - automatic checking for (this) when calling methods
 - support for ECMA 5 accessors
 - uses native JS prototype-based inheritance (for instanceof and Object.getPrototypeOf support)
 - automatic constructor inheritance and default constructor support
 - use class.get(object, propertyName) and class.set(object, propertyName, value) to call parent's accessors
*/

"use strict"
var Class = (function () { 
	var get = Object.getOwnPropertyDescriptor;
	function deepGet(proto, name) {
		while (!proto.hasOwnProperty(name))
			proto = Object.getPrototypeOf(proto);
		return get(proto, name);
	}
	function wrapMethod(ctor, method, errorMessage) {
		return function () {
			if (!this || !(this instanceof ctor))
				throw new TypeError(errorMessage);
			else return method.apply(this, arguments);
		}
	}
	function defineMethod(ctor, name, method) {
		Object.defineProperty(ctor.prototype, name, {
			value: wrapMethod(ctor, method, "method [" + name + "] called on invalid type of object")
		});
	}
	// return accessor that protects Class.accessor.property.get/set from being called on invalid types
	function protectedAccessor(ctor, name, accessor) {
		var get = accessor.get;
		var set = accessor.set;
		accessor = {};
		if (get)
			Object.defineProperty(accessor, "get", {
				value: wrapMethod(ctor, get, "accessor [" + name + ".get] called on invalid type of object")
			});
		if (set) 
			Object.defineProperty(accessor, "set", {
				value: wrapMethod(ctor, set, "accessor [" + name + ".set] called on invalid type of object")
			});
		return accessor;
	}
	// properties object will be modified
	return function(properties) {
		// verify properties object
		if (!properties || !(properties instanceof Object))
			throw new TypeError("Class.constructor(properties): properties must be an object");
		
		// check and create default constructor, if necessary
		var base = properties.prototype;
		if (!properties.hasOwnProperty("constructor") || properties.constructor === Object) {
			if (properties.prototype) {
				properties.constructor = function () {
					base.apply(this, arguments);
				}
			} else properties.constructor = function () {};
		} else if (!(properties.constructor instanceof Function))
			throw new TypeError("Class.constructor(properties): properties.constructor, if defined, must be a function");
		
		// wrap constructor, protect from being called on invalid type
		var realCtor = properties.constructor; // underlying constructor
		// constructor wrapper, checks for type before calling underlying constructor
		var ctor = function () {
			if (!this || !(this instanceof ctor))
				throw new TypeError("constructor called on invalid type of object");
			realCtor.apply(this, arguments);
		}
		delete properties.constructor;
		
		// check and apply prototype
		if (properties.hasOwnProperty("prototype")) {
			if (!properties.prototype || !(properties.prototype instanceof Function))
				throw new TypeError("Class.constructor(properties): properties.prototype, if defined, must be a class or a function");
			Object.defineProperty(ctor, "prototype", { value: new properties.prototype });
			delete properties.prototype;
		}
		var proto = ctor.prototype;
		
		for (var i in properties) {
			var property = properties[i];
			// define method
			if (property && property instanceof Function) {
				defineMethod(ctor, i, property);
			// define getter/setter
			} else if (property && property.get &&
				property.get instanceof Function) {
				Object.defineProperty(proto, i, protectedAccessor(ctor, i, property));
			// regular property, regular assignment
			} else proto[i] = property;
		}
		Object.defineProperty(ctor, "set", {
			value: function (object, name, value) {
				if (!this || !(this instanceof Function))
					throw new TypeError("class.set not called on a class");
				if (!name || typeof(name) !== "string")
					throw new TypeError("class.set name must be a string");
				deepGet(this.prototype, name).set.call(object, value);
			}
		});
		Object.defineProperty(ctor, "get", {
			value: function (object, name, value) {
				if (!this || !(this instanceof Function))
					throw new TypeError("class.get not called on a class");
				if (!name || typeof(name) !== "string")
					throw new TypeError("class.set name must be a string");
				return deepGet(this.prototype, name).get.call(object);
			}
		});
		// class ready, return
		return ctor;
	}
})();
