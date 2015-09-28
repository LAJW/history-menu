"use strict"
var Chrome;
{
	let wrap = function (system, funcKey) {
		return function () {
			let args = Array.prototype.slice.call(arguments);
			return new Promise(function (resolve) {
				args.push(resolve);
				system[funcKey].apply(system, args);
			});
		}
	}
	Chrome = {
		history: {
			search: wrap(chrome.history, "search")
		},
		sessions: {
			getRecent: wrap(chrome.sessions, "getRecentlyClosed"),
			restore: function (sessionId, inBackground) {
				typecheck(arguments, String, [Boolean, undefined]);	
				return new Promise(function (resolve) {
					if (inBackground) {
						chrome.tabs.getCurrent(function (tab) {
							chrome.sessions.restore(sessionId, function () {
								chrome.tabs.update(tab.id, {active: true},
									resolve);
							});
						})
					} else chrome.sessions.restore(sessionId);
				});
			}
		},
		storage: {
			local: {
				get: wrap(chrome.storage.local, "get"),
				set: wrap(chrome.storage.local, "set")
			},
			sync: {
				get: wrap(chrome.storage.sync, "get"),
				set: wrap(chrome.storage.sync, "set")
			}
		},
		tabs: {
			create: wrap(chrome.tabs, "create"),
			query: wrap(chrome.tabs, "query"),
			update: wrap(chrome.tabs, "update"),
			highlight: wrap(chrome.tabs, "highlight"),
			// open url or if tab with URL already exists, select it instead
			openOrSelect: function (url, inBackground) {
				let colon = url.indexOf(":");
				let pattern = "*" + url.substr(colon);
				return Chrome.tabs.query({url: pattern})
					.then(function (tabs) {
					console.log(tabs);
					if (tabs.length) {
						if (inBackground)
							return Chrome.tabs.highlight({
								tabs:
									tabs.map(function (tab) { return tab.index; })
							});		
						else return Chrome.tabs.update(
							tabs[0].id, 
							{ active: true }
						);
					} else {
						return Chrome.tabs.create({
							url: url,
							active: !inBackground
						});
					}
				});
			}
		}
	}
}
