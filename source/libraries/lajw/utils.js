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
	typecheck(arguments, Number);
	var diff = ( Date.now() - value ) / 1000;
	if (diff < 60) {
		return "<1m";
	} else if (diff < 3600) {
		return Math.round(diff / 60) + "m";
	} else if (diff < 3600 * 24) {
		return Math.round(diff / 3600) + "h";
	} else if (diff < 3600 * 24 * 365) {
		return Math.round(diff / 3600 / 24) + "d";
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
