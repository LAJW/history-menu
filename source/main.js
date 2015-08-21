function compose() {
	var funcs = arguments;
	return function (value) {
		for (var i = funcs.length - 1; i >= 0; i--) {
			var func = funcs[i];
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
		for (var arg of arguments)
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
	var listeners = Array.prototype.slice(arguments);
	var handler = function () {
		for (var listener of listeners)
			listener.apply(this, arguments);
	}
	handler.addListener = function (listener) {
		typecheck(arguments, Function);
		var index = listeners.indexOf(listener);
		if (index < 0)
			listeners.push(listener);
	}
	handler.removeListener = function () {
		var index = listeners.indexOf(listener);
		if (index > 0)
			listeners.splice(index, 1);
	}
	return handler;
}

Chrome = {
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
		foregroundRestore: function (sessionId) {
			typecheck(arguments, String);
			chrome.sessions.restore(sessionId);
		},
		backgroundRestore: function (sessionId) {
			typecheck(arguments, String);
			chrome.tabs.getCurrent(function (tab) {
				chrome.sessions.restore(sessionId, function () {
					setTimeout(function () {
						chrome.tabs.update(tab.id, {active: true});
					}, 1000);
				});
			})

		},
		onChange: new EventHandler
	}
}

chrome.sessions.onChanged.addListener(Chrome.sessions.onChange);

// detect which cells were added and which were removed during array transition
var diff = function (before, after) {
	typecheck(arguments, Array, Array);
	var arr1 = before,
		arr2 = after,
		i1 = 0,
		i2 = 0, 
		l1 = arr1.length, 
		l2 = arr2.length,
		out = [];
	while (i1 < l1 || i2 < l2) {
		if (arr1[i1] == arr2[i2]) {
			out.push({value: arr1[i1]});
			i1++;
			i2++;
		} else if (i1 == l1) 
			for (; i2 < l2; i2++) 
				out.push({value: arr2[i2], added: true});
		else {
			var f2 = arr2.indexOf(arr1[i1], i2 + 1);
			if (f2 < 0) {
				out.push({value: arr1[i1], removed: true});
				i1++;
			} else for (; i2 < f2; l2++) 
				out.push({value: arr2[i2], added: true});
		}
	}
	return out;
}

// detect which cells were added and which were removed during array transition
var diff = function (before, after) {
	typecheck(arguments, Array, Array);
	var arr1 = before,
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
			var f2 = arr2.indexOf(arr1[i1], i2 + 1);
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
		var args = Array.prototype.slice.call(arguments);
		var o = args.pop();
		return o[name].apply(o, args);
	});
}

Object.defineProperty(Function.prototype, "create", {
	get: function () {
		var self = this;
		return function (a, b, c, d, e, f, g) {
			return new self(a, b, c, d, e, f, g);
		}
	}
});

var map = method("map");
var each = method("forEach");

// Mixed => Mixed: Logs Mixed type value
var log = function (value) {
	console.log(value);
	return value;	
}

var sessionToNode = function (session) {
	typecheck(arguments, [
		{tab: Object, lastModified: Number},
		{window: Object, lastModified: Number}
	]);
	if (session.window) {
		var window = session.window;
		window.lastModified = session.lastModified;
		return WindowFolder.create(window);
	} else {
		var tab = session.tab;
		tab.lastModified = session.lastModified;
		return TabButton.create(tab);
	}
}

// Parent, Node | null => Node => Node: Inserts node before node
var insertInto = curry(function (parent, before, child) {
	return parent.insert(child, before);
});

// Parent => Node => Node: Inserts node at the end of child list
var appendInto = curry(function (parent, child) {
	return parent.insert(child);
});

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
		if (e.which == 1) {
			chrome.sessions.restore(this.sessionId);
			window.close();
		} else if (e.which == 2) {
			chrome.sessions.restore(this.sessionId);
		}
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

// find node with specified sid
var getBySID = function (array, sid) {
	for (var node of array) {
		if (node.sessionId == sid)
			return node;
	}
	return undefined;
}

function sessionToSID(session) {
	return (session.tab || session.window).sessionId;
}

function SIDToSession(sessions, SID) {
	typecheck(arguments, Array, String);
	for (var session of sessions) {
		if (sessionToSID(session) == SID)
			return session;
	}
	return undefined;
}

function createNodeFromSID(sessions, SID) {
	typecheck(arguments, Array, String);
	return sessionToNode(SIDToSession(sessions, SID));
}

function getNodeBySID(collection, SID) {
	typecheck(arguments, Array, String);
	for (var node of collection) {
		if (node.sessionId == SID)
			return node;
	}
	return undefined;
}

Root.ready().then(function (root) {
	root.setTheme("Ubuntu", true);
	var oldSIDs = [];
	var sessionChange = function () {
		Chrome.sessions.get({}).then(function (sessions) {
			var newSIDs = sessions.map(sessionToSID);
			var d = diff(oldSIDs, newSIDs);
			var children = root.children;
			// insert the new ones
			console.log(d);
			d.added.forEach(function (c) {
				var child = createNodeFromSID(sessions, c.value);
				if (c.before) {
					var before = getNodeBySID(children, c.before);
					root.insert(child, before);
				} else {
					root.insert(child);
				}
			});
			// remove the old ones
			d.removed.forEach(function (c) {
				var child = getNodeBySID(children, c);	
				console.log(child);
				root.remove(child);
			});
			// limit to 25 entries
			root.children.slice(10).forEach(function (child) {
				root.remove(child);
			});
			oldSIDs = newSIDs.slice(0, 10);
		});
	}
	sessionChange();
	Chrome.sessions.onChange.addListener(sessionChange);
});

