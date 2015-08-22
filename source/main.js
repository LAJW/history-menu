"use strict"
if (!Array.prototype.find) {
	Object.defineProperty(Array.prototype, "find", {value: function (callback) {
		typecheck(arguments, Function);
		for (var c of this)
			if (callback(c))
				return c;
		return undefined;
	}});
}

function compose() {
	let funcs = arguments;
	return function (value) {
		for (let i = funcs.length - 1; i >= 0; i--) {
			let func = funcs[i];
			if (func instanceof Promise || value instanceof Promise) {
				value = Promise.all([func, value]).then(function (args) {
					return args[0](args[1]);	
				});
			} else value = func(value);	
		}
		return value;
	}
}

function curry(fn) {
	return function () {
		for (let arg of arguments)
			if (arg instanceof Promise)
				return Promise.all(arguments).then(function (args) {
					return fn.bind.apply(fn, 
						[null].concat(Array.prototype.slice.call(args))
					);
				});
		return fn.bind.apply(fn, 
			[null].concat(Array.prototype.slice.call(arguments))
		);
	}
}

// Universal Event Handler
var EventHandler = function () {
	typecheck(arguments, [Function, undefined], typecheck.trail);
	let listeners = Array.prototype.slice(arguments);
	let handler = function () {
		for (let listener of listeners)
			listener.apply(this, arguments);
	}
	handler.addListener = function (listener) {
		typecheck(arguments, Function);
		let index = listeners.indexOf(listener);
		if (index < 0)
			listeners.push(listener);
	}
	handler.removeListener = function () {
		let index = listeners.indexOf(listener);
		if (index > 0)
			listeners.splice(index, 1);
	}
	return handler;
}

// detect which cells were added and which were removed during array transition
var diff = function (before, after) {
	typecheck(arguments, Array, Array);
	let arr1 = before,
		arr2 = after,
		i1 = 0,
		i2 = 0, 
		l1 = arr1.length, 
		l2 = arr2.length,
		out = { removed: [], added: [] };
	while (i1 < l1 || i2 < l2) {
		if (arr1[i1] == arr2[i2]) {
			i1++;
			i2++;
		} else if (i1 == l1) 
			for (; i2 < l2; i2++) 
				out.added.push({value: arr2[i2]});
		else {
			let f2 = arr2.indexOf(arr1[i1], i2 + 1);
			if (f2 < 0) 
				out.removed.push(arr1[i1]);
			else {
				for (; i2 < f2; i2++) 
					out.added.push({value: arr2[i2], before: arr2[f2]});
				i2++;
			}
			i1++;
		}
	}
	return out;
}

var param = curry(function (name, object) {
	return object[name];
});

var front = param(0);

var back = function (array) {
	return array[array.length - 1];
}

var method = function (name) {
	return curry(function () {
		let args = Array.prototype.slice.call(arguments);
		let o = args.pop();
		return o[name].apply(o, args);
	});
}

Object.defineProperty(Function.prototype, "create", {
	get: function () {
		let self = this;
		return function (a, b, c, d, e, f, g) {
			return new self(a, b, c, d, e, f, g);
		}
	}
});

var map = method("map");

var each = method("forEach");

var sessionToNode = function (session) {
	typecheck(arguments, [
		{tab: Object, lastModified: Number},
		{window: Object, lastModified: Number}
	]);
	if (session.window) {
		let window = session.window;
		window.lastModified = session.lastModified;
		return WindowFolder.create(window);
	} else {
		let tab = session.tab;
		tab.lastModified = session.lastModified;
		return TabButton.create(tab);
	}
}

var TabButton = new Class({
	prototype: Button,
	constructor: function (tab) {
		Button.call(this, {
			icon: "chrome://favicon/" + tab.url,
			title: tab.title,
			tooltip: tab.url
		});
		this.sessionId = tab.sessionId;
	},
	click: function (e) {
		e.preventDefault();
		Chrome.sessions.restore(this.sessionId, e.which == 2);
	}
});

var WindowFolder = new Class({
	prototype: Folder,
	constructor: function (window) {
		Folder.call(this, window);
		this.title = "Window (Number of tabs: " + window.tabs.length + ")";
		each(compose(appendInto(this), TabButton.create))(window.tabs);
	}
});

function sessionToSID(session) {
	return (session.tab || session.window).sessionId;
}

var Chrome = {
	history: {
		search: function (query) {
			return new Promise(function (resolve) {
				chrome.history.search(query, resolve);
			});
		}
	},	
	sessions: {
		get: function (query) {
			return new Promise(function (resolve) {
				chrome.sessions.getRecentlyClosed(query, resolve);
			});
		},
		restore: function (sessionId, inBackground) {
			typecheck(arguments, String, [Boolean, undefined]);	
			if (inBackground) {
				chrome.tabs.getCurrent(function (tab) {
					chrome.sessions.restore(sessionId, function () {
						chrome.tabs.update(tab.id, {active: true});
					});
				})
			} else chrome.sessions.restore(sessionId);
		},
		onStateChange: {
			addListener: function (callback) {
				function sessionToSID(session) {
					return (session.window || session.tab).sessionId;
				}
				let oldSIDs = [];
				let sessionChange = function () {
					Chrome.sessions.get({}).then(function (sessions) {
						sessions = sessions.slice(0, 10);
						let newSIDs = sessions.map(sessionToSID);
						let df = diff(oldSIDs, newSIDs);
						var added = df.added.map(function (c) {
							return {value: sessions.find(function (session) {
								return sessionToSID(session) == c.value;
							}), before: c.before};
						});
						callback(added, df.removed);
						oldSIDs = newSIDs;
					});
				}
				sessionChange();
				chrome.sessions.onChanged.addListener(sessionChange);
			}
		}
	}
}

Root.ready().then(function (root) {
	root.setTheme("Ubuntu", true);
	var sessionButtonCache = {};
	Chrome.sessions.onStateChange.addListener(function (added, removed) {
		added.forEach(function (item) {
			let before = sessionButtonCache[item.before]
			let child = sessionToNode(item.value);
			let parent = sessionButtonCache[item.parent] || root;
			sessionButtonCache[child.sessionId] = child;
			parent.insert(child, before);
		});
		removed.forEach(function (SID) {
			var removed = sessionButtonCache[SID];
			removed.parent.remove(removed);
		});
	});
});

