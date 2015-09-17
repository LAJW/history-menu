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

class Session {
	constructor(chromeSession) {
		this.id = chromeSession.sessionId;			
		this.visited = chromeSession.lastVisited;
		if (chromeSession.tab) {
			let tab = chromeSession.tab;	
			this.title = tab.title;
			this.url = tab.url;
		} else {
			let window = chromeSession.window;
			this.children = chromeSession.map(Session.create);
		}
	}
	compare(that) {
		return this.sessionId == that.sessionId;	
	}
}

var diff = function (params) {
	typecheck(arguments, {
		before: Array,
		after: Array,
		equals: Function,
		getChildren: Function,
		parent: [Object, undefined]
	});
	let equals = params.equals,
		getChildren = params.getChildren,
		parent = params.parent,
		arr1 = params.before,
		arr2 = params.after,
		i1 = 0,
		i2 = 0, 
		il1 = arr1.length, 
		il2 = arr2.length,
		result = { remove: [], insert: [] },
		f2 = 0,
		children;
	while (i1 < il1 || i2 < il2) {
		if (i1 >= il1) 
			for (; i2 < il2; i2++) 
				result.insert.push({
					value: arr2[i2],
					parent: parent
				});
		else if (equals(arr1[i1], arr2[i2])) {
			children = getChildren(arr1[i1]);
			if (children)
				result = result.concat(diff({
					before: children ,
					after: getChildren(arr2[i2]),
					equals: equals,
					getChildren: getChildren,
					parent: arr2[i2],
				}));
			i1++;
			i2++;
		} else {
			f2 = i2 + 1;
			for (; f2 < il2; f2++)
				if (equals(arr1[i1], arr2[i2]))
					break;
			if (f2 < 0) {
				result.remove.push(arr1[i1]);
				i1++;
			} else {
				for (; i2 < f2; i2++) 
					result.insert.push({
						value: arr2[i2], 
						before: arr2[f2],
						parent: parent
					});
			}
		}
	}
	return result;
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

var ifElse = curry(function (ifValue, elseValue, condition) {
	return condition ? ifValue : elseValue;
});

var sessionToNode = function (session) {
	typecheck(arguments, Object);
	return session.tabs
		? WindowFolder.create(session)
		: TabButton.create(session);
}

class TabButton extends Button {
   constructor(tab) {
		super({
			icon: "chrome://favicon/" + tab.url,
			title: tab.title,
			tooltip: tab.url
		});
		this.sessionId = tab.sessionId;
	}
	click(e) {
		e.preventDefault();
		Chrome.sessions.restore(this.sessionId, e.which == 2);
	}
};

class WindowFolder extends Folder {
	constructor(window) {
		Folder.call(this, window);
		this.title = "Window (Number of tabs: " + window.tabs.length + ")";
		let self = this;
		window.tabs.forEach(function (tab) {
			self.insert(TabButton.create(tab));
		});
	}
}

var Chrome = {
	history: {
		search: function (query) {
			return new Promise(function (resolve) {
				chrome.history.search(query, resolve);
			});
		},
		onStateChange: {
			addListener: function (callback) {
								
			}
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
		_limit: 10,
		_onLimitChange: new EventHandler,
		onStateChange: {
			addListener: function (callback) {
				function sessionToSID(session) {
					return (session.window || session.tab).sessionId;
				}
				let oldSessions = [];
				let sessionChange = function () {
					Chrome.sessions.get({}).then(function (sessions) {
						sessions = sessions
							.slice(0, Chrome.sessions.limit)
							.map(function (session) {
								let result = session.tab || session.window;
								result.lastVisited = session.lastVisited;
								return result;
							});
						let df = diff({
							before: oldSessions,
							after: sessions,
							equals: function (a, b) {
								return a.sessionId == b.sessionId;	
							},
							getChildren: param("tabs")
						});
						oldSessions = sessions;
						callback(df);
					});
				}
				sessionChange();
				chrome.sessions.onChanged.addListener(sessionChange);
				Chrome.sessions._onLimitChange.addListener(sessionChange); 
			}
		},
		// global limit on visible session count
		get limit() {
			return Chrome.sessions._limit;
		},
		set limit(value) {
			typecheck(arguments, Number);
			Chrome.sessions._limit = value;	
			Chrome.sessions._onLimitChange();
		}
	}
}

Root.ready().then(function (root) {
	root.setTheme("Ubuntu", true);
	var sessionButtonCache = {};
	Chrome.sessions.onStateChange.addListener(function (diff) {
		diff.insert.forEach(function (item) {
			let before = sessionButtonCache[item.before]
			let child = sessionToNode(item.value);
			let parent = item.parent ? sessionButtonCache[item.parent.sessionId] : root;
			sessionButtonCache[child.sessionId] = child;
			parent.insert(child, before);
		});
		diff.remove.forEach(function (session) {
			var removed = sessionButtonCache[session.sessionId];
			removed.parent.remove(removed);
		});
	});
});

