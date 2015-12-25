"use strict"
/**
 * Checks if argument list matches type pattern. Throws TypeError if something 
 * went wrong.
 * @param {Object} callerArgs - Optional caller's "arguments" object or other 
 * array-like object
 * @param {...Mixed} types - types to be checked against
 * @param {typecheck.trail | typecheck.loose} - (optional) trail last type or 
 * do loose typecheck (pt arguments and parameters)
 * @throw {TypeError} - error with information about invalid parameter
 */
function typecheck(callerArgs) {
	var loose = false;
	if (!arguments.length)
		return;
	if (callerArgs === undefined || callerArgs === null)
		throw TypeError("callerArgs must be a non-null object");
	var types = Array.prototype.slice.call(arguments, 1);
	if (types[types.length - 1] === typecheck.trail ||
		types[types.length - 1] === typecheck.loose) {
		loose = types[types.length - 1] === typecheck.loose;
		types.pop();
		var lastType = types[types.length - 1];
		for (var i = types.length, il = callerArgs.length; i < il; i++) {
			if (!instanceOf(callerArgs[i], lastType, loose)) {
				console.log(
					"argument [" + i + "] has incorrect type\nExpected:\n",
					lastType, "\nGot:\n", callerArgs[i]);
				throw new TypeError;
			}
		}
	} else if (types.length < callerArgs.length) {
		console.log("Too many arguments\nExpected:\n", 
		types.length, "\nGot:\n", callerArgs.length);
		throw new TypeError;
	}
	for (var i = 0, il = types.length; i < il; i++) {
		if (!instanceOf(callerArgs[i], types[i], loose)) {
			console.log("argument [" + i + "] has incorrect type\nExpected:\n",
				types[i], "\nGot:\n", callerArgs[i]);
			throw new TypeError;
		}
	}
}

// Check extra parameters against the last type in argument list 
Object.defineProperty(typecheck, "trail", {
	value: function () {
		var args = Array.prototype.slice.call(arguments);
		args.push(typecheck.trail);
		return typecheck.apply(null, args);
	}
});

// Accept unexpected parameters on structures of types and trailing
Object.defineProperty(typecheck, "loose", {
	value: function () {
		var args = Array.prototype.slice.call(arguments);
		args.push(typecheck.loose);
		return typecheck.apply(null, args);
	}
});

