/************* source/popup.js - WHM Popup Entry Point Script *****************/
/**
 * @file This file is the entry point for Wrona History Menu Popup.
 * @copyright Copyright 2015 (c) Lukasz A.J. Wrona. All rights reserved.  This
 * file is distributed under the GNU General Public License version 3. See
 * LICENSE for details.
 * @author Lukasz A.J. Wrona (lukasz.andrzej.wrona@gmail.com)
 */

"use strict"

define(["./ActionButton", "./Chrome", "./DevicesButton", "./DeviceFolder",
		"./libraries/lajw/ui/Input", "./libraries/lajw/ui/Layer",
		"./libraries/lajw/ui/MultiButton", "./libraries/lajw/ui/Progressbar.js",
		"./libraries/lajw/ui/Separator", "./WindowFolder", "./TabButton",
		"./HistoryButton", "./libraries/lajw/ui/Root"],
function (ActionButton, Chrome, DevicesButton, DeviceFolder, Input, Layer,
	MultiButton, Progressbar, Separator, WindowFolder, TabButton, HistoryButton,
	Root) {

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

class Token {
	constructor(tokenFactory) {
		typecheck(arguments, TokenFactory);
		this._id = ++tokenFactory._id;
		this._tokenFactory = tokenFactory;
	}
	get valid() {
		return this._id == this._tokenFactory._id;
	}
	valueOf() {
		return this.valid;
	}
}

class TokenFactory {
	constructor() {
		this._id = 0;
	}
}

let tokenFactory = new TokenFactory();
let selectedResult = 0;
let searchResults = [];

let keyCode = {
	arrowUp: 38,
	arrowDown: 40,
	tab: 9,
	enter: 13
};

document.body.onkeydown = function (e) {
	if ((e.keyCode == keyCode.arrowDown 
			|| e.keyCode == keyCode.tab && !e.shiftKey)
		&& selectedResult + 1 <
			searchResults.length) {
		searchResults[selectedResult].highlighted = false;
		selectedResult++;
		searchResults[selectedResult].highlighted = true;
		if (searchResults[selectedResult - 5]) {
			searchResults[selectedResult - 5].DOM.scrollIntoView();
		}
		e.preventDefault();
	} else if ((e.keyCode == keyCode.arrowUp 
			|| e.keyCode == keyCode.tab && e.shiftKey)
		&& selectedResult - 1 >= 0) {
		searchResults[selectedResult].highlighted = false;
		selectedResult--;
		searchResults[selectedResult].highlighted = true;
		if (searchResults[selectedResult - 5]) {
			searchResults[selectedResult - 5].DOM.scrollIntoView();
		}
		e.preventDefault();
	} else if (e.keyCode == keyCode.enter) {
		if (searchResults.length > 0) {
			searchResults[selectedResult].click({
				preventDefault: e.preventDefault.bind(e),
				ctrlClick: e.shiftKey
			});
		}
	}
}

function onSearch(deviceLayer, deivcesButton, searchLayer, i18n, settings,
		value) {
	let token = new Token(tokenFactory);
	if (deviceLayer) {
		deviceLayer.visible = false;
		devicesButton.on = false;
	}
	searchLayer.clear();
	selectedResult = 0;
	searchResults = [];
	if (value) {
		searchLayer.visible = true;
		searchLayer.insert(new Progressbar);
		setTimeout(function () {
			if (!token.valid)
				return;
			let promise = Promise.resolve();
			for (let sector of timeSectors()) {
				promise = promise.then(function () {
					return Chrome.history.search({
						text: value,
						startTime: sector.start,
						endTime: sector.end,
					})
				}).then(function (results) {
					if (!results.length || !token.valid) 
						return
					let nodes = results.map(function (result) {
						if (!settings.timer) {
							result.lastVisitTime = null;
						}
						return new HistoryButton(result);
					});
					searchResults = searchResults.concat(nodes.slice());
					nodes.unshift(new Separator(
						{title: i18n(sector.i18n)}
					));
					searchLayer.insert(nodes);
				});
			}
			promise.then(function () {
				if (!token.valid)
					return;
				if (searchResults.length > 0) {
					searchResults[0].highlighted = true;
				}
				searchLayer.remove(searchLayer.children[0]);
				if (searchLayer.children.length) {
					searchLayer.insert(new Separator({
						title: i18n("results_end")
					}));
				} else {
					searchLayer.insert(new Separator({
						title: i18n("results_nothing_found")
					}));
				}
			});
		}.bind(this), 500);
	} else {
		searchLayer.visible = false;
	}
}

function getMainLayer(sessions, devices, history, i18n, settings) {
	if (sessions.length > 0) {
		sessions.unshift(new Separator({
			title: i18n("popup_recently_closed_tabs")
		}));
	}
	if (history.length > 0) {
		history.unshift(new Separator({
			title: i18n("popup_recent_history")
		}));
	}
	let children = settings.tabsFirst 
		? sessions.concat(history) 
		: history.concat(sessions);
	if (children.length == 0) {
		history.unshift(new Separator({
			title: i18n("results_nothing_found")
		}));
	}
	return new Layer({
		children: children
	});
}

function main(root, sessions, devices, history, i18n, settings) {
	root.setTheme(settings.theme || Chrome.getPlatform(), settings.animate);
	root.width = parseInt(settings.width);
	root.height = parseInt(settings.height);
	root.insert(getMainLayer(sessions, devices, history, i18n, settings));
	let searchLayer = root.insert(new Layer({
		visible: false,
		children: [new Separator({
			title: i18n("popup_search_history")
		})]
	}));
	let devicesButton, deviceLayer;
	let mainButtons = new MultiButton({
		children: [
			new Input({
				placeholder: i18n("popup_search_history"),
				lockon: true,
				change: onSearch.bind(null, deviceLayer, devicesButton,
					searchLayer, i18n, settings)
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
	if (devices.length > 0) {
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
}

function sessionToButton(settings, session) {
	let bit = session.tab || session.window;
	if (settings.timer) {
		bit.lastModified = session.lastModified;
	}
	if (session.tab) {
		return new TabButton(bit);
	} else {
		bit.open = settings.expand;
		return new WindowFolder(bit);
	}
}

function getSessionNodes(settings) {
	return Chrome.sessions.getRecent({
		maxResults: parseInt(settings.tabCount)
	}).then(function (sessions) {
		return sessions.map(sessionToButton.bind(null, settings));
	});
}

function getDeviceNodes(settings) {
	return Chrome.sessions.getDevices().then(function (devices) {
		return devices.map(function (device) {
			if (!settings.timer) {
				device.sessions.forEach(function (session) {
					session.lastModified = undefined;
				});
			}
			return new DeviceFolder(device)
		});
	});
}

function getHistoryNodes(settings) {
	return Chrome.history.search({
		text: "", 
		startTime: Date.now() - 1000 * 3600 * 24 * 30, 
		endTime: Date.now(),
		maxResults: parseInt(settings.historyCount)
	}).then(function (results) {
		return results.map(function (result) {
			result.preferSelect = settings.preferSelect;
			if (!settings.timer) {
				result.lastVisitTime = undefined;
			}
			return new HistoryButton(result);
		});
	});
}

Chrome.fetch("defaults.json")
	.then(JSON.parse)
	.then(Chrome.getSettings)
	.then(function (settings) {
		return Promise.all([
			Root.ready(),
			getSessionNodes(settings),
			getDeviceNodes(settings),
			getHistoryNodes(settings),
			Chrome.getI18n(settings.lang),
			settings
		])
	}).then(function (arr) {
		main.apply(null, arr);
	});
});
