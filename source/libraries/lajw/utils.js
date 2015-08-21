/**
* Checks if value is instance of supplied constructor(s) or in specified range
* of values. Also check structures of types with {param1: Type1, param2: Type2}
* @param {Mixed} value 
* @param {Function | Object | Array} type 
* @param {Boolean} loose - don't return false on unexpected object parameters
* @return {Boolean}
*/
function instanceOf(value, type, loose) {
	if (arguments.length < 2 || type === value)
	   	return true;
	if (!type)
	   	return false;
	if (type instanceof Function) 
		return value && value instanceof type
		|| type == String && typeof value == "string" 
		|| type == Boolean && typeof value == "boolean" 
		|| type == Number && typeof value == "number";
	if (type instanceof Array)
		return type.some(function (type) {
			return instanceOf(value, type, loose);
		});	
	return value
		&& type instanceof Object 
		&& Object.keys(type).every(function (key) {
			return instanceOf(value[key], type[key], loose);
		}) 
		&& (loose || Object.keys(value).every(type.hasOwnProperty.bind(type)));
}

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
				console.log("argument [" + i + "] has incorrect type\nExpected:\n",
					lastType, "\nGot:\n", callerArgs[i]);
				throw new TypeError;
			}
		}
	} else if (types.length < callerArgs.length) {
		console.log("Too many arguments\nExpected:\n", types.length, "\nGot:\n", callerArgs.length);
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
typecheck.trail = {};
typecheck.loose = {};

// css shortcuts
function px(input) {
	typecheck(arguments, Number);
	return Math.round(input) + "px";
}

function url(input) {
	typecheck(arguments, String);
	return " url('" + input + "') ";
}

// converts to string, checks if supplied string is a valid URL
// 1. String isURL(Mixed text)
function isURL(text) {
	if (!instanceOf(text, String))
		return false;
	return text.indexOf("://") > 0 && text.indexOf(" ") < 0;
}
// converts to string, If supplied string is an URL, returns trimmed version of it, else returns supplied string
// 1. String trimURL(Mixed text)

function trimURL(text) {
	text += '';
	if (!isURL(text))
		return text;
	// trim query strings ?q=...xxx
	var queryStart = text.indexOf("?");
	var queryEnd = text.indexOf("=", queryStart);
	if (queryStart > 0 && queryEnd > 0)
		text = text.substr(0, queryEnd + 1) + "...";
	// trim slashes
	var split = text.split("/");
	if (split.length > 5) {
		split.splice(4, split.length - 5, "...");
		text = split.join("/");
	}
	return text;
}

// convert supplied time to human-readable time format relative to current date
// relativeTime(Number timeInMilliseconds)

function relativeTime(value) {
	var diff = ( Date.now() - value ) / 1000;
	if (diff < 60) {
		return "<1m";
	} else if (diff < 3600) {
		return round(diff / 60) + "m";
	} else if (diff < 3600 * 24) {
		return round(diff / 3600) + "h";
	} else if (diff < 3600 * 24 * 365) {
		return round(diff / 3600 / 24) + "d";
	} else {
		return round(diff / 3600 / 24 / 365) + "y";	
	}
}

/**
* DOM Element generator
* @param {Object} params - parameters describing element to be created
* @return {Element} - created element
*/
function $(params) {
	typecheck(arguments, [Object, String]);
	if (typeof(params) == "string")
		return document.createTextNode(params);
	var element = document.createElement(params.nodeName);
	delete params.nodeName;
	if (params.events) {
		for (var i in params.events)
			element.addEventListener(i, params.events[i]);
		delete params.nodeName;
	}
	if (params.childNodes) {
		params.childNodes.forEach(element.appendChild.bind(element));
		delete params.childNodes;
	}
	for (var i in params)
		element[i] = params[i];
	return element;
}
