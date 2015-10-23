"use strict"

// fetch for chrome protocol
function chromeFetch(url) {
	return new Promise(function (resolve, reject) {
		let xhr = new XMLHttpRequest();
		xhr.open("GET", url);
		xhr.onload = function () {
			if (this.status >= 200 && this.status < 300)
				resolve(xhr.response);
			else reject(xhr.statusText);
		}
		xhr.onerror = function () {
			reject(xhr.statusText);
		}
		xhr.send();
	});
}

// get i18n engine in promise
function getI18n(locale) {
	typecheck(arguments, [String, undefined]);
	// default locale - use default chrome locale engine
	if (!locale)
		return Promise.resolve(chrome.i18n.getMessage.bind(chrome.i18n));
	// custom set to english - load only english
	if (locale == "en")
		return chromeFetch("_locales/en/messages.json")
			.then(function (json) {
				let locale = JSON.parse(json);
				return function (messageKey) {
					typecheck(arguments, String);
					let data = locale[messageKey];
					return data ? data.message : "";
				}
			});
	// custom set to non-english, english fallback
	return Promise.all([
			chromeFetch("_locales/" + locale + "/messages.json"),
			chromeFetch("_locales/en/messages.json")
	]).then(function (locales) {
		let locale = JSON.parse(locales[0]);
		let enLocale = JSON.parse(locales[1]);
		return function (messageKey) {
			let data = locale[messageKey] || enLocale[messageKey];
			return data ? data.message : "";		
		}
	});
}

function getPlatform() {
	if (navigator.appVersion.indexOf("Win") != -1)
		return "Windows";
	else if (navigator.appVersion.indexOf("Linux") != -1)
		return "Ubuntu";
	else return "";
}

// Read-only settings server 
function getSettings(defaultSettings) {
	defaultSettings = defaultSettings || {};
	return Promise.all([
		Chrome.storage.local.get(),
		Chrome.storage.sync.get()
	]).then(function (storages) {
		let local = storages[0];
		let sync = storages[1];
		if (local.local)
			return local;
		else return sync;
	}).then(function (settings) {
		for (var i in defaultSettings) {
			if (!settings.hasOwnProperty(i))
				settings[i] = defaultSettings[i];
		}
		return settings;
	});
}

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
			search: wrap(chrome.history, "search"),
			deleteUrl: wrap(chrome.history, "deleteUrl")
		},
		sessions: {
			getRecent: wrap(chrome.sessions, "getRecentlyClosed"),
			getDevices: wrap(chrome.sessions, "getDevices"),
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
		settings: {
			getReadOnly: function () {
				
			}, 
			getReadWrite: function () {
				
			}
		},
		tabs: {
			create: wrap(chrome.tabs, "create"),
			query: wrap(chrome.tabs, "query"),
			update: wrap(chrome.tabs, "update"),
			highlight: wrap(chrome.tabs, "highlight"),
			// open url or if tab with URL already exists, select it instead
			openOrSelect: function (url, inBackground) {
				typecheck(arguments,
					String,
					[Boolean, undefined]
				);
				let colon = url.indexOf(":");
				if (colon >= 0) {
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
				} else {
					return Chrome.tabs.create({
						url: url,
						active: !inBackground
					});
				}
			}
		}
	}
}
