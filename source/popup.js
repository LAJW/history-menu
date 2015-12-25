"use strict"

define(["./ActionButton", "./Chrome", "./DeviceFolder", "./libraries/lajw/ui/Input",
		"./libraries/lajw/ui/Layer", "./libraries/lajw/ui/MultiButton",
		"./libraries/lajw/ui/Separator", "./WindowFolder", "./TabButton",
		"./HistoryButton", "./libraries/lajw/ui/Root"],
function (ActionButton, Chrome, DeviceFolder, Input, Layer, MultiButton,
		Separator, WindowFolder, TabButton, HistoryButton, Root) {

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

Chrome.fetch("defaults.json")
	.then(JSON.parse)
	.then(Chrome.getSettings)
	.then(function (settings) {
		Promise.all([
			Root.ready(),
			settings.tabCount | 0 ?
				Chrome.sessions.getRecent({maxResults: settings.tabCount | 0})
					.then(function (sessions) {
						return sessions.map(function (session) {
							let bit = session.tab || session.window;
							if (settings.timer)
								bit.lastModified = session.lastModified;
							if (session.tab)
								return new TabButton(bit);
							else {
								bit.open = settings.expand;
								return new WindowFolder(bit);
							}
						});
					}) : [],
			Chrome.sessions.getDevices()
				.then(function (devices) {
					return devices.map(function (device) {
						if (!settings.timer)
							device.sessions.forEach(function (session) {
								session.lastModified = undefined;
								device.expand = true;
							});
						device.expand = true;
						return new DeviceFolder(device)
					});
				}),
			settings.historyCount | 0 ? 
				Chrome.history.search({
					text: "", 
					startTime: Date.now() - 1000 * 3600 * 24 * 30, 
					endTime: Date.now(),
					maxResults: settings.historyCount | 0
				}).then(function (results) {
					return results.map(function (result) {
						result.preferSelect = settings.preferSelect;
						if (!settings.timer)
							result.lastVisitTime = undefined;
						return new HistoryButton(result);
					});
				}) : [],
			Chrome.getI18n(settings.lang),
			settings
		]).then(function (arr) {
			(function (root, sessions, devices, history, i18n, settings) {
				root.setTheme(settings.theme || Chrome.getPlatform(), settings.animate);
				root.width = parseInt(settings.width);
				root.height = parseInt(settings.height);
				if (sessions.length)
					sessions.unshift(new Separator({ title: i18n("popup_recently_closed_tabs") }));
				if (history.length)
					history.unshift(new Separator({ title: i18n("popup_recent_history") }));
				let children = settings.tabsFirst ? sessions.concat(history) : history.concat(sessions);
				if (!children.length)
					children = [new Separator({ title: i18n("results_nothing_found") })];
				root.insert(new Layer({ children: children }));
				let searchLayer = root.insert(new Layer({
					visible: false,
					children: [new Separator({ title: i18n("popup_search_history") })]
				}));
				let searchInstance = 0;
				let devicesButton, deviceLayer;
				let mainButtons = new MultiButton({
					children: [
						new Input({
							placeholder: i18n("popup_search_history"),
							lockon: true,
							change: function (value) {
								let currentSearchInstance = ++searchInstance;
								// layout update
								searchLayer.visible = !!this.value;
								if (deviceLayer) {
									deviceLayer.visible = false;
									devicesButton.on = false;
								}
								if (value) {
									searchLayer.clear();
									searchLayer.insert(new Progressbar);
								}
								setTimeout(function () {
									if (searchInstance != currentSearchInstance)
										return;
									Promise.all(timeSectors().map(function (time) {
										return Chrome.history.search({
											text: value,
											startTime: time.start,
											endTime: time.end,
										}).then(function (results) {
											if (searchInstance != currentSearchInstance || !results.length)
												return [];	
											let nodes = results.map(function (result) {
												if (!settings.timer) {
													result.lastVisitTime = null;
												}
												return new HistoryButton(result);
											});
											nodes.unshift(new Separator({
												title: i18n(time.i18n)
											}));
											return nodes;
										});
										console.log("alled");
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
								}, 1000);
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
				});
				if (devices.length) {
					deviceLayer = new Layer({
						visible: false,
						children: devices
					});
					devicesButton = new DevicesButton({
						tooltip: i18n("popup_other_devices"),
						click: function (e) {
							this.on = deviceLayer.visible = !deviceLayer.visible;
						}
					});
					root.insert(deviceLayer);
					mainButtons.insert(devicesButton, mainButtons.children[1]);
				}
				root.insert(mainButtons);
			}).apply(this, arr);
		});
	});
});
