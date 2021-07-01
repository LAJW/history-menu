/************* source/popup.js - WHM Popup Entry Point Script *****************/
/**
 * @file This file is the entry point for Wrona History Menu Popup.
 * @copyright Copyright 2015 (c) Lukasz A.J. Wrona. All rights reserved.  This
 * file is distributed under the GNU General Public License version 3. See
 * LICENSE for details.
 * @author Lukasz A.J. Wrona (lukasz.andrzej.wrona@gmail.com)
 */

import ActionButton from "./ActionButton"
import Chrome from "./Chrome"
import DevicesButton from "./DevicesButton"
import Input from "./components/Input"
import Layer from "./components/Layer"
import MultiButton from "./components/MultiButton"
import Progressbar from "./components/Progressbar"
import Separator from "./components/Separator"
import WindowFolder from "./WindowFolder"
import TabButton from "./TabButton"
import HistoryButton from "./HistoryButton"
import Root from "./components/Root"
import DeviceFolder from "./DeviceFolder"
import Node from "./components/Node"
import { I18n, Settings } from "./Settings"
import { groupBy, parseGlobs, removeDomain, url } from "./Utils"
import { isTemplateExpression } from "typescript"

let devicesButton : DevicesButton, deviceLayer : Layer;

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
	_id : number
	_tokenFactory : TokenFactory
	constructor(tokenFactory : TokenFactory) {
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
	_id : number
	constructor() {
		this._id = 0;
	}
}

const tokenFactory = new TokenFactory();
let selectedResult = 0;
let searchResults : HistoryButton[] = [];

const keyCode = {
	arrowUp:   38,
	arrowDown: 40,
	tab:       9,
	enter:     13
};

window.addEventListener("keydown", e => {
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
			// @ts-ignore
			// TODO: Outstanding, events might have to be rewired
			searchResults[selectedResult].click({
				preventDefault: () => e.preventDefault,
				button: (e.ctrlKey || e.shiftKey) ? 1 : 0
			});
		}
	}
});

function onSearch(deviceLayer : Layer, searchLayer : Layer, i18n : (key : string) => string, settings : Settings, value : string) {
	if (deviceLayer) {
		deviceLayer.visible = false;
		devicesButton.on    = false;
	}
	const token         = new Token(tokenFactory);
	selectedResult      = 0;
	searchResults       = new Array;
	searchLayer.visible = value.length > 0;
	searchLayer.clear();
	if (value.length > 0) {
		const progressbar = new Progressbar
		searchLayer.insert(progressbar);
		setTimeout(async () => {
			if (!token.valid) {
				return;
			}
			for (const sector of timeSectors()) {
				const results = await Chrome.history.search({
					text:      value,
					startTime: sector.start,
					endTime:   sector.end,
				})
				if (results.length && token.valid) {
					const nodes = results.map(result => {
						if (!settings.timer) {
							result.lastVisitTime = null;
						}
						return new HistoryButton(i18n, { ...result });
					});
					searchResults = [ ...searchResults, ...nodes ];
					searchLayer.insert(new Separator({title: i18n(sector.i18n)}))
					searchLayer.insert(nodes);
				}
			}
			if (!token.valid) {
				return;
			}
			if (searchResults.length > 0) {
				searchResults[0].highlighted = true;
			}
			searchLayer.remove(progressbar);
			if (searchLayer.children.length) {
				searchLayer.insert(new Separator({
					title: i18n("results_end")
				}));
			} else {
				searchLayer.insert(new Separator({
					title: i18n("results_nothing_found")
				}));
			}
		}, 500);
	}
}

function getMainLayer(sessions : Node[], history : Node[], i18n : (key : string) => string, settings : Settings) {
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
		children: children,
		fadeInEnabled: false,
	});
}

function isFolder(node : chrome.bookmarks.BookmarkTreeNode) {
	return node.children !== undefined;
}

function isTitledBookmark(node : chrome.bookmarks.BookmarkTreeNode) {
	return node.url && node.title && node.title !== "";
}

function stripHash(url : string) {
	const index = url.indexOf("#");
	if (index === -1) {
		return url;
	} else {
		return url.substring(0, index);
	}
}

function getHash(url : string) {
	const index = url.indexOf("#");
	if (index === -1) {
		return "";
	} else {
		return url.substring(index);
	}
}

function urlToTitleMap(bookmarks : chrome.bookmarks.BookmarkTreeNode[]) {
	const urlToTitle = new Map<string, string>()
	function addAllChildren(node : chrome.bookmarks.BookmarkTreeNode) {
		if (isFolder(node)) {
			node.children.forEach(addAllChildren);
		} else if (isTitledBookmark(node)) {
			urlToTitle.set(node.url.toLowerCase(), node.title);
		}
	}
	bookmarks.forEach(addAllChildren);
	return urlToTitle;
}

function main(root : Root, sessions : Node[], devices : DeviceFolder[], history : HistoryButton[], bookmarks : chrome.bookmarks.BookmarkTreeNode[], i18n : (key : string) => string, settings : Settings) {
	root.setTheme(settings.theme || Chrome.getPlatform(), settings.animate);
	root.width  = settings.width || 0;
	root.height = settings.height || 0;
	root.insert(getMainLayer(sessions, history, i18n, settings));
	const searchLayer = root.insert(new Layer({
		visible:  false,
		children: [new Separator({
			title: i18n("popup_search_history")
		})],
		fadeInEnabled: true,
	})) as Layer;
	const mainButtons = new MultiButton({
		children: [
			new Input({
				placeholder: i18n("popup_search_history"),
				lockon:      true,
				change: value => onSearch(deviceLayer, searchLayer, i18n, settings, value ?? "")
			}),
			new ActionButton({
				title:   "",
				tooltip: i18n("popup_history_manager"),
				icon:    "icons/history-19.png",
				click:   async e => {
					await Chrome.tabs.openOrSelect("chrome://history/", false)
					if (!(e.button == 1 || e.ctrlKey)) {
						window.close();
					}
				},
			}),
			new ActionButton({
				title:   "",
				tooltip: i18n("popup_options"),
				icon:    "icons/options.png",
				click:   async e => {
					await Chrome.tabs.openOrSelect(`chrome://extensions/?options=${chrome.runtime.id}`, false)
					if (!(e.button == 1 || e.ctrlKey)) {
						window.close();
					}
				}
			})
		]
	});
	if (devices.length > 0) {
		deviceLayer = new Layer({
			visible:  false,
			children: devices,
			fadeInEnabled: false,
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

function sessionToButton(i18n : I18n, settings : Settings, session : chrome.sessions.Session, titleMap : Map<string, string>) {
	if (session.tab) {
		return new TabButton({
			...session.tab,
			title : titleMap.get(session.tab.url.toLowerCase()) ?? processTitle(session.tab),
			lastModified : settings.timer ? session.lastModified : undefined,
		})
	}
	return new WindowFolder(i18n, {
		...session.window,
		lastModified : settings.timer ? session.lastModified : undefined,
		open : session.window !== undefined ? settings.expand : undefined,
		fadeInEnabled : false,
	})
}

async function getSessionNodes(i18n : I18n, settings : Settings, titleMap: Map<string, string>) : Promise<Node[]> {
	return (await Chrome.sessions.getRecent({ }))
		.slice(0, settings.tabCount | 0)
		.map(session => sessionToButton(i18n, settings, session, titleMap));
}

async function getDeviceNodes(i18n : I18n, settings : Settings) {
	const devices = await Chrome.sessions.getDevices();
	return devices.map(device => {
		if (!settings.timer) {
			device.sessions.forEach(session => {
				session.lastModified = undefined;
			});
		}
		return new DeviceFolder(i18n, device)
	});
}


function head<T>(collection : Iterable<T>) : T {
	for (const el of collection) {
		return el;
	}
	throw new Error("Collection was empty");
}

function auxiliaryTitle(titleGroups : Map<string, chrome.history.HistoryItem[]>, item : chrome.history.HistoryItem) : { title : string, aux? : string } {
	const title = item.title;
	const titleGroup = titleGroups.get(title);
	if (titleGroup) {
		const baseUrlGroups = groupBy([...titleGroup].map(item => stripHash(item.url)), id => id);
		// TODO: Query different
		if (baseUrlGroups.size === 1) { // base URL unique - good site
			if (head(baseUrlGroups.values()).length == 1) {
				return { title };
			} else {
				return { title, aux : getHash(item.url) };
			}
		} else { // Base URL different - trash site
			return { title, aux : removeDomain(item.url) };
		}
	} else { // no title
		return { title: item.url };
	}
}

function processTitle(item : { url? : string, title? : string }) {
	return item.title;
}

async function getHistoryNodes(i18n : I18n, settings : Settings, titleMap : Map<string, string>) {
	const timestamp = Date.now();
	const blacklist = parseGlobs(settings.filter.split("\n")).parsers;
	let results : chrome.history.HistoryItem[]
	for (let i = 1; i < 10; ++i) {
		// TODO: Into async generator
		const preFilter = await Chrome.history.search({
			text:       "", 
			startTime:  timestamp - 1000 * 3600 * 24 * 30, 
			endTime:    timestamp,
			maxResults: (settings.historyCount | 20) + (20 * i)
		})
		results = preFilter.filter(x => !blacklist.some(match => match(x.url)))
		if (preFilter.length === results.length || results.length >= settings.length) {
			break;
		}
	}
	const titleGroups = groupBy(results, ({title}) => title)
	return results
		.slice(0, settings.historyCount)
		.map(item => {
			const aux = auxiliaryTitle(titleGroups, item);
			let title = titleMap.get(item.url.toLowerCase())
			if (!title) {
				if (!item.title || item.title === "" || titleGroups.get(item.title).length > 0) {
					title = titleMap.get(stripHash(item.url.toLowerCase())) ?? processTitle(item);
				}
			}
			return new HistoryButton(i18n, {
				...item,
				title,
				lastVisitTime : settings.timer ? item.lastVisitTime : undefined,
				preferSelect : settings.preferSelect,
				originalTitle : aux.title,
				aux : aux.aux
			})
		})
}

(async () => {
	const settings = await Chrome.fetch("defaults.json")
		.then(JSON.parse)
		.then(Chrome.settings.getReadOnly)
	const i18n = await Chrome.getI18n(settings.lang);
	const bookmarks = await Chrome.bookmarks.getTree();
	const titleMap = urlToTitleMap(bookmarks);
	const [...args] = await Promise.all([
		Root.ready(),
		getSessionNodes(i18n, settings, titleMap),
		getDeviceNodes(i18n, settings),
		getHistoryNodes(i18n, settings, titleMap),
		bookmarks,
		i18n,
		settings
	])
	main(...args);
})();
