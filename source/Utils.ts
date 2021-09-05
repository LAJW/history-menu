import { Fail, Ok, Result } from "./Result";

export function inlineEscaped(str : string) : Result<string, string> {
	let result = ""
	for (let i = 0; i < str.length; ++i) {
		const ch = str[i];
		if (ch == "\\") {
			if (i + 1 === str.length) {
				return new Fail("Extra backslash");
			}
			result += str[i + 1];
			++i;
		} else {
			result += ch;
		}
	}
	return new Ok(result);
}

export function escapedSplit (string : string) : Result<string[], string> {
	const result : string[] = []
	for (const part of string.split(/(?<!\\)\*/)) {
		const inlined = inlineEscaped(part);
		if (inlined.isOk) {
			result.push(inlined.ok);
		} else {
			return new Fail(inlined.fail);
		}
	}
	return new Ok(result);
}

export function stripComments(line : string) : Result<string, string> {
	const parts = line.split(" ");
	if (parts[0].startsWith("#")) {
		return new Ok("");
	} else if (parts.length > 1 && !parts[1].startsWith("#")) {
		return new Fail("Comments should start with #");
	} else {
		return new Ok(parts[0]);
	}
}

export function glob(parts : string[], haystack : string) {
	const first = parts[0];
	const last = parts[parts.length - 1];
	if (!haystack.startsWith(first)) {
		return false;
	}
	let index = first.length;
	for (let i = 1; i < parts.length; ++i) {
		const part = parts[i];
		index = haystack.indexOf(part, index);
		if (index === -1) {
			return false;
		}
		index += part.length;
	}
	return index === haystack.length || last === "";
}

export function parseGlob(line: string) : Result<(str: string) => boolean, string> {
	return stripComments(line)
	.bind(escapedSplit)
	.bind(parts => {
		if (parts.length === 0) {
			return new Fail("Empty pattern.");
		} else if (parts.reduce((sum, str) => sum + str.length, 0) <= 3) {
			return new Fail("Pattern is too short: " + parts);
		} else {
			return new Ok(haystack => glob(parts, haystack));
		}
	});
}

export function* enumerate<T>(enumerator: Iterable<T>) : Iterable<[number, T]> {
	let i = 0;
	for (const element of enumerator) {
		yield [i, element];
		++i;
	}
}

export function parseGlobs(lines : string[]) {
	const parsers : ((str: string) => boolean)[] = [];
	const errors : string[] = [];
	for (const [lineIndex, line] of enumerate(lines)) {
		const trimmed = line.trim();
		if (trimmed !== "" && !trimmed.startsWith("#")) {
			parseGlob(trimmed).match(
				parser => parsers.push(parser),
				error => errors.push(`Line ${lineIndex + 1}: ${error}`));
		}
	}
	return { parsers, errors }
}

export function groupBy<T, V>(items : Iterable<T>, func : (value: T) => V) {
	const groups = new Map<V, T[]>();
	for (const item of items) {
		const id = func(item);
		let group = groups.get(id);
		if (!group) {
			group = [];
			groups.set(id, group);
		}
		group.push(item);
	}
	return groups;
}

const prefixes = [
	"https://www.",
	"http://www.",
	"https://",
	"http://",
]

export function removeProtocol(url : string) {
	const prefix = prefixes.find(prefix => url.startsWith(prefix));
	if (prefix !== undefined) {
		return url.substr(prefix.length);
	}
	return url;
}

export function removeDomain(url : string) {
	const protocolIndex = url.indexOf("//");
	if (protocolIndex < 0) {
		return url;
	}
	const domainIndex = url.indexOf("/", protocolIndex + 2);
	return url.substring(domainIndex + 1);
}

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
	className? : string
	events? : {
		click? : ((e: MouseEvent) => void)
		mousedown? : ((e: MouseEvent) => void)
		mouseup? : ((e: MouseEvent) => void)
	},
	childNodes? : Node[]
	type? : string
	disabled? : boolean
	width? : number
	height? : number
}

export function $(params : Template | string) : HTMLElement | Node {
	if (typeof(params) == "string")
		return document.createTextNode(params);
	const element = document.createElement(params.nodeName);
	if (params.events) {
		if (params.events.click) {
			element.addEventListener("click", params.events.click);
		}
		if (params.events.mousedown) {
			element.addEventListener("mousedown", params.events.mousedown);
		}
		if (params.events.mouseup) {
			element.addEventListener("mouseup", params.events.mouseup);
		}
	}
	if (params.childNodes) {
		params.childNodes.forEach(element.appendChild.bind(element));
	}
	if (params.className) {
		element.className = params.className
	}
	if (params.type) {
		(element as HTMLInputElement).type = params.type
	}
	if (params.disabled !== undefined) {
		(element as HTMLInputElement).disabled = params.disabled
	}
	if (params.width) {
		const canvas = element as HTMLCanvasElement
		canvas.width = params.width
		canvas.height = params.height
	}
	return element;
}

const MouseButton = Object.freeze({
	Left : 0,
	Middle : 1,
})

export function isInBackground(e : MouseEvent | KeyboardEvent) {
	return (e as MouseEvent).button === MouseButton.Middle
		|| ((e as MouseEvent).button === MouseButton.Left
				|| (e as KeyboardEvent).key === "Enter")
			&& e.metaKey || e.ctrlKey || e.shiftKey;
}

export default {
	$,
	px,
	url,
	isURL,
	trimURL,
	relativeTime,
}
