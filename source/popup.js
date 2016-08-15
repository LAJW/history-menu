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
	const now       = Date.now();
	const hour      = 1000 * 3600;
	const lastHour  = now - hour;
	const lastDay   = now - hour * 24;
	const yesterday = now - hour * 48;
	const lastWeek  = now - hour * 24 * 7;
	const prevWeek  = now - hour * 24 * 14;
	const lastMonth = now - hour * 24 * 30;
	const prevMonth = now - hour * 24 * 60;
	return [
		{ start: lastHour,  end: now,       i18n: "results_recently" },
		{ start: lastDay,   end: lastHour,  i18n: "results_today" },
		{ start: yesterday, end: lastDay,   i18n: "results_yesterday" },
		{ start: lastWeek,  end: yesterday, i18n: "results_this_week" },
		{ start: prevWeek,  end: lastWeek,  i18n: "results_last_week" },
		{ start: lastMonth, end: prevWeek,  i18n: "results_this_month" },
		{ start: prevMonth, end: lastMonth, i18n: "results_last_month" }
	];
}

class Token {
	constructor(tokenFactory) {
		typecheck(arguments, TokenFactory);
		tokenFactory._id += 1;
		this._id           = tokenFactory._id;
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

const tokenFactory = new TokenFactory();
let selectedResult = 0;
let searchResults  = [];

const keyCode = {
	arrowUp:   38,
	arrowDown: 40,
	tab:       9,
	enter:     13
};

window.addEventListener("keydown", function (e) {
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
});

function onSearch(deviceLayer, deivcesButton, searchLayer, i18n, settings,
		value) {
	if (deviceLayer) {
		deviceLayer.visible = false;
		devicesButton.on    = false;
	}
	typecheck(arguments,
		[Layer,         undefined],
		[DevicesButton, undefined],
		Layer,
		Object,
		Object,
		String);
	const token         = new Token(tokenFactory);
	selectedResult      = 0;
	searchResults       = new Array;
	searchLayer.visible = value.length > 0;
	searchLayer.clear();
	if (value.length > 0) {
		searchLayer.insert(new Progressbar);
		setTimeout(function () {
			if (!token.valid)
				return;
			let promise = Promise.resolve();
			for (const sector of timeSectors()) {
				promise = promise.then(function () {
					return Chrome.history.search({
						text:      value,
						startTime: sector.start,
						endTime:   sector.end,
					})
				}).then(function (results) {
					if (!results.length || !token.valid) 
						return
					const nodes = results.map(function (result) {
						if (!settings.timer) {
							result.lastVisitTime = null;
						}
						return new HistoryButton(result);
					});
					searchResults = searchResults.concat(nodes);
					nodes.unshift(new Separator({title: i18n(sector.i18n)}));
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
	const children = settings.tabsFirst 
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
	root.width  = parseInt(settings.width);
	root.height = parseInt(settings.height);
	root.insert(getMainLayer(sessions, devices, history, i18n, settings));
	const searchLayer = root.insert(new Layer({
		visible:  false,
		children: [new Separator({
			title: i18n("popup_search_history")
		})]
	}));
	let devicesButton, deviceLayer;
	const mainButtons = new MultiButton({
		children: [
			new Input({
				placeholder: i18n("popup_search_history"),
				lockon:      true,
				change:      onSearch.bind(null, deviceLayer, devicesButton,
					searchLayer, i18n, settings)
			}),
			new ActionButton({
				tooltip: i18n("popup_history_manager"),
				icon:    "icons/history-19.png",
				click:   function (e) {
					Chrome.tabs.openOrSelect("chrome://history/", false);
				}
			}),
			new ActionButton({
				tooltip: i18n("popup_options"),
				icon:    "icons/options.png",
				click:   function (e) {
					Chrome.tabs.openOrSelect("chrome://extensions/?options=",
						false);
				}
			})
		]
	});
	if (devices.length > 0) {
		deviceLayer = new Layer({
			visible:  false,
			children: devices
		});
		devicesButton = new DevicesButton({
			tooltip: i18n("popup_other_devices"),
			click:   function (e) {
				const visible       = !deviceLayer.visible;
				deviceLayer.visible = visible;
				this.on             = visible;
			}
		});
		root.insert(deviceLayer);
		mainButtons.insert(devicesButton, mainButtons.children[1]);
	}
	root.insert(mainButtons);
}

function sessionToButton(settings, session) {
	const object = session.tab || session.window;
	if (settings.timer) {
		object.lastModified = session.lastModified;
	}
	return session.tab
		? new TabButton(object)
		: new WindowFolder(object);
}

function getSessionNodes(settings) {
	return Chrome.sessions.getRecent({ })
	.then(function (sessions) {
		return sessions
		.slice(0, parseInt(settings.tabCount || 25))
		.map(sessionToButton.bind(null, settings));
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
	const timestamp = Date.now();
	return Chrome.history.search({
		text:       "", 
		startTime:  timestamp - 1000 * 3600 * 24 * 30, 
		endTime:    timestamp,
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
	.then(Chrome.settings.getReadOnly)
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
