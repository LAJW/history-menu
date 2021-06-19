// css shortcuts
export function px(input : number) {
	return Math.round(input) + "px";
}

export function url(input : string) {
	return " url('" + input + "') ";
}

// converts to string, checks if supplied string is a valid URL
// 1. String isURL(Mixed text)
export function isURL(text : string) {
	return text.indexOf("://") > 0 && text.indexOf(" ") < 0;
}
// converts to string, If supplied string is an URL, returns trimmed version of it, else returns supplied string
// 1. String trimURL(Mixed text)

export function trimURL(text : string) {
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

export function relativeTime(value : number) {
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
		return Math.round(diff / 3600 / 24 / 365) + "y";	
	}
}

interface Template {
	nodeName : string
	className : string
	events? : {
		click? : ((e: MouseEvent) => void)
		mousedown? : ((e: MouseEvent) => void)
		mouseup? : ((e: MouseEvent) => void)
	},
	childNodes : Node[] | undefined
}

export function $(params : Template | string) : HTMLElement {
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
