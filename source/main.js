"use strict"

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
		{ start: lastHour, end: now, i18n: "time_last_hour" },
		{ start: lastDay, end: lastHour, i18n: "time_last_day" },
		{ start: yesterday, end: lastDay, i18n: "time_yesterday" },
		{ start: lastWeek, end: yesterday, i18n: "time_last_week" },
		{ start: prevWeek, end: lastWeek, i18n: "time_prev_week" },
		{ start: lastMonth, end: prevWeek, i18n: "time_last_month" },
		{ start: prevMonth, end: lastMonth, i18n: "time_prev_month" }
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

Object.defineProperty(Function.prototype, "create", {
	get: function () {
		let self = this;
		return function (a, b, c, d, e, f, g, h) {
			return new self(a, b, c, d, e, f, g, h)
		}
	}
})

// remove ftp|http|https://(www). from url
function trimURL(url) {
	typecheck(arguments, String);	
	url = url.substr(url.indexOf("://") + 3);
	if (url.substr(0,4) == "www.")
		url = url.substr(4);
	return url;
}

let settings = {
	locale: "en",
	expandWindows: false,
	timer: false,
	recentlyClosedCount: 10,
	recentlyViewedCount: 10
}

Promise.all([
	Root.ready(),
	Chrome.sessions.getRecent({maxResults: settings.recentlyClosedCount})
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
		maxResults: settings.recentlyViewedCount
	}).then(function (results) {
		return results.map(function (result) {
			if (!settings.timer)
				result.lastVisitTime = undefined;
			return HistoryButton.create(result);
		});
	}),
	Chrome.storage.local.get(),
	Chrome.storage.sync.get(),
	chromeFetch("_locales/" + settings.locale + "/messages.json")
]).then(function (arr) {
	(function (root, sessions, devices, history, storage, local, i18nData) {
		i18nData = JSON.parse(i18nData);
		let i18n = function (key) {
			return i18nData[key] ? i18nData[key].message : "";		
		}
		root.setTheme("Windows", true);
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
		root.insert(new MultiButton({
			children: [
				new Input({
					placeholder: i18n("popup_search_history"),
					lockon: true,
					change: function (value) {
						// layout update
						searchLayer.visible = !!this.value;
						deviceLayer.visible = false;
						devicesButton.on = false;
						
						Promise.all(timeSectors().map(function (time) {
							return Chrome.history.search({
								text: value,
								startTime: time.start,
								endTime: time.end,
							}).then(function (results) {
								if (!results.length)
									return [];
								let nodes = results.map(HistoryButton.create);
								nodes.unshift(new Separator({title: time.i18n}));
								return nodes;
							});
						})).then(function (lists) {
							if (this.value == value) {
								searchLayer.clear();
								let nodes = Array.prototype.concat.apply([], lists);
								if (nodes.length == 0)
									searchLayer.insert(new Separator({title: "No results"}));
								else searchLayer.insert(nodes);
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
