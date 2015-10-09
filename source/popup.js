"use strict"

// get time sectors for search
function timeSectors() {
	let now = Date.now();
	let hour = 1000 * 3600;
	let lastHour = now - hour;
	let lastDay = now - hour * 24;
	let yesterday = now - hour * 48;
	let lastWeek = now - hour * 24 * 7;
	let prevWeek = now - hour * 24 * 14;
	let lastMonth = now - hour * 24 * 30;
	let prevMonth = now - hour * 24 * 60;
	return [
		{ start: lastHour, end: now, i18n: "results_recently" },
		{ start: lastDay, end: lastHour, i18n: "results_today" },
		{ start: yesterday, end: lastDay, i18n: "results_yesterday" },
		{ start: lastWeek, end: yesterday, i18n: "results_this_week" },
		{ start: prevWeek, end: lastWeek, i18n: "results_last_week" },
		{ start: lastMonth, end: prevWeek, i18n: "results_this_month" },
		{ start: prevMonth, end: lastMonth, i18n: "results_last_month" }
	];						
}

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

// Function.prototype.create - "new" abstraction, for use in functional code
Object.defineProperty(Function.prototype, "create", {
	get: function () {
		let self = this;
		return function (a, b, c, d, e, f, g, h) {
			return new self(a, b, c, d, e, f, g, h)
		}
	}
})

// remove protocol://[www.] from url
function trimURL(url) {
	typecheck(arguments, String);	
	url = url.substr(url.indexOf("://") + 3);
	if (url.substr(0,4) == "www.")
		url = url.substr(4);
	return url;
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
			.then(JSON.parse)
			.then(function (locale) {
				typecheck(arguments, String);
				return function (messageKey) {
					let data = locale[messageKey];
					return data ? data.message : "";
				}
			});
	// custom set to non-english, english fallback
	return Promise.all(
			chromeFetch("_locales/" + locale + "/messages.json")
				.then(JSON.parse),
			chromeFetch("_locales/en/messages.json")
				.then(JSON.parse)
	).then(function (locales) {
		let locale = locales[0];
		let enLocale = locales[1];
		return function (messageKey) {
			let data = locale[messageKey] || enLocale[messageKey];
			return data ? data.message : "";		
		}
	});
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

function getPlatform() {
	if (navigator.appVersion.indexOf("Win") != -1)
		return "Windows";
	else if (navigator.appVersion.indexOf("Linux") != -1)
		return "Ubuntu";
	else return "";
}

chromeFetch("defaults.json")
	.then(JSON.parse)
	.then(getSettings)
	.then(function (settings) {
		Promise.all([
			Root.ready(),
			Chrome.sessions.getRecent({maxResults: settings.tabCount | 0})
				.then(function (sessions) {
					return sessions.map(function (session) {
						let bit = session.tab || session.window;
						if (settings.timer)
							bit.lastModified = session.lastModified;
						if (session.tab)
							return new TabButton(bit);
						else return new WindowFolder(bit);
					});
				}),
			Chrome.sessions.getDevices()
				.then(function (devices) {
					return devices.map(function (device) {
						if (!settings.timer)
							device.sessions.forEach(function (session) {
								session.lastModified = undefined;
							});
						return DeviceFolder.create(device)
					});
				}),
			Chrome.history.search({
				text: "", 
				startTime: Date.now() - 1000 * 3600 * 24 * 30, 
				endTime: Date.now(),
				maxResults: settings.historyCount | 0
			}).then(function (results) {
				return results.map(function (result) {
					if (!settings.timer)
						result.lastVisitTime = undefined;
					return HistoryButton.create(result);
				});
			}),
			getI18n(settings.locale),
			settings
		]).then(function (arr) {
			(function (root, sessions, devices, history, i18n, settings) {
				root.setTheme(settings.theme || getPlatform(), settings.animate);
				let mainLayer = root.insert(new Layer({children: [].concat(
					[new Separator({title: i18n("popup_recently_closed_tabs")})],
					sessions,
					[new Separator({title: i18n("popup_recent_history")})],
					history
				)}));
				
				let deviceLayer = root.insert(new Layer({
					visible: false,
					children: devices
				}));
				let devicesButton;
				let searchLayer = root.insert(new Layer({
					visible: false,
					children: [
						new Separator({title: i18n("popup_search_history")})
					]
				}));
				let searchInstance = 0;
				root.insert(new MultiButton({
					children: [
						new Input({
							placeholder: i18n("popup_search_history"),
							lockon: true,
							change: function (value) {
								let currentSearchInstance = ++searchInstance;
								// layout update
								searchLayer.visible = !!this.value;
								deviceLayer.visible = false;
								devicesButton.on = false;
								if (value) {
									searchLayer.clear();
									searchLayer.insert(new Progressbar);
								}
								Promise.all(timeSectors().map(function (time) {
									return Chrome.history.search({
										text: value,
										startTime: time.start,
										endTime: time.end,
									}).then(function (results) {
										if (!results.length)
											return [];
										let nodes = results.map(function (result) {
											if (!settings.timer) {
												result.lastVisitTime = null;
											}
											return HistoryButton.create(result);
										});
										nodes.unshift(new Separator({
											title: i18n(time.i18n)
										}));
										return nodes;
									});
								})).then(function (lists) {
									if (searchInstance == currentSearchInstance) {
										searchLayer.clear();
										let nodes = Array.prototype.concat.apply([], lists);
										if (nodes.length == 0)
											searchLayer.insert(new Separator({
												title: i18n("results_nothing_found")
											}));
										else searchLayer.insert(nodes);
										searchLayer.insert(new Separator({
											title: i18n("results_end")
										}));
									}
								}.bind(this));
							}
						}),
						devicesButton = new DevicesButton({
							tooltip: i18n("popup_other_devices"),
							click: function (e) {
								this.on = deviceLayer.visible = !deviceLayer.visible;
							}
						}),
						new ActionButton({
							tooltip: i18n("popup_history_manager"),
							icon: "icons/history-19.png",
							click: function (e) {
								Chrome.tabs.openOrSelect("chrome://history/", false);
							}
						}),
						new ActionButton({
							tooltip: i18n("popup_options"),
							icon: "icons/options.png",
							click: function (e) {
								Chrome.tabs.openOrSelect("./options.html", false);
							}
						})
					]
				}));
			}).apply(this, arr);
		});
	});
